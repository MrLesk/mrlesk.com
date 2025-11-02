<template>
  <div class="ttyd-frame">
    <iframe
      v-if="isClient"
      ref="frameRef"
      class="ttyd-frame__iframe"
      :src="src"
      :title="title"
      allow="clipboard-read; clipboard-write; fullscreen; keyboard-lock"
      tabindex="-1"
      scrolling="no"
      loading="lazy"
    />
    <div v-else class="ttyd-frame__placeholder">
      Loading terminal…
    </div>
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
const { $clicks } = useSlideContext()

const currentClick = computed(() => {
  const clicks = $clicks?.value ?? 0
  return clicks - props.clickOffset
})

// Watch for click changes and inject text into terminal
watch(currentClick, (newClick, oldClick) => {
  // Only trigger on click increment (not decrement/navigation back)
  if (newClick <= oldClick || newClick < 1) return

  const slotName = `click-${newClick}`
  const slotContent = slots[slotName]

  if (!slotContent) return

  // Extract text content from slot VNode
  const text = extractTextFromSlot(slotContent)
  if (!text) return

  injectTextToTerminal(text)
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

async function injectTextToTerminal(text) {
  if (!text) return

  console.log('[TtydFrame] Attempting to inject text:', text.substring(0, 50) + '...')
  console.log('[TtydFrame] Target session:', sessionName.value)

  try {
    // Use tmux send-keys via a simple HTTP API endpoint
    const response = await fetch('http://localhost:3031/send-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session: sessionName.value,
        text: text,
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
</style>
