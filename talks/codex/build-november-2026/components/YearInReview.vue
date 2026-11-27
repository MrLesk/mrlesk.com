<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useSlideSteps } from '../composables/useSlideSteps'
import { mediaIn, picturesIn, type Media } from '../lib/photos'
import { SIGN_UP_TOTAL, YEAR_EVENTS } from '../lib/year'

// "A year in review". The clicks:
//
//   0                 the opening: one picture of every event, shuffling quickly
//   1 to 7            one event per click, oldest first; 7 is today
//   8                 the closing numbers, with every picture of the year
//
// On each event the pile of pictures turns by itself, so there is time to talk.
// The page's `clicks:` must be the number of events plus 1.
const { step, isLive } = useSlideSteps(YEAR_EVENTS.length + 1)

const base = import.meta.env.BASE_URL.replace(/\/$/, '')

const isOpening = computed(() => step.value === 0)
const isClosing = computed(() => step.value > YEAR_EVENTS.length)
// The place in YEAR_EVENTS of the event on screen. -1 during the opening and the closing.
const eventIndex = computed(() => (isOpening.value || isClosing.value ? -1 : step.value - 1))
const event = computed(() => YEAR_EVENTS[eventIndex.value])

// ── The pictures of each part ────────────────────────────────────────────────

// The opening shows the first picture of every event that has one.
const openingPictures = YEAR_EVENTS.flatMap(yearEvent => picturesIn(yearEvent.photos).slice(0, 1))

// The closing shows every picture of the year: first one of each event, then the second ones, and so on.
const piles = YEAR_EVENTS.map(yearEvent => picturesIn(yearEvent.photos))
const longestPile = Math.max(...piles.map(pile => pile.length))
const closingPictures = Array.from({ length: longestPile }, (_, round) => piles.flatMap(pile => pile.slice(round, round + 1))).flat()

const pile = computed(() => {
  if (isOpening.value) return { key: 'opening', items: openingPictures, everyMs: 1500 }
  if (isClosing.value) return { key: 'closing', items: closingPictures, everyMs: 1300 }
  return { key: event.value.date, items: mediaIn(event.value.photos), everyMs: 3600 }
})

// ── The words of an event ────────────────────────────────────────────────────

const dateParts = computed(() => {
  // The date has no time, so it is read as UTC and formatted as UTC. That keeps the day right everywhere.
  const date = new Date(`${event.value.date}T00:00:00Z`)
  const part = (options: Intl.DateTimeFormatOptions): string =>
    new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'UTC' }).format(date)

  return { day: part({ day: 'numeric' }), month: part({ month: 'long' }), weekday: part({ weekday: 'long' }) }
})

const counter = computed(() =>
  `${String(eventIndex.value + 1).padStart(2, '0')} / ${String(YEAR_EVENTS.length).padStart(2, '0')}`)

// The closing number of sign-ups is rounded down to hundreds and shown with a plus: "1,200+".
const signUpsRounded = Math.floor(SIGN_UP_TOTAL / 100) * 100

// ── Numbers count up shortly after each click ────────────────────────────────

// Outside the live slide (overview, exports) the numbers are just there.
const afterClick = ref(false)
const counting = computed(() => !isLive.value || afterClick.value)

watch([step, isLive], () => {
  afterClick.value = false
  if (isLive.value) window.setTimeout(() => (afterClick.value = true), 600)
}, { immediate: true })

// ── The soft colours behind everything come from the picture on top ──────────

const glowUrl = ref('')

function followTopPicture(media: Media): void {
  if (media.kind === 'image') glowUrl.value = media.url
}
</script>

