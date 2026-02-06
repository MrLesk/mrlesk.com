<template>
  <div
    ref="containerRef"
    class="embedded-terminal"
    :class="{ 'embedded-terminal--disabled': !allowInputs }"
    role="application"
    :aria-label="title"
    tabindex="0"
    @pointerdown.stop="focusTerminal"
  ></div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

const props = defineProps({
  wsSrc: {
    type: String,
    required: true,
  },
  fontSize: {
    type: Number,
    default: 14,
  },
  maxCols: {
    type: Number,
    default: null,
  },
  allowInputs: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: 'Embedded terminal',
  },
})

const emit = defineEmits(['connected', 'disconnected', 'error'])

const containerRef = ref(null)
let term = null
let fitAddon = null
let socket = null
let resizeObserver = null
let keyCaptureHandler = null
let textareaKeyHandler = null
let textareaKeyUpHandler = null
let textareaKeyPressHandler = null
let textareaBeforeInputHandler = null
let textareaFocusHandler = null
let textareaBlurHandler = null
let fullscreenHandler = null
let escapeHoldTimer = null
let escapeDownAt = null
let socketOpen = false
const encoder = new TextEncoder()
const decoder = new TextDecoder()
const CLIENT_MESSAGE_TYPE = {
  INPUT: 0,
  RESIZE: 1,
}
const SERVER_MESSAGE_TYPE = {
  OUTPUT: 0,
  SET_TITLE: 1,
  PREFERENCES: 2,
}
let serverTypeEncoding = null

function focusTerminal() {
  if (!props.allowInputs) return
  term?.focus()
  if (document.fullscreenElement) {
    lockEscape()
  }
}

async function lockEscape() {
  if (!document.fullscreenElement) return
  if (navigator.keyboard?.lock) {
    try {
      await navigator.keyboard.lock(['Escape'])
    } catch {
      // ignore - browser may reject
    }
  }
}

function unlockEscape() {
  if (navigator.keyboard?.unlock) {
    try {
      navigator.keyboard.unlock()
    } catch {
      // ignore
    }
  }
}

function startEscapeHold() {
  if (escapeHoldTimer) return
  escapeDownAt = Date.now()
  escapeHoldTimer = setTimeout(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.()
    }
  }, 700)
}

function clearEscapeHold() {
  if (escapeHoldTimer) clearTimeout(escapeHoldTimer)
  escapeHoldTimer = null
  escapeDownAt = null
}

function buildPayload(type, data) {
  const encoded = typeof data === 'string' ? encoder.encode(data) : data
  const payload = new Uint8Array(encoded.length + 1)
  let typeByte = typeof type === 'number' ? type : Number.parseInt(type, 10)
  if (!Number.isFinite(typeByte)) typeByte = 0
  if (serverTypeEncoding === 'ascii') {
    typeByte += 48
  }
  payload[0] = typeByte
  payload.set(encoded, 1)
  return payload
}

function sendResize() {
  if (!socket || socket.readyState !== WebSocket.OPEN || !term) return
  const payload = JSON.stringify({
    columns: term.cols,
    rows: term.rows,
  })
  socket.send(buildPayload(CLIENT_MESSAGE_TYPE.RESIZE, payload))
}

function fitTerminal() {
  if (!term || !fitAddon) return
  fitAddon.fit()
  applyMaxCols()
  sendResize()
}

function sendInput(data) {
  if (!socket || socket.readyState !== WebSocket.OPEN || !data) return
  const payload = typeof data === 'string' ? data : String(data)
  socket.send(buildPayload(CLIENT_MESSAGE_TYPE.INPUT, payload))
}

function send(text, options = {}) {
  if (!socketOpen || !socket || socket.readyState !== WebSocket.OPEN) return false
  if (text) {
    sendInput(text)
  }
  if (options.enter) {
    sendInput('\r')
  }
  return true
}

function applyMaxCols() {
  if (!term) return
  if (!props.maxCols) return
  if (term.cols <= props.maxCols) return
  term.resize(props.maxCols, term.rows)
}

