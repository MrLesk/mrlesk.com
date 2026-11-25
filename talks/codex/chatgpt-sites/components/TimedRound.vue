<script setup lang="ts">
import { useSlideSteps } from '../composables/useSlideSteps'

// Slides "Make it work" and "Neighbor test": a big countdown, a short list of what to do, and
// one note. These slides stay on screen while the room works.
//
//   start    the clock shows the full time
//   click 1  the clock starts
//
// The slide's frontmatter must say `clicks: 1`.
defineProps<{
  /** Length of the countdown. */
  minutes: number
  /** What to do, in order. */
  items: string[]
  /** What stands in front of each item: an empty tick box, or its number. */
  marker: 'tick' | 'number'
  /** The one line under the list. */
  note: string
  /** The icon in front of the note. */
  noteIcon: 'hand' | 'swap'
}>()

const { step, isLive } = useSlideSteps(1)
</script>

<template>
  <div class="round">
    <CountdownTimer class="round-clock" :minutes="minutes" :started="step >= 1" :live="isLive" />

    <div class="round-items">
      <div v-for="(item, index) in items" :key="item" class="round-item" :style="{ '--order': index }">
        <span class="round-marker" :class="`is-${marker}`">{{ marker === 'number' ? index + 1 : '' }}</span>
        {{ item }}
      </div>
    </div>

    <p class="round-note"><SiteIcon :name="noteIcon" class="round-note-icon" />{{ note }}</p>
  </div>
</template>

<style scoped>
.round {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  column-gap: calc(54 * var(--pt));
  row-gap: calc(24 * var(--pt));
  margin-top: calc(14 * var(--pt));
}

/* The clock is 9em wide, so this font-size makes it 216 points across. */
.round-clock {
  font-size: calc(24 * var(--pt));
  animation: sites-pop 800ms var(--sites-ease-spring) 200ms both;
}

.round-items {
  display: flex;
  flex-direction: column;
  gap: calc(16 * var(--pt));
}

.round-item {
  display: flex;
  align-items: center;
  gap: calc(16 * var(--pt));
  font-size: calc(27 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.2;
  animation: sites-rise 700ms var(--sites-ease-out) both;
  animation-delay: calc(350ms + var(--order) * 130ms);
}

.round-marker {
  flex: none;
  display: grid;
  place-items: center;
  width: calc(28 * var(--pt));
  height: calc(28 * var(--pt));
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: calc(14 * var(--pt));
  font-weight: 600;
}

.round-marker.is-tick {
  border: 2px solid rgba(52, 66, 224, 0.5);
  border-radius: calc(7 * var(--pt));
}

.round-marker.is-number {
  border-radius: 50%;
  background: var(--codex-accent-soft);
  color: var(--codex-accent);
}

.round-note {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: calc(12 * var(--pt));
  margin: 0;
  padding: calc(13 * var(--pt)) calc(18 * var(--pt));
  border-radius: calc(14 * var(--pt));
  background: var(--sites-panel);
  font-size: calc(19 * var(--pt));
  font-weight: 500;
  animation: sites-rise 700ms var(--sites-ease-out) 900ms both;
}

/* The icon nods every few seconds, so the note is not forgotten. */
.round-note-icon {
  flex: none;
  color: var(--codex-accent);
  font-size: calc(22 * var(--pt));
  transform-origin: 50% 90%;
  animation: round-note-nod 3.6s ease-in-out 2s infinite;
}

@keyframes round-note-nod {
  0%,
  16%,
  100% {
    rotate: 0deg;
  }
  4% {
    rotate: -16deg;
  }
  8% {
    rotate: 12deg;
  }
  12% {
    rotate: -8deg;
  }
}
</style>
