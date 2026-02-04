<template>
  <div
    ref="containerRef"
    class="embedded-terminal"
    :class="{ 'embedded-terminal--disabled': !allowInputs }"
    :style="maskStyle"
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
  maskRight: {
    type: Number,
    default: 0,
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

const maskWidth = ref(0)

const maskStyle = computed(() => {
  if (!maskWidth.value) return null
  return { '--terminal-mask-right': `${maskWidth.value}px` }
})

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
  payload[0] = type.charCodeAt(0)
  payload.set(encoded, 1)
  return payload
}

function sendResize() {
  if (!socket || socket.readyState !== WebSocket.OPEN || !term) return
  const payload = JSON.stringify({
    columns: term.cols,
    rows: term.rows,
  })
  socket.send(buildPayload('1', payload))
}

function fitTerminal() {
  if (!term || !fitAddon) return
  fitAddon.fit()
  applyMaxCols()
  updateMaskOffset()
  sendResize()
}

function sendInput(data) {
  if (!socket || socket.readyState !== WebSocket.OPEN || !data) return
  const payload = typeof data === 'string' ? data : String(data)
  socket.send(buildPayload('0', payload))
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

function updateMaskOffset() {
  const root = containerRef.value
  if (!root) return
  const screen = root.querySelector('.xterm-screen')
  if (!screen) return
  const gap = root.getBoundingClientRect().width - screen.getBoundingClientRect().width
  const rows = root.querySelectorAll('.xterm-rows > div')
  let row = null
  for (const candidate of rows) {
    const text = candidate.textContent ?? ''
    if (text.includes('│') && text.includes('·')) {
      row = candidate
      break
    }
  }
  let panelWidth = 0
  const screenRect = screen.getBoundingClientRect()
  if (row) {
    const text = row.textContent ?? ''
    const pipeIndex = text.indexOf('│')
    if (pipeIndex >= 0) {
      const cols = text.length
      if (cols > 0) {
        const cellWidth = screenRect.width / cols
        const panelCols = cols - pipeIndex
        panelWidth = Math.round(panelCols * cellWidth)
      }
    }
  }
  if (!panelWidth) {
    maskWidth.value = 0
    return
  }
  const width = panelWidth + Math.max(0, gap) + 2
  maskWidth.value = Math.max(0, Math.round(width))
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
  const messageType = String.fromCharCode(bytes[0])
  const payload = bytes.subarray(1)

  if (messageType === '0') {
    term.write(payload)
    return
  }

  if (messageType === '1') {
    const title = decoder.decode(payload)
    if (title) document.title = title
    return
  }

  if (messageType === '2') {
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
  term.onRender(() => {
    updateMaskOffset()
  })
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

watch(() => props.maskRight, () => {
  updateMaskOffset()
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

.embedded-terminal::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: var(--terminal-mask-right, 0px);
  height: 100%;
  background: #000;
  pointer-events: none;
}
</style>