<template>
  <div class="review">
    <Transition name="review-glow">
      <div v-if="glowUrl" :key="glowUrl" class="review-glow" :style="{ backgroundImage: `url(${glowUrl})` }" />
    </Transition>
    <div class="review-veil" />

    <header class="review-header">
      <span><img :src="`${base}/codex-logo-static.png`" alt="">Codex Community Vienna · 2026</span>
      <Transition name="review-fade">
        <b v-if="event" :key="counter">{{ counter }}</b>
      </Transition>
    </header>

    <!-- The left side: the words. -->
    <Transition name="review-words" mode="out-in">
      <div v-if="isOpening" key="opening" class="review-words">
        <p class="review-eyebrow">Codex Community Vienna</p>
        <h1 class="review-title">A year<br>in review</h1>
        <p class="review-year">2026</p>
      </div>

      <div v-else-if="isClosing" key="closing" class="review-words review-numbers">
        <p><strong class="review-number"><CountUp :to="YEAR_EVENTS.length" :run="counting" /></strong><span class="review-number-label">events</span></p>
        <p><strong class="review-number"><CountUp :to="signUpsRounded" :run="counting" :duration-ms="1800" />+</strong><span class="review-number-label">sign-ups</span></p>
        <p><strong class="review-number">1</strong><span class="review-number-label">community</span></p>
      </div>

      <div v-else :key="event.date" class="review-words">
        <p class="review-date">
          <strong>{{ dateParts.day }}</strong>
          <span>{{ dateParts.month }}<small>{{ dateParts.weekday }}</small></span>
        </p>
        <p class="review-tags">
          <span>{{ event.kind }}</span>
          <span v-if="event.isToday" class="is-today">Today</span>
        </p>
        <h2 class="review-event-title">{{ event.title }}</h2>
        <p class="review-place"><ph-map-pin-fill />{{ event.place }}</p>
        <p class="review-signups">
          <ph-users-three-fill /><CountUp :to="event.signUps" :run="counting" />&nbsp;signed up
        </p>
      </div>
    </Transition>

    <!-- The right side: the pile of pictures. The old pile leaves while the new one is dealt. -->
    <div class="review-pile">
      <Transition name="review-pile-swap">
        <PhotoStack
          :key="pile.key"
          :items="pile.items"
          :playing="isLive"
          :every-ms="pile.everyMs"
          @top="followTopPicture"
        >
          <!-- Today has no pictures yet: a card says so until some are in photos/07-today. -->
          <div class="review-today-card">
            <img :src="`${base}/codex-logo.gif`" alt="">
            <strong>You are here</strong>
          </div>
        </PhotoStack>
      </Transition>
    </div>

    <YearTimeline
      class="review-line"
      :events="YEAR_EVENTS"
      :active-index="isClosing ? YEAR_EVENTS.length : eventIndex"
    />
  </div>
</template>

<style scoped>
.review {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #ffffff;
  color: var(--codex-fg);
}

/* ── The soft colours behind everything ──────────────────────────────────────
   A tiny copy of the picture on top, blown up and blurred. Blurring a tiny picture is cheap. */

.review-glow {
  position: absolute;
  left: 50%;
  top: 50%;
  width: calc(96 * var(--pt));
  height: calc(54 * var(--pt));
  background-size: cover;
  background-position: center;
  filter: blur(calc(5 * var(--pt))) saturate(1.5);
  transform: translate(-50%, -50%) scale(12);
  opacity: 0.6;
}

.review-glow-enter-active,
.review-glow-leave-active {
  transition: opacity 1200ms ease;
}

.review-glow-enter-from,
.review-glow-leave-to {
  opacity: 0;
}

/* White over the left side, so the words stay easy to read. */
.review-veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.8) 40%, rgba(255, 255, 255, 0.3) 100%);
}

/* ── The top line ────────────────────────────────────────────────────────── */

.review-header {
  position: absolute;
  left: calc(40 * var(--pt));
  right: calc(40 * var(--pt));
  top: calc(26 * var(--pt));
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: calc(13 * var(--pt));
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--codex-fg-muted);
}

.review-header span {
  display: inline-flex;
  align-items: center;
  gap: calc(8 * var(--pt));
}

.review-header img {
  width: calc(22 * var(--pt));
  height: calc(22 * var(--pt));
}

.review-header b {
  font-size: calc(15 * var(--pt));
  font-variant-numeric: tabular-nums;
  color: var(--codex-fg);
}

.review-fade-enter-active,
.review-fade-leave-active {
  transition: opacity 300ms ease;
}

.review-fade-enter-from,
.review-fade-leave-to {
  opacity: 0;
}

.review-fade-leave-active {
  position: absolute;
  right: 0;
}

/* ── The words on the left ───────────────────────────────────────────────── */

.review-words {
  position: absolute;
  left: calc(40 * var(--pt));
  top: calc(72 * var(--pt));
  bottom: calc(92 * var(--pt));
  width: calc(390 * var(--pt));
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* The old words leave quickly. The new ones rise in line by line. */
.review-words-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}

.review-words-leave-to {
  opacity: 0;
  transform: translateY(calc(-14 * var(--pt)));
}

.review-words > * {
  animation: deck-rise 650ms var(--deck-ease-out) both;
}

.review-words > :nth-child(2) { animation-delay: 80ms; }
.review-words > :nth-child(3) { animation-delay: 160ms; }
.review-words > :nth-child(4) { animation-delay: 240ms; }
.review-words > :nth-child(5) { animation-delay: 320ms; }

.review-eyebrow {
  margin: 0 0 calc(14 * var(--pt)) 0;
  font-size: calc(15 * var(--pt));
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--codex-accent);
}

.slidev-layout h1.review-title {
  margin: 0;
  font-size: calc(72 * var(--pt));
  font-weight: 500;
  letter-spacing: -0.035em;
  line-height: 0.98;
}

