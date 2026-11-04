<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useIsSlideActive } from '@slidev/client'

// The IN (...) list behind the production 500. While `running`, it keeps growing, slowly
// at first and then faster. Once it no longer fits, the newest ids stay at the right edge
// and the oldest slide away under a fade. Going back a click resets it to the typed list.
const props = defineProps<{ running: boolean }>()
const active = useIsSlideActive()

const TYPED = 3 // the list as typed on the slide: 1, 2, 3
const KEPT = 40 // ids kept in the page, plenty to overflow the window
const last = ref(TYPED)
const shown = computed(() => {
  const first = Math.max(1, last.value - KEPT + 1)
  return Array.from({ length: last.value - first + 1 }, (_, index) => first + index).join(', ')
})

const box = ref<HTMLElement>()
const list = ref<HTMLElement>()
const full = ref(false)
let frame = 0
let started = 0

function tick(now: number) {
  const seconds = (now - started) / 1000
  last.value = Math.min(999_999, TYPED + Math.round(3 * seconds + 0.6 * seconds ** 3))
  // The overflow goes past the left edge, which scrollWidth does not count, so compare widths.
  full.value = !!box.value && !!list.value && list.value.offsetWidth > box.value.clientWidth
  frame = requestAnimationFrame(tick)
}

watch(() => props.running && active.value, (on) => {
  cancelAnimationFrame(frame)
  if (on) {
    started = performance.now()
    frame = requestAnimationFrame(tick)
  }
  else {
    last.value = TYPED
    full.value = false
  }
}, { immediate: true })

onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>

<template>
  <span ref="box" class="ids" :class="{ full }"><span ref="list">{{ shown }}</span></span>
</template>
