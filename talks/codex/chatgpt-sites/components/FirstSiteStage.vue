<script setup lang="ts">
import { useSlideSteps } from '../composables/useSlideSteps'
import { useTypedOnStep } from '../composables/useTypewriter'
import { SITE_ADDRESS } from '../lib/example-site'

// Slide "Your first site": the four steps on the left, ChatGPT and the Site it builds on the right.
//
//   start    1 Open ChatGPT       the Work switch turns on
//   click 1  2 Describe your site the @Sites prompt types itself
//   click 2  3 Make it yours      the preview builds, a change request comes in, the pins turn blue
//   click 3  4 Publish            the preview goes live at its address
//
// The slide's frontmatter must say `clicks: 3`.
const steps = useSlideSteps(3)
const { step, stepClasses } = steps

const PROMPT = 'Build a map of everyone at this meetup.'

const STEPS = [
  { title: 'Open ChatGPT', note: 'Switch to Work.', noteIsAddress: false },
  { title: 'Describe your site', note: 'Mention @Sites in your prompt.', noteIsAddress: false },
  { title: 'Make it yours', note: 'Review. Ask for changes. Repeat.', noteIsAddress: false },
  { title: 'Publish', note: SITE_ADDRESS, noteIsAddress: true },
]

const { shown: promptText, isComplete: promptIsTyped } = useTypedOnStep(PROMPT, 1, steps)

// The burst of paper when the Site goes live: sixteen pieces thrown in a full circle,
// every second one a little further.
const CONFETTI_COLOURS = ['var(--codex-accent)', 'var(--codex-grad-3)', 'var(--sites-live)', '#ffb224']
const CONFETTI = Array.from({ length: 16 }, (_, index) => {
  const angle = (index * 22.5 * Math.PI) / 180
  const distance = index % 2 === 0 ? 46 : 78
  return {
    '--piece-x': `calc(${(Math.cos(angle) * distance).toFixed(1)} * var(--pt))`,
    '--piece-y': `calc(${(Math.sin(angle) * distance).toFixed(1)} * var(--pt))`,
    '--piece-spin': `${index % 2 === 0 ? 220 : -260}deg`,
    '--piece-colour': CONFETTI_COLOURS[index % CONFETTI_COLOURS.length],
  }
})
</script>

<template>
  <div class="first-site" :class="stepClasses">
    <!-- Left: the four steps. The line beside them fills up to the current one. -->
    <ol class="first-site-steps" :style="{ '--progress': step / (STEPS.length - 1) }">
      <li
        v-for="(item, index) in STEPS"
        :key="item.title"
        class="first-site-step"
        :class="{ 'is-current': step === index, 'is-waiting': step < index }"
      >
        <span class="first-site-step-number">0{{ index + 1 }}</span>
        <span class="first-site-step-title">{{ item.title }}</span>
        <span class="first-site-step-note" :class="{ 'is-address': item.noteIsAddress }">{{ item.note }}</span>
      </li>
    </ol>

    <!-- Right: ChatGPT on top, the Site preview rising from below. -->
    <div class="first-site-screen">
      <div class="chat-head">
        <span class="chat-brand">ChatGPT</span>
        <span class="chat-work">Work</span>
      </div>

      <div class="chat-body">
        <p class="chat-question">What do you want to build?</p>
        <SitesPrompt
          class="chat-prompt"
          :text="promptText"
          :mention="step >= 1"
          :ready="step >= 1 && promptIsTyped"
          placeholder="Describe your site"
        />
      </div>

      <div class="preview">
        <BrowserWindow class="preview-window">
          <template #address>
            <span class="preview-address">
              <span class="preview-address-private">Private preview</span>
              <span class="preview-address-live">{{ SITE_ADDRESS }}</span>
            </span>
          </template>
          <template #actions>
            <span class="preview-publish">
              <span class="preview-publish-idle">Publish</span>
              <span class="preview-publish-live"><i aria-hidden="true" />Live</span>
            </span>
          </template>

          <!-- Grey bars while the Site is being built, then the Site itself. -->
          <div class="preview-skeleton" aria-hidden="true"><i /><i /><i /></div>
          <MiniSite :pins="step >= 2" />
        </BrowserWindow>

        <span class="preview-feedback">Make the pins blue.</span>
        <span class="preview-confetti" aria-hidden="true">
          <i v-for="(piece, index) in CONFETTI" :key="index" :style="piece" />
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.first-site {
  display: grid;
  grid-template-columns: calc(292 * var(--pt)) minmax(0, 1fr);
  gap: calc(34 * var(--pt));
  height: calc(366 * var(--pt));
}

/* ── The four steps ─────────────────────────────────────────────────────── */

.first-site-steps {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 0;
  padding: calc(4 * var(--pt)) 0 calc(10 * var(--pt)) calc(20 * var(--pt));
  list-style: none;
  animation: sites-rise 700ms var(--sites-ease-out) 150ms both;
}

