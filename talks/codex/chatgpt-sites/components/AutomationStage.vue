<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useSlideSteps } from '../composables/useSlideSteps'
import { useTypedOnStep } from '../composables/useTypewriter'
import { SITE_ADDRESS } from '../lib/example-site'

// Slide "Automations": a schedule that keeps the Site up to date, while a day runs by fast.
//
//   start    the Site's Automations are empty, the clock stands at Tuesday 05:00
//   click 1  "Create schedule": every day at 08:00, and the task types itself
//   click 2  time runs. Every morning at 08:00 the schedule runs and the map gets new guests.
//
// The slide's frontmatter must say `clicks: 2`.
//
// The day only runs while the slide is on screen for real. Previews and exports show
// Tuesday 08:00, right after a run.
const steps = useSlideSteps(2)
const { step, isLive, stepClasses } = steps

/** The work the schedule does, in plain words. It is our example: the docs give none. */
const TASK = 'Add the new guests from the event’s guest list to the map.'
const { shown: typedTask, isComplete: isTaskTyped } = useTypedOnStep(TASK, 1, steps)

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
/** The schedule runs every day at this hour. */
const RUN_HOUR = 8
/** How long one made-up day takes on screen. */
const DAY_LENGTH_MS = 6000
/** Where the day starts on click 2, in hours since Monday 00:00: Tuesday 05:00. */
const START_HOUR = 24 + 5
/** What previews show, in hours since Monday 00:00: Tuesday 08:00, right after a run. */
const PREVIEW_HOUR = 24 + RUN_HOUR
/** How long the map stays empty while it refreshes. */
const REFRESH_MS = 350

const hoursSinceMonday = ref(PREVIEW_HOUR)
const hourOfDay = computed(() => hoursSinceMonday.value % 24)

const clockDay = computed(() => DAYS[Math.floor(hoursSinceMonday.value / 24) % DAYS.length]!.slice(0, 3))
const clockTime = computed(() => {
  const minutesOfDay = Math.floor(hourOfDay.value * 60)
  const hours = String(Math.floor(minutesOfDay / 60)).padStart(2, '0')
  const minutes = String(minutesOfDay % 60).padStart(2, '0')
  return `${hours}:${minutes}`
})

/** How far the clock's hand has turned: midnight is at the top, noon at the bottom. */
const handAngle = computed(() => (hourOfDay.value / 24) * 360)

/** 0 at night, 1 at noon. The sun is up from 06:00 to 18:00. */
const daylight = computed(() => Math.max(0, Math.sin(((hourOfDay.value - 6) / 12) * Math.PI)))

/** How many times the schedule has run since Monday 08:00. That first run counts as 0. */
const runNumber = computed(() => Math.floor((hoursSinceMonday.value - RUN_HOUR) / 24))
const lastRun = computed(() => `${DAYS[runNumber.value % DAYS.length]}, 08:00`)

// The dial is drawn on a 120 x 120 grid. The schedule's mark sits on its rim at 08:00.
const DIAL_CENTER = 60
const DIAL_RADIUS = 52
const markAngle = (RUN_HOUR / 24) * 2 * Math.PI
const RUN_MARK = {
  x: DIAL_CENTER + DIAL_RADIUS * Math.sin(markAngle),
  y: DIAL_CENTER - DIAL_RADIUS * Math.cos(markAngle),
}

// ── A run: a light travels to the Site, the map refreshes, a note pops up ──

/** Counts the runs played on screen. Each new value plays the light and the note again. */
const runKey = ref(0)
const areGuestsShown = ref(true)
let refreshTimer: ReturnType<typeof setTimeout> | undefined

function playRun(): void {
  runKey.value++
  areGuestsShown.value = false
  clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => {
    areGuestsShown.value = true
  }, REFRESH_MS)
}

// ── The day that runs by ───────────────────────────────────────────────────

const isDayRunning = computed(() => isLive.value && step.value >= 2)
let animationFrame = 0

function startTheDay(): void {
  let previous = performance.now()
  const advance = (now: number): void => {
    hoursSinceMonday.value += ((now - previous) / DAY_LENGTH_MS) * 24
    previous = now
    animationFrame = requestAnimationFrame(advance)
  }
  animationFrame = requestAnimationFrame(advance)
}

