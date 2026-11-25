<script setup lang="ts">
// A picture of the ChatGPT message box: the @Sites mention, the prompt and the send button.
// It only draws what it is given. The parent decides what is typed and when.
withDefaults(defineProps<{
  /** The prompt typed so far. */
  text: string
  /** Shows the @Sites mention in front of the prompt. */
  mention?: boolean
  /** Lights the send button, as when a message is ready to send. */
  ready?: boolean
  /** Grey hint shown while nothing is typed. */
  placeholder?: string
}>(), {
  mention: true,
  ready: false,
  placeholder: '',
})
</script>

<template>
  <div class="sites-prompt" :class="{ 'is-ready': ready }">
    <span class="sites-prompt-mention" :class="{ 'is-in': mention }">@Sites</span>
    <span class="sites-prompt-text">
      <span>{{ text }}</span>
      <i class="sites-prompt-caret" aria-hidden="true" />
      <span v-if="!text" class="sites-prompt-placeholder">{{ placeholder }}</span>
    </span>
    <span class="sites-prompt-send" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
    </span>
  </div>
</template>

<style scoped>
/* All sizes are in em, so a parent changes the size of the whole box with one font-size. */
.sites-prompt {
  display: flex;
  align-items: center;
  gap: 0.6em;
  box-sizing: border-box;
  width: 100%;
  min-height: 3.2em;
  padding: 0.55em 0.6em 0.55em 0.9em;
  border: 1px solid var(--sites-line);
  border-radius: 1.6em;
  background: #ffffff;
  box-shadow: 0 0.5em 1.6em rgba(20, 14, 80, 0.08);
  color: var(--codex-fg);
  line-height: 1.3;
}

.sites-prompt-mention {
  flex: none;
  overflow: hidden;
  max-width: 0;
  padding: 0.2em 0;
  border-radius: 0.5em;
  background: var(--codex-accent-soft);
  color: var(--codex-accent);
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  transform: scale(0.8);
  transition:
    max-width 420ms var(--sites-ease-out),
    padding 420ms var(--sites-ease-out),
    opacity 240ms ease,
    transform 420ms var(--sites-ease-spring);
}

.sites-prompt-mention.is-in {
  max-width: 5em;
  padding: 0.2em 0.5em;
  opacity: 1;
  transform: none;
}

.sites-prompt-text {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
}

.sites-prompt-placeholder {
  color: var(--codex-fg-muted);
  opacity: 0.7;
}

.sites-prompt-caret {
  display: inline-block;
  width: 0.12em;
  height: 1.15em;
  margin: 0 0.08em;
  border-radius: 1px;
  background: var(--codex-accent);
  vertical-align: text-bottom;
  animation: sites-prompt-caret 1.1s steps(1) infinite;
}

.sites-prompt-send {
  flex: none;
  display: grid;
  place-items: center;
  width: 2.1em;
  height: 2.1em;
  border-radius: 50%;
  background: rgba(3, 10, 24, 0.12);
  color: #ffffff;
  transition:
    background 300ms ease,
    transform 300ms var(--sites-ease-spring),
    box-shadow 300ms ease;
}

.sites-prompt-send svg {
  width: 1.1em;
  height: 1.1em;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sites-prompt.is-ready .sites-prompt-send {
  background: var(--codex-accent);
  box-shadow: 0 0.3em 0.9em rgba(52, 66, 224, 0.4);
  transform: scale(1.08);
}

@keyframes sites-prompt-caret {
  0%,
  55% {
    opacity: 1;
  }
  56%,
  100% {
    opacity: 0;
  }
}
</style>
