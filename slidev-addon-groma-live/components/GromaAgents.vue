<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useIsSlideActive, useSlideContext } from '@slidev/client'

// Agents working Backlog.md tasks on a live Groma map, driven by the slide's clicks.
//
// The deck's `scenario` instance runs the agents' steps for real (see setup/scenario.ts): each click
// asks for the phase in `phases`, and the map follows because the files really change. The panel
// over Groma's hierarchy shows what each agent is doing; the pins on the map show where.
// With `review`, the slide only makes sure the agents have finished, so a comparison of what they
// changed is ready, and shows no panel.
// Entering the slide on its first click resets the service, so every rehearsal starts the same.
const props = withDefaults(defineProps<{
  name: string
  origin: string
  views: string[]
  captions?: string[]
  stills?: string[]
  /** The scenario phase each click shows; 0 is the service before the agents start. */
  phases?: number[]
  review?: boolean
  /** Groma's pin colour for each assignee, so a card matches its agent's pins. */
  colours?: Record<string, string>
  scale?: number
}>(), {
  captions: () => [],
  stills: () => [],
  phases: () => [],
  review: false,
  colours: () => ({ '@codex': '#2F9ED6', '@claude': '#8B5CF6', '@antigravity': '#E8A317' }),
  scale: 0.6,
})

interface Agent {
  agent: string
  name: string
  task: string
  title: string
  status: 'idle' | 'working' | 'done'
  file?: string
  checked: number
  criteria: number
}

const { $clicks, $renderContext } = useSlideContext()
const active = useIsSlideActive()
// Slidev also counts the presenter's preview of the next click, and the overview, as this slide
// being active. Only the slide itself (the audience window or the presenter's main view) may move
// the shared demo; a preview that asked for the next click too would fight it.
const drives = computed(() => active.value && ['slide', 'presenter'].includes($renderContext.value))
// Only the dev server runs the agents; a built deck shows the stills and never asks.
const dev = import.meta.env.DEV
const endpoint = computed(() => `${import.meta.env.BASE_URL}__groma-live/${props.name}`)
const agents = ref<Agent[]>([])
let poll: ReturnType<typeof setInterval> | undefined

const phase = computed(() => props.review ? 'end' : String(props.phases[Math.min($clicks.value, props.phases.length - 1)] ?? 0))

async function sync(method: 'GET' | 'POST', query = ''): Promise<void> {
  try {
    const state = await (await fetch(`${endpoint.value}${query}`, { method })).json()
    if (Array.isArray(state.agents)) agents.value = state.agents
  } catch {
    // Without the dev server there are no agents; the stills stay on screen.
  }
}

watch([drives, phase], ([driving, to]) => {
  if (dev && driving) void sync('POST', `?to=${to}`)
}, { immediate: true })

watch(active, shown => {
  clearInterval(poll)
  if (dev && shown && !props.review) poll = setInterval(() => sync('GET'), 300)
}, { immediate: true })

onBeforeUnmount(() => clearInterval(poll))

const short = (file?: string) => file?.split('/').slice(-2).join('/')
</script>

<template>
  <GromaFrame :origin="origin" :views="views" :captions="captions" :stills="stills" :scale="scale" />
  <div v-if="!review && agents.length > 0" class="groma-agents">
    <p class="groma-agents-label">AGENTS</p>
    <div
      v-for="agent in agents"
      :key="agent.agent"
      class="groma-agent"
      :class="agent.status"
      :style="{ '--agent': colours[agent.agent] ?? 'var(--ink)' }"
    >
      <header>
        <i />
        <b>{{ agent.name }}</b>
        <span v-if="agent.status !== 'idle'" class="task">{{ agent.task }}</span>
      </header>
      <p v-if="agent.status === 'idle'" class="waiting">waiting for a task</p>
      <template v-else>
        <p class="title">{{ agent.title }}</p>
        <transition name="groma-agent-line" mode="out-in">
          <p v-if="agent.status === 'done'" key="done" class="line done">✓ done, committed</p>
          <p v-else-if="agent.file" :key="agent.file" class="line">› {{ short(agent.file) }}</p>
          <p v-else key="start" class="line">› reading the task</p>
        </transition>
        <div class="criteria" :title="`${agent.checked} of ${agent.criteria} acceptance criteria`">
          <i v-for="n in agent.criteria" :key="n" :class="{ on: n <= agent.checked }" />
        </div>
      </template>
    </div>
  </div>
</template>

<style>
/* Sits exactly over Groma's hierarchy panel at the default scale (0.6) and inset (22): the agents
   take the place of a panel this beat does not need, and the camera already frames the map beside it. */
.groma-agents {
  position: absolute;
  z-index: 4;
  top: 67px;
  left: 29px;
  display: flex;
  width: 216px;
  height: 386px;
  box-sizing: border-box;
  flex-direction: column;
  gap: 9px;
  padding: 12px 12px 14px;
  border: 1px solid #dddcd6;
  border-radius: 6px;
  background: #ffffff;
  font-family: "Fira Code", ui-monospace, monospace;
}

.groma-agents-label {
  margin: 0 0 2px !important;
  color: #6f7673;
  font-size: 8px;
  letter-spacing: 0.14em;
}

.groma-agent {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 9px 10px 10px;
  border: 1px solid #e6e5df;
  border-left: 3px solid var(--agent);
  border-radius: 4px;
  background: #fbfbf9;
  transition: opacity 0.4s ease, border-color 0.4s ease;
}

.groma-agent.idle {
  border-left-color: #d3d2cc;
}

.groma-agent header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.groma-agent header i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--agent);
}

.groma-agent header b {
  color: #171b1a;
  font-family: Inter, system-ui, sans-serif;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: -0.01em;
}

.groma-agent header .task {
  margin-left: auto;
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--agent);
  color: #ffffff;
  font-size: 8.5px;
  letter-spacing: 0.04em;
}

.groma-agent p {
  margin: 0 !important;
  line-height: 1.3 !important;
}

.groma-agent .waiting {
  color: #9a9f9c;
  font-size: 9px;
}

.groma-agent .title {
  color: #171b1a;
  font-family: Inter, system-ui, sans-serif;
  font-size: 11px;
  font-weight: 560;
}

.groma-agent .line {
  overflow: hidden;
  color: #5d6764;
  font-size: 8.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.groma-agent .line.done {
  color: #1d9e75;
}

.groma-agent .criteria {
  display: flex;
  gap: 3px;
}

.groma-agent .criteria i {
  width: 14px;
  height: 3px;
  border-radius: 2px;
  background: #e2e1db;
  transition: background 0.4s ease;
}

.groma-agent .criteria i.on {
  background: var(--agent);
}

.groma-agent-line-enter-active,
.groma-agent-line-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.groma-agent-line-enter-from {
  opacity: 0;
  transform: translateY(3px);
}

.groma-agent-line-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}
</style>
