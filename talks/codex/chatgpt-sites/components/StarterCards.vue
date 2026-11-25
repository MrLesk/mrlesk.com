<script setup lang="ts">
import { DECK_ADDRESS, DECK_URL, PROMPT_SLIDE_ALIAS, STARTERS } from '../lib/workshop'

// Slide "Pick a starter": the three ready-made ideas, each with a small scene that keeps
// playing its one action, then the way to an own idea and the QR code to the prompts.
// The slide's one click starts the countdown in the corner; nothing here reacts to it.
const [clubFinder, volunteerSignup, calculator] = STARTERS

const promptSlideUrl = `${DECK_URL}${PROMPT_SLIDE_ALIAS}`
const promptSlideAddress = `${DECK_ADDRESS}/${PROMPT_SLIDE_ALIAS}`
</script>

<template>
  <div class="starters">
    <div class="starter-cards">
      <!-- Club finder: a word is typed, one club matches. -->
      <div class="starter" style="--order: 0">
        <div class="starter-name">{{ clubFinder.name }}</div>
        <div class="scene scene-search" aria-hidden="true">
          <span class="scene-field"><SiteIcon name="search" /><span class="scene-typed">chess</span></span>
          <span class="scene-row is-match">Chess club</span>
          <span class="scene-row">Hiking group</span>
          <span class="scene-row">Film society</span>
        </div>
        <div class="starter-action">One action: <strong>{{ clubFinder.action }}</strong></div>
      </div>

      <!-- Volunteer signup: the button is pressed, one spot is taken. -->
      <div class="starter" style="--order: 1">
        <div class="starter-name">{{ volunteerSignup.name }}</div>
        <div class="scene scene-signup" aria-hidden="true">
          <span class="scene-slot">
            Saturday, 10:00
            <span class="scene-spots"><span class="scene-spots-before">3 spots left</span><span class="scene-spots-after">2 spots left</span></span>
          </span>
          <span class="scene-button">
            <span class="scene-button-idle">Sign up</span>
            <span class="scene-button-done"><SiteIcon name="check" />Signed up</span>
          </span>
        </div>
        <div class="starter-action">One action: <strong>{{ volunteerSignup.action }}</strong></div>
      </div>

      <!-- Calculator: the numbers are in, the result appears. -->
      <div class="starter" style="--order: 2">
        <div class="starter-name">{{ calculator.name }}</div>
        <div class="scene scene-calculator" aria-hidden="true">
          <span class="scene-sum"><span>84.00</span><i>÷</i><span>4 people</span></span>
          <span class="scene-result"><strong>21.00</strong> each</span>
        </div>
        <div class="starter-action">One action: <strong>{{ calculator.action }}</strong></div>
      </div>
    </div>

    <div class="starters-more">
      <div class="starters-own">
        <strong>Your own idea</strong>
        <span>For <em>who</em>, to <em>do one thing</em>.</span>
      </div>
      <a class="starters-qr" :href="promptSlideUrl" target="_blank" rel="noreferrer">
        <QrCode class="starters-qr-code" :url="promptSlideUrl" />
        <span class="starters-qr-text">
          <strong>The prompt, ready to copy</strong>
          <span>{{ promptSlideAddress }}</span>
        </span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.starters {
  display: flex;
  flex-direction: column;
  gap: calc(16 * var(--pt));
  margin-top: calc(6 * var(--pt));
}

.starter-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: calc(16 * var(--pt));
}

.starter {
  display: flex;
  flex-direction: column;
  padding: calc(16 * var(--pt)) calc(18 * var(--pt));
  border: 1px solid var(--sites-line);
  border-radius: calc(16 * var(--pt));
  background: #ffffff;
  box-shadow: var(--sites-shadow);
  animation: sites-rise 800ms var(--sites-ease-out) both;
  animation-delay: calc(200ms + var(--order) * 150ms);
  /* The three scenes take turns: each starts two seconds after the one before it. */
  --scene-delay: calc(1200ms + var(--order) * 2000ms);
}

.starter-name {
  font-size: calc(20 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.02em;
}

.starter-action {
  color: var(--codex-fg-muted);
  font-size: calc(12.5 * var(--pt));
}

.starter-action strong {
  color: var(--codex-accent);
  font-weight: 600;
}

/* ── The three scenes ───────────────────────────────────────────────────────
   Every scene is one loop of six seconds. Its parts share that clock, so they stay in step. */

.scene {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: calc(5 * var(--pt));
  height: calc(126 * var(--pt));
  margin: calc(10 * var(--pt)) 0;
  padding: calc(10 * var(--pt)) calc(12 * var(--pt));
  border-radius: calc(11 * var(--pt));
  background: var(--sites-panel);
  font-size: calc(11.5 * var(--pt));
}

.scene * {
  animation-duration: 6s;
  animation-delay: var(--scene-delay);
  animation-iteration-count: infinite;
  animation-timing-function: ease;
  animation-fill-mode: both;
}

/* Club finder */

.scene-field {
  display: flex;
  align-items: center;
  gap: calc(6 * var(--pt));
  padding: calc(4 * var(--pt)) calc(9 * var(--pt));
  border: 1px solid var(--sites-line);
  border-radius: 999px;
  background: #ffffff;
}

.scene-field .site-icon {
  flex: none;
  color: var(--codex-fg-muted);
}

.scene-typed {
  overflow: hidden;
  font-weight: 500;
  white-space: nowrap;
  animation-name: scene-type;
  animation-timing-function: steps(5, end);
}

.scene-row {
  padding: calc(2.5 * var(--pt)) calc(9 * var(--pt));
  border-radius: calc(6 * var(--pt));
  animation-name: scene-row-dim;
}

.scene-row.is-match {
  animation-name: scene-row-match;
}

/* Volunteer signup */

.scene-slot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
}

