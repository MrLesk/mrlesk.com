<script setup lang="ts">
import { computed } from 'vue'
import { useSlideSteps } from '../composables/useSlideSteps'
import { useTypedOnStep } from '../composables/useTypewriter'

// Slide "Ask for one change": what to do when the first preview is not right. The presenter
// talks over it while everyone's Site is still building.
//
//   start    the loop of three steps, and the sentence with its three gaps
//   click 1  an example types itself into the sentence
//
// The slide's frontmatter must say `clicks: 1`.
const steps = useSlideSteps(1)
const { step } = steps

const LOOP = ['Try it', 'Say what happened', 'Ask for one change']

/** The example sentence in pieces. The pieces with `isGap` are what a participant writes. */
const EXAMPLE = [
  { text: 'When I ', isGap: false },
  { text: 'press Sign up', isGap: true },
  { text: ', I expected ', isGap: false },
  { text: 'a thank-you message', isGap: true },
  { text: ', but ', isGap: false },
  { text: 'nothing', isGap: true },
  { text: ' happened.', isGap: false },
]
const exampleText = EXAMPLE.map(piece => piece.text).join('')

const { shown: typedExample } = useTypedOnStep(exampleText, 1, steps)

/** Each piece of the example, cut to what has been typed so far. */
const typedPieces = computed(() => {
  let charactersLeft = typedExample.value.length
  return EXAMPLE.map((piece) => {
    const typed = piece.text.slice(0, Math.max(0, charactersLeft))
    charactersLeft -= piece.text.length
    return { typed, isGap: piece.isGap }
  })
})
</script>

<template>
  <div class="change">
    <!-- The loop. One step after another lights up, for as long as the slide is on screen. -->
    <div class="change-loop">
      <template v-for="(name, index) in LOOP" :key="name">
        <SiteIcon v-if="index > 0" name="chevron" class="change-arrow" />
        <span class="change-step" :style="{ '--order': index }">
          <i>{{ index + 1 }}</i>{{ name }}
        </span>
      </template>
      <!-- The way back from the last step to the first. -->
      <svg class="change-return" viewBox="0 0 600 44" preserveAspectRatio="none" aria-hidden="true">
        <path d="M540 2v14a12 12 0 0 1-12 12H72a12 12 0 0 1-12-12V8" />
        <path d="M52 16l8-9 8 9" />
      </svg>
    </div>

    <div class="change-box">
      <p v-if="step === 0" class="change-sentence">
        When I <span class="change-gap" />, I expected <span class="change-gap" />, but <span class="change-gap" /> happened.
      </p>
      <p v-else class="change-sentence">
        <span v-for="(piece, index) in typedPieces" :key="index" :class="{ 'change-filled': piece.isGap }">{{ piece.typed }}</span>
      </p>
    </div>

    <p class="change-rule">One change per message.</p>
  </div>
</template>

<style scoped>
.change {
  margin-top: calc(30 * var(--pt));
}

/* ── The loop ───────────────────────────────────────────────────────────── */

.change-loop {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(600 * var(--pt));
  margin: 0 auto;
  padding-bottom: calc(44 * var(--pt));
  animation: sites-rise 800ms var(--sites-ease-out) 200ms both;
}

.change-step {
  display: flex;
  align-items: center;
  gap: calc(9 * var(--pt));
  padding: calc(9 * var(--pt)) calc(16 * var(--pt)) calc(9 * var(--pt)) calc(9 * var(--pt));
  border: 1px solid var(--sites-line);
  border-radius: 999px;
  background: #ffffff;
  font-size: calc(16 * var(--pt));
  font-weight: 600;
  white-space: nowrap;
  /* Each step takes its turn in the light: a third of the loop each. */
  animation: change-step-turn 4.5s ease-in-out infinite;
  animation-delay: calc(900ms + var(--order) * 1500ms);
}

.change-step i {
  display: grid;
  place-items: center;
  width: calc(24 * var(--pt));
  height: calc(24 * var(--pt));
  border-radius: 50%;
  background: var(--codex-accent-soft);
  color: var(--codex-accent);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: calc(12 * var(--pt));
  font-style: normal;
}

.change-arrow {
  flex: none;
  color: var(--codex-fg-muted);
  font-size: calc(18 * var(--pt));
}

.change-return {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: calc(44 * var(--pt));
  fill: none;
  stroke: var(--codex-fg-muted);
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.6;
}

/* ── The sentence ───────────────────────────────────────────────────────── */

.change-box {
  margin-top: calc(18 * var(--pt));
  padding: calc(26 * var(--pt)) calc(30 * var(--pt));
  border-radius: calc(18 * var(--pt));
  background: var(--sites-panel);
  animation: sites-rise 800ms var(--sites-ease-out) 400ms both;
}

.change-sentence {
  /* Room for two lines, so the box keeps its size when the example comes in. */
  min-height: calc(86 * var(--pt));
  margin: 0;
  font-size: calc(27 * var(--pt));
  font-weight: 500;
  letter-spacing: -0.015em;
  line-height: 1.6;
}

.change-gap {
  display: inline-block;
  width: calc(110 * var(--pt));
  border-bottom: 2px dashed rgba(52, 66, 224, 0.55);
  vertical-align: baseline;
}

.change-filled {
  color: var(--codex-accent);
  font-weight: 600;
}

.change-rule {
  margin: calc(26 * var(--pt)) 0 0 0;
  font-size: calc(24 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.02em;
  animation: sites-rise 800ms var(--sites-ease-out) 550ms both;
}

@keyframes change-step-turn {
  0%,
  33%,
  100% {
    border-color: var(--sites-line);
    box-shadow: 0 0 0 0 rgba(52, 66, 224, 0);
  }
  6%,
  27% {
    border-color: var(--codex-accent);
    box-shadow: 0 calc(8 * var(--pt)) calc(22 * var(--pt)) rgba(52, 66, 224, 0.22);
  }
}
</style>
