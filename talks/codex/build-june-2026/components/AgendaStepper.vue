<script setup lang="ts">
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

const props = withDefaults(defineProps<{
  initialIndex?: number | string
  maxIndex?: number | string
}>(), {
  initialIndex: 1,
})

const { $clicks } = useSlideContext()

const agenda = [
  {
    time: '09:30 AM - 10:00 AM',
    title: 'Coffee and networking',
    meta: 'Arrival, coffee, and first conversations.',
  },
  {
    time: '10:00 AM - 10:45 AM',
    title: 'Kickoff Keynote',
    meta: 'Agenda for the day, Staff and Codex expert introductions.',
  },
  {
    time: '11:00 AM - 12:00 PM',
    title: 'Build time',
    meta: 'Move into tracks and start the first focused build block.',
  },
  {
    time: '12:00 PM - 12:30 PM',
    title: 'Lunch break',
    meta: 'Reset, compare progress, and find the next blocker.',
  },
  {
    time: '12:30 PM - 03:00 PM',
    title: 'Build time',
    meta: 'Long-form implementation, review, and iteration.',
  },
  {
    time: '03:00 PM - 04:30 PM',
    title: 'Presentations',
    meta: 'Whoever wants to present their work will have between 5 and 10 minutes to showcase what they built.',
  },
  {
    time: '04:30 PM - 05:30 PM',
    title: 'Closing and networking',
    meta: 'Wrap up, trade notes, and keep the useful threads alive.',
  },
]

const normalizedInitialIndex = computed(() => {
  const index = Number(props.initialIndex)
  if (!Number.isFinite(index)) return 1
  return Math.min(agenda.length - 1, Math.max(0, Math.trunc(index)))
})

const normalizedMaxIndex = computed(() => {
  const index = Number(props.maxIndex)
  if (!Number.isFinite(index)) return agenda.length - 1
  return Math.min(agenda.length - 1, Math.max(normalizedInitialIndex.value, Math.trunc(index)))
})

const remainingClicks = computed(() => Math.max(0, normalizedMaxIndex.value - normalizedInitialIndex.value))
const clickGapSize = computed(() => remainingClicks.value + 1)

const activeIndex = computed(() => {
  const clicks = $clicks?.value ?? 0
  return Math.min(normalizedMaxIndex.value, normalizedInitialIndex.value + clicks)
})

const visibleSlots = 4
const maxWindowStart = Math.max(0, agenda.length - visibleSlots)

const windowStart = computed(() => {
  if (activeIndex.value <= 1) return 0
  if (activeIndex.value >= agenda.length - 2) return maxWindowStart
  return Math.min(maxWindowStart, Math.max(0, activeIndex.value - 1))
})

const stateFor = (index: number) => {
  if (index < activeIndex.value) return 'is-done'
  if (index === activeIndex.value) return 'is-active'
  return 'is-upcoming'
}

const itemStyle = (index: number) => {
  const slot = index - windowStart.value
  const clamped = Math.max(-1, Math.min(visibleSlots, slot))
  const relative = index - activeIndex.value
  const isVisible = slot >= 0 && slot < visibleSlots
  const scale = relative === 0 ? 1 : 0.9
  const opacity = relative === 0 ? 1 : isVisible ? relative < 0 ? 0.46 : 0.72 : 0
  const slotY = 10 + clamped * 83

  return {
    '--agenda-y': `calc(${slotY} * var(--pt))`,
    '--agenda-scale': scale,
    '--agenda-opacity': opacity,
    '--agenda-z': 20 - Math.abs(relative),
  }
}
</script>

