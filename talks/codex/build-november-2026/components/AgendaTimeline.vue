<script setup lang="ts">
import { computed } from 'vue'
import { useNow } from '../composables/useNow'
import { useSlideSteps } from '../composables/useSlideSteps'
import { AGENDA, WORKSHOPS, eventMinutes, minutesOf } from '../lib/event'

// "Agenda": the day as one ribbon from left to right, with the optional workshops above it.
// Everything comes in by itself, so the slide has no clicks. On the day of the event a marker
// shows the current time on the ribbon.
const { isLive } = useSlideSteps(0)
const now = useNow(isLive)

const dayStart = minutesOf(AGENDA[0].start)
const dayLength = minutesOf(AGENDA[AGENDA.length - 1].end) - dayStart

/** How far along the ribbon a clock time is, in percent of the ribbon's width. */
function positionOf(clockTime: string): number {
  return (minutesOf(clockTime) - dayStart) / dayLength * 100
}

/** The place and width on the ribbon of something that runs from `start` to `end`. */
function spanOf(start: string, end: string) {
  return { left: `${positionOf(start)}%`, width: `${positionOf(end) - positionOf(start)}%` }
}

// The current time on the ribbon, or null outside the event's hours and on any other day.
const nowMarker = computed(() => {
  const minutes = eventMinutes(now.value)
  if (minutes === null || minutes < dayStart || minutes > dayStart + dayLength) return null

  const clock = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
  return { clock, left: `${(minutes - dayStart) / dayLength * 100}%` }
})
</script>

<template>
  <div class="agenda">
    <div class="agenda-workshops">
      <article
        v-for="(workshop, index) in WORKSHOPS"
        :key="workshop.start"
        class="workshop"
        :style="{ 'left': `${positionOf(workshop.start)}%`, '--order': index }"
      >
        <span class="workshop-tag">Optional · {{ workshop.start }} to {{ workshop.end }}</span>
        <h2>{{ workshop.title }}</h2>
        <p><ph-map-pin-fill /> {{ workshop.room }}</p>
      </article>
    </div>

    <div class="agenda-ribbon">
      <div
        v-for="(block, index) in AGENDA"
        :key="block.start"
        class="agenda-block"
        :class="`is-${block.kind}`"
        :style="{ ...spanOf(block.start, block.end), '--order': index }"
      >
        <strong>{{ block.title }}</strong>
      </div>
      <!-- The half hour of each workshop, marked on the build time under it. -->
      <span
        v-for="workshop in WORKSHOPS"
        :key="workshop.start"
        class="agenda-slot"
        :style="spanOf(workshop.start, workshop.end)"
      />
      <span v-if="nowMarker" class="agenda-now" :style="{ left: nowMarker.left }"><b>{{ nowMarker.clock }}</b></span>
    </div>

    <div class="agenda-times">
      <span
        v-for="(block, index) in AGENDA"
        :key="block.start"
        :style="{ 'left': `${positionOf(block.start)}%`, '--order': index }"
      >{{ block.start }}</span>
    </div>
  </div>
</template>

<style scoped>
.agenda {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-bottom: calc(30 * var(--pt));
}

/* ── Workshops: cards above the ribbon, each starting where its half hour starts ── */

.agenda-workshops {
  position: relative;
  height: calc(190 * var(--pt));
}

.workshop {
  position: absolute;
  bottom: calc(22 * var(--pt));
  width: calc(284 * var(--pt));
  padding: calc(16 * var(--pt)) calc(18 * var(--pt));
  border-radius: calc(14 * var(--pt));
  border: 1px solid rgba(52, 66, 224, 0.3);
  background: #ffffff;
  box-shadow: var(--deck-shadow);
  animation: deck-rise 700ms var(--deck-ease-out) both;
  animation-delay: calc(1500ms + var(--order) * 250ms);
}

/* The stem from a card down to its half hour on the ribbon. */
.workshop::after {
  content: '';
  position: absolute;
  left: calc(26 * var(--pt));
  top: 100%;
  width: calc(2 * var(--pt));
  height: calc(22 * var(--pt));
  background: var(--codex-accent);
}