function stopTheDay(): void {
  cancelAnimationFrame(animationFrame)
  clearTimeout(refreshTimer)
  areGuestsShown.value = true
  // Without runs the light and the note leave the page, so they cannot play again by themselves.
  runKey.value = 0
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

watch([isLive, () => step.value >= 2], ([live, timeRuns]) => {
  stopTheDay()
  if (!live) return void (hoursSinceMonday.value = PREVIEW_HOUR)
  if (!timeRuns) return void (hoursSinceMonday.value = START_HOUR)
  if (prefersReducedMotion()) return void (hoursSinceMonday.value = PREVIEW_HOUR)
  hoursSinceMonday.value = START_HOUR
  startTheDay()
}, { immediate: true })

// The hand passing 08:00 is a run.
watch(runNumber, (now, before) => {
  if (isDayRunning.value && now > before) playRun()
})

onBeforeUnmount(stopTheDay)
</script>

<template>
  <div class="automation" :class="stepClasses">
    <!-- Left: the Site's Automations, first empty, then with one schedule. -->
    <div class="panel">
      <div class="panel-head"><SiteIcon name="clock" />Automations</div>

      <div class="panel-body">
        <div class="panel-empty">
          <span>No schedules yet</span>
          <span class="panel-create"><SiteIcon name="plus" />Create schedule</span>
        </div>

        <div class="schedule">
          <div class="schedule-timing">Every day · 08:00</div>
          <p class="schedule-task">{{ typedTask }}<i v-if="!isTaskTyped" class="schedule-caret" aria-hidden="true" /></p>
          <span class="schedule-status" :class="{ 'is-on': isTaskTyped }"><SiteIcon name="check" />Scheduled</span>
        </div>
      </div>
    </div>

    <!-- Middle: the day, as a clock that turns once every 24 hours. -->
    <div class="day">
      <svg class="dial" viewBox="0 0 120 120" aria-hidden="true">
        <circle class="dial-night" :cx="DIAL_CENTER" :cy="DIAL_CENTER" :r="DIAL_RADIUS" />
        <circle class="dial-day" :cx="DIAL_CENTER" :cy="DIAL_CENTER" :r="DIAL_RADIUS" :style="{ opacity: daylight }" />
        <g :transform="`rotate(${handAngle} ${DIAL_CENTER} ${DIAL_CENTER})`">
          <line class="dial-hand" :x1="DIAL_CENTER" :y1="DIAL_CENTER" :x2="DIAL_CENTER" y2="22" />
          <line class="dial-hand is-day" :x1="DIAL_CENTER" :y1="DIAL_CENTER" :x2="DIAL_CENTER" y2="22" :style="{ opacity: daylight }" />
          <!-- The tip is the sun by day and the moon by night. -->
          <circle class="dial-moon" :cx="DIAL_CENTER" cy="18" r="7" />
          <circle class="dial-sun" :cx="DIAL_CENTER" cy="18" r="7" :style="{ opacity: daylight > 0 ? 1 : 0 }" />
        </g>
        <circle class="dial-center" :cx="DIAL_CENTER" :cy="DIAL_CENTER" r="3.5" />
        <circle v-if="runKey > 0" :key="runKey" class="dial-mark-ring" :cx="RUN_MARK.x" :cy="RUN_MARK.y" r="6" />
        <circle class="dial-mark" :cx="RUN_MARK.x" :cy="RUN_MARK.y" r="6" />
      </svg>
      <div class="day-clock"><span>{{ clockDay }}</span> {{ clockTime }}</div>
      <div class="day-legend"><i aria-hidden="true" />Runs at 08:00</div>

      <!-- The path from the clock to the Site. Each run sends a light along it. -->
      <div class="wire" aria-hidden="true">
        <i v-if="runKey > 0" :key="runKey" class="wire-light" />
      </div>
    </div>

    <!-- Right: the Site, which the schedule keeps up to date. -->
    <BrowserWindow class="site" :address="SITE_ADDRESS">
      <MiniSite :pins="areGuestsShown" />
      <Transition name="site-updated" mode="out-in">
        <span :key="lastRun" class="site-updated"><SiteIcon name="reload" />Updated {{ lastRun }}</span>
      </Transition>
      <span v-if="runKey > 0" :key="runKey" class="site-note">+3 new guests</span>
    </BrowserWindow>
  </div>
</template>

<style scoped>
.automation {
  display: grid;
  grid-template-columns: calc(286 * var(--pt)) calc(150 * var(--pt)) minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  align-items: center;
  gap: calc(22 * var(--pt));
  height: calc(262 * var(--pt));
  margin-bottom: calc(14 * var(--pt));
}

/* ── The Automations panel ──────────────────────────────────────────────── */

.panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  border: 1px solid var(--sites-line);
  border-radius: calc(16 * var(--pt));
  background: #ffffff;
  box-shadow: var(--sites-shadow);
  animation: sites-rise 800ms var(--sites-ease-out) 200ms both;
}