<template>
  <div class="agenda-stage">
    <v-click-gap v-if="remainingClicks > 0" :size="clickGapSize" />
    <div class="agenda-rail" aria-hidden="true" />
    <ol class="agenda-list">
      <li
        v-for="(item, index) in agenda"
        :key="`${item.time}-${item.title}-${index}`"
        :class="['agenda-item', stateFor(index), { 'has-coffee-art': index === 0 }]"
        :style="itemStyle(index)"
      >
        <div class="agenda-marker">
          <span v-if="stateFor(index) === 'is-done'">done</span>
          <span v-else>{{ String(index + 1).padStart(2, '0') }}</span>
        </div>
        <div class="agenda-time">{{ item.time }}</div>
        <div class="agenda-copy">
          <div class="agenda-title">{{ item.title }}</div>
          <div class="agenda-meta">{{ item.meta }}</div>
        </div>
        <div class="agenda-state">
          {{ stateFor(index) === 'is-done' ? 'Finished' : stateFor(index) === 'is-active' ? 'Now' : 'Next' }}
        </div>
        <div v-if="index === 0" class="agenda-coffee-art" aria-hidden="true">
          <div class="coffee-steam coffee-steam-1" />
          <div class="coffee-steam coffee-steam-2" />
          <div class="coffee-steam coffee-steam-3" />
          <div class="coffee-cup">
            <div class="coffee-cup-body">
              <div class="coffee-brew" />
              <div class="coffee-handle" />
            </div>
          </div>
          <div class="coffee-saucer" />
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.agenda-stage {
  position: relative;
  width: min(calc(900 * var(--pt)), 100%);
  height: calc(360 * var(--pt));
  overflow: hidden;
}

.agenda-rail {
  position: absolute;
  left: calc(36 * var(--pt));
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(52, 66, 224, 0.22) 24%,
    rgba(52, 66, 224, 0.36) 50%,
    rgba(3, 10, 24, 0.08) 76%,
    transparent
  );
}

.agenda-list {
  position: relative;
  list-style: none;
  padding: 0;
  margin: 0;
  height: 100%;
}

.agenda-item {
  --agenda-y: 0px;
  --agenda-scale: 0.9;
  --agenda-opacity: 0.72;
  --agenda-z: 1;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: grid;
  grid-template-columns: calc(68 * var(--pt)) calc(126 * var(--pt)) 1fr;
  align-items: center;
  gap: calc(14 * var(--pt));
  min-height: calc(60 * var(--pt));
  border: 1px solid var(--codex-border);
  border-radius: calc(8 * var(--pt));
  padding: calc(11 * var(--pt)) calc(102 * var(--pt)) calc(11 * var(--pt)) calc(16 * var(--pt));
  background: #ffffff;
  opacity: var(--agenda-opacity);
  z-index: var(--agenda-z);
  transform: translate3d(0, var(--agenda-y), 0) scale(var(--agenda-scale));
  transform-origin: center;
  will-change: transform, opacity;
  transition:
    transform 420ms cubic-bezier(0.22, 1, 0.36, 1),
    min-height 320ms ease,
    padding 320ms ease,
    opacity 260ms ease,
    border-color 220ms ease,
    box-shadow 260ms ease,
    color 220ms ease,
    background-color 220ms ease;
}

.agenda-item.is-active {
  --agenda-opacity: 1;
  --agenda-scale: 1;
  min-height: calc(78 * var(--pt));
  padding-top: calc(14 * var(--pt));
  padding-bottom: calc(14 * var(--pt));
  border-color: rgba(52, 66, 224, 0.42);
  box-shadow: 0 calc(18 * var(--pt)) calc(42 * var(--pt)) rgba(20, 14, 80, 0.16);
}

.agenda-item.has-coffee-art.is-active {
  min-height: calc(84 * var(--pt));
  padding-right: calc(220 * var(--pt));
}

.agenda-item.is-done {
  color: var(--codex-fg-muted);
}

.agenda-marker {
  width: calc(38 * var(--pt));
  height: calc(38 * var(--pt));
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--codex-accent-soft);
  color: var(--codex-accent);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: calc(11 * var(--pt));
  font-weight: 600;
  text-transform: uppercase;
  transition:
    background 220ms ease,
    color 220ms ease;
}

.agenda-item.is-active .agenda-marker {
  background: linear-gradient(135deg, var(--codex-grad-1), var(--codex-grad-2));
  color: #ffffff;
}