.review-year {
  margin: calc(10 * var(--pt)) 0 0 0;
  font-size: calc(110 * var(--pt));
  font-weight: 700;
  letter-spacing: -0.05em;
  line-height: 1;
  background: linear-gradient(120deg, var(--codex-grad-1), var(--codex-grad-2) 50%, var(--codex-grad-3));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* The date: a very big day with the month and the weekday beside it. */
.review-date {
  display: flex;
  align-items: center;
  gap: calc(14 * var(--pt));
  margin: 0 0 calc(12 * var(--pt)) 0;
}

.review-date strong {
  font-size: calc(104 * var(--pt));
  font-weight: 700;
  letter-spacing: -0.05em;
  line-height: 0.9;
  background: linear-gradient(120deg, var(--codex-grad-2), var(--codex-grad-3));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.review-date span {
  font-size: calc(30 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.review-date small {
  display: block;
  font-size: calc(16 * var(--pt));
  font-weight: 500;
  letter-spacing: 0;
  color: var(--codex-fg-muted);
}

.review-tags {
  display: flex;
  gap: calc(8 * var(--pt));
  margin: 0 0 calc(12 * var(--pt)) 0;
}

.review-tags span {
  padding: calc(4 * var(--pt)) calc(12 * var(--pt));
  border-radius: calc(20 * var(--pt));
  background: var(--codex-accent-soft);
  color: var(--codex-accent);
  font-size: calc(13 * var(--pt));
  font-weight: 600;
  letter-spacing: 0.04em;
}

.review-tags .is-today {
  background: var(--deck-green);
  color: #ffffff;
  animation: review-today-pulse 1.8s ease-in-out infinite;
}

@keyframes review-today-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(20, 161, 102, 0.5); }
  50% { box-shadow: 0 0 0 calc(8 * var(--pt)) rgba(20, 161, 102, 0); }
}

.slidev-layout h2.review-event-title {
  margin: 0 0 calc(14 * var(--pt)) 0;
  font-size: calc(33 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.12;
}

.review-place,
.review-signups {
  display: flex;
  align-items: center;
  gap: calc(7 * var(--pt));
  margin: 0 0 calc(6 * var(--pt)) 0;
  font-size: calc(17 * var(--pt));
  font-weight: 500;
  color: var(--codex-fg-muted);
}

.review-signups {
  color: var(--codex-fg);
  font-weight: 600;
}

/* The closing numbers. */
.review-numbers p {
  display: flex;
  align-items: baseline;
  gap: calc(14 * var(--pt));
  margin: 0 0 calc(6 * var(--pt)) 0;
}

.review-number {
  font-size: calc(84 * var(--pt));
  font-weight: 700;
  letter-spacing: -0.05em;
  line-height: 1.05;
  background: linear-gradient(120deg, var(--codex-grad-2), var(--codex-grad-3));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.review-number-label {
  font-size: calc(28 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.02em;
}

/* ── The pile of pictures on the right ───────────────────────────────────── */

.review-pile {
  position: absolute;
  left: calc(440 * var(--pt));
  right: calc(30 * var(--pt));
  top: calc(56 * var(--pt));
  bottom: calc(84 * var(--pt));
}

.review-pile :deep(.photo-stack) {
  --photo-max-width: calc(430 * var(--pt));
  --photo-max-height: calc(340 * var(--pt));
  position: absolute;
  inset: 0;
}

.review-pile-swap-leave-active {
  transition: transform 420ms cubic-bezier(0.5, 0, 0.75, 0.2), opacity 420ms ease;
}

.review-pile-swap-leave-to {
  transform: translate(-36%, 8%) rotate(-9deg);
  opacity: 0;
}

.review-today-card {
  position: absolute;
  left: 50%;
  top: 50%;
  width: calc(300 * var(--pt));
  height: calc(300 * var(--pt));
  translate: -50% -50%;
  rotate: -2deg;
  border-radius: calc(22 * var(--pt));
  border: calc(6 * var(--pt)) solid #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: calc(16 * var(--pt));
  background: url('/cover-bg.png') center / cover, var(--codex-grad-2);
  color: #ffffff;
  box-shadow: 0 calc(14 * var(--pt)) calc(36 * var(--pt)) rgba(20, 14, 80, 0.3);
  animation: deck-pop 800ms var(--deck-ease-spring) both;
}

.review-today-card img {
  width: calc(120 * var(--pt));
  height: calc(120 * var(--pt));
}

.review-today-card strong {
  font-size: calc(26 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.02em;
}

/* ── The line of the year at the bottom ──────────────────────────────────── */

.review-line {
  position: absolute;
  left: calc(46 * var(--pt));
  right: calc(46 * var(--pt));
  bottom: calc(50 * var(--pt));
}
</style>