function connect() {
  if (!props.wsSrc) return

  socket?.close()
  socketOpen = false
  socket = new WebSocket(props.wsSrc, ['tty'])
  socket.binaryType = 'arraybuffer'

  socket.addEventListener('open', () => {
    socketOpen = true
    if (term) {
      const handshake = JSON.stringify({
        AuthToken: null,
        columns: term.cols,
        rows: term.rows,
      })
      socket.send(encoder.encode(handshake))
    }
    emit('connected')
  })

  socket.addEventListener('message', (event) => {
    if (!term) return
    const data = event.data
    if (typeof data === 'string') {
      const bytes = encoder.encode(data)
      handleServerMessage(bytes)
      return
    }
    if (data instanceof ArrayBuffer) {
      handleServerMessage(new Uint8Array(data))
    }
  })

  socket.addEventListener('close', () => {
    socketOpen = false
    emit('disconnected')
  })

  socket.addEventListener('error', (error) => {
    emit('error', error)
  })
}

function handleServerMessage(bytes) {
  if (!term || bytes.length < 1) return
  const messageType = bytes[0]
  let normalizedType = messageType
  let nextEncoding = serverTypeEncoding
  if (messageType >= 48 && messageType <= 50) {
    normalizedType = messageType - 48
    nextEncoding = 'ascii'
  } else if (messageType >= 0 && messageType <= 2) {
    nextEncoding = 'binary'
  }
  if (nextEncoding && nextEncoding !== serverTypeEncoding) {
    serverTypeEncoding = nextEncoding
    if (nextEncoding === 'ascii') {
      sendResize()
    }
  }
  const payload = bytes.subarray(1)

  if (normalizedType === SERVER_MESSAGE_TYPE.OUTPUT) {
    term.write(payload)
    return
  }

  if (normalizedType === SERVER_MESSAGE_TYPE.SET_TITLE) {
    const title = decoder.decode(payload)
    if (title) document.title = title
    return
  }

  if (normalizedType === SERVER_MESSAGE_TYPE.PREFERENCES) {
    // preferences payload; ignored for now
  }
}

function initTerminal() {
  if (!containerRef.value || term) return

  term = new Terminal({
    fontFamily: 'JetBrains Mono, Menlo, monospace',
    fontSize: props.fontSize ?? 14,
    lineHeight: 1.2,
    theme: {
      background: '#000000',
    },
    cursorBlink: true,
    scrollback: 0,
    disableStdin: !props.allowInputs,
  })

  fitAddon = new FitAddon()
  term.loadAddon(fitAddon)
  term.open(containerRef.value)
  fitTerminal()
  term.attachCustomKeyEventHandler((event) => {
    if (!props.allowInputs) return true
    if (event.key !== 'Escape') return true
    if (event.type !== 'keydown') return false
    sendInput('\x1b')
    if (document.fullscreenElement) {
      lockEscape()
    }
    startEscapeHold()
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    return false
  })
  const textarea = containerRef.value.querySelector('.xterm-helper-textarea')
  if (textarea) {
    const stopKeyEvent = (event) => {
      // Keep terminal keys from reaching Slidev, but allow xterm to handle them.
      event.stopImmediatePropagation()
      event.stopPropagation()
      if (event.key === 'Escape') {
        event.preventDefault()
        startEscapeHold()
      }
    }
    textareaKeyHandler = stopKeyEvent
    textareaKeyPressHandler = stopKeyEvent
    textareaKeyUpHandler = (event) => {
      if (event.key === 'Escape') {
        clearEscapeHold()
      }
    }
    textareaBeforeInputHandler = (event) => {
      event.stopImmediatePropagation()
      event.stopPropagation()
    }
    textareaFocusHandler = () => {
      lockEscape()
    }
    textareaBlurHandler = () => {
      unlockEscape()
      clearEscapeHold()
    }
    textarea.addEventListener('keydown', textareaKeyHandler)
    textarea.addEventListener('keypress', textareaKeyPressHandler)
    textarea.addEventListener('keyup', textareaKeyUpHandler)
    textarea.addEventListener('beforeinput', textareaBeforeInputHandler)
    textarea.addEventListener('focus', textareaFocusHandler)
    textarea.addEventListener('blur', textareaBlurHandler)
  }
  if (props.allowInputs) {
    requestAnimationFrame(() => {
      term?.focus()
    })
  }

  term.onData((data) => {
    if (!props.allowInputs) return
    sendInput(data)
  })

  resizeObserver = new ResizeObserver(() => {
    fitTerminal()
  })

  resizeObserver.observe(containerRef.value)

  connect()

  requestAnimationFrame(() => fitTerminal())
  setTimeout(() => fitTerminal(), 60)
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      fitTerminal()
    }).catch(() => {})
  }
}