/* The grey line, and on top of it the blue part that grows with each click. */
.first-site-steps::before,
.first-site-steps::after {
  content: '';
  position: absolute;
  top: calc(8 * var(--pt));
  left: 0;
  width: 2px;
  border-radius: 2px;
}

.first-site-steps::before {
  bottom: calc(14 * var(--pt));
  background: var(--sites-line);
}

.first-site-steps::after {
  height: calc((100% - 22 * var(--pt)) * var(--progress));
  background: var(--codex-accent);
  transition: height 700ms var(--sites-ease-out);
}

.first-site-step {
  display: grid;
  grid-template-columns: calc(34 * var(--pt)) 1fr;
  align-items: baseline;
  transition:
    opacity 400ms ease,
    transform 500ms var(--sites-ease-out);
}

.first-site-step.is-waiting {
  opacity: 0.3;
}

.first-site-step.is-current {
  transform: translateX(calc(4 * var(--pt)));
}

.first-site-step-number {
  color: var(--codex-accent);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: calc(12 * var(--pt));
  font-weight: 500;
}

.first-site-step-title {
  font-size: calc(21 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.first-site-step-note {
  grid-column: 2;
  margin-top: calc(3 * var(--pt));
  color: var(--codex-fg-muted);
  font-size: calc(13.5 * var(--pt));
}

.first-site-step-note.is-address {
  color: var(--codex-accent);
  font-weight: 500;
}

/* ── ChatGPT ────────────────────────────────────────────────────────────── */

.first-site-screen {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--sites-line);
  border-radius: calc(18 * var(--pt));
  background: var(--sites-panel);
  animation: sites-rise 800ms var(--sites-ease-out) 250ms both;
}

.chat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(16 * var(--pt)) calc(20 * var(--pt)) 0;
}

