<script setup lang="ts">
import { computed } from 'vue'
import { useNow } from '../composables/useNow'
import { useSlideSteps } from '../composables/useSlideSteps'
import { AGENDA, PLATFORM_LABEL, PLATFORM_URL, WORKSHOPS, eventMinutes, formatMinutes, minutesOf } from '../lib/event'

// "Build time": the slide that stays on screen while everyone builds. On the day of the event it
// shows the time and what comes next, with the minutes left until then.
const { isLive } = useSlideSteps(0)
const now = useNow(isLive)

const base = import.meta.env.BASE_URL.replace(/\/$/, '')

// Everything that interrupts build time, in the order of the day.
const MOMENTS = [
  ...WORKSHOPS.map(workshop => ({ start: workshop.start, title: workshop.title, room: workshop.room })),
  ...AGENDA.filter(block => block.kind !== 'build').map(block => ({ start: block.start, title: block.title, room: '' })),
].sort((first, second) => minutesOf(first.start) - minutesOf(second.start))

// Minutes since midnight on the day of the event, and null on any other day.
const minutesNow = computed(() => eventMinutes(now.value))

const clock = computed(() => {
  if (minutesNow.value === null) return ''
  return `${String(Math.floor(minutesNow.value / 60)).padStart(2, '0')}:${String(minutesNow.value % 60).padStart(2, '0')}`
})

// The next moment of the day. On any other day it is the first one, without a countdown.
const next = computed(() => {
  const moment = MOMENTS.find(candidate => minutesOf(candidate.start) > (minutesNow.value ?? -1))
  if (!moment) return null

  const minutesLeft = minutesNow.value === null ? null : minutesOf(moment.start) - minutesNow.value
  return { ...moment, countdown: minutesLeft === null ? '' : `in ${formatMinutes(minutesLeft)}` }
})
</script>

<template>
  <div class="build-time">
    <AuroraBackdrop />
    <FloatingBits :count="14" />

    <div class="build-time-main">
      <img class="build-time-logo" :src="`${base}/codex-logo.gif`" alt="">
      <BigLine text="Build time" size="giant" />
      <p v-if="clock" class="build-time-clock">{{ clock }}</p>
    </div>

    <div v-if="next" class="build-time-next">
      <span>Next · {{ next.start }}<template v-if="next.room"> · {{ next.room }}</template></span>
      <strong>{{ next.title }}</strong>
      <em v-if="next.countdown">{{ next.countdown }}</em>
    </div>

    <div class="build-time-qr">
      <QrCode :url="PLATFORM_URL" />
      <span>{{ PLATFORM_LABEL }}</span>
    </div>
  </div>
</template>

<style scoped>
.build-time {
  position: absolute;
  inset: 0;
  color: #ffffff;
}

.build-time-main {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(96 * var(--pt));
  display: flex;
  flex-direction: column;
  align-items: center;
}

.build-time-logo {
  width: calc(104 * var(--pt));
  height: calc(104 * var(--pt));
  margin-bottom: calc(22 * var(--pt));
  filter: drop-shadow(0 calc(8 * var(--pt)) calc(20 * var(--pt)) rgba(20, 14, 80, 0.45));
  animation: deck-pop 800ms var(--deck-ease-spring) both;
}

.build-time-clock {
  margin: calc(14 * var(--pt)) 0 0 0;
  font-size: calc(34 * var(--pt));
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: rgba(255, 255, 255, 0.9);
  animation: deck-rise 800ms var(--deck-ease-out) 600ms both;
}

/* What comes next: a glass card at the bottom left. */
.build-time-next {
  position: absolute;
  left: calc(34 * var(--pt));
  bottom: calc(30 * var(--pt));
  max-width: calc(560 * var(--pt));
  padding: calc(14 * var(--pt)) calc(18 * var(--pt));
  border-radius: calc(16 * var(--pt));
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(calc(14 * var(--pt)));
  animation: deck-rise 800ms var(--deck-ease-out) 800ms both;
}

.build-time-next span {
  display: block;
  font-size: calc(12 * var(--pt));
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.8);
}

.build-time-next strong {
  display: block;
  margin-top: calc(4 * var(--pt));
  font-size: calc(21 * var(--pt));
  font-weight: 600;
  line-height: 1.2;
}

.build-time-next em {
  display: block;
  margin-top: calc(4 * var(--pt));
  font-size: calc(16 * var(--pt));
  font-style: normal;
  color: rgba(255, 255, 255, 0.85);
}

.build-time-qr {
  position: absolute;
  right: calc(34 * var(--pt));
  bottom: calc(30 * var(--pt));
  width: calc(124 * var(--pt));
  padding: calc(10 * var(--pt)) calc(10 * var(--pt)) calc(8 * var(--pt));
  border-radius: calc(14 * var(--pt));
  background: #ffffff;
  color: var(--codex-fg);
  text-align: center;
  box-shadow: 0 calc(10 * var(--pt)) calc(30 * var(--pt)) rgba(20, 14, 80, 0.3);
  animation: deck-rise 800ms var(--deck-ease-out) 1000ms both;
}

.build-time-qr span {
  display: block;
  margin-top: calc(6 * var(--pt));
  font-size: calc(10.5 * var(--pt));
  font-weight: 600;
}
</style>