.panel-head {
  display: flex;
  align-items: center;
  gap: calc(8 * var(--pt));
  padding: calc(14 * var(--pt)) calc(18 * var(--pt));
  border-bottom: 1px solid var(--sites-line);
  font-size: calc(15 * var(--pt));
  font-weight: 600;
}

.panel-head .site-icon {
  color: var(--codex-accent);
  font-size: calc(17 * var(--pt));
}

/* The empty state and the schedule share one spot. Click 1 swaps them. */
.panel-body {
  flex: 1;
  display: grid;
  padding: calc(16 * var(--pt)) calc(18 * var(--pt));
}

.panel-empty,
.schedule {
  grid-area: 1 / 1;
  transition:
    opacity 300ms ease,
    transform 600ms var(--sites-ease-out);
}

.panel-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: calc(14 * var(--pt));
  color: var(--codex-fg-muted);
  font-size: calc(14 * var(--pt));
}

.panel-create {
  display: flex;
  align-items: center;
  gap: calc(7 * var(--pt));
  padding: calc(8 * var(--pt)) calc(16 * var(--pt));
  border-radius: 999px;
  background: var(--codex-fg);
  color: #ffffff;
  font-size: calc(13.5 * var(--pt));
  font-weight: 600;
  animation: panel-create-invite 2.4s ease-in-out 1.2s infinite;
}

.s1 .panel-empty {
  opacity: 0;
  transform: scale(0.94);
}

.schedule {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  opacity: 0;
  transform: translateY(calc(18 * var(--pt)));
}

.s1 .schedule {
  opacity: 1;
  transform: none;
  transition-delay: 150ms;
}

