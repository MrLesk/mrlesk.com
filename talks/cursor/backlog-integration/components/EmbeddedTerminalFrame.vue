<template>
  <div
    ref="rootRef"
    class="embedded-terminal-frame"
    :class="{ 'embedded-terminal-frame--no-inputs': !shouldAllowInputs }"
  >
    <EmbeddedTerminal
      v-if="!shouldUseFallback && isClient"
      ref="terminalRef"
      class="embedded-terminal-frame__terminal"
      :ws-src="resolvedEmbeddedSrc"
      :allow-inputs="shouldAllowInputs"
      :title="title"
      :font-size="resolvedFontSize"
      :mask-right="resolvedMaskRight"
      @error="handleEmbeddedError"
      @connected="handleEmbeddedConnected"
      @disconnected="handleEmbeddedDisconnected"
    />
    <div v-else-if="shouldUseFallback" class="embedded-terminal-frame__fallback">
      <img :src="resolvedFallbackImage" :alt="title" loading="lazy" />
    </div>
    <div v-else class="embedded-terminal-frame__placeholder">
      Loading terminal…
    </div>

    <div
      v-if="hasPasteSlot && markerClick != null"
      ref="enterMarkerRef"
      v-click="markerClick"
      class="embedded-terminal-click-marker"
    ></div>

    <div ref="pasteSlotRef" class="embedded-terminal-slot-extract">
      <slot name="paste" />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, useSlots, watch } from 'vue'
import { useSlideContext } from '@slidev/client'
import EmbeddedTerminal from './EmbeddedTerminal.vue'

if (!window.__embeddedTerminalFrameState) {
  window.__embeddedTerminalFrameState = {
    slides: new Map()
  }
}

const props = defineProps({
  src: {
    type: String,
    default: 'http://localhost:7681/',
  },
  title: {
    type: String,
    default: 'ttyd session',
  },
  tmuxSession: {
    type: String,
    default: null,
  },
  allowInputs: {
    type: Boolean,
    default: false,
  },
  fallbackImage: {
    type: String,
    default: null,
  },
  embeddedSrc: {
    type: String,
    default: null,
  },
  fontSize: {
    type: Number,
    default: null,
  },
  maskRight: {
    type: Number,
    default: null,
  },
})

const isDev = import.meta.env?.DEV ?? false
const slots = useSlots()
const rootRef = ref(null)
const domSlideNo = ref(null)
const terminalRef = ref(null)
const enterMarkerRef = ref(null)
const pasteSlotRef = ref(null)
const isClient = ref(false)
const embeddedFailed = ref(false)
const pendingSend = ref(null)
const markerClick = ref(null)
const clickStart = ref(null)

const { $nav, $page, $frontmatter } = useSlideContext()

