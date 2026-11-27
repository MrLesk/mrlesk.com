<script setup lang="ts">
import { useSlideSteps } from '../composables/useSlideSteps'
import type { NewsItem } from '../lib/news'

// A row or grid of news cards. Each click brings in the next card; a click back takes it away.
// The page's `clicks:` must be the number of items.
const props = defineProps<{
  items: NewsItem[]
  /** `tall` puts the pictures above the text; `wide` puts them beside the text. */
  shape: 'tall' | 'wide'
}>()

const { step } = useSlideSteps(props.items.length)
</script>

<template>
  <div class="news-cards" :class="`is-${shape}`">
    <article
      v-for="(item, index) in items"
      :key="item.title"
      class="news-card"
      :class="{ 'is-shown': step > index, 'is-latest': step === index + 1 }"
    >
      <div class="news-media">
        <img v-for="picture in item.pictures" :key="picture" :src="picture" alt="" class="news-picture">
        <!-- A scene mounts when its card comes in, so its animation starts with the click. -->
        <MiniScene v-if="item.scene && step > index" :name="item.scene" class="news-scene" />
      </div>
      <div class="news-text">
        <h2>{{ item.title }}</h2>
        <p>{{ item.note }}</p>
      </div>
    </article>
  </div>
</template>

<style scoped>
.news-cards {
  flex: 1;
  display: grid;
  gap: calc(14 * var(--pt));
  margin-bottom: calc(14 * var(--pt));
}

.news-cards.is-tall {
  grid-template-columns: repeat(4, 1fr);
}

.news-cards.is-wide {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, 1fr);
}

/* A card waits below its place until its click, then springs in. */
.news-card {
  display: flex;
  align-items: center;
  min-width: 0;
  border-radius: calc(18 * var(--pt));
  border: 1px solid var(--deck-line);
  background: linear-gradient(180deg, #ffffff 0%, var(--deck-panel) 100%);
  opacity: 0;
  transform: translateY(calc(26 * var(--pt))) scale(0.94);
  transition:
    opacity 400ms ease,
    transform 700ms var(--deck-ease-spring),
    border-color 500ms ease,
    box-shadow 500ms ease;
}

.news-card.is-shown {
  opacity: 1;
  transform: none;
}

/* The newest card stands out until the next one arrives. */
.news-card.is-latest {
  border-color: rgba(52, 66, 224, 0.45);
  box-shadow: var(--deck-shadow);
}

/* The space for the pictures has the shape of a wide picture. */
.news-media {
  aspect-ratio: 16 / 9;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: calc(10 * var(--pt));
}

/* A picture keeps its shape. Two square icons shrink until they fit side by side. */
.news-picture {
  height: 100%;
  min-width: 0;
  object-fit: contain;
  border-radius: calc(10 * var(--pt));
}

.news-text {
  min-width: 0;
}

.news-text h2 {
  margin: 0;
  letter-spacing: -0.02em;
}

/* A note can hold a line break. */
.news-text p {
  margin: calc(6 * var(--pt)) 0 0 0;
  color: var(--codex-fg-muted);
  font-weight: 500;
  line-height: 1.3;
  white-space: pre-line;
}

.is-tall .news-card {
  flex-direction: column;
  justify-content: center;
  gap: calc(22 * var(--pt));
  padding: calc(22 * var(--pt)) calc(14 * var(--pt));
  text-align: center;
}

.is-tall .news-media {
  align-self: stretch;
}

.is-tall .news-scene {
  font-size: calc(13 * var(--pt));
}

.is-tall .news-text h2 {
  font-size: calc(26 * var(--pt));
}

.is-tall .news-text p {
  font-size: calc(15 * var(--pt));
}

.is-wide .news-card {
  gap: calc(18 * var(--pt));
  padding: calc(12 * var(--pt)) calc(18 * var(--pt)) calc(12 * var(--pt)) calc(12 * var(--pt));
}

.is-wide .news-media {
  flex: none;
  width: calc(160 * var(--pt));
}

.is-wide .news-scene {
  font-size: calc(10 * var(--pt));
}

.is-wide .news-text h2 {
  font-size: calc(20 * var(--pt));
  line-height: 1.15;
}

.is-wide .news-text p {
  font-size: calc(13.5 * var(--pt));
}
</style>
