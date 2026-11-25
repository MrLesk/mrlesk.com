<script setup lang="ts">
import { STATIONS } from '../lib/workshop'

// Slide "Your turn": the hand-over from the presentation to the workshop. It shows the three
// stations everyone passes and what "done" means. It has no clicks: the stations come in one
// after another by themselves.
</script>

<template>
  <div class="turn">
    <div class="turn-stations">
      <template v-for="(station, index) in STATIONS" :key="station.name">
        <SiteIcon v-if="index > 0" name="chevron" class="turn-arrow" :style="{ '--order': index }" />
        <div class="turn-station" :style="{ '--order': index }">
          <span class="turn-number">{{ index + 1 }}</span>
          <span class="turn-name">{{ station.name }}</span>
          <span class="turn-what">{{ station.what }}</span>
          <span class="turn-minutes">{{ station.minutes }} min</span>
        </div>
      </template>
    </div>

    <p class="turn-done"><SiteIcon name="check" class="turn-tick" />Done = your neighbor used it.</p>
  </div>
</template>

<style scoped>
.turn {
  display: flex;
  flex-direction: column;
  gap: calc(30 * var(--pt));
}

.turn-stations {
  display: flex;
  align-items: center;
  gap: calc(14 * var(--pt));
}

/* Each station comes in a little after the one before it. */
.turn-station {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: calc(20 * var(--pt)) calc(22 * var(--pt)) calc(22 * var(--pt));
  border: 1px solid var(--sites-line);
  border-radius: calc(18 * var(--pt));
  background: #ffffff;
  box-shadow: var(--sites-shadow);
  animation: sites-rise 800ms var(--sites-ease-out) both;
  animation-delay: calc(250ms + var(--order) * 320ms);
}

.turn-number {
  display: grid;
  place-items: center;
  width: calc(32 * var(--pt));
  height: calc(32 * var(--pt));
  border-radius: 50%;
  background: linear-gradient(135deg, var(--codex-grad-1), var(--codex-grad-2));
  color: #ffffff;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: calc(14 * var(--pt));
  font-weight: 600;
}

.turn-name {
  margin-top: calc(14 * var(--pt));
  font-size: calc(32 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.turn-what {
  margin-top: calc(6 * var(--pt));
  color: var(--codex-fg-muted);
  font-size: calc(15 * var(--pt));
}

.turn-minutes {
  margin-top: calc(16 * var(--pt));
  padding: calc(3 * var(--pt)) calc(11 * var(--pt));
  border-radius: 999px;
  background: var(--codex-accent-soft);
  color: var(--codex-accent);
  font-size: calc(12.5 * var(--pt));
  font-weight: 600;
}

.turn-arrow {
  flex: none;
  color: var(--codex-accent);
  font-size: calc(22 * var(--pt));
  animation: sites-pop 500ms var(--sites-ease-spring) both;
  animation-delay: calc(350ms + var(--order) * 320ms);
}

.turn-done {
  display: flex;
  align-items: center;
  gap: calc(12 * var(--pt));
  margin: 0;
  font-size: calc(24 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.02em;
  animation: sites-rise 800ms var(--sites-ease-out) 1300ms both;
}

.turn-tick {
  flex: none;
  box-sizing: border-box;
  width: 1.4em;
  height: 1.4em;
  padding: 0.28em;
  border-radius: 50%;
  background: var(--sites-live);
  color: #ffffff;
  stroke-width: 3;
}
</style>