.agenda-item.is-done .agenda-marker {
  background: rgba(3, 10, 24, 0.08);
  color: var(--codex-fg-muted);
}

.agenda-time {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: calc(11 * var(--pt));
  color: var(--codex-fg-muted);
  transition: color 220ms ease;
}

.agenda-title {
  font-size: calc(18 * var(--pt));
  font-weight: 600;
  letter-spacing: 0;
  color: var(--codex-fg);
  transition: color 220ms ease;
}

.agenda-item.is-done .agenda-title,
.agenda-item.is-upcoming .agenda-title {
  color: var(--codex-fg);
}

.agenda-meta {
  margin-top: calc(2 * var(--pt));
  font-size: calc(11.5 * var(--pt));
  line-height: 1.35;
  color: var(--codex-fg-muted);
  transition: color 220ms ease;
}

.agenda-state {
  position: absolute;
  right: calc(16 * var(--pt));
  top: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: calc(66 * var(--pt));
  border-radius: calc(999 * var(--pt));
  border: 1px solid rgba(52, 66, 224, 0.18);
  padding: calc(4 * var(--pt)) calc(10 * var(--pt));
  font-size: calc(10 * var(--pt));
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0;
  color: var(--codex-accent);
  background: var(--codex-accent-soft);
  transform: translateY(-50%);
  white-space: nowrap;
  transition:
    background 220ms ease,
    border-color 220ms ease,
    color 220ms ease;
}

.agenda-item.is-done .agenda-state {
  border-color: rgba(3, 10, 24, 0.08);
  background: rgba(3, 10, 24, 0.04);
  color: var(--codex-fg-muted);
}

.agenda-item.is-upcoming .agenda-state {
  background: #ffffff;
  color: var(--codex-fg-muted);
}

.agenda-coffee-art {
  position: absolute;
  right: calc(90 * var(--pt));
  top: 50%;
  width: calc(126 * var(--pt));
  height: calc(84 * var(--pt));
  opacity: 0;
  pointer-events: none;
  transform: translate3d(calc(10 * var(--pt)), -50%, 0) scale(0.9);
  transform-origin: center;
  transition:
    opacity 260ms ease,
    transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

.agenda-item.has-coffee-art.is-active .agenda-coffee-art {
  opacity: 1;
  transform: translate3d(0, -50%, 0) scale(1);
}

.agenda-item.has-coffee-art.is-done .agenda-coffee-art,
.agenda-item.has-coffee-art.is-upcoming .agenda-coffee-art {
  opacity: 0;
}

.coffee-cup {
  position: absolute;
  left: calc(50% - 37 * var(--pt));
  bottom: calc(10 * var(--pt));
  width: calc(74 * var(--pt));
  height: calc(58 * var(--pt));
  z-index: 2;
  animation: agenda-float-cup 6.5s ease-in-out infinite;
}

.coffee-cup::before {
  content: "";
  position: absolute;
  left: calc(-28 * var(--pt));
  top: calc(-34 * var(--pt));
  width: calc(132 * var(--pt));
  height: calc(94 * var(--pt));
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.74) 0%, rgba(158, 183, 255, 0.28) 38%, rgba(158, 183, 255, 0) 68%);
  filter: blur(calc(10 * var(--pt)));
}

.coffee-cup-body {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: calc(10 * var(--pt)) calc(10 * var(--pt)) calc(48 * var(--pt)) calc(48 * var(--pt)) /
    calc(10 * var(--pt)) calc(10 * var(--pt)) calc(58 * var(--pt)) calc(58 * var(--pt));
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(234, 241, 255, 0.98) 42%, rgba(202, 217, 255, 0.98) 100%);
  box-shadow:
    inset calc(-8 * var(--pt)) calc(-10 * var(--pt)) calc(18 * var(--pt)) rgba(69, 94, 198, 0.14),
    inset calc(8 * var(--pt)) calc(3 * var(--pt)) calc(12 * var(--pt)) rgba(255, 255, 255, 0.9),
    0 calc(18 * var(--pt)) calc(34 * var(--pt)) rgba(56, 84, 214, 0.24);
}