.scene-spots,
.scene-button {
  display: grid;
}

.scene-spots > span,
.scene-button > span {
  grid-area: 1 / 1;
}

.scene-spots {
  color: var(--codex-fg-muted);
  font-weight: 400;
  text-align: right;
}

.scene-spots-before,
.scene-button-idle {
  animation-name: scene-before;
}

.scene-spots-after,
.scene-button-done {
  animation-name: scene-after;
}

.scene-button {
  margin-top: calc(6 * var(--pt));
  animation-name: scene-press;
}

.scene-button > span {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: calc(6 * var(--pt));
  padding: calc(7 * var(--pt));
  border-radius: calc(8 * var(--pt));
  font-weight: 600;
}

.scene-button-idle {
  background: var(--codex-accent);
  color: #ffffff;
}

.scene-button-done {
  background: var(--sites-live-soft);
  color: var(--sites-live);
}

/* Calculator */

.scene-calculator {
  align-items: center;
  gap: calc(8 * var(--pt));
}

.scene-sum {
  display: flex;
  align-items: center;
  gap: calc(8 * var(--pt));
}

.scene-sum span {
  padding: calc(4 * var(--pt)) calc(10 * var(--pt));
  border: 1px solid var(--sites-line);
  border-radius: calc(7 * var(--pt));
  background: #ffffff;
  font-weight: 500;
}

.scene-sum i {
  color: var(--codex-fg-muted);
  font-style: normal;
}

.scene-result {
  font-size: calc(13 * var(--pt));
  animation-name: scene-result;
}

.scene-result strong {
  color: var(--codex-accent);
  font-size: calc(22 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.02em;
}

/* ── Own idea and QR code ───────────────────────────────────────────────── */

.starters-more {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: calc(16 * var(--pt));
  animation: sites-rise 800ms var(--sites-ease-out) 700ms both;
}

.starters-own {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: calc(2 * var(--pt));
  padding: calc(12 * var(--pt)) calc(18 * var(--pt));
  border: 1.5px dashed rgba(3, 10, 24, 0.22);
  border-radius: calc(14 * var(--pt));
  font-size: calc(16 * var(--pt));
}

.starters-own strong {
  font-weight: 600;
}

.starters-own span {
  color: var(--codex-fg-muted);
}

.starters-own em {
  color: var(--codex-accent);
  font-style: normal;
  font-weight: 600;
}

/* The theme underlines every link. This block is one big link, so it drops the line. */
.starters-qr {
  display: flex;
  align-items: center;
  gap: calc(14 * var(--pt));
  padding: calc(10 * var(--pt)) calc(18 * var(--pt)) calc(10 * var(--pt)) calc(10 * var(--pt));
  border: 1px solid var(--sites-line) !important;
  border-radius: calc(14 * var(--pt));
  background: #ffffff;
  color: var(--codex-fg) !important;
}

.starters-qr-code {
  width: calc(58 * var(--pt));
}

.starters-qr-text {
  display: flex;
  flex-direction: column;
  gap: calc(2 * var(--pt));
  font-size: calc(14 * var(--pt));
}

.starters-qr-text strong {
  font-weight: 600;
}

.starters-qr-text span {
  color: var(--codex-fg-muted);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: calc(10 * var(--pt));
}

/* The loops. Each one plays its action in the first third, holds it, then starts over. */

@keyframes scene-type {
  0%,
  5% {
    max-width: 0;
  }
  22%,
  92% {
    max-width: 4em;
  }
  100% {
    max-width: 0;
  }
}

@keyframes scene-row-dim {
  0%,
  22%,
  100% {
    opacity: 1;
  }
  30%,
  92% {
    opacity: 0.25;
  }
}

@keyframes scene-row-match {
  0%,
  22%,
  100% {
    background: transparent;
    color: inherit;
  }
  30%,
  92% {
    background: var(--codex-accent-soft);
    color: var(--codex-accent);
  }
}

@keyframes scene-press {
  0%,
  22%,
  34%,
  100% {
    scale: 1;
  }
  28% {
    scale: 0.94;
  }
}

@keyframes scene-before {
  0%,
  28%,
  100% {
    opacity: 1;
  }
  32%,
  92% {
    opacity: 0;
  }
}

@keyframes scene-after {
  0%,
  28%,
  100% {
    opacity: 0;
  }
  32%,
  92% {
    opacity: 1;
  }
}

@keyframes scene-result {
  0%,
  22%,
  100% {
    opacity: 0;
    scale: 0.6;
  }
  30%,
  92% {
    opacity: 1;
    scale: 1;
  }
}
</style>
