<template>
  <div ref="rootRef" class="ttyd-frame" :class="{ 'ttyd-frame--no-inputs': !shouldAllowInputs }">
    <iframe
      v-if="!shouldUseFallback && isClient"
      ref="frameRef"
      class="ttyd-frame__iframe"
      :src="src"
      :title="title"
      allow="clipboard-read; clipboard-write; fullscreen; keyboard-lock"
      :tabindex="shouldAllowInputs ? 0 : -1"
      scrolling="no"
      loading="lazy"
      @load="onIframeLoad"
    />
    <div v-else-if="shouldUseFallback" class="ttyd-frame__fallback">
      <img :src="resolvedFallbackImage" :alt="title" loading="lazy" />
    </div>
    <div v-else class="ttyd-frame__placeholder">
      Loading terminal…
    </div>
    <!-- Register clicks with Slidev by creating invisible v-click elements -->
    <div
      v-for="i in clickSlotCount"
      :key="`click-${markerKey}-${i}`"
      ref="clickMarkers"
      v-click="markerAt(i)"
      class="ttyd-click-marker"
    ></div>
    <!-- Hidden slots container for extracting click content -->
    <div ref="pasteSlotRef" class="ttyd-slot-extract">
      <slot name="paste" />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, useSlots, watch } from 'vue'
import { useSlideContext } from '@slidev/client'

// Global state to track what has been sent (persists across slide navigation, resets on page reload)
if (!window.__ttydFrameState) {
  window.__ttydFrameState = {
    // Map of slideNo -> { textSent: boolean, enterSent: boolean }
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
  autoRun: {
    type: String,
    default: null,
  },
  fallbackImage: {
    type: String,
    default: null,
  },
})

const isDev = import.meta.env?.DEV ?? false

// Auto-detect tmux session from port if not specified
const sessionName = computed(() => {
  if (props.tmuxSession) return props.tmuxSession

  // Map port to session name (see scripts/dev.ts)
  if (props.src.includes(':7681')) return 'voxxed-backlog-shell'
  if (props.src.includes(':7682')) return 'voxxed-claude-shell'
  if (props.src.includes(':7683')) return 'voxxed-backlog-refresh'

  return 'voxxed-claude-shell' // default
})

const slots = useSlots()
const frameRef = ref(null)
const pasteSlotRef = ref(null)
const rootRef = ref(null)
const clickMarkers = ref([])
const clickBase = ref(null)
const markerKey = ref(0)
const isClient = ref(false)
const isVisible = ref(true)
const { $clicks, $nav, $page } = useSlideContext()
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

// Get current slide number - try multiple methods
const currentSlideNo = computed(() => {
  // Method 1: Try $nav.currentSlideNo
  if ($nav.value?.currentSlideNo?.value != null) {
    return $nav.value.currentSlideNo.value
  }
  // Method 2: Try $nav.currentSlideNo directly (might not be a ref)
  if ($nav.value?.currentSlideNo != null && typeof $nav.value.currentSlideNo === 'number') {
    return $nav.value.currentSlideNo
  }
  // Method 3: Parse from URL
  const path = window.location.pathname
  const match = path.match(/\/(\d+)$/)
  if (match) {
    return parseInt(match[1], 10)
  }
  return 0
})

// Get this component's slide number from $page
const thisSlideNo = computed(() => {
  const page = $page.value
  if (typeof page === 'number') return page
  if (page && typeof page.value === 'number') return page.value
  return 0
})

// Check if this slide is currently active
const isActiveSlide = computed(() => {
  const current = currentSlideNo.value
  const thisPage = thisSlideNo.value
  return current === thisPage
})

// Only allow inputs if prop is true AND this slide is active
const shouldAllowInputs = computed(() => props.allowInputs && isActiveSlide.value)

// Unique key for this specific TtydFrame instance (slide + session)
const stateKey = computed(() => `${currentSlideNo.value}-${sessionName.value}`)

// Get or create state for this specific TtydFrame instance
const frameState = computed(() => {
  const key = stateKey.value
  if (!window.__ttydFrameState.slides.has(key)) {
    window.__ttydFrameState.slides.set(key, {
      textSent: false,
      enterSent: false
    })
  }
  return window.__ttydFrameState.slides.get(key)
})

const hasPasteSlot = computed(() => Boolean(slots.paste))

const shouldRegisterClicks = computed(() => (
  isClient.value && isActiveSlide.value && isVisible.value
    && hasPasteSlot.value
))

// Reserve two clicks (paste + enter) when paste slot is provided
const clickSlotCount = computed(() => (
  shouldRegisterClicks.value ? 2 : 0
))

function updateVisibility() {
  const el = rootRef.value
  if (!el) {
    isVisible.value = false
    return
  }
  const hasRects = el.getClientRects().length > 0
  isVisible.value = hasRects && el.offsetParent !== null
}

function updateClickBase() {
  const el = rootRef.value
  if (!el) {
    clickBase.value = null
    return
  }

  let current = el
  let found = null
  while (current) {
    const start = current.dataset?.slidevClicksStart
    if (start != null && start !== '') {
      const parsed = Number.parseInt(start, 10)
      if (Number.isFinite(parsed)) {
        found = parsed
        break
      }
    }
    current = current.parentElement
  }

  clickBase.value = found
}

function markerAt(index) {
  if (clickBase.value == null) return undefined
  return clickBase.value + index
}

let clickObserver = null

function isMarkerActive(marker) {
  if (!marker) return false
  return marker.classList.contains('slidev-vclick-current')
    || marker.classList.contains('slidev-vclick-prior')
}