.chat-brand {
  font-size: calc(15 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.01em;
}

/* The Work switch turns itself on shortly after the slide opens. */
.chat-work {
  padding: calc(3 * var(--pt)) calc(11 * var(--pt));
  border: 1px solid var(--sites-line);
  border-radius: 999px;
  background: #ffffff;
  font-size: calc(11 * var(--pt));
  font-weight: 600;
  animation: chat-work-turn-on 800ms ease 900ms both;
}

/* The question and the message box start in the middle and move up when the preview comes. */
.chat-body {
  padding: 0 calc(20 * var(--pt));
  transform: translateY(calc(76 * var(--pt)));
  transition: transform 800ms var(--sites-ease-out);
}

.s2 .chat-body {
  transform: translateY(calc(10 * var(--pt)));
}

.chat-question {
  overflow: hidden;
  max-height: calc(30 * var(--pt));
  margin: 0 0 calc(12 * var(--pt)) 0;
  font-size: calc(18 * var(--pt));
  font-weight: 500;
  letter-spacing: -0.015em;
  text-align: center;
  transition:
    opacity 300ms ease,
    max-height 700ms var(--sites-ease-out),
    margin 700ms var(--sites-ease-out);
}

.s2 .chat-question {
  max-height: 0;
  margin-bottom: 0;
  opacity: 0;
}

.chat-prompt {
  font-size: calc(12.5 * var(--pt));
}

/* ── The Site preview ───────────────────────────────────────────────────── */

.preview {
  position: absolute;
  top: calc(104 * var(--pt));
  right: calc(30 * var(--pt));
  left: calc(30 * var(--pt));
  height: calc(290 * var(--pt));
  opacity: 0;
  transform: translateY(calc(70 * var(--pt))) rotate(-2deg);
  transition:
    opacity 400ms ease,
    transform 800ms var(--sites-ease-out);
}

.s2 .preview {
  opacity: 1;
  transform: rotate(-2deg);
}

/* Going live: the window straightens up. */
.s3 .preview {
  transform: translateY(calc(-6 * var(--pt)));
}

/* The pins come in grey and turn blue after the change request. The delays only apply on the
   way in, so a click back hides everything at once. */
.preview-window {
  height: 100%;
  font-size: calc(9.5 * var(--pt));
  --map-pin: #a2a8ba;
}

.s2 .preview-window {
  --map-pin: var(--codex-accent);
  --map-pins-delay: 1200ms;
  --map-pin-tone-delay: 3000ms;
}

.preview-skeleton {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.8em;
  padding: 1.2em;
  background: #ffffff;
  transition: opacity 400ms ease;
}

.s2 .preview-skeleton {
  opacity: 0;
  transition-delay: 1000ms;
}

.preview-skeleton i {
  display: block;
  border-radius: 0.5em;
  background: linear-gradient(90deg, #eceef5 0%, #f8f9fc 50%, #eceef5 100%);
  background-size: 200% 100%;
  animation: preview-shimmer 1.2s linear infinite;
}

.preview-skeleton i:nth-child(1) {
  width: 38%;
  height: 1em;
}

.preview-skeleton i:nth-child(2) {
  width: 62%;
  height: 1.8em;
}

.preview-skeleton i:nth-child(3) {
  flex: 1;
}

/* The address bar: "Private preview" slides out, the Site's address slides in. */
.preview-address {
  position: relative;
  flex: 1;
  height: 1.4em;
  overflow: hidden;
  line-height: 1.4;
}

.preview-address > span {
  position: absolute;
  inset: 0;
  transition:
    opacity 300ms ease,
    transform 500ms var(--sites-ease-out);
}

.preview-address-live {
  color: var(--codex-fg);
  font-weight: 500;
  opacity: 0;
  transform: translateY(110%);
}

.s3 .preview-address-private {
  opacity: 0;
  transform: translateY(-110%);
}

.s3 .preview-address-live {
  opacity: 1;
  transform: none;
  transition-delay: 150ms;
}

/* The Publish button and the Live badge share one spot. */
.preview-publish {
  display: grid;
}

.preview-publish > span {
  grid-area: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45em;
  padding: 0.4em 1em;
  border-radius: 1em;
  font-size: 0.9em;
  font-weight: 600;
  transition:
    opacity 300ms ease,
    transform 450ms var(--sites-ease-spring);
}

.preview-publish-idle {
  background: var(--codex-fg);
  color: #ffffff;
}

.preview-publish-live {
  background: var(--sites-live-soft);
  color: var(--sites-live);
  opacity: 0;
  transform: scale(0.7);
}

.preview-publish-live i {
  width: 0.55em;
  height: 0.55em;
  border-radius: 50%;
  background: currentColor;
  animation: preview-live-dot 1.6s ease-in-out infinite;
}

.s3 .preview-publish-idle {
  opacity: 0;
  transform: scale(0.7);
}

.s3 .preview-publish-live {
  opacity: 1;
  transform: none;
  transition-delay: 200ms;
}

/* "Ask for changes": a message that lands on the preview. */
.preview-feedback {
  position: absolute;
  top: calc(58 * var(--pt));
  right: calc(-10 * var(--pt));
  z-index: 3;
  padding: calc(7 * var(--pt)) calc(13 * var(--pt));
  border-radius: calc(14 * var(--pt)) calc(14 * var(--pt)) calc(4 * var(--pt)) calc(14 * var(--pt));
  background: var(--codex-accent);
  box-shadow: 0 calc(8 * var(--pt)) calc(20 * var(--pt)) rgba(52, 66, 224, 0.35);
  color: #ffffff;
  font-size: calc(11.5 * var(--pt));
  font-weight: 500;
  opacity: 0;
  transform: translateY(calc(8 * var(--pt))) scale(0.9);
  transform-origin: bottom right;
  transition:
    opacity 300ms ease,
    transform 450ms var(--sites-ease-spring);
}

.s2 .preview-feedback {
  opacity: 1;
  transform: none;
  transition-delay: 2000ms;
}

.s3 .preview-feedback {
  opacity: 0;
  transform: translateY(calc(-6 * var(--pt))) scale(0.9);
  transition-delay: 0ms;
}

/* The burst of paper, thrown from the Live badge. */
.preview-confetti {
  position: absolute;
  top: calc(14 * var(--pt));
  right: calc(36 * var(--pt));
  z-index: 4;
}

.preview-confetti i {
  position: absolute;
  width: calc(6 * var(--pt));
  height: calc(9 * var(--pt));
  border-radius: calc(2 * var(--pt));
  background: var(--piece-colour);
  opacity: 0;
}

.s3 .preview-confetti i {
  animation: preview-confetti 1200ms var(--sites-ease-out) 350ms both;
}

@keyframes chat-work-turn-on {
  0% {
    box-shadow: 0 0 0 0 rgba(52, 66, 224, 0);
  }
  45% {
    border-color: var(--codex-accent);
    background: var(--codex-accent-soft);
    box-shadow: 0 0 0 calc(7 * var(--pt)) rgba(52, 66, 224, 0.16);
    color: var(--codex-accent);
  }
  100% {
    border-color: var(--codex-accent);
    background: var(--codex-accent-soft);
    box-shadow: 0 0 0 0 rgba(52, 66, 224, 0);
    color: var(--codex-accent);
  }
}

@keyframes preview-shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: 0 0;
  }
}

@keyframes preview-live-dot {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(20, 161, 102, 0.5);
  }
  50% {
    box-shadow: 0 0 0 0.35em rgba(20, 161, 102, 0);
  }
}

@keyframes preview-confetti {
  0% {
    opacity: 1;
    transform: scale(0.4);
  }
  70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(var(--piece-x), var(--piece-y)) rotate(var(--piece-spin));
  }
}
</style>