const shouldUseFallback = computed(() => Boolean(props.fallbackImage) && !isDev)
const resolvedFallbackImage = computed(() => {
  if (!props.fallbackImage) return ''
  if (/^https?:\/\//i.test(props.fallbackImage)) return props.fallbackImage
  const base = import.meta.env.BASE_URL || '/'
  if (props.fallbackImage.startsWith('/')) {
    const baseTrimmed = base.endsWith('/') ? base.slice(0, -1) : base
    return `${baseTrimmed}${props.fallbackImage}`
  }
  return `${base}${props.fallbackImage}`
})

const sessionName = computed(() => {
  if (props.tmuxSession) return props.tmuxSession
  if (props.src.includes(':7681')) return 'voxxed-backlog-shell'
  if (props.src.includes(':7682')) return 'voxxed-claude-shell'
  if (props.src.includes(':7683')) return 'voxxed-backlog-refresh'
  return 'voxxed-claude-shell'
})

const resolvedEmbeddedSrc = computed(() => {
  if (props.embeddedSrc) return props.embeddedSrc
  if (!props.src) return null

  try {
    const url = new URL(props.src)
    const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    const pathname = url.pathname.replace(/\/+$/, '')
    return `${protocol}//${url.host}${pathname}/ws${url.search}`
  } catch {
    // ignore URL parse errors
  }

  return null
})

const defaultMaskRight = computed(() => {
  if (props.src?.includes(':7682')) return 140
  return null
})

const resolvedMaskRight = computed(() => {
  if (props.maskRight != null) return props.maskRight
  return defaultMaskRight.value
})

const defaultFontSize = computed(() => {
  if (props.src?.includes(':7682')) return 12
  return 14
})

const resolvedFontSize = computed(() => {
  if (props.fontSize != null) return props.fontSize
  return defaultFontSize.value
})

const currentClicks = computed(() => (
  $nav.value?.clicks?.value ?? $nav.value?.clicks ?? 0
))

const currentSlideNo = computed(() => {
  if ($nav.value?.currentSlideNo?.value != null) {
    return $nav.value.currentSlideNo.value
  }
  if ($nav.value?.currentSlideNo != null && typeof $nav.value.currentSlideNo === 'number') {
    return $nav.value.currentSlideNo
  }
  const path = window.location.pathname
  const match = path.match(/\/(\d+)$/)
  if (match) return parseInt(match[1], 10)
  return 0
})

const thisSlideNo = computed(() => {
  const page = $page.value
  if (typeof page === 'number') return page
  if (page && typeof page.value === 'number') return page.value
  if (domSlideNo.value != null) return domSlideNo.value
  return 0
})

const stableSlideNo = ref(0)

watch(() => thisSlideNo.value, (value) => {
  if (!stableSlideNo.value && value) {
    stableSlideNo.value = value
  }
})

const effectiveSlideNo = computed(() => stableSlideNo.value || thisSlideNo.value)

const isActiveSlide = computed(() => {
  if (!currentSlideNo.value || !effectiveSlideNo.value) return false
  return currentSlideNo.value === effectiveSlideNo.value
})
const shouldAllowInputs = computed(() => props.allowInputs && isActiveSlide.value)

const stateKey = computed(() => `${effectiveSlideNo.value}-${sessionName.value}`)
const frameState = computed(() => {
  const key = stateKey.value
  if (!window.__embeddedTerminalFrameState.slides.has(key)) {
    window.__embeddedTerminalFrameState.slides.set(key, {
      textSent: false,
      enterSent: false,
      lastClicks: null,
    })
  }
  return window.__embeddedTerminalFrameState.slides.get(key)
})

function sharedClicksKey() {
  return `embedded-terminal:${stateKey.value}:last-clicks`
}

function sharedStageKey() {
  return `embedded-terminal:${stateKey.value}:stage`
}

function readSharedLastClicks() {
  try {
    const raw = window.localStorage?.getItem(sharedClicksKey())
    if (raw == null) return null
    const parsed = Number.parseInt(raw, 10)
    return Number.isFinite(parsed) ? parsed : null
  } catch {
    return null
  }
}

function readSharedStage() {
  try {
    const raw = window.localStorage?.getItem(sharedStageKey())
    if (raw == null) return 0
    const parsed = Number.parseInt(raw, 10)
    return Number.isFinite(parsed) ? parsed : 0
  } catch {
    return 0
  }
}

function writeSharedStage(value) {
  try {
    window.localStorage?.setItem(sharedStageKey(), String(value))
  } catch {
    // ignore storage errors
  }
}

function writeSharedLastClicks(value) {
  try {
    window.localStorage?.setItem(sharedClicksKey(), String(value))
  } catch {
    // ignore storage errors
  }
}

const hasPasteSlot = computed(() => Boolean(slots.paste))
function updateMarkerClick() {
  const root = rootRef.value
  if (!root) {
    markerClick.value = null
    clickStart.value = null
    return
  }
  const start = root.dataset?.slidevClicksStart
  if (start == null || start === '') {
    if (hasPasteSlot.value) {
      clickStart.value = 0
      markerClick.value = 2
    } else {
      markerClick.value = null
      clickStart.value = null
    }
    return
  }
  const parsed = Number.parseInt(start, 10)
  if (!Number.isFinite(parsed)) {
    markerClick.value = null
    clickStart.value = null
    return
  }
  clickStart.value = parsed
  markerClick.value = parsed + 1
}

function updateDomSlideNo() {
  const el = rootRef.value
  if (!el) {
    domSlideNo.value = null
    return
  }
  let current = el
  while (current) {
    if (current.classList) {
      for (const cls of current.classList) {
        if (cls.startsWith('slidev-page-')) {
          const parsed = Number.parseInt(cls.replace('slidev-page-', ''), 10)
          if (Number.isFinite(parsed)) {
            domSlideNo.value = parsed
            return
          }
        }
      }
    }
    current = current.parentElement
  }
  domSlideNo.value = null
}

function getPresenterSection() {
  return rootRef.value?.closest('.grid-section') ?? null
}

function shouldAutoRun() {
  if (!isActiveSlide.value) return false
  const section = getPresenterSection()
  if (section?.classList.contains('next')) return false
  return true
}

let rootObserver = null
let enterObserver = null

function attachEnterObserver() {
  enterObserver?.disconnect()
  enterObserver = null
  if (!enterMarkerRef.value) return
  enterObserver = new MutationObserver(handleMarkerClicks)
  enterObserver.observe(enterMarkerRef.value, { attributes: true, attributeFilter: ['class'] })
}

function requestFit() {
  if (!terminalRef.value?.fit) return
  nextTick(() => {
    terminalRef.value?.fit?.()
  })
}

function handleMarkerClicks() {
  if (shouldUseFallback.value) return
  if (!shouldAutoRun()) return
  if (document.visibilityState === 'hidden' || !document.hasFocus()) return
  requestFit()

  const start = clickStart.value ?? 0
  const current = currentClicks.value
  const sharedLast = readSharedLastClicks()
  const sharedStage = readSharedStage()
  if (sharedStage >= 1) frameState.value.textSent = true
  if (sharedStage >= 2) frameState.value.enterSent = true
  if (sharedLast != null) {
    if (frameState.value.lastClicks == null || sharedLast > frameState.value.lastClicks) {
      frameState.value.lastClicks = sharedLast
    }
  }
  if (frameState.value.lastClicks == null) {
    if (current === start && current > 0) {
      frameState.value.lastClicks = current - 1
      writeSharedLastClicks(frameState.value.lastClicks)
    } else {
      frameState.value.lastClicks = current
      writeSharedLastClicks(frameState.value.lastClicks)
      return
    }
  } else if (current < frameState.value.lastClicks) {
    frameState.value.lastClicks = current
    writeSharedLastClicks(frameState.value.lastClicks)
    frameState.value.textSent = false
    frameState.value.enterSent = false
    writeSharedStage(0)
    return
  }
  if (current === frameState.value.lastClicks) return
  frameState.value.lastClicks = current
  writeSharedLastClicks(frameState.value.lastClicks)
  const step = current - start
  if (step < 0) return

  if (hasPasteSlot.value && !frameState.value.textSent && step >= 0) {
    const text = resolvePasteText()
    if (!text) return
    injectTextToTerminal(text, false)
    frameState.value.textSent = true
    writeSharedStage(1)
    return
  }

  if (frameState.value.textSent && !frameState.value.enterSent && step >= 1) {
    sendEnterKey()
    frameState.value.enterSent = true
    writeSharedStage(2)
  }
}

function handleEmbeddedError() {
  embeddedFailed.value = true
}

function handleEmbeddedConnected() {
  embeddedFailed.value = false
  flushPendingSend()
}

function handleEmbeddedDisconnected() {
  embeddedFailed.value = true
}

function sendViaEmbedded(text, enter = false) {
  if (!terminalRef.value?.send) return null
  return terminalRef.value.send(text ?? '', { enter })
}

function queuePendingSend(text, enter = false) {
  if (!pendingSend.value) {
    pendingSend.value = { text: '', enter: false }
  }
  if (text) {
    pendingSend.value.text = text
  }
  if (enter) {
    pendingSend.value.enter = true
  }
}

function flushPendingSend() {
  if (!pendingSend.value) return
  const { text, enter } = pendingSend.value
  const sent = sendViaEmbedded(text, enter)
  if (sent) {
    pendingSend.value = null
  }
}

function resolvePasteText() {
  if (hasPasteSlot.value && pasteSlotRef.value) {
    const text = pasteSlotRef.value.innerText ?? ''
    return stripIndent(text)
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }
  return ''
}

function stripIndent(text) {
  const normalized = text.replace(/\r\n/g, '\n')
  const lines = normalized.split('\n')
  const nonEmpty = lines.filter(line => line.trim().length > 0)
  if (!nonEmpty.length) return normalized
  const indent = nonEmpty.reduce((min, line) => {
    const match = line.match(/^[ \t]*/)
    const size = match ? match[0].length : 0
    return Math.min(min, size)
  }, Number.POSITIVE_INFINITY)
  if (!Number.isFinite(indent) || indent <= 0) return normalized
  return lines.map(line => line.slice(indent)).join('\n')
}

async function injectTextToTerminal(text, sendEnter = false) {
  if (shouldUseFallback.value) return
  if (!text) return

  const embeddedResult = sendViaEmbedded(text, sendEnter)
  if (embeddedResult === true) return
  queuePendingSend(text, sendEnter)
}

async function sendEnterKey() {
  if (shouldUseFallback.value) return

  const embeddedResult = sendViaEmbedded('', true)
  if (embeddedResult === true) return
  queuePendingSend('', true)
}

onMounted(() => {
  if (shouldUseFallback.value) return
  isClient.value = true

  nextTick(() => {
    requestFit()
    updateDomSlideNo()
    updateMarkerClick()
    handleMarkerClicks()
  })

  if (rootRef.value) {
    rootObserver = new MutationObserver(() => {
      requestFit()
      updateDomSlideNo()
      updateMarkerClick()
      handleMarkerClicks()
    })
    rootObserver.observe(rootRef.value, { attributes: true, attributeFilter: ['class', 'data-slidev-clicks-start'] })
  }

  updateMarkerClick()
  nextTick(attachEnterObserver)
})

onUnmounted(() => {
  rootObserver?.disconnect()
  rootObserver = null
  enterObserver?.disconnect()
  enterObserver = null
})

watch(() => currentSlideNo.value, () => {
  nextTick(handleMarkerClicks)
})

watch(isActiveSlide, () => {
  requestFit()
  updateDomSlideNo()
  updateMarkerClick()
  nextTick(handleMarkerClicks)
})

watch(() => $nav.value?.clicks?.value ?? $nav.value?.clicks, () => {
  updateMarkerClick()
  nextTick(handleMarkerClicks)
})

watch(enterMarkerRef, () => {
  nextTick(attachEnterObserver)
})
</script>

<style scoped>
.embedded-terminal-frame {
  @apply relative w-full overflow-hidden border border-white/10 shadow-xl bg-black/60;
  border-radius: 0;
  position: relative;
}

.embedded-terminal-frame__terminal {
  @apply block;
  width: 100%;
  height: 100%;
  background: #000;
}

.embedded-terminal-frame__fallback {
  @apply flex items-center justify-center bg-black/60;
}

.embedded-terminal-frame__fallback img {
  @apply max-w-full max-h-full object-contain;
}

.embedded-terminal-frame__placeholder {
  @apply flex items-center justify-center text-base text-white/70 p-8;
}

.embedded-terminal-frame--no-inputs .embedded-terminal-frame__terminal {
  pointer-events: none !important;
}

.embedded-terminal-click-marker {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
}

.embedded-terminal-slot-extract {
  position: absolute;
  left: -9999px;
  top: 0;
  width: 1px;
  opacity: 0;
  pointer-events: none;
  white-space: pre-wrap;
}
</style>
