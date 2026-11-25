<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useSlideSteps } from '../composables/useSlideSteps'
import { OPEN_PROMPT_PARTS, PROMPT_SENTENCE, STARTERS, promptFor } from '../lib/workshop'

// Slide "Your prompt": the one sentence everyone sends, with its three open parts.
//
//   start    the three parts are open: [who], [one action], [result]
//   click 1  the parts fill in for the first starter, and the countdown in the corner starts
//   click 2  the second starter
//   click 3  the third starter
//
// The slide's frontmatter must say `clicks: 3`, one click for each starter.
//
// People who open this slide on their own screen can press "Copy prompt" to take the prompt
// that is shown.
const { step } = useSlideSteps(STARTERS.length)

/** The starter whose words are shown, or nothing while the parts are still open. */
const shownStarter = computed(() => STARTERS[step.value - 1])
const parts = computed(() => shownStarter.value ?? OPEN_PROMPT_PARTS)
const promptText = computed(() => promptFor(parts.value))

const COPIED_NOTE_MS = 1600
const wasJustCopied = ref(false)
let copiedNoteTimer: ReturnType<typeof setTimeout> | undefined

async function copyPrompt(event: MouseEvent): Promise<void> {
  await navigator.clipboard.writeText(promptText.value)
  wasJustCopied.value = true
  clearTimeout(copiedNoteTimer)
  copiedNoteTimer = setTimeout(() => {
    wasJustCopied.value = false
  }, COPIED_NOTE_MS)

  // A clicked button keeps the keyboard focus, and Space would then press it again instead of
  // moving the slides on. Giving the focus back avoids that.
  if (event.currentTarget instanceof HTMLElement) event.currentTarget.blur()
}

onBeforeUnmount(() => clearTimeout(copiedNoteTimer))
</script>

<template>
  <div class="prompt">
    <div class="prompt-box">
      <p class="prompt-sentence">
        <span class="prompt-mention">@Sites</span>
        <template v-for="(piece, index) in PROMPT_SENTENCE" :key="index">
          <template v-if="typeof piece === 'string'">{{ piece }}</template>
          <!-- An open part. Its words slide out and the next ones slide in. -->
          <Transition v-else name="prompt-part" mode="out-in">
            <span :key="parts[piece.part]" class="prompt-part" :class="{ 'is-open': !shownStarter }">{{ parts[piece.part] }}</span>
          </Transition>
        </template>
      </p>

      <div class="prompt-bar">
        <span class="prompt-starters">
          <span
            v-for="starter in STARTERS"
            :key="starter.name"
            class="prompt-starter"
            :class="{ 'is-shown': starter === shownStarter }"
          >{{ starter.name }}</span>
        </span>
        <button class="prompt-copy" type="button" @click="copyPrompt">
          <SiteIcon :name="wasJustCopied ? 'check' : 'copy'" />{{ wasJustCopied ? 'Copied' : 'Copy prompt' }}
        </button>
      </div>
    </div>

    <p class="prompt-task">Change the three parts. Then send it.</p>
    <p class="prompt-hint">Your own language is fine.</p>
  </div>
</template>

<style scoped>
.prompt {
  margin-top: calc(10 * var(--pt));
}

/* The message box. */
.prompt-box {
  padding: calc(24 * var(--pt)) calc(26 * var(--pt)) calc(16 * var(--pt));
  border: 1px solid var(--sites-line);
  border-radius: calc(20 * var(--pt));
  background: #ffffff;
  box-shadow: var(--sites-shadow);
  animation: sites-rise 800ms var(--sites-ease-out) 200ms both;
}

.prompt-sentence {
  min-height: calc(132 * var(--pt));
  margin: 0;
  font-size: calc(23 * var(--pt));
  font-weight: 500;
  letter-spacing: -0.015em;
  line-height: 1.75;
}

.prompt-mention {
  margin-right: 0.3em;
  padding: 0.12em 0.4em;
  border-radius: 0.4em;
  background: var(--codex-accent-soft);
  color: var(--codex-accent);
  font-weight: 600;
}

/* A part the participant fills in. Open: a dashed slot. Filled: a solid blue one. */
.prompt-part {
  display: inline-block;
  padding: 0 0.45em;
  border: 1.5px solid transparent;
  border-radius: 0.4em;
  background: var(--codex-accent);
  color: #ffffff;
  font-weight: 600;
  line-height: 1.4;
}

.prompt-part.is-open {
  border-color: rgba(52, 66, 224, 0.5);
  border-style: dashed;
  background: var(--codex-accent-soft);
  color: var(--codex-accent);
}

.prompt-part-enter-active,
.prompt-part-leave-active {
  transition:
    opacity 220ms ease,
    transform 320ms var(--sites-ease-out);
}

.prompt-part-enter-from {
  opacity: 0;
  transform: translateY(0.5em);
}

.prompt-part-leave-to {
  opacity: 0;
  transform: translateY(-0.5em);
}

/* Under the sentence: which starter is shown, and the copy button. */
.prompt-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: calc(10 * var(--pt));
  padding-top: calc(12 * var(--pt));
  border-top: 1px solid var(--sites-line);
}

.prompt-starters {
  display: flex;
  gap: calc(8 * var(--pt));
}

.prompt-starter {
  padding: calc(4 * var(--pt)) calc(11 * var(--pt));
  border-radius: 999px;
  color: var(--codex-fg-muted);
  font-size: calc(12.5 * var(--pt));
  font-weight: 500;
  transition:
    background 300ms ease,
    color 300ms ease;
}

.prompt-starter.is-shown {
  background: var(--codex-accent-soft);
  color: var(--codex-accent);
  font-weight: 600;
}

.prompt-copy {
  display: flex;
  align-items: center;
  gap: calc(7 * var(--pt));
  padding: calc(7 * var(--pt)) calc(14 * var(--pt));
  border: 0;
  border-radius: 999px;
  background: var(--codex-fg);
  color: #ffffff;
  font: inherit;
  font-size: calc(12.5 * var(--pt));
  font-weight: 600;
  cursor: pointer;
}

.prompt-task {
  margin: calc(22 * var(--pt)) 0 calc(4 * var(--pt)) 0;
  font-size: calc(21 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.02em;
  animation: sites-rise 800ms var(--sites-ease-out) 450ms both;
}

.prompt-hint {
  margin: 0;
  color: var(--codex-fg-muted);
  font-size: calc(15 * var(--pt));
  animation: sites-rise 800ms var(--sites-ease-out) 550ms both;
}
</style>
