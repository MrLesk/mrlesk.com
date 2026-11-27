<script setup lang="ts">
import { picturesIn } from '../lib/photos'
import { YEAR_EVENTS } from '../lib/year'

// Rows of the year's pictures that glide sideways without end, each row the other way.
// The pictures come from the events' folders, so today's pictures join as soon as they are in
// photos/07-today. The folder photos/personal is never part of the wall.
const props = withDefaults(defineProps<{
  rows?: number
}>(), {
  rows: 3,
})

const pictures = YEAR_EVENTS.flatMap(event => picturesIn(event.photos))

// The pictures are dealt to the rows like cards, so every row holds pictures of every event.
const rowsOfPictures = Array.from({ length: props.rows }, (_, row) =>
  pictures.filter((_, index) => index % props.rows === row))
</script>

<template>
  <div class="photo-wall" aria-hidden="true">
    <div
      v-for="(row, rowIndex) in rowsOfPictures"
      :key="rowIndex"
      class="photo-wall-row"
      :class="{ 'is-reversed': rowIndex % 2 === 1 }"
    >
      <!-- A row holds its pictures twice. When the first set has passed, the second set stands
           exactly where the first one began, and the glide starts again unseen. -->
      <div class="photo-wall-track" :style="{ animationDuration: `${row.length * 10}s` }">
        <img v-for="(picture, index) in [...row, ...row]" :key="index" :src="picture.url" alt="">
      </div>
    </div>
  </div>
</template>

<style scoped>
.photo-wall {
  --wall-gap: calc(8 * var(--pt));
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: var(--wall-gap);
  overflow: hidden;
}

.photo-wall-row {
  flex: 1;
  min-height: 0;
}

.photo-wall-track {
  display: flex;
  gap: var(--wall-gap);
  width: max-content;
  height: 100%;
  animation: photo-wall-glide linear infinite;
}

.is-reversed .photo-wall-track {
  animation-direction: reverse;
}

.photo-wall-track img {
  display: block;
  width: auto;
  height: 100%;
  border-radius: calc(10 * var(--pt));
}

/* Half of the track is one set of pictures minus half a gap. */
@keyframes photo-wall-glide {
  to {
    transform: translateX(calc(-50% - var(--wall-gap) / 2));
  }
}
</style>
