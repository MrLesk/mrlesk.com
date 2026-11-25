<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useSlideSteps } from '../composables/useSlideSteps'

// Slide "Get ready": on screen while people sit down, so everyone can check before the
// presentation that they can build. It has no clicks. Two things keep moving for as long as
// the slide is up: the three steps light up one after another, and the message box keeps
// typing "@Sites".
const { isLive } = useSlideSteps(0)

const STEPS = [
  { label: 'ChatGPT', hint: 'Open it' },
  { label: 'Work', hint: 'Switch to it' },
  { label: '@Sites', hint: 'Type it' },
]

/** The mention is shown for this long, then hidden for the same time, again and again. */
const MENTION_BLINK_MS = 2600
const isMentionShown = ref(true)
let blinker: ReturnType<typeof setInterval> | undefined

watch(isLive, (live) => {
  clearInterval(blinker)
  isMentionShown.value = true
  if (!live) return
  blinker = setInterval(() => {
    isMentionShown.value = !isMentionShown.value
  }, MENTION_BLINK_MS)
}, { immediate: true })

onBeforeUnmount(() => clearInterval(blinker))
</script>

<template>
  <div class="ready">
    <div class="ready-steps">
      <template v-for="(step, index) in STEPS" :key="step.label">
        <SiteIcon v-if="index > 0" name="chevron" class="ready-arrow" />
        <div class="ready-step" :style="{ '--order': index }">
          <span class="ready-step-number">{{ index + 1 }}</span>
          <span class="ready-step-label">{{ step.label }}</span>
          <span class="ready-step-hint">{{ step.hint }}</span>
        </div>
      </template>
    </div>

    <div class="ready-check">
      <SitesPrompt class="ready-prompt" text="" :mention="isMentionShown" placeholder="the site you want to build" />
      <p class="ready-line"><SiteIcon name="check" class="ready-tick" /><span>You see <strong>@Sites</strong>? You are ready.</span></p>
    </div>

    <div class="ready-fallback">
      <strong>No Work or @Sites?</strong>
      Sit next to someone who has it, or take the browser starter.
    </div>

    <p class="ready-footnote">Sites needs ChatGPT Plus, Pro or Business.</p>
  </div>
</template>

<style scoped>
.ready {
  display: flex;
  flex-direction: column;
  height: calc(350 * var(--pt));
}

.ready > * {
  flex: none;
}

/* ── The three steps ────────────────────────────────────────────────────── */

.ready-steps {
  display: flex;
  align-items: center;
  gap: calc(14 * var(--pt));
  margin-top: calc(6 * var(--pt));
}

.ready-step {
  flex: 1;
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: calc(12 * var(--pt));
  align-items: center;
  padding: calc(22 * var(--pt)) calc(20 * var(--pt));
  border: 1px solid var(--sites-line);
  border-radius: calc(16 * var(--pt));
  background: #ffffff;
  animation:
    sites-rise 700ms var(--sites-ease-out) both,
    ready-step-turn 4.8s ease-in-out infinite;
  /* Each step rises a little after the one before it, and takes its turn in the light. */
  animation-delay: calc(150ms + var(--order) * 130ms), calc(1200ms + var(--order) * 1600ms);
}

.ready-step-number {
  grid-row: 1 / span 2;
  display: grid;
  place-items: center;
  width: calc(40 * var(--pt));
  height: calc(40 * var(--pt));
  border-radius: 50%;
  background: var(--codex-accent-soft);
  color: var(--codex-accent);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: calc(16 * var(--pt));
  font-weight: 600;
}

.ready-step-label {
  font-size: calc(27 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.ready-step-hint {
  color: var(--codex-fg-muted);
  font-size: calc(15 * var(--pt));
}

.ready-arrow {
  flex: none;
  color: var(--codex-fg-muted);
  font-size: calc(20 * var(--pt));
  animation: sites-rise 700ms var(--sites-ease-out) 400ms both;
}

/* ── What "ready" looks like ────────────────────────────────────────────── */

.ready-check {
  display: grid;
  grid-template-columns: calc(380 * var(--pt)) 1fr;
  align-items: center;
  gap: calc(28 * var(--pt));
  margin-top: calc(34 * var(--pt));
  animation: sites-rise 700ms var(--sites-ease-out) 600ms both;
}

.ready-prompt {
  font-size: calc(14 * var(--pt));
}

.ready-line {
  display: flex;
  align-items: center;
  gap: calc(10 * var(--pt));
  margin: 0;
  font-size: calc(24 * var(--pt));
  font-weight: 500;
  letter-spacing: -0.015em;
}

.ready-line strong {
  color: var(--codex-accent);
  font-weight: 600;
}

.ready-tick {
  flex: none;
  box-sizing: border-box;
  width: 1.5em;
  height: 1.5em;
  padding: 0.3em;
  border-radius: 50%;
  background: var(--sites-live);
  color: #ffffff;
  stroke-width: 3;
}

/* ── No access ──────────────────────────────────────────────────────────── */

.ready-fallback {
  margin-top: calc(34 * var(--pt));
  padding: calc(16 * var(--pt)) calc(20 * var(--pt));
  border: 1.5px dashed rgba(3, 10, 24, 0.22);
  border-radius: calc(14 * var(--pt));
  color: var(--codex-fg-muted);
  font-size: calc(17 * var(--pt));
  animation: sites-rise 700ms var(--sites-ease-out) 750ms both;
}

.ready-fallback strong {
  margin-right: calc(6 * var(--pt));
  color: var(--codex-fg);
  font-weight: 600;
}

.ready-footnote {
  margin: auto 0 0 0;
  color: var(--codex-fg-muted);
  font-size: calc(12 * var(--pt));
  animation: sites-rise 700ms var(--sites-ease-out) 900ms both;
}

/* One step at a time lights up: its turn is the first third of the loop. */
@keyframes ready-step-turn {
  0%,
  33%,
  100% {
    border-color: var(--sites-line);
    box-shadow: 0 0 0 0 rgba(52, 66, 224, 0);
  }
  8%,
  25% {
    border-color: var(--codex-accent);
    box-shadow: 0 calc(10 * var(--pt)) calc(28 * var(--pt)) rgba(52, 66, 224, 0.2);
  }
}
</style>
