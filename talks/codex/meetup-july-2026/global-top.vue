<script setup lang="ts">
import { useNav } from '@slidev/client'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import {
  RealtimeSlideDirector,
  type SlideDirectorDebugEntry,
  type SlideDirectorStatus,
} from './scripts/realtime-slide-director-client'
import type { SlideDirectorToolName } from './scripts/slide-director'

type SlideControlAction = 'next' | 'previous'

interface SlideControlCommand {
  action: SlideControlAction
  requestId: string
}

const COMMAND_EVENT = 'slidev-control:command'
const ACK_EVENT = 'slidev-control:ack'
const STATE_EVENT = 'slidev-control:state'

const nav = useNav()
const hot = import.meta.hot
const director = shallowRef<RealtimeSlideDirector | null>(null)
const directorStatus = ref<SlideDirectorStatus>('off')
const directorMessage = ref('Auto slides are off')
const debugEnabled = ref(false)
const debugEntries = ref<SlideDirectorDebugEntry[]>([])
const liveTranscript = ref('')
const liveTranscriptItemId = ref<string | null>(null)
const debugSlideLabel = computed(() => `${nav.currentSlideNo.value}/${nav.total.value}`)

const directorLabel = computed(() => {
  switch (directorStatus.value) {
    case 'connecting': return 'Connecting…'
    case 'listening': return 'Auto'
    case 'acting': return 'Turning…'
    case 'error': return 'Retry auto'
    default: return 'Auto slides'
  }
})

function currentState() {
  return {
    currentSlide: nav.currentSlideNo.value,
    totalSlides: nav.total.value,
    updatedAt: new Date().toISOString(),
  }
}

function canControl() {
  return (nav.isPlaying.value || nav.isPresenter.value) && !nav.isPrintMode.value
}

function canUseDirector() {
  return Boolean(hot) && canControl()
}

function sendState() {
  if (hot && canControl())
    hot.send(STATE_EVENT, currentState())
}

async function applySlideAction(action: SlideControlAction) {
  const before = nav.currentSlideNo.value

  if (action === 'next' && before < nav.total.value)
    await nav.nextSlide()
  else if (action === 'previous' && before > 1)
    await nav.prevSlide()

  await nextTick()
  sendState()

  return {
    ...currentState(),
    changed: nav.currentSlideNo.value !== before,
  }
}

async function executeDirectorTool(name: SlideDirectorToolName) {
  if (!canControl())
    throw new Error('Slidev is not in the play or presenter view')

  if (name === 'next_slide') {
    return {
      ok: true,
      action: name,
      state: await applySlideAction('next'),
    }
  }

  if (name === 'previous_slide') {
    return {
      ok: true,
      action: name,
      state: await applySlideAction('previous'),
    }
  }

  return {
    ok: true,
    action: name,
    state: currentState(),
  }
}

async function handleCommand(command: SlideControlCommand) {
  if (!hot || !canControl())
    return

  if (command.action !== 'next' && command.action !== 'previous')
    return

  const state = await applySlideAction(command.action)
  hot.send(ACK_EVENT, {
    requestId: command.requestId,
    ...state,
  })
}

async function toggleDirector() {
  if (directorStatus.value === 'connecting' || directorStatus.value === 'listening' || directorStatus.value === 'acting') {
    director.value?.disconnect()
    director.value = null
    return
  }

  if (!canUseDirector())
    return

  const instance = new RealtimeSlideDirector({
    getState: currentState,
    executeTool: executeDirectorTool,
    debug: debugEnabled.value,
    onDebug(entry) {
      const details = entry.details ?? {}
      if (entry.type === 'transcription_delta') {
        const itemId = typeof details.itemId === 'string' ? details.itemId : null
        if (itemId !== liveTranscriptItemId.value) {
          liveTranscriptItemId.value = itemId
          liveTranscript.value = ''
        }
        liveTranscript.value += typeof details.delta === 'string' ? details.delta : ''
        return
      }

      if (entry.type === 'speech_started') {
        liveTranscript.value = ''
        liveTranscriptItemId.value = null
      }
      else if (entry.type === 'transcription_completed') {
        liveTranscript.value = typeof details.transcript === 'string' ? details.transcript : liveTranscript.value
      }

      debugEntries.value = [...debugEntries.value.slice(-49), entry]
    },
    onStatus(status, message) {
      directorStatus.value = status
      directorMessage.value = message
    },
  })
  director.value = instance

  try {
    await instance.connect()
  }
  catch {
    // The controller already exposes the useful error through its status.
  }
}

function formatDebugEntry(entry: SlideDirectorDebugEntry) {
  const details = entry.details ?? {}

  if (entry.type === 'transcription_completed')
    return `heard: ${String(details.transcript ?? '')}`

  if (entry.type === 'model_decision') {
    const tools = Array.isArray(details.tools) ? details.tools : []
    const first = tools[0] as { name?: unknown } | undefined
    const latency = typeof details.decisionLatencyMs === 'number' ? ` · ${details.decisionLatencyMs}ms` : ''
    return `decision: ${String(first?.name ?? 'no tool')}${latency}`
  }

  if (entry.type === 'tool_completed')
    return `result: ${String(details.tool ?? '')} · ${String(details.beforeSlide ?? '?')} → ${String(details.afterSlide ?? '?')}`

  if (entry.type === 'realtime_error' || entry.type === 'session_error' || entry.type === 'tool_failed')
    return `${entry.type}: ${String(details.message ?? 'unknown error')}`

  if (entry.type === 'slide_state_updated')
    return `state: slide ${String(details.currentSlide ?? entry.state.currentSlide)}`

  return entry.type.replaceAll('_', ' ')
}

