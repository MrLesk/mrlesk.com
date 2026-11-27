<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

// A number that counts up from zero when `run` turns on, and goes back to zero when it
// turns off. If `run` is already on when the slide is drawn, the final number is just there.
const props = withDefaults(defineProps<{
  /** The number to count up to. */
  to: number
  /** Turns the count on. */
  run: boolean
  /** How long the count takes. */
  durationMs?: number
}>(), {
  durationMs: 1100,
})

const shown = ref(props.run ? props.to : 0)
let animationFrame = 0

function countUp(): void {
  const startedAt = performance.now()
  const drawNextNumber = (now: number): void => {
    const progress = Math.min((now - startedAt) / props.durationMs, 1)
    // Fast at first, slower towards the end.
    const easedProgress = 1 - (1 - progress) ** 3
    shown.value = Math.round(props.to * easedProgress)
    if (progress < 1) animationFrame = requestAnimationFrame(drawNextNumber)
  }
  animationFrame = requestAnimationFrame(drawNextNumber)
}

watch(() => props.run, (run) => {
  cancelAnimationFrame(animationFrame)
  const wantsLessMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!run) shown.value = 0
  else if (wantsLessMotion) shown.value = props.to
  else countUp()
})

onBeforeUnmount(() => cancelAnimationFrame(animationFrame))
</script>

<template>
  <span class="count-up">{{ shown.toLocaleString('en-US') }}</span>
</template>

<style scoped>
/* Every digit takes the same width, so the number does not wobble while it counts. */
.count-up {
  font-variant-numeric: tabular-nums;
}
</style>
