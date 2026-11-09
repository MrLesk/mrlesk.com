<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useIsSlideActive, useSlideContext } from '@slidev/client'

// Agents working Backlog.md tasks on a live Groma map, driven by the slide's clicks.
//
// The deck's `scenario` instance runs the agents' steps for real (see setup/scenario.ts): each click
// asks for the phase in `phases`, and the map follows because the files really change. The panel
// over Groma's hierarchy shows what each agent is doing; the pins on the map show where.
// With `review`, the slide only makes sure the agents have finished, so a comparison of what they
// changed is ready, and shows no panel.
// A scenario with a history starts from its first commit, an empty folder. Until the history phase is
// over, the panel shows the commits going by instead of the agents.
// A `live` instance runs real agents instead (see setup/live-agents.ts): they plan as soon as the dev
// server starts, phase 1 sets them going, each card shows what its agent is doing right now, and RESET
// puts the copy back on its baseline and has them plan again.
// Entering the slide on its first click resets the service, so every rehearsal starts the same.
// With `cost`, a live run's slide also shows what the run has cost so far, planning included, priced at list
// prices from the sessions Codex saved (see setup/run-cost.ts): on the agents slide it counts up while they work,
// on a review it says "so far" until every agent has finished.
// With `everyAgent`, a live run's panel lists every agent of the run, one card each: the finished ones, the ones at
// work, then the queued ones, which start as cards free up. The list scrolls inside the panel, by hand, and by itself
// to the first agent still at work whenever that one changes, so the cards at work stay in view.
const props = withDefaults(defineProps<{
  name: string
  origin: string
  views: string[]
  captions?: string[]
  stills?: string[]
  /** The scenario phase each click shows; 0 is the service before the agents start. */
  phases?: number[]
  review?: boolean
  /** Groma's theme: `light` (default), `dark` or `blueprint`; the panel follows it. */
  theme?: string
  /** Groma's pin colour for each assignee, so a card matches its agent's pins. */
  colours?: Record<string, string>
  scale?: number
  /** Live runs only: show what the run has cost so far, bottom right. */
  cost?: boolean
  /** Whether the agents panel shows at each click, like `views`; shown on every click when left out. */
  panels?: boolean[]
  /** Live runs only: one card per agent of the run, queued ones included, in a list that scrolls. */
  everyAgent?: boolean
}>(), {
  captions: () => [],
  stills: () => [],
  phases: () => [],
  review: false,
  theme: 'light',
  colours: () => ({ '@codex': '#2F9ED6', '@claude': '#8B5CF6', '@antigravity': '#E8A317' }),
  scale: 0.6,
  cost: false,
  panels: () => [],
  everyAgent: false,
})