function handleMarkerClicks() {
  if (shouldUseFallback.value) return
  if (!isActiveSlide.value || !isVisible.value) return
  const markers = clickMarkers.value
  if (!markers || markers.length < 1) return

  if (isMarkerActive(markers[0]) && !frameState.value.textSent) {
    const text = resolvePasteText()
    if (!text) return

    injectTextToTerminal(text, false)
    frameState.value.textSent = true
  }

  if (markers.length > 1 && isMarkerActive(markers[1]) && !frameState.value.enterSent) {
    sendEnterKey()
    frameState.value.enterSent = true
  }
}


function onIframeLoad() {
  if (!shouldAllowInputs.value && frameRef.value) {
    // Immediately blur iframe when it loads
    frameRef.value.blur()

    // Also try to blur the iframe's contentWindow
    try {
      frameRef.value.contentWindow?.blur()
    } catch (e) {
      // Cross-origin, can't access contentWindow
    }

    // Focus the body instead
    document.body.focus()
  }
}

// Watch for shouldAllowInputs changes and prevent focus when disabled
watch(shouldAllowInputs, (allowed) => {
  if (shouldUseFallback.value) return
  if (!allowed && frameRef.value) {
    // Blur immediately when inputs become disabled
    frameRef.value.blur()
    document.body.focus()
  }
})

// Continuously prevent focus stealing when slide changes
watch(() => currentSlideNo.value, () => {
  if (shouldUseFallback.value) return
  // Small delay to let DOM update
  setTimeout(() => {
    if (!shouldAllowInputs.value && frameRef.value && document.activeElement === frameRef.value) {
      frameRef.value.blur()
      document.body.focus()
    }
  }, 100)
})

// Watch for slide becoming active to auto-run command if specified
watch(isActiveSlide, (active) => {
  if (shouldUseFallback.value) return
  if (!active || !props.autoRun) return

  // Check if we've already run this command on this slide
  if (frameState.value.textSent) return

  // Send the command + Enter immediately
  injectTextToTerminal(props.autoRun, true)
  frameState.value.textSent = true
  frameState.value.enterSent = true
})

watch(() => currentSlideNo.value, () => {
  nextTick(handleMarkerClicks)
  nextTick(updateClickBase)
})

watch(isActiveSlide, () => {
  nextTick(updateVisibility)
  nextTick(updateClickBase)
})

watch(() => $clicks?.value, () => {
  nextTick(updateVisibility)
  nextTick(updateClickBase)
})

watch(clickMarkers, () => {
  if (!isClient.value) return
  clickObserver?.disconnect()
  clickObserver = null
  if (!clickMarkers.value?.length) return
  clickObserver = new MutationObserver(handleMarkerClicks)
  for (const marker of clickMarkers.value) {
    clickObserver.observe(marker, { attributes: true, attributeFilter: ['class'] })
  }
  nextTick(handleMarkerClicks)
}, { deep: true })

watch(clickBase, (next, prev) => {
  if (next === prev) return
  markerKey.value += 1
})

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

  try {
    const response = await fetch('http://localhost:3099/send-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session: sessionName.value,
        text: text,
        sendEnter: sendEnter,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to send keys: ${response.status}`)
    }
  } catch (e) {
    console.error('[TtydFrame] Failed to inject text:', e)
  }
}

async function sendEnterKey() {
  if (shouldUseFallback.value) return
  try {
    const response = await fetch('http://localhost:3099/send-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session: sessionName.value,
        text: '',
        sendEnter: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to send Enter: ${response.status}`)
    }
  } catch (e) {
    console.error('[TtydFrame] Failed to send Enter key:', e)
  }
}

onMounted(() => {
  if (shouldUseFallback.value) return
  isClient.value = true

  nextTick(() => {
    updateVisibility()
    updateClickBase()
    handleMarkerClicks()
  })

  // Aggressively prevent focus for 2 seconds after mount
  // This handles the case where iframe loads before slide number updates
  const preventFocusInterval = setInterval(() => {
    if (!shouldAllowInputs.value && frameRef.value && document.activeElement === frameRef.value) {
      frameRef.value.blur()
      document.body.focus()
    }
  }, 10) // Check every 10ms

  setTimeout(() => {
    clearInterval(preventFocusInterval)
  }, 2000) // Stop after 2 seconds
})

onUnmounted(() => {
  clickObserver?.disconnect()
  clickObserver = null
})
</script>

<style scoped>
.ttyd-frame {
  @apply relative w-full overflow-hidden border border-white/10 shadow-xl bg-black/60;
  border-radius: 0;
  position: relative;
}

.ttyd-frame__iframe {
  @apply block border-0;
  width: calc(100% + 20px);
  height: 100%;
  min-height: inherit;
  background: #000;
  margin-right: -20px;
}

.ttyd-frame--no-inputs .ttyd-frame__iframe {
  pointer-events: none !important;
}

.ttyd-frame__fallback {
  @apply flex items-center justify-center bg-black/60;
}

.ttyd-frame__fallback img {
  @apply max-w-full max-h-full object-contain;
}

.ttyd-frame__placeholder {
  @apply flex items-center justify-center text-base text-white/70 p-8;
}

.ttyd-click-marker {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
}

.ttyd-slot-extract {
  position: absolute;
  left: -9999px;
  top: 0;
  width: 1px;
  opacity: 0;
  pointer-events: none;
  white-space: pre-wrap;
}
</style>