.schedule-timing {
  font-size: calc(21 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.02em;
}

.schedule-task {
  min-height: calc(66 * var(--pt));
  margin: calc(8 * var(--pt)) 0 calc(12 * var(--pt)) 0;
  color: var(--codex-fg-muted);
  font-size: calc(15 * var(--pt));
  line-height: 1.45;
}

.schedule-caret {
  display: inline-block;
  width: calc(2 * var(--pt));
  height: 1.1em;
  margin-left: calc(1 * var(--pt));
  background: var(--codex-accent);
  vertical-align: text-bottom;
}

.schedule-status {
  display: flex;
  align-items: center;
  gap: calc(6 * var(--pt));
  padding: calc(4 * var(--pt)) calc(12 * var(--pt));
  border-radius: 999px;
  background: var(--sites-live-soft);
  color: var(--sites-live);
  font-size: calc(13 * var(--pt));
  font-weight: 600;
  opacity: 0;
  transform: scale(0.7);
  transform-origin: left center;
  transition:
    opacity 250ms ease,
    transform 450ms var(--sites-ease-spring);
}

.schedule-status.is-on {
  opacity: 1;
  transform: none;
}

/* ── The day ────────────────────────────────────────────────────────────── */

.day {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: sites-rise 800ms var(--sites-ease-out) 350ms both;
}

.dial {
  position: relative;
  z-index: 1;
  width: calc(130 * var(--pt));
  height: calc(130 * var(--pt));
}

.dial-night {
  fill: #232a5c;
}

.dial-day {
  fill: #d9e6ff;
  stroke: rgba(52, 66, 224, 0.3);
  stroke-width: 1.5;
}

.dial-hand {
  stroke: rgba(255, 255, 255, 0.85);
  stroke-width: 2.5;
  stroke-linecap: round;
}

.dial-hand.is-day {
  stroke: #232a5c;
}

.dial-moon {
  fill: #eef0ff;
}

.dial-sun {
  fill: #ffb224;
  transition: opacity 400ms ease;
}

.dial-center {
  fill: #ffffff;
}

/* The schedule's mark at 08:00 pops up once the schedule exists. */
.dial-mark {
  fill: var(--codex-accent);
  stroke: #ffffff;
  stroke-width: 2.5;
  opacity: 0;
  transform: scale(0.2);
  transform-box: fill-box;
  transform-origin: center;
  transition:
    opacity 250ms ease,
    transform 500ms var(--sites-ease-spring);
}

.s1 .dial-mark {
  opacity: 1;
  transform: none;
  transition-delay: 500ms;
}

/* On every run a ring spreads out from the mark. */
.dial-mark-ring {
  fill: none;
  stroke: var(--codex-accent);
  stroke-width: 2;
  transform-box: fill-box;
  transform-origin: center;
  animation: dial-mark-ring 900ms ease-out both;
}

.day-clock {
  margin-top: calc(10 * var(--pt));
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: calc(19 * var(--pt));
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.day-clock span {
  color: var(--codex-fg-muted);
}

.day-legend {
  display: flex;
  align-items: center;
  gap: calc(6 * var(--pt));
  margin-top: calc(4 * var(--pt));
  color: var(--codex-fg-muted);
  font-size: calc(12 * var(--pt));
  font-weight: 500;
  opacity: 0;
  transition: opacity 400ms ease;
}

.day-legend i {
  width: calc(8 * var(--pt));
  height: calc(8 * var(--pt));
  border-radius: 50%;
  background: var(--codex-accent);
}

.s1 .day-legend {
  opacity: 1;
  transition-delay: 600ms;
}

/* The wire runs from the middle of the clock to the Site, behind the clock. */
.wire {
  position: absolute;
  top: calc(65 * var(--pt));
  left: 50%;
  right: calc(-22 * var(--pt));
  height: 0;
  border-top: 2px dashed rgba(52, 66, 224, 0.25);
}

.wire-light {
  position: absolute;
  top: calc(-6 * var(--pt));
  left: 0;
  width: calc(10 * var(--pt));
  height: calc(10 * var(--pt));
  border-radius: 50%;
  background: var(--codex-accent);
  box-shadow: 0 0 calc(12 * var(--pt)) calc(4 * var(--pt)) rgba(52, 66, 224, 0.45);
  animation: wire-light 700ms ease-in both;
}

/* ── The Site ───────────────────────────────────────────────────────────── */

.site {
  height: 100%;
  font-size: calc(9.5 * var(--pt));
  animation: sites-rise 800ms var(--sites-ease-out) 450ms both;
}

.site-updated {
  position: absolute;
  top: 0.9em;
  right: 1.1em;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.35em 0.9em;
  border-radius: 999px;
  background: var(--sites-live-soft);
  color: var(--sites-live);
  font-size: 1.05em;
  font-weight: 600;
  opacity: 0;
  transition: opacity 300ms ease;
}

.s2 .site-updated {
  opacity: 1;
}

.site-updated-enter-active,
.site-updated-leave-active {
  transition:
    opacity 200ms ease,
    transform 300ms var(--sites-ease-out);
}

.site-updated-enter-from {
  opacity: 0;
  transform: translateY(0.6em);
}

.site-updated-leave-to {
  opacity: 0;
  transform: translateY(-0.6em);
}

/* The note shows up when the light arrives, stays for a moment, and leaves. */
.site-note {
  position: absolute;
  top: 55%;
  left: 50%;
  z-index: 2;
  padding: 0.45em 1em;
  border-radius: 999px;
  background: var(--codex-accent);
  box-shadow: 0 0.6em 1.6em rgba(52, 66, 224, 0.4);
  color: #ffffff;
  font-size: 1.4em;
  font-weight: 600;
  white-space: nowrap;
  translate: -50% -50%;
  animation: site-note 2600ms var(--sites-ease-out) 600ms both;
}

@keyframes panel-create-invite {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(3, 10, 24, 0);
  }
  50% {
    box-shadow: 0 0 0 calc(6 * var(--pt)) rgba(3, 10, 24, 0.1);
  }
}

@keyframes dial-mark-ring {
  from {
    opacity: 0.9;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(3.2);
  }
}

@keyframes wire-light {
  from {
    left: 0;
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  to {
    left: 100%;
    opacity: 0;
  }
}

@keyframes site-note {
  0% {
    opacity: 0;
    scale: 0.6;
  }
  12%,
  80% {
    opacity: 1;
    scale: 1;
  }
  100% {
    opacity: 0;
    scale: 1;
  }
}
</style>
