<script setup lang="ts">
import { steady } from '../lib/steady'

// Small things that drift up through a slide and fade: hearts, sparkles, or plain bubbles.
const props = withDefaults(defineProps<{
  /** What drifts up: emoji or other short texts, taking turns. Leave it out to get bubbles. */
  bits?: string[]
  /** How many drift at the same time. */
  count?: number
}>(), {
  bits: () => [],
  count: 16,
})

const pieces = Array.from({ length: props.count }, (_, index) => ({
  bit: props.bits.length ? props.bits[index % props.bits.length] : '',
  style: {
    'left': `${Math.round(steady(index + 1) * 96)}%`,
    '--size': `${12 + Math.round(steady(index + 7) * 22)}`,
    '--sway': `${Math.round((steady(index + 9) - 0.5) * 80)}`,
    'animationDuration': `${8 + steady(index + 3) * 8}s`,
    // A negative delay starts each piece part of the way up, so the slide opens already full.
    'animationDelay': `${-steady(index + 5) * 16}s`,
  },
}))
</script>

<template>
  <div class="floating-bits" aria-hidden="true">
    <span
      v-for="(piece, index) in pieces"
      :key="index"
      class="floating-bit"
      :class="{ 'is-bubble': !piece.bit }"
      :style="piece.style"
    >{{ piece.bit }}</span>
  </div>
</template>

<style scoped>
.floating-bits {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.floating-bit {
  position: absolute;
  bottom: calc(-50 * var(--pt));
  font-size: calc(var(--size) * var(--pt));
  line-height: 1;
  animation-name: floating-bit-rise;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.floating-bit.is-bubble {
  width: calc(var(--size) * var(--pt));
  height: calc(var(--size) * var(--pt));
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.7);
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.08));
}

@keyframes floating-bit-rise {
  0% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 0;
  }
  12%, 80% {
    opacity: 0.9;
  }
  100% {
    transform: translate(calc(var(--sway) * var(--pt)), calc(-640 * var(--pt))) rotate(24deg);
    opacity: 0;
  }
}
</style>
