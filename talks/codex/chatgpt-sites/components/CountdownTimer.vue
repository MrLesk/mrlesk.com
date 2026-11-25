<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import { useCountdown } from '../composables/useCountdown'

// A countdown clock: a ring that empties and the time left in its middle.
//
// The slide starts it by turning `started` on, which every workshop slide does on its first
// click. See composables/useCountdown.ts for what keeps it running.
//
// A slide may hold only one clock, because the clock is named after its slide's number.
// Sizes are in em: a parent sets the size of the clock with one font-size. With `compact`
// the time stands beside a small ring, for the header of a slide.
const props = withDefaults(defineProps<{
  /** Length of the countdown. */
  minutes: number
  /** Turns on to start the clock. */
  started: boolean
  /** True while the slide is on screen for real. Pass `isLive` from useSlideSteps. */
  live: boolean
  /** Small ring with the time beside it. */
  compact?: boolean
}>(), {
  compact: false,
})

const { $page } = useSlideContext()
const totalSeconds = props.minutes * 60
const { secondsLeft, isRunning, isOver } = useCountdown(`slide-${$page.value}`, totalSeconds, () => props.started, () => props.live)

const timeLeft = computed(() => {
  const minutesPart = Math.floor(secondsLeft.value / 60)
  const secondsPart = String(secondsLeft.value % 60).padStart(2, '0')
  return `${minutesPart}:${secondsPart}`
})

/** How much of the ring is still drawn: 1 at the start, 0 when the time is up. */
const shareLeft = computed(() => secondsLeft.value / totalSeconds)
</script>

<template>
  <span
    class="countdown"
    :class="{ 'is-compact': compact, 'is-running': isRunning, 'is-over': isOver }"
    :style="{ '--share-left': shareLeft }"
    role="timer"
    :aria-label="`${timeLeft} left`"
  >
    <svg class="countdown-dial" viewBox="0 0 100 100" aria-hidden="true">
      <circle class="countdown-track" cx="50" cy="50" r="44" />
      <!-- pathLength="1" lets CSS say how much of the ring to draw as a number from 0 to 1. -->
      <circle class="countdown-ring" cx="50" cy="50" r="44" pathLength="1" />
    </svg>
    <span class="countdown-time">{{ timeLeft }}</span>
  </span>
</template>

<style scoped>
.countdown {
  position: relative;
  display: inline-grid;
  place-items: center;
  width: 9em;
  height: 9em;
  color: var(--codex-fg);
  --ring-colour: var(--codex-accent);
}

.countdown-dial {
  grid-area: 1 / 1;
  width: 100%;
  height: 100%;
  /* The ring starts at the top and empties clockwise. */
  transform: rotate(-90deg);
}

.countdown-track,
.countdown-ring {
  fill: none;
  stroke-width: 7;
}

.countdown-track {
  stroke: var(--codex-accent-soft);
}

.countdown-ring {
  stroke: var(--ring-colour);
  stroke-linecap: round;
  stroke-dasharray: 1;
  stroke-dashoffset: calc(1 - var(--share-left));
  transition:
    stroke-dashoffset 1s linear,
    stroke 600ms ease;
}

.countdown-time {
  grid-area: 1 / 1;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 2.3em;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.03em;
}

/* While it runs, the clock breathes once a second. */
.countdown.is-running .countdown-dial {
  animation: countdown-breathe 1s ease-in-out infinite;
}

/* Time is up: the ring comes back in amber and pulses. */
.countdown.is-over {
  --ring-colour: #ffb224;
}

.countdown.is-over .countdown-ring {
  stroke-dashoffset: 0;
}

.countdown.is-over .countdown-time {
  animation: countdown-over 1.2s ease-in-out infinite;
}

/* Compact: a small ring, the time to its right. */
.countdown.is-compact {
  display: inline-flex;
  gap: 0.5em;
  width: auto;
  height: auto;
}

.countdown.is-compact .countdown-dial {
  width: 1.5em;
  height: 1.5em;
}

.countdown.is-compact .countdown-track,
.countdown.is-compact .countdown-ring {
  stroke-width: 14;
}

.countdown.is-compact .countdown-time {
  font-size: 1em;
}

@keyframes countdown-breathe {
  0%,
  100% {
    filter: drop-shadow(0 0 0 rgba(52, 66, 224, 0));
  }
  50% {
    filter: drop-shadow(0 0 0.5em rgba(52, 66, 224, 0.35));
  }
}

@keyframes countdown-over {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}
</style>
