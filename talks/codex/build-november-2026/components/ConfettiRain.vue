<script setup lang="ts">
import { steady } from '../lib/steady'

// Paper confetti that falls through the slide without end.
const props = withDefaults(defineProps<{
  /** How many pieces fall at the same time. */
  count?: number
}>(), {
  count: 70,
})

const COLOURS = ['#ffffff', '#ffd166', '#ff7eb6', '#7ee0ff', '#c9b8ff', '#8ef0b5']

const pieces = Array.from({ length: props.count }, (_, index) => ({
  'left': `${Math.round(steady(index + 1) * 100)}%`,
  'background': COLOURS[index % COLOURS.length],
  '--width': `${5 + Math.round(steady(index + 3) * 6)}`,
  '--height': `${9 + Math.round(steady(index + 5) * 9)}`,
  '--drift': `${Math.round((steady(index + 13) - 0.5) * 180)}`,
  '--spin': `${360 + Math.round(steady(index + 11) * 720)}deg`,
  'animationDuration': `${3.6 + steady(index + 7) * 4}s`,
  // A negative delay starts each piece part of the way down, so the slide opens already full.
  'animationDelay': `${-steady(index + 9) * 8}s`,
}))
</script>

<template>
  <div class="confetti" aria-hidden="true">
    <span v-for="(piece, index) in pieces" :key="index" class="confetti-piece" :style="piece" />
  </div>
</template>

<style scoped>
.confetti {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.confetti-piece {
  position: absolute;
  top: calc(-30 * var(--pt));
  width: calc(var(--width) * var(--pt));
  height: calc(var(--height) * var(--pt));
  border-radius: calc(1.5 * var(--pt));
  animation-name: confetti-fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@keyframes confetti-fall {
  from {
    transform: translate(0, 0) rotate(0deg);
  }
  to {
    transform: translate(calc(var(--drift) * var(--pt)), calc(600 * var(--pt))) rotate(var(--spin));
  }
}
</style>
