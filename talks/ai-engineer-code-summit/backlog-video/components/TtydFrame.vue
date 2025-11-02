<template>
  <div class="ttyd-frame" :class="{ 'ttyd-frame--no-inputs': !shouldAllowInputs }">
    <iframe
      v-if="isClient"
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
    <div v-else class="ttyd-frame__placeholder">
      Loading terminal…
    </div>
    <!-- Register clicks with Slidev by creating invisible v-click elements -->
    <div
      v-for="i in clickSlotCount"
      :key="`click-${i}`"
      v-click="clickOffset + i"
      class="ttyd-click-marker"
    ></div>
    <!-- Hidden slots container for extracting click content -->
    <div style="display: none;">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, useSlots, watch } from 'vue'
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
  clickOffset: {
    type: Number,
    default: 0,
  },
  tmuxSession: {
    type: String,
    default: null,
  },
  allowInputs: {
    type: Boolean,
    default: false,
  },
})

// Auto-detect tmux session from port if not specified
const sessionName = computed(() => {
  if (props.tmuxSession) return props.tmuxSession

  // Map port to session name
  if (props.src.includes(':7681')) return 'ai-engineer-backlog-shell'
  if (props.src.includes(':7682')) return 'ai-engineer-claude-shell'

  return 'ai-engineer-claude-shell' // default
})

const slots = useSlots()
const frameRef = ref(null)
const isClient = ref(false)
const { $clicks, $nav, $page } = useSlideContext()

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

// Count how many click-N slots are defined, +1 for the Enter key
const clickSlotCount = computed(() => {
  const slotNames = Object.keys(slots)
  const clickSlots = slotNames.filter(name => /^click-\d+$/.test(name))
  // Add 1 extra click for sending Enter after the text
  return clickSlots.length > 0 ? clickSlots.length + 1 : 0
})

const currentClick = computed(() => {
  const clicks = $clicks?.value ?? 0
  return clicks - props.clickOffset
})


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
  if (!allowed && frameRef.value) {
    // Blur immediately when inputs become disabled
    frameRef.value.blur()
    document.body.focus()
  }
})

// Continuously prevent focus stealing when slide changes
watch(() => currentSlideNo.value, () => {
  // Small delay to let DOM update
  setTimeout(() => {
    if (!shouldAllowInputs.value && frameRef.value && document.activeElement === frameRef.value) {
      frameRef.value.blur()
      document.body.focus()
    }
  }, 100)
})

// Watch for clicks to send text on first click, Enter on subsequent clicks
watch(currentClick, (newClick, oldClick) => {
  // Only trigger on click increment (not decrement/navigation back)
  if (newClick <= oldClick || newClick < 1) return

  // First click: send text without Enter (if not already sent)
  if (newClick === 1 && !frameState.value.textSent) {
    const slotContent = slots['click-1']
    if (!slotContent) return

    const text = extractTextFromSlot(slotContent)
    if (!text) return

    injectTextToTerminal(text, false) // Don't send Enter yet
    frameState.value.textSent = true
    return
  }

  // Second click: send Enter key (if not already sent)
  if (newClick === 2 && !frameState.value.enterSent) {
    sendEnterKey()
    frameState.value.enterSent = true
    return
  }
})

function extractTextFromSlot(slotFn) {
  if (!slotFn) return ''

  try {
    const vnodes = slotFn()
    if (!vnodes || vnodes.length === 0) return ''

    // Extract text content from VNode children
    return vnodes
      .map(vnode => {
        if (typeof vnode.children === 'string') {
          return vnode.children
        }
        if (Array.isArray(vnode.children)) {
          return vnode.children.map(child =>
            typeof child === 'string' ? child : child.children
          ).join('')
        }
        return ''
      })
      .join('')
      .trim()
  } catch (e) {
    console.error('Failed to extract slot text:', e)
    return ''
  }
}

async function injectTextToTerminal(text, sendEnter = false) {
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
  isClient.value = true

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
</style>
