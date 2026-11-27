<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useSlideSteps } from '../composables/useSlideSteps'
import { BREAKOUT_ROOM_COUNT, DISCORD_URL, MENTOR_COUNT, PLATFORM_LABEL, PLATFORM_URL } from '../lib/event'

// "House rules": three cards and the motto. Everything comes in by itself, so the slide has no
// clicks. The two numbers count up once their card has arrived.
const { isLive } = useSlideSteps(0)

// True once the numbers may count. Outside the live slide (overview, exports) they are just there.
const cardArrived = ref(false)
const counting = computed(() => !isLive.value || cardArrived.value)

watch(isLive, (live) => {
  cardArrived.value = false
  if (live) window.setTimeout(() => (cardArrived.value = true), 700)
}, { immediate: true })

// The motto comes in part by part.
const MOTTO = ['Be friendly,', 'be respectful,', 'build cool things!']
</script>

<template>
  <div class="rules">
    <div class="rules-cards">
      <article class="rule-card" style="--order: 0">
        <QrCode class="rule-qr" :url="PLATFORM_URL" />
        <div>
          <h2>{{ PLATFORM_LABEL }}</h2>
          <p>Agenda and credits</p>
        </div>
      </article>

      <article class="rule-card rule-numbers" style="--order: 1">
        <div>
          <strong class="rule-number"><CountUp :to="BREAKOUT_ROOM_COUNT" :run="counting" /></strong>
          <span class="rule-number-label">breakout rooms</span>
        </div>
        <div>
          <strong class="rule-number"><CountUp :to="MENTOR_COUNT" :run="counting" /></strong>
          <span class="rule-number-label">mentors</span>
        </div>
      </article>

      <article class="rule-card" style="--order: 2">
        <!-- The QR code appears as soon as DISCORD_URL in lib/event.ts holds the invite link. -->
        <QrCode v-if="DISCORD_URL" class="rule-qr" :url="DISCORD_URL" />
        <simple-icons-discord v-else class="rule-discord" />
        <div>
          <h2>Discord</h2>
          <p>Questions and help</p>
        </div>
      </article>
    </div>

    <p class="rules-motto">
      <span v-for="(part, index) in MOTTO" :key="part" :style="{ '--order': index }">{{ part }}</span>
    </p>
  </div>
</template>

<style scoped>
.rules {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: calc(18 * var(--pt));
  padding-bottom: calc(14 * var(--pt));
}

.rules-cards {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: calc(14 * var(--pt));
}

.rule-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: calc(14 * var(--pt));
  padding: calc(18 * var(--pt));
  border-radius: calc(18 * var(--pt));
  border: 1px solid var(--deck-line);
  background: linear-gradient(180deg, #ffffff 0%, var(--deck-panel) 100%);
  text-align: center;
  animation: deck-rise 700ms var(--deck-ease-out) both;
  animation-delay: calc(150ms + var(--order) * 150ms);
}

.rule-card h2 {
  margin: 0;
  font-size: calc(24 * var(--pt));
}

.rule-card p {
  margin: calc(4 * var(--pt)) 0 0 0;
  font-size: calc(16 * var(--pt));
  font-weight: 500;
  color: var(--codex-fg-muted);
}

.rule-qr {
  width: calc(112 * var(--pt));
  padding: calc(8 * var(--pt));
  border-radius: calc(12 * var(--pt));
  background: #ffffff;
  box-shadow: var(--deck-shadow);
}

.rule-discord {
  width: calc(96 * var(--pt));
  height: calc(96 * var(--pt));
  color: #5865f2;
  animation: rule-discord-nod 3.6s ease-in-out 1500ms infinite;
}

@keyframes rule-discord-nod {
  0%, 70%, 100% { rotate: 0deg; }
  78% { rotate: -9deg; }
  86% { rotate: 9deg; }
  94% { rotate: -4deg; }
}

/* The two numbers stand side by side. */
.rule-numbers {
  flex-direction: row;
  gap: calc(26 * var(--pt));
}

.rule-number {
  display: block;
  font-size: calc(76 * var(--pt));
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, var(--codex-grad-2), var(--codex-grad-3));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.rule-number-label {
  display: block;
  margin-top: calc(6 * var(--pt));
  font-size: calc(16 * var(--pt));
  font-weight: 500;
  color: var(--codex-fg-muted);
}

.rules-motto {
  display: flex;
  justify-content: center;
  gap: calc(12 * var(--pt));
  margin: 0;
  padding: calc(20 * var(--pt));
  border-radius: calc(18 * var(--pt));
  background: linear-gradient(120deg, var(--codex-grad-2), var(--codex-grad-3));
  color: #ffffff;
  font-size: calc(30 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.02em;
  animation: deck-rise 700ms var(--deck-ease-out) 700ms both;
}

.rules-motto span {
  animation: deck-pop 600ms var(--deck-ease-spring) both;
  animation-delay: calc(1300ms + var(--order) * 450ms);
}
</style>
