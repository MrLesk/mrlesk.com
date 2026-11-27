<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import type { Media } from '../lib/photos'

// A pile of pictures, like prints on a table. While `playing`, the top picture slides off and
// goes to the bottom of the pile every few seconds, so every picture gets its turn on top.
// Pictures keep their own shape, so upright and wide pictures can share one pile.
// Without pictures the pile shows its default slot.
const props = withDefaults(defineProps<{
  items: Media[]
  playing: boolean
  /** How long a picture stays on top, in milliseconds. */
  everyMs?: number
}>(), {
  everyMs: 3600,
})

const emit = defineEmits<{
  /** The picture or clip that is on top now. */
  top: [media: Media]
}>()

/** How long the top picture takes to slide off, in milliseconds. Must match `.is-leaving` below. */
const SLIDE_OFF_MS = 430
/** How far each picture is turned, in degrees. Pictures take these in turn. */
const TILTS = [-3, 4, -5, 3, -2, 5]
/** Pictures deeper than this lie in the same place, at the bottom of the pile. */
const DEEPEST = 4

// The place in `items` of the picture on top, and of the one that is sliding off (-1: none).
const topIndex = ref(0)
const leavingIndex = ref(-1)
let turnTimer = 0
let settleTimer = 0

/** How deep a picture lies in the pile: 0 is on top. */
function depthOf(index: number): number {
  return (index - topIndex.value + props.items.length) % props.items.length
}

// First the top picture slides off to the side. Then it goes to the bottom, and the next one is on top.
function turnPile(): void {
  if (props.items.length < 2) return

  leavingIndex.value = topIndex.value
  settleTimer = window.setTimeout(() => {
    topIndex.value = (topIndex.value + 1) % props.items.length
    leavingIndex.value = -1
  }, SLIDE_OFF_MS)
}

watch(() => props.playing, (playing) => {
  window.clearInterval(turnTimer)
  if (playing) turnTimer = window.setInterval(turnPile, props.everyMs)
}, { immediate: true })

watch(topIndex, (index) => {
  if (props.items.length) emit('top', props.items[index])
}, { immediate: true })

onBeforeUnmount(() => {
  window.clearInterval(turnTimer)
  window.clearTimeout(settleTimer)
})
</script>

<template>
  <div class="photo-stack">
    <slot v-if="!items.length" />
    <div
      v-for="(media, index) in items"
      :key="media.url"
      class="photo-card"
      :class="{ 'is-top': depthOf(index) === 0, 'is-leaving': index === leavingIndex }"
      :style="{
        '--depth': Math.min(depthOf(index), DEEPEST),
        '--tilt': TILTS[index % TILTS.length],
        '--order': index,
        'zIndex': 100 - depthOf(index),
      }"
    >
      <video v-if="media.kind === 'video'" :src="media.url" autoplay muted loop playsinline />
      <img v-else :src="media.url" alt="">
    </div>
  </div>
</template>

<style scoped>
/* The largest size of a picture. A parent can change both to fit its space. */
.photo-stack {
  --photo-max-width: calc(440 * var(--pt));
  --photo-max-height: calc(330 * var(--pt));
  position: relative;
  width: 100%;
  height: 100%;
}

/* Each picture below the top one lies a little lower, smaller, darker and more turned.
   When the pile first appears, the pictures are dealt onto it one by one from the right. */
.photo-card {
  --turn: 1;
  position: absolute;
  left: 50%;
  top: 50%;
  padding: calc(6 * var(--pt));
  border-radius: calc(14 * var(--pt));
  background: #ffffff;
  box-shadow: 0 calc(14 * var(--pt)) calc(36 * var(--pt)) rgba(20, 14, 80, 0.3);
  transform:
    translate(-50%, -50%)
    translate(calc(var(--depth) * var(--tilt) * 3.2 * var(--pt)), calc(var(--depth) * 9 * var(--pt)))
    rotate(calc(var(--tilt) * var(--turn) * 1deg))
    scale(calc(1 - var(--depth) * 0.045));
  filter: brightness(calc(1 - var(--depth) * 0.08));
  transition:
    transform 750ms var(--deck-ease-out),
    filter 500ms ease;
  animation: photo-card-deal 850ms var(--deck-ease-out) backwards;
  animation-delay: calc(var(--order) * 90ms);
}

/* The picture on top lies almost straight. */
.photo-card.is-top {
  --turn: 0.3;
}

.photo-card.is-leaving {
  transform: translate(-50%, -50%) translate(62%, -5%) rotate(17deg);
  transition: transform 430ms cubic-bezier(0.5, 0, 0.75, 0.2);
}

.photo-card img,
.photo-card video {
  display: block;
  max-width: var(--photo-max-width);
  max-height: var(--photo-max-height);
  border-radius: calc(9 * var(--pt));
}

/* Only `from` is given: each picture lands on its own place in the pile. */
@keyframes photo-card-deal {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) translate(150%, -14%) rotate(24deg) scale(0.9);
  }
}
</style>
