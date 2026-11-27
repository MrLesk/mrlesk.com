<script setup lang="ts">
import type { SceneName } from '../lib/news'

// A small text animation for a news card that has no official OpenAI picture. `name` picks the
// scene. NewsCards mounts a scene when the click shows its card, so the animation starts then.
// Every size inside a scene is in em, so the card sets the scene's size with font-size.
defineProps<{
  name: SceneName
}>()
</script>

<template>
  <div class="mini-scene" :class="`scene-${name}`" aria-hidden="true">
    <!-- Chat + Work: the two slide into each other and become ChatGPT. -->
    <template v-if="name === 'merge'">
      <span class="pill pill-chat">Chat</span>
      <span class="pill pill-work">Work</span>
      <span class="pill pill-chatgpt">ChatGPT</span>
    </template>

    <!-- Background windows: how long the answer may take, and how much less it costs. -->
    <template v-else-if="name === 'windows'">
      <span class="window-row"><b>2 hours</b><i>−30%</i></span>
      <span class="window-row"><b>8 hours</b><i>−40%</i></span>
    </template>
  </div>
</template>

<style scoped>
.mini-scene {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
}

/* ── Chat + Work ─────────────────────────────────────────────────────────── */

/* The three pills share the middle of the scene. Chat starts on the left, Work on the right. */
.scene-merge .pill {
  grid-area: 1 / 1;
}

.pill {
  height: 3em;
  padding: 0 1.2em;
  border-radius: 1.5em;
  display: grid;
  place-items: center;
  color: #ffffff;
  font-weight: 600;
  letter-spacing: -0.01em;
}

/* Chat and Work slide to the middle and fade as they meet. Then ChatGPT springs up and stays. */
.pill-chat {
  background: rgba(52, 66, 224, 0.9);
  animation:
    merge-from-left 800ms var(--deck-ease-out) 500ms both,
    merge-fade 400ms ease 1100ms forwards;
}

.pill-work {
  background: rgba(138, 91, 255, 0.9);
  animation:
    merge-from-right 800ms var(--deck-ease-out) 500ms both,
    merge-fade 400ms ease 1100ms forwards;
}

.pill-chatgpt {
  font-size: 1.15em;
  background: linear-gradient(90deg, rgba(52, 66, 224, 0.95), rgba(138, 91, 255, 0.95));
  animation: merge-appear 700ms var(--deck-ease-spring) 1250ms both;
}

@keyframes merge-from-left {
  from {
    translate: -2.9em 0;
  }
}

@keyframes merge-from-right {
  from {
    translate: 2.9em 0;
  }
}

@keyframes merge-fade {
  to {
    opacity: 0;
    scale: 0.7;
  }
}

@keyframes merge-appear {
  from {
    opacity: 0;
    scale: 0.6;
  }
}

/* ── Background windows ──────────────────────────────────────────────────── */

.scene-windows {
  place-content: center;
  gap: 0.5em;
}

/* One row per window: the time the answer may take, then the discount on the tokens. */
.window-row {
  display: flex;
  align-items: center;
  gap: 0.7em;
  padding: 0.4em 0.45em 0.4em 0.9em;
  border-radius: 0.9em;
  border: 1px solid var(--deck-line);
  background: #ffffff;
  font-size: 1.25em;
  animation: deck-rise 600ms var(--deck-ease-out) both;
}

.window-row + .window-row {
  animation-delay: 150ms;
}

.window-row b {
  font-weight: 600;
  color: var(--codex-fg);
}

.window-row i {
  padding: 0.1em 0.5em;
  border-radius: 0.8em;
  background: #14a166;
  color: #ffffff;
  font-style: normal;
  font-weight: 700;
}
</style>