.workshop-tag {
  font-size: calc(12 * var(--pt));
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--codex-accent);
}

.workshop h2 {
  margin: calc(5 * var(--pt)) 0 calc(6 * var(--pt)) 0;
  font-size: calc(19 * var(--pt));
  line-height: 1.2;
}

.workshop p {
  display: flex;
  align-items: center;
  gap: calc(4 * var(--pt));
  margin: 0;
  font-size: calc(14 * var(--pt));
  color: var(--codex-fg-muted);
}

/* ── The ribbon ──────────────────────────────────────────────────────────── */

.agenda-ribbon {
  position: relative;
  height: calc(140 * var(--pt));
}

/* A block opens from left to right, one block after the other. Its name stands at the bottom, so
   the band of a workshop at the top never covers it. */
.agenda-block {
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: flex-end;
  padding: 0 calc(12 * var(--pt)) calc(14 * var(--pt));
  border-radius: calc(14 * var(--pt));
  box-shadow: inset 0 0 0 calc(2 * var(--pt)) #ffffff;
  animation: agenda-block-open 800ms var(--deck-ease-out) both;
  animation-delay: calc(250ms + var(--order) * 220ms);
}

.agenda-block strong {
  font-size: calc(17 * var(--pt));
  font-weight: 600;
  line-height: 1.15;
}

.agenda-block.is-build {
  background: linear-gradient(120deg, var(--codex-grad-2), var(--codex-grad-3));
  color: #ffffff;
}

.agenda-block.is-build strong {
  font-size: calc(30 * var(--pt));
}

.agenda-block.is-break {
  background: #ffe9c2;
  color: #5c3a00;
}

.agenda-block.is-show {
  background: linear-gradient(120deg, #f0458c, #ff8a5c);
  color: #ffffff;
}

/* Networking has no fixed end, so its block fades out. */
.agenda-block.is-social {
  background: linear-gradient(90deg, #d9c7ff, rgba(217, 199, 255, 0));
  color: #3a1f8f;
  box-shadow: none;
}

@keyframes agenda-block-open {
  from {
    clip-path: inset(0 100% 0 0 round calc(14 * var(--pt)));
    opacity: 0;
  }
  to {
    clip-path: inset(0 0 0 0 round calc(14 * var(--pt)));
    opacity: 1;
  }
}

/* The half hour of a workshop: a striped band along the top of the build time. */
.agenda-slot {
  position: absolute;
  top: calc(2 * var(--pt));
  height: calc(44 * var(--pt));
  border-radius: calc(12 * var(--pt)) calc(12 * var(--pt)) calc(6 * var(--pt)) calc(6 * var(--pt));
  background: repeating-linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0 calc(5 * var(--pt)),
    rgba(255, 255, 255, 0.55) calc(5 * var(--pt)) calc(10 * var(--pt))
  );
  animation: deck-fade 600ms ease 1400ms both;
}

.agenda-now {
  position: absolute;
  top: calc(-14 * var(--pt));
  bottom: calc(-14 * var(--pt));
  width: calc(3 * var(--pt));
  margin-left: calc(-1.5 * var(--pt));
  border-radius: calc(2 * var(--pt));
  background: var(--deck-green);
}

.agenda-now b {
  position: absolute;
  left: 50%;
  bottom: 100%;
  translate: -50% 0;
  padding: calc(2 * var(--pt)) calc(8 * var(--pt));
  border-radius: calc(10 * var(--pt));
  background: var(--deck-green);
  color: #ffffff;
  font-size: calc(12 * var(--pt));
  font-variant-numeric: tabular-nums;
}

/* ── The times under the ribbon, one where each block starts ─────────────── */

.agenda-times {
  position: relative;
  height: calc(30 * var(--pt));
}

.agenda-times span {
  position: absolute;
  top: calc(10 * var(--pt));
  font-size: calc(17 * var(--pt));
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--codex-fg);
  animation: deck-fade 600ms ease both;
  animation-delay: calc(450ms + var(--order) * 220ms);
}
</style>
