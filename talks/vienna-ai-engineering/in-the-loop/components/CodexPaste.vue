<script setup lang="ts">
import { useIsSlideActive, useSlideContext } from '@slidev/client'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

// The prompt from Groma.md's "First scan" notice on the previous slide goes to Codex, on the presenter's clicks.
// When the slide opens, the pointer comes to Copy prompt and waits. Click 1 presses it, and the notice gives way to
// a Codex terminal; click 2 pastes the prompt (⌘V); click 3 sends it (⏎) and Codex starts working. Going back a
// click returns to where that click started; previews, the overview and a slide entered from the next one show
// where it ends. The text is Groma.md's own, word for word (src/viewers/web/chrome/empty.ts in the Groma.md repository).
const prompt = "Curate this repository's architecture with Groma. Run groma agent-instructions and follow its curation workflow. Describe the architecture as it exists today; do not change application code."

const active = useIsSlideActive()
const { $renderContext, $clicks } = useSlideContext()
const plays = computed(() => active.value && ['slide', 'presenter'].includes($renderContext.value))

/** 1 pointer on Copy, 2 copied, 3 Codex opens, 4 pasted, 5 sent, 6 working, 7 first command. */
const LAST = 7
const step = ref(LAST)
const seconds = ref(0)
/** Where each click rests, and what a click forward plays to get there (milliseconds after the click, step). */
const rest = [1, 3, 4, LAST]
const forward: [number, number][][] = [
  [[0, 2], [800, 3]],
  [[0, 4]],
  [[0, 5], [300, 6], [1500, 7]],
]
let timers: ReturnType<typeof setTimeout>[] = []
let clock: ReturnType<typeof setInterval> | undefined
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

function stop(): void {
  timers.forEach(clearTimeout)
  timers = []
  clearInterval(clock)
  clock = undefined
}

function run(steps: [number, number][]): void {
  stop()
  if (reduced()) {
    step.value = steps[steps.length - 1]![1]
    return
  }
  timers = steps.map(([at, to]) => setTimeout(() => { step.value = to }, at))
}

/** Shows where a click rests, without playing anything. */
function settle(click: number): void {
  stop()
  step.value = rest[Math.min(Math.max(click, 0), rest.length - 1)]!
  if (step.value < 6) seconds.value = 0
}

// Opening the slide on its first click brings the pointer to Copy prompt; entering it further on shows that click.
watch(plays, now => {
  if (!now) return (stop(), step.value = LAST)
  seconds.value = 0
  if ($clicks.value > 0) return settle($clicks.value)
  step.value = 0
  run([[700, 1]])
}, { immediate: true })

// One click forward plays its step; any other move (back, or a jump) shows where that click rests.
watch($clicks, (now, before) => {
  if (!plays.value) return
  if (now === before + 1 && forward[before] !== undefined) run(forward[before]!)
  else settle(now)
})
// Codex counts the seconds it has been working.
watch(step, now => {
  if (now === 6 && clock === undefined) clock = setInterval(() => { seconds.value++ }, 1000)
})
onBeforeUnmount(stop)

const classes = computed(() => Object.fromEntries(Array.from({ length: LAST }, (_, i) => [`s${i + 1}`, step.value >= i + 1])))
// "45s", then "2m 05s", as Codex writes it.
const elapsed = computed(() => seconds.value < 60 ? `${seconds.value}s` : `${Math.floor(seconds.value / 60)}m ${String(seconds.value % 60).padStart(2, '0')}s`)
</script>

<template>
  <div class="codex-paste" :class="classes">
    <!-- Groma.md's notice after a first scan, as on the previous slide. -->
    <div class="cp-card" aria-hidden="true">
      <span class="cp-dismiss">×</span>
      <span class="cp-title">First scan</span>
      <span class="cp-hint">Ask your coding agent to curate this architecture.</span>
      <span class="cp-prompt">{{ prompt }}</span>
      <!-- Both labels share one cell, so the button keeps the width of Copy prompt when it says Copied. -->
      <span class="cp-copy">
        <span class="cp-copy-label cp-copy-idle">Copy prompt</span>
        <span class="cp-copy-label cp-copy-done"><svg class="cp-check" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 8.5l3.5 3.5 7.5-8" /></svg>Copied</span>
        <svg class="cp-pointer" viewBox="0 0 16 24" aria-hidden="true">
        <path d="M1 1v19.5l5.2-5 3.4 7.7 3.1-1.4-3.4-7.5H16z" fill="#111" stroke="#fff" stroke-width="1.4" stroke-linejoin="round" />
      </svg></span>
    </div>

    <!-- Codex in a terminal, in the deck's terminal style. -->
    <div class="cp-term">
      <div class="cp-bar"><i /><i /><i /><span>codex · keycloak</span></div>
      <div class="cp-body">
        <!-- Sending scrolls the header away; half of it would linger under the bar. -->
        <div v-if="step < 5" class="cp-head"><b>&gt;_</b> OpenAI Codex <span>~/projects/keycloak</span></div>
        <div v-if="step >= 5" class="cp-user"><span>›</span>{{ prompt }}</div>
        <div v-if="step >= 7" class="cp-tool"><span>•</span>Running <b>groma agent-instructions</b></div>
        <div v-if="step >= 6" class="cp-status"><span class="cp-spin" /><b>Working</b> ({{ elapsed }} • esc to interrupt)</div>
        <div class="cp-composer">
          <span class="cp-caret">›</span>
          <span v-if="step === 4" class="cp-pasted">{{ prompt }}</span>
          <span v-else class="cp-placeholder">Ask Codex to do anything</span>
          <span class="cp-key cp-key-paste">⌘V</span>
          <span class="cp-key cp-key-send">⏎</span>
        </div>
      </div>
    </div>
  </div>
</template>