.coffee-brew {
  position: absolute;
  top: calc(5 * var(--pt));
  left: calc(5 * var(--pt));
  right: calc(5 * var(--pt));
  height: calc(13 * var(--pt));
  border-radius: 50% / 80%;
  background:
    radial-gradient(ellipse at 32% 34%, rgba(255, 255, 255, 0.62), transparent 28%),
    radial-gradient(ellipse at 66% 40%, rgba(105, 135, 255, 0.32), transparent 44%),
    linear-gradient(180deg, #5a78ff 0%, #3043db 70%, #2230ab 100%);
  box-shadow:
    inset 0 calc(3 * var(--pt)) calc(8 * var(--pt)) rgba(16, 30, 107, 0.4),
    0 0 calc(14 * var(--pt)) rgba(83, 113, 255, 0.18);
}

.coffee-handle {
  position: absolute;
  right: calc(-18 * var(--pt));
  top: calc(18 * var(--pt));
  width: calc(26 * var(--pt));
  height: calc(28 * var(--pt));
  border: calc(5 * var(--pt)) solid rgba(239, 245, 255, 0.95);
  border-left: none;
  border-radius: 0 60% 60% 0;
  box-shadow:
    inset calc(3 * var(--pt)) 0 calc(7 * var(--pt)) rgba(255, 255, 255, 0.75),
    calc(4 * var(--pt)) calc(5 * var(--pt)) calc(11 * var(--pt)) rgba(62, 91, 220, 0.18);
}

.coffee-saucer {
  position: absolute;
  left: calc(50% - 50 * var(--pt));
  bottom: calc(4 * var(--pt));
  width: calc(100 * var(--pt));
  height: calc(11 * var(--pt));
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  background: linear-gradient(180deg, rgba(249, 252, 255, 0.98) 0%, rgba(202, 217, 255, 0.98) 100%);
  box-shadow:
    inset 0 calc(5 * var(--pt)) calc(9 * var(--pt)) rgba(255, 255, 255, 0.48),
    0 calc(15 * var(--pt)) calc(22 * var(--pt)) rgba(56, 84, 214, 0.2);
}

.coffee-steam {
  position: absolute;
  bottom: calc(60 * var(--pt));
  width: calc(5 * var(--pt));
  height: calc(36 * var(--pt));
  z-index: 3;
  border-radius: 40%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(185, 206, 255, 0.14), rgba(255, 255, 255, 0));
  filter: blur(calc(5 * var(--pt)));
  opacity: 0;
  transform-origin: bottom center;
  animation: agenda-steam-rise 3.6s ease-in-out infinite;
}

.coffee-steam-1 {
  left: calc(50% - 24 * var(--pt));
  animation-delay: 0s;
}

.coffee-steam-2 {
  left: calc(50% - 3 * var(--pt));
  animation-delay: 0.7s;
}

.coffee-steam-3 {
  left: calc(50% + 19 * var(--pt));
  animation-delay: 1.4s;
}

@keyframes agenda-steam-rise {
  0% {
    opacity: 0;
    transform: translateY(calc(12 * var(--pt))) scaleX(0.8);
  }
  25% {
    opacity: 0.7;
  }
  60% {
    opacity: 0.4;
  }
  100% {
    opacity: 0;
    transform: translateY(calc(-52 * var(--pt))) scaleX(1.4) rotate(6deg);
  }
}

@keyframes agenda-float-cup {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(calc(-4 * var(--pt)));
  }
}

@media (prefers-reduced-motion: reduce) {
  .agenda-item,
  .agenda-marker,
  .agenda-time,
  .agenda-title,
  .agenda-meta,
  .agenda-state,
  .agenda-coffee-art {
    transition-duration: 1ms;
  }

  .agenda-item.has-coffee-art.is-active .agenda-coffee-art,
  .coffee-steam {
    animation: none;
  }
}
</style>