onMounted(() => {
  fullscreenHandler = () => {
    if (document.fullscreenElement) {
      lockEscape()
    } else {
      unlockEscape()
      clearEscapeHold()
    }
  }
  document.addEventListener('fullscreenchange', fullscreenHandler)

  const tryInit = () => {
    if (!containerRef.value || term) return
    const rect = containerRef.value.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      requestAnimationFrame(tryInit)
      return
    }
    initTerminal()
  }

  tryInit()
})

onUnmounted(() => {
  if (document && fullscreenHandler) {
    document.removeEventListener('fullscreenchange', fullscreenHandler)
  }
  fullscreenHandler = null
  const textarea = containerRef.value?.querySelector('.xterm-helper-textarea')
  if (textarea && textareaKeyHandler) {
    textarea.removeEventListener('keydown', textareaKeyHandler)
  }
  if (textarea && textareaKeyPressHandler) {
    textarea.removeEventListener('keypress', textareaKeyPressHandler)
  }
  if (textarea && textareaKeyUpHandler) {
    textarea.removeEventListener('keyup', textareaKeyUpHandler)
  }
  if (textarea && textareaBeforeInputHandler) {
    textarea.removeEventListener('beforeinput', textareaBeforeInputHandler)
  }
  if (textarea && textareaFocusHandler) {
    textarea.removeEventListener('focus', textareaFocusHandler)
  }
  if (textarea && textareaBlurHandler) {
    textarea.removeEventListener('blur', textareaBlurHandler)
  }
  textareaKeyHandler = null
  textareaKeyUpHandler = null
  textareaKeyPressHandler = null
  textareaBeforeInputHandler = null
  textareaFocusHandler = null
  textareaBlurHandler = null
  resizeObserver?.disconnect()
  resizeObserver = null
  socket?.close()
  socket = null
  term?.dispose()
  term = null
  fitAddon = null
})

watch(() => props.allowInputs, (allowed) => {
  if (!term) return
  term.setOption('disableStdin', !allowed)
  if (allowed) {
    requestAnimationFrame(() => {
      term?.focus()
    })
  }
})

watch(() => props.wsSrc, () => {
  connect()
})

watch(() => props.fontSize, (size) => {
  if (!term) return
  term.setOption('fontSize', size ?? 14)
  if (fitAddon) {
    fitTerminal()
  }
})

defineExpose({ focus: focusTerminal, fit: fitTerminal, send })
</script>

<style scoped>
.embedded-terminal {
  width: 100%;
  height: 100%;
  background: #000;
  position: relative;
}

.embedded-terminal--disabled {
  pointer-events: none;
}

:global(.embedded-terminal .xterm-viewport) {
  overflow: hidden !important;
  scrollbar-width: none;
}

:global(.embedded-terminal .xterm-viewport::-webkit-scrollbar) {
  width: 0;
  height: 0;
}

:global(.embedded-terminal .xterm),
:global(.embedded-terminal .xterm-screen),
:global(.embedded-terminal .xterm-viewport) {
  background: #000 !important;
}

</style>
