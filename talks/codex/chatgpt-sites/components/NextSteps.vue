<script setup lang="ts">
// Slide "Keep building": where the day goes on after the workshop. It has no clicks. The line
// draws itself and the three stops appear along it.

/** The rest of the day, from the Build Day agenda of 28 November 2026. */
const STOPS = [
  { time: '11:40', label: 'Build' },
  { time: '13:15', label: 'Build and get feedback' },
  { time: '16:00', label: 'Demo, if you like' },
]
</script>

<template>
  <div class="next">
    <div class="next-day">
      <i class="next-line" aria-hidden="true" />
      <div v-for="(stop, index) in STOPS" :key="stop.time" class="next-stop" :style="{ '--order': index }">
        <i class="next-dot" aria-hidden="true" />
        <span class="next-time">{{ stop.time }}</span>
        <span class="next-label">{{ stop.label }}</span>
      </div>
    </div>

    <p class="next-mentors">Mentors: the Sites challenge room.</p>
    <p class="next-hint">Stuck or not finished? Keep going there.</p>
    <p class="next-footnote">Hosting is free through January 31, 2027.</p>
  </div>
</template>

<style scoped>
.next {
  display: flex;
  flex-direction: column;
  height: calc(340 * var(--pt));
  margin-top: calc(22 * var(--pt));
}

.next > * {
  flex: none;
}

/* ── The rest of the day ────────────────────────────────────────────────── */

.next-day {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

/* The line runs through the middle of the dots and draws itself from the left. */
.next-line {
  position: absolute;
  top: calc(9 * var(--pt));
  right: 0;
  left: 0;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--codex-accent), var(--codex-grad-3));
  transform-origin: left center;
  animation: next-line-draw 1400ms var(--sites-ease-out) 250ms both;
}

/* Each stop appears when the line reaches it. */
.next-stop {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  animation: sites-rise 700ms var(--sites-ease-out) both;
  animation-delay: calc(350ms + var(--order) * 380ms);
}

.next-dot {
  width: calc(20 * var(--pt));
  height: calc(20 * var(--pt));
  border: calc(5 * var(--pt)) solid #ffffff;
  border-radius: 50%;
  background: var(--codex-accent);
  box-shadow: 0 0 0 2px var(--codex-accent);
}

.next-time {
  margin-top: calc(16 * var(--pt));
  color: var(--codex-accent);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: calc(17 * var(--pt));
  font-weight: 500;
}

.next-label {
  margin-top: calc(2 * var(--pt));
  font-size: calc(25 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

/* ── Where to get help ──────────────────────────────────────────────────── */

.next-mentors {
  margin: calc(44 * var(--pt)) 0 calc(4 * var(--pt)) 0;
  font-size: calc(24 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.02em;
  animation: sites-rise 700ms var(--sites-ease-out) 1500ms both;
}

.next-hint {
  margin: 0;
  color: var(--codex-fg-muted);
  font-size: calc(17 * var(--pt));
  animation: sites-rise 700ms var(--sites-ease-out) 1600ms both;
}

.next-footnote {
  margin: auto 0 0 0;
  color: var(--codex-fg-muted);
  font-size: calc(12 * var(--pt));
  animation: sites-rise 700ms var(--sites-ease-out) 1750ms both;
}

@keyframes next-line-draw {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}
</style>
