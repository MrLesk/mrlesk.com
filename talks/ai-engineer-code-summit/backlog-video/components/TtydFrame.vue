<template>
  <div class="ttyd-frame" :class="{ 'ttyd-frame--no-focus': !allowFocus }">
    <iframe
      v-if="isClient"
      ref="frameRef"
      class="ttyd-frame__iframe"
      :src="src"
      :title="title"
      allow="clipboard-read; clipboard-write; fullscreen; keyboard-lock"
      :tabindex="allowFocus ? 0 : -1"
      scrolling="no"
      loading="lazy"
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
  allowFocus: {
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
const { $clicks, $nav } = useSlideContext()
const textSent = ref(false)

// Count how many click-N slots are defined
const clickSlotCount = computed(() => {
  const slotNames = Object.keys(slots)
  const clickSlots = slotNames.filter(name => /^click-\d+$/.test(name))
  return clickSlots.length
})

const currentClick = computed(() => {
  const clicks = $clicks?.value ?? 0
  return clicks - props.clickOffset
})

// Watch for slide changes to reset text sent flag
watch(() => $nav.currentSlideNo, () => {
  textSent.value = false
})

function handleIframeClick(e) {
  if (!props.allowFocus) {
    e.preventDefault()
    // Blur the iframe to prevent it from capturing keyboard input
    if (frameRef.value) {
      frameRef.value.blur()
    }
  }
}

// Send text immediately on slide load
watch(isClient, (ready) => {
  if (!ready || textSent.value) return

  const slotContent = slots['click-1']
  if (!slotContent) return

  const text = extractTextFromSlot(slotContent)
  if (!text) return

  console.log('[TtydFrame] Sending text on slide load:', text.substring(0, 50) + '...')
  injectTextToTerminal(text, false) // Don't send Enter yet
  textSent.value = true
})

// Watch for clicks to send Enter key
watch(currentClick, (newClick, oldClick) => {
  console.log('[TtydFrame] Click change:', { newClick, oldClick, clickOffset: props.clickOffset })

  // Only trigger on click increment (not decrement/navigation back)
  if (newClick <= oldClick || newClick < 1) {
    console.log('[TtydFrame] Skipping click - not increment')
    return
  }

  console.log('[TtydFrame] Sending Enter key')
  sendEnterKey()
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

  console.log('[TtydFrame] Attempting to inject text:', text.substring(0, 50) + '...')
  console.log('[TtydFrame] Target session:', sessionName.value)

  try {
    // Use tmux send-keys via a simple HTTP API endpoint
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

    console.log('[TtydFrame] Successfully injected text via tmux send-keys')
  } catch (e) {
    console.error('[TtydFrame] Failed to inject text:', e)
  }
}

async function sendEnterKey() {
  console.log('[TtydFrame] Sending Enter key to session:', sessionName.value)

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

    console.log('[TtydFrame] Successfully sent Enter key')
  } catch (e) {
    console.error('[TtydFrame] Failed to send Enter key:', e)
  }
}

onMounted(() => {
  isClient.value = true
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

/* Add an overlay to prevent all iframe interactions when focus is disabled */
.ttyd-frame--no-focus::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background: transparent;
}

/* Remove overlay on hover to allow interactions */
.ttyd-frame--no-focus:hover::before {
  display: none;
}
</style>
