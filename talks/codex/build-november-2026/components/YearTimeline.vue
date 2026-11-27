<script setup lang="ts">
import { computed } from 'vue'
import type { YearEvent } from '../lib/year'

// The year as a line from March to December, with one stop per event at its date.
// The line fills up to the active event.
const props = defineProps<{
  events: YearEvent[]
  /** The place in `events` of the event on screen. -1: none yet. `events.length`: all are done. */
  activeIndex: number
}>()

// The line starts a little before the first event and ends a little after the last one.
const LINE_START = Date.UTC(2026, 1, 18)
const LINE_END = Date.UTC(2026, 11, 10)
const MONTH_NAMES = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** How far along the line a moment is, in percent. */
function positionOf(time: number): number {
  return (time - LINE_START) / (LINE_END - LINE_START) * 100
}

const months = MONTH_NAMES.map((name, index) => ({ name, left: `${positionOf(Date.UTC(2026, index + 2, 1))}%` }))
const stops = computed(() => props.events.map(event => `${positionOf(Date.parse(event.date))}%`))

const filledWidth = computed(() => {
  if (props.activeIndex < 0) return '0%'
  return stops.value[Math.min(props.activeIndex, props.events.length - 1)]
})
</script>

<template>
  <div class="year-line" aria-hidden="true">
    <span class="year-line-fill" :style="{ width: filledWidth }" />
    <span v-for="month in months" :key="month.name" class="year-line-month" :style="{ left: month.left }">{{ month.name }}</span>
    <span
      v-for="(left, index) in stops"
      :key="index"
      class="year-line-stop"
      :class="{ 'is-done': index < activeIndex, 'is-active': index === activeIndex }"
      :style="{ left }"
    />
  </div>
</template>

<style scoped>
.year-line {
  position: relative;
  height: calc(4 * var(--pt));
  border-radius: calc(2 * var(--pt));
  background: rgba(3, 10, 24, 0.12);
}

.year-line-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  border-radius: calc(2 * var(--pt));
  background: linear-gradient(90deg, var(--codex-grad-1), var(--codex-grad-2) 60%, var(--codex-grad-3));
  transition: width 900ms var(--deck-ease-out);
}

.year-line-month {
  position: absolute;
  top: calc(12 * var(--pt));
  font-size: calc(10.5 * var(--pt));
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--codex-fg-muted);
}

.year-line-stop {
  position: absolute;
  top: 50%;
  width: calc(12 * var(--pt));
  height: calc(12 * var(--pt));
  margin: calc(-6 * var(--pt)) 0 0 calc(-6 * var(--pt));
  border-radius: 50%;
  border: calc(2 * var(--pt)) solid rgba(3, 10, 24, 0.25);
  background: #ffffff;
  transition:
    scale 500ms var(--deck-ease-spring),
    border-color 400ms ease,
    background-color 400ms ease;
}

.year-line-stop.is-done {
  border-color: var(--codex-accent);
  background: var(--codex-accent);
}

.year-line-stop.is-active {
  scale: 1.7;
  border-color: var(--codex-accent);
  background: #ffffff;
  box-shadow: 0 0 0 calc(5 * var(--pt)) rgba(52, 66, 224, 0.2);
  animation: year-line-pulse 1.8s ease-in-out infinite;
}

@keyframes year-line-pulse {
  0%, 100% { box-shadow: 0 0 0 calc(3 * var(--pt)) rgba(52, 66, 224, 0.28); }
  50% { box-shadow: 0 0 0 calc(8 * var(--pt)) rgba(52, 66, 224, 0); }
}
</style>
