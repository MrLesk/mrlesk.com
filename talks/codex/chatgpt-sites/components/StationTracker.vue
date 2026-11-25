<script setup lang="ts">
import { useSlideSteps } from '../composables/useSlideSteps'
import { STATIONS } from '../lib/workshop'

// The "you are here" marker of the workshop slides, in the top right corner: the three
// stations, with the current one filled and the ones already passed ticked off.
//
// With `minutes` it also shows a small countdown, which the slide's first click starts. The
// two slides with a big clock in the middle leave `minutes` out.
defineProps<{
  /** The station this slide belongs to: 1 Page, 2 Action, 3 Neighbor. */
  current: 1 | 2 | 3
  /** Length of the small countdown. Leave out for no countdown. */
  minutes?: number
}>()

// Only the first click matters here: it starts the countdown.
const { step, isLive } = useSlideSteps(1)
</script>

<template>
  <div class="stations">
    <span
      v-for="(station, index) in STATIONS"
      :key="station.name"
      class="station"
      :class="{ 'is-current': index + 1 === current, 'is-passed': index + 1 < current }"
    >
      <i class="station-number">
        <SiteIcon v-if="index + 1 < current" name="check" />
        <template v-else>{{ index + 1 }}</template>
      </i>
      {{ station.name }}
    </span>
    <CountdownTimer v-if="minutes" class="stations-clock" compact :minutes="minutes" :started="step >= 1" :live="isLive" />
  </div>
</template>

<style scoped>
/* The slide's title is on the left of the same line. */
.stations {
  position: absolute;
  top: calc(58 * var(--pt));
  right: calc(55 * var(--pt));
  display: flex;
  align-items: center;
  gap: calc(8 * var(--pt));
  animation: sites-rise 700ms var(--sites-ease-out) 150ms both;
}

.station {
  display: flex;
  align-items: center;
  gap: calc(6 * var(--pt));
  padding: calc(4 * var(--pt)) calc(11 * var(--pt)) calc(4 * var(--pt)) calc(5 * var(--pt));
  border: 1px solid var(--sites-line);
  border-radius: 999px;
  color: var(--codex-fg-muted);
  font-size: calc(11.5 * var(--pt));
  font-weight: 600;
}

.station-number {
  display: grid;
  place-items: center;
  width: calc(17 * var(--pt));
  height: calc(17 * var(--pt));
  border-radius: 50%;
  background: rgba(3, 10, 24, 0.07);
  font-size: calc(10 * var(--pt));
  font-style: normal;
}

.station.is-passed {
  border-color: transparent;
  background: var(--codex-accent-soft);
  color: var(--codex-accent);
}

.station.is-passed .station-number {
  background: transparent;
  font-size: calc(11 * var(--pt));
}

.station.is-current {
  border-color: transparent;
  background: var(--codex-accent);
  box-shadow: 0 calc(5 * var(--pt)) calc(14 * var(--pt)) rgba(52, 66, 224, 0.3);
  color: #ffffff;
}

.station.is-current .station-number {
  background: rgba(255, 255, 255, 0.24);
}

.stations-clock {
  margin-left: calc(8 * var(--pt));
  font-size: calc(13 * var(--pt));
}
</style>