function handleKeydown(event: KeyboardEvent) {
  if (event.altKey && event.key.toLowerCase() === 'a') {
    event.preventDefault()
    void toggleDirector()
  }
}

const stopStateSync = watch(
  [nav.currentSlideNo, nav.total, nav.isPlaying, nav.isPresenter],
  () => {
    sendState()
    director.value?.updateSlideState(currentState())
  },
  { immediate: true },
)

hot?.on(COMMAND_EVENT, handleCommand)

onMounted(() => {
  debugEnabled.value = new URLSearchParams(window.location.search).get('slideDebug') === '1'
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  stopStateSync()
  director.value?.disconnect(false)
  hot?.off(COMMAND_EVENT, handleCommand)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <details
    v-if="debugEnabled && canUseDirector()"
    class="slide-director-debug"
    open
  >
    <summary>
      Auto debug · slide {{ debugSlideLabel }}
    </summary>
    <div class="slide-director-debug-transcript">
      {{ liveTranscript || 'Waiting for speech…' }}
    </div>
    <div class="slide-director-debug-events">
      <div
        v-for="(entry, index) in debugEntries"
        :key="`${entry.timestamp}-${index}`"
        :data-kind="entry.type.includes('error') || entry.type.includes('failed') ? 'error' : undefined"
      >
        <span>S{{ entry.state.currentSlide }}</span>
        {{ formatDebugEntry(entry) }}
      </div>
    </div>
    <footer>Saved locally to .slide-director-debug.jsonl</footer>
  </details>

  <button
    v-if="canUseDirector()"
    class="slide-director-control"
    :data-status="directorStatus"
    :aria-pressed="directorStatus === 'listening' || directorStatus === 'acting'"
    :disabled="directorStatus === 'connecting' || directorStatus === 'acting'"
    :title="`${directorMessage} · Option/Alt+A`"
    type="button"
    @click.stop="toggleDirector"
  >
    <span class="slide-director-dot" aria-hidden="true"></span>
    <span>{{ directorLabel }}</span>
  </button>
</template>

<style scoped>
.slide-director-debug {
  position: fixed;
  left: 16px;
  bottom: 16px;
  z-index: 1001;
  width: min(430px, calc(100vw - 32px));
  max-height: min(52vh, 430px);
  overflow: hidden;
  border: 1px solid rgba(98, 226, 161, 0.4);
  border-radius: 10px;
  background: rgba(5, 9, 19, 0.94);
  color: rgba(255, 255, 255, 0.82);
  box-shadow: 0 10px 34px rgba(0, 0, 0, 0.42);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
  line-height: 1.45;
}

.slide-director-debug summary {
  padding: 8px 10px;
  color: #62e2a1;
  cursor: pointer;
  user-select: none;
}

.slide-director-debug-transcript {
  margin: 0 9px 8px;
  padding: 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.07);
  color: white;
  font-size: 11px;
}

.slide-director-debug-events {
  max-height: 220px;
  overflow: auto;
  padding: 0 9px;
}

.slide-director-debug-events > div {
  padding: 3px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.slide-director-debug-events span {
  color: #8d9abe;
}

.slide-director-debug-events [data-kind='error'] {
  color: #ff8e8e;
}

.slide-director-debug footer {
  padding: 7px 9px;
  color: rgba(255, 255, 255, 0.42);
}

.slide-director-control {
  position: fixed;
  /* Leave room for the theme's current / total page counter. */
  right: 4.75rem;
  bottom: 16px;
  z-index: 1000;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 24px;
  padding: 4px 9px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  background: rgba(8, 12, 28, 0.76);
  color: rgba(255, 255, 255, 0.82);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.28);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  opacity: 0.42;
  cursor: pointer;
  transition: opacity 120ms ease, border-color 120ms ease, background 120ms ease;
}

.slide-director-control:hover,
.slide-director-control:focus-visible {
  opacity: 1;
  outline: none;
  border-color: rgba(255, 255, 255, 0.42);
}

.slide-director-control:disabled {
  cursor: wait;
}

.slide-director-dot {
  width: 7px;
  height: 7px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #77809a;
}

.slide-director-control[data-status='connecting'] .slide-director-dot,
.slide-director-control[data-status='acting'] .slide-director-dot {
  background: #ffc56f;
  box-shadow: 0 0 8px rgba(255, 197, 111, 0.8);
}

.slide-director-control[data-status='listening'] {
  border-color: rgba(98, 226, 161, 0.42);
}

.slide-director-control[data-status='listening'] .slide-director-dot {
  background: #62e2a1;
  box-shadow: 0 0 8px rgba(98, 226, 161, 0.9);
}

.slide-director-control[data-status='error'] {
  opacity: 0.82;
  border-color: rgba(255, 112, 112, 0.52);
}

.slide-director-control[data-status='error'] .slide-director-dot {
  background: #ff7070;
}
</style>