interface Agent {
  agent: string
  name: string
  task: string
  title: string
  /** `queued`: live runs with `everyAgent` only, an agent that starts once a card is free. */
  status: 'planning' | 'idle' | 'working' | 'done' | 'failed' | 'queued'
  file?: string
  checked: number
  criteria: number
  /** Live agents only: what the agent is doing, whether it waits on the API, and for how long it ran. */
  action?: string
  waiting?: boolean
  seconds?: number
  /** Live agents only: the colour of the agent's pin on the map. */
  colour?: string
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
const everyAgentList = ref<Agent[]>([])
const history = ref<{ phase: number, commit: number, total: number, recent: string[] }>()
const live = ref(false)
const base = ref('')
const runCost = ref<{ usd: number, tokens: number, model?: string, tier?: string }>()
const runPhase = ref(0)
const completedTasks = ref(0)
const totalTasks = ref(0)
// A view may name the baseline commit as {base}; it is filled in once the instance reports it.
const frameViews = computed(() => props.views.map(view => view.replaceAll('{base}', base.value)))
let poll: ReturnType<typeof setInterval> | undefined

const phase = computed(() => props.review ? 'end' : String(props.phases[Math.min($clicks.value, props.phases.length - 1)] ?? 0))
// A click can leave the map to itself, for a view that frames the pins before the agents start.
const panelShown = computed(() => props.panels[Math.min($clicks.value, props.panels.length - 1)] ?? true)
// The cards the panel shows: one per agent of the run with `everyAgent`, otherwise one per card of the run.
const cards = computed(() => props.everyAgent && everyAgentList.value.length > 0 ? everyAgentList.value : agents.value)
const list = ref<HTMLElement>()
const firstAtWork = computed(() => cards.value.find(agent => agent.task !== '' && agent.status !== 'done' && agent.status !== 'failed')?.name)
watch(firstAtWork, async (name) => {
  if (!props.everyAgent || name === undefined) return
  await nextTick()
  const card = list.value?.querySelector<HTMLElement>(`[data-agent="${name}"]`)
  if (card) list.value!.scrollTo({ top: card.offsetTop, behavior: 'smooth' })
})
const inHistory = computed(() => !props.review && history.value !== undefined && Number(phase.value) <= history.value.phase)

async function sync(method: 'GET' | 'POST', query = ''): Promise<void> {
  try {
    const state = await (await fetch(`${endpoint.value}${query}`, { method })).json()
    if (Array.isArray(state.agents)) agents.value = state.agents
    if (Array.isArray(state.everyAgent)) everyAgentList.value = state.everyAgent
    history.value = state.history
    live.value = state.live === true
    if (typeof state.base === 'string') base.value = state.base
    if (state.cost !== undefined) runCost.value = state.cost
    if (typeof state.phase === 'number') runPhase.value = state.phase
    if (typeof state.completed === 'number') completedTasks.value = state.completed
    if (typeof state.totalTasks === 'number') totalTasks.value = state.totalTasks
  } catch {
    // Without the dev server there are no agents; the stills stay on screen.
  }
}

// A click on the shown slide moves the agents to its phase. Showing the slide (opening it, coming back to it on a
// later click, a reload, a hot update) moves a scenario there too, but never real agents: for a live run the go is
// only ever the presenter's click, so arriving on the go click just shows the agents as they are.
watch([drives, phase], async ([driving, to], before) => {
  if (!dev || !driving) return
  const [wasDriving, from] = (before ?? []) as [boolean | undefined, string | undefined]
  const clicked = wasDriving === true && from !== undefined && from !== to
  if (!clicked) {
    await sync('GET')
    if (live.value) return
  }
  void sync('POST', `?to=${to}`)
}, { immediate: true })

// A view that names {base} needs the baseline commit before Groma can compare with it: asking as soon as the
// slide is mounted (Slidev mounts the next slides ahead) means the map's first load already has it.
onMounted(() => {
  if (dev && props.views.some(view => view.includes('{base}'))) void sync('GET')
})

watch(active, shown => {
  clearInterval(poll)
  if (dev && shown && !props.review) poll = setInterval(() => sync('GET'), 300)
  else if (dev && shown && props.cost) poll = setInterval(() => sync('GET'), 2000)
}, { immediate: true })

onBeforeUnmount(() => clearInterval(poll))

const short = (file?: string) => file?.split('/').slice(-2).join('/')
const clock = (seconds = 0) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
const reset = () => sync('POST', '?reset')
const dollars = (usd: number) => `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const millions = (tokens: number) => `${(tokens / 1e6).toFixed(1)}M`
const modelName = (model?: string) => model?.replace(/^gpt-([\d.]+)-(\w+)$/, (_, version: string, name: string) => `GPT-${version} ${name[0]!.toUpperCase()}${name.slice(1)}`) ?? 'Codex'
const tierName = (tier?: string) => ({ ultrafast: 'Ultrafast', priority: 'Fast', fast: 'Fast', flex: 'Flex' } as Record<string, string>)[tier ?? ''] ?? ''
</script>

<template>
  <GromaFrame :key="origin" :origin="origin" :views="frameViews" :captions="captions" :stills="stills" :scale="scale" :theme="theme" />
  <!-- On the agents slide the cost appears with the click that starts them; a review always shows it. -->
  <transition name="groma-cost">
    <div v-if="cost && live && runCost && runCost.tokens > 0 && (review || Number(phase) >= 1)" class="groma-cost">
      <span class="groma-cost-label">{{ runPhase === 2 ? 'THIS RUN' : 'THIS RUN, SO FAR' }}</span>
      <b>≈ {{ dollars(runCost.usd) }}</b>
      <span class="groma-cost-line">{{ agents.length }} agents · {{ millions(runCost.tokens) }} tokens</span>
      <span class="groma-cost-line">{{ modelName(runCost.model) }} {{ tierName(runCost.tier) }} · list prices</span>
    </div>
  </transition>
  <div v-if="inHistory && history" class="groma-agents" :class="{ blueprint: theme === 'blueprint', dark: theme === 'dark' }">
    <p class="groma-agents-label">HISTORY</p>
    <p class="groma-history-count"><b>{{ history.commit }}</b> / {{ history.total }} commits</p>
    <div class="groma-history-bar"><i :style="{ transform: `scaleX(${history.commit / history.total})` }" /></div>
    <ol class="groma-history-log">
      <li v-for="(subject, n) in history.recent" :key="history.commit - n" :class="{ latest: n === 0 }">{{ subject }}</li>
    </ol>
  </div>
  <div v-else-if="!review && agents.length > 0" class="groma-agents" :class="{ compact: cards.length > 3, every: everyAgent, blueprint: theme === 'blueprint', dark: theme === 'dark', 'panel-hidden': !panelShown }">
    <p class="groma-agents-label">
      AGENTS<span v-if="live && totalTasks > agents.length"> · {{ completedTasks }}/{{ totalTasks }}</span>
      <button v-if="dev && live" class="groma-agents-reset" title="Stop the agents and go back to the baseline" @click="reset">RESET</button>
    </p>
    <div ref="list" class="groma-agents-list">
      <div
        v-for="agent in cards"
        :key="agent.name"
        class="groma-agent"
        :class="[agent.status, { ready: live && agent.status === 'idle' && agent.task !== '' }]"
        :data-agent="agent.name"
        :style="{ '--agent': agent.status === 'queued' ? '#c9c8c2' : agent.colour ?? colours[agent.agent] ?? '#9aa0a8' }"
      >
        <header>
          <i />
          <b>{{ agent.name }}</b>
          <span v-if="live && agent.status !== 'idle' && agent.status !== 'planning' && agent.task !== ''" class="clock">{{ clock(agent.seconds) }}</span>
          <span v-if="(live || agent.status !== 'idle') && agent.task !== ''" class="task">{{ agent.task }}</span>
        </header>
        <!-- A live agent has its task before it starts: the card shows it, ready. -->
        <p v-if="agent.status === 'queued'" class="waiting">queued</p>
        <p v-else-if="(agent.status === 'idle' && !live) || agent.task === ''" class="waiting">waiting for a ready task</p>
        <template v-else>
          <p class="title">{{ agent.title }}</p>
          <transition name="groma-agent-line" mode="out-in">
            <p v-if="agent.status === 'planning'" key="planning" class="line">› planning</p>
            <p v-else-if="agent.status === 'idle'" key="ready" class="line">› ready</p>
            <p v-else-if="agent.status === 'done'" key="done" class="line done">{{ live ? '✓ done' : '✓ done, committed' }}</p>
            <p v-else-if="agent.status === 'failed'" key="failed" class="line failed">× {{ agent.action }}</p>
            <p v-else-if="agent.waiting" key="waiting" class="line">… waiting for the API</p>
            <p v-else-if="live && agent.action" :key="agent.action" class="line">› {{ agent.action }}</p>
            <p v-else-if="agent.file" :key="agent.file" class="line">› {{ short(agent.file) }}</p>
            <p v-else key="start" class="line">› reading the task</p>
          </transition>
          <div class="criteria" :title="`${agent.checked} of ${agent.criteria} acceptance criteria`">
            <i v-for="n in agent.criteria" :key="n" :class="{ on: n <= agent.checked }" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style>
/* The run's cost: bottom right, level with the caption card bottom left, and in its style. Groma's details
   panel only opens there when something is selected, and its live work island sits bottom centre. */
.groma-cost {
  position: absolute;
  right: 40px;
  bottom: 34px;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
  padding: 8px 13px 9px;
  border: 1.5px solid var(--groma-ink, #171b1a);
  background: var(--groma-paper, #f7f6f2);
  box-shadow: 7px 7px 0 -3px var(--groma-accent, var(--groma-green, #1d9e75));
  color: var(--groma-ink, #171b1a);
  text-align: right;
}

/* Moves like the caption card (GromaFrame's groma-caption): 0.3 s fade and an 8 px rise. The caption swaps
   out, then in, so the card waits the 0.3 s of the old caption leaving and rises with the new one. */
.groma-cost-enter-active {
  transition: opacity 0.3s ease 0.3s, transform 0.3s ease 0.3s;
}

.groma-cost-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.groma-cost-enter-from,
.groma-cost-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.groma-cost b {
  font-size: 23px;
  font-weight: 750;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.groma-cost-label,
.groma-cost-line {
  font-family: "Fira Code", ui-monospace, monospace;
  font-size: 8.5px;
  letter-spacing: 0.1em;
}

.groma-cost-label {
  font-weight: 700;
  letter-spacing: 0.16em;
}

.groma-cost-line {
  opacity: 0.72;
}

/* Sits exactly over Groma's hierarchy panel at the default scale (0.6) and inset (22): the agents
   take the place of a panel this beat does not need, and the camera already frames the map beside it.
   It grows below that panel when the cards need more room, under the caption, which stays on top. */
.groma-agents {
  position: absolute;
  z-index: 4;
  top: 67px;
  left: 29px;
  display: flex;
  width: 216px;
  min-height: 386px;
  box-sizing: border-box;
  flex-direction: column;
  gap: 9px;
  padding: 12px 12px 14px;
  border: 1px solid #dddcd6;
  border-radius: 6px;
  background: #ffffff;
  font-family: "Fira Code", ui-monospace, monospace;
  transition: opacity 0.4s ease, transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* A click that leaves the map to itself (`panels`): the panel slides out to the left and comes back with the next. */
.groma-agents.panel-hidden {
  opacity: 0;
  pointer-events: none;
  transform: translateX(-14px);
}

/* The cards, with the panel's gap between them. Positioned, so a card's offsetTop is its place in the list. */
.groma-agents-list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: inherit;
}

/* `everyAgent`: the panel keeps the hierarchy panel's height, and the list scrolls inside it under the header. */
.groma-agents.every {
  height: 386px;
}

.groma-agents.every .groma-agents-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: #d3d2cc transparent;
}

.groma-agents.every .groma-agent {
  flex-shrink: 0;
}

.groma-agent.queued header b {
  color: #8a8f8c;
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

.groma-agent .line.failed {
  color: #c2463b;
}

.groma-agent header .clock {
  margin-left: auto;
  color: #6f7673;
  font-size: 8.5px;
}

.groma-agent header .clock + .task {
  margin-left: 6px;
}

.groma-agents-label {
  display: flex;
  align-items: center;
}

.groma-agents-reset {
  margin-left: auto;
  padding: 1px 5px;
  border: 1px solid #dddcd6;
  border-radius: 3px;
  background: none;
  color: #6f7673;
  font: inherit;
  cursor: pointer;
}

/* Up to six agents fit when each card keeps to its name, task, current line and criteria. */
.groma-agents.compact {
  gap: 4px;
  padding: 10px 12px 11px;
}

.groma-agents.compact .groma-agent header b {
  font-size: 11.5px;
}

.groma-agents.compact .groma-agent {
  gap: 1px;
  padding: 5px 9px 6px;
}

.groma-agents.compact .groma-agent .title {
  overflow: hidden;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* With up to six agents, the current line and the criteria share a row, so six cards fit the panel. */
.groma-agents.compact .groma-agent {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 8px;
}

.groma-agents.compact .groma-agent header,
.groma-agents.compact .groma-agent .title,
.groma-agents.compact .groma-agent .waiting {
  grid-column: 1 / -1;
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

.groma-history-count {
  margin: 0 !important;
  color: #5d6764;
  font-family: Inter, system-ui, sans-serif;
  font-size: 11px;
}

.groma-history-count b {
  color: #171b1a;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.groma-history-bar {
  height: 3px;
  overflow: hidden;
  border-radius: 2px;
  background: #e2e1db;
}

.groma-history-bar i {
  display: block;
  height: 100%;
  background: #1d9e75;
  transform-origin: left;
  transition: transform 0.3s ease;
}

.groma-history-log {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin: 6px 0 0 !important;
  padding: 0 !important;
  list-style: none;
}

.groma-history-log li {
  overflow: hidden;
  color: #9a9f9c;
  font-size: 8.5px;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.groma-history-log li.latest {
  color: #171b1a;
  font-size: 9.5px;
  animation: groma-history-in 0.25s ease;
}

@keyframes groma-history-in {
  from { opacity: 0; transform: translateY(-3px); }
}

/* Over Groma's blueprint theme, the panel takes its colours (src/viewers/web/atoms/theme.ts in Groma). */
.groma-agents.blueprint {
  border-color: #164764;
  background: #07152b;
}

.groma-agents.blueprint .groma-agents-label,
.groma-agents.blueprint .groma-agent header .clock,
.groma-agents.blueprint .groma-agents-reset {
  color: #79a9bd;
}

.groma-agents.blueprint .groma-agents-reset {
  border-color: #164764;
}

.groma-agents.blueprint .groma-agent {
  border-color: #164764;
  border-left-color: var(--agent);
  background: #0b1e3a;
}

.groma-agents.blueprint .groma-agent.idle {
  border-left-color: #2c496c;
}

.groma-agents.blueprint .groma-agent header b,
.groma-agents.blueprint .groma-agent .title,
.groma-agents.blueprint .groma-history-count b,
.groma-agents.blueprint .groma-history-log li.latest {
  color: #d8f3ff;
}

.groma-agents.blueprint .groma-agent .line,
.groma-agents.blueprint .groma-history-count {
  color: #79a9bd;
}

.groma-agents.blueprint .groma-agent .waiting,
.groma-agents.blueprint .groma-history-log li {
  color: #527cb0;
}

.groma-agents.blueprint .groma-agent .line.done {
  color: #3ddc97;
}

.groma-agents.blueprint .groma-agent .line.failed {
  color: #ff8fab;
}

.groma-agents.blueprint .groma-agent .criteria i,
.groma-agents.blueprint .groma-history-bar {
  background: #164764;
}

.groma-agents.blueprint .groma-agent .criteria i.on {
  background: var(--agent);
}

/* Over Groma's dark theme, the panel takes its colours (src/viewers/web/atoms/theme.ts in Groma). */
.groma-agents.dark {
  border-color: #2a2e33;
  background: #111315;
}

.groma-agents.dark .groma-agents-label,
.groma-agents.dark .groma-agent header .clock,
.groma-agents.dark .groma-agents-reset {
  color: #9aa0a8;
}

.groma-agents.dark .groma-agents-reset {
  border-color: #2a2e33;
}

.groma-agents.dark .groma-agent {
  border-color: #2a2e33;
  border-left-color: var(--agent);
  background: #181b1e;
}

.groma-agents.dark .groma-agent.idle {
  border-left-color: #4a5058;
}

.groma-agents.dark .groma-agent header b,
.groma-agents.dark .groma-agent .title,
.groma-agents.dark .groma-history-count b,
.groma-agents.dark .groma-history-log li.latest {
  color: #e6e8eb;
}

.groma-agents.dark .groma-agent .line,
.groma-agents.dark .groma-history-count {
  color: #9aa0a8;
}

.groma-agents.dark .groma-agent .waiting,
.groma-agents.dark .groma-history-log li {
  color: #6b717a;
}

.groma-agents.dark .groma-agent .line.done {
  color: #3ddc97;
}

.groma-agents.dark .groma-agent .line.failed {
  color: #ff7b72;
}

.groma-agents.dark .groma-agent .criteria i,
.groma-agents.dark .groma-history-bar {
  background: #2a2e33;
}

.groma-agents.dark .groma-agent .criteria i.on {
  background: var(--agent);
}

/* A live agent that has not started yet already carries its task's colour. */
.groma-agents .groma-agent.idle.ready,
.groma-agents.dark .groma-agent.idle.ready,
.groma-agents.blueprint .groma-agent.idle.ready {
  border-left-color: var(--agent);
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
