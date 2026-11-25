<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'
import { useSlideSteps } from '../composables/useSlideSteps'
import { useTypewriter } from '../composables/useTypewriter'

// The cover's message box. While the cover is on screen it types one example prompt after
// another, so the slide stays alive while people take their seats.
// To change the examples, edit PROMPTS. The first one is what previews and exports show.
const PROMPTS = [
  'Build my personal website.',
  'Build a map of everyone at this meetup.',
  'Build an RSVP page for our next event.',
]
/** How long a finished prompt stays up before the next one starts. */
const READING_PAUSE_MS = 2400

const { isLive } = useSlideSteps(0)
const { shown, type, show } = useTypewriter()
const isFullPrompt = computed(() => PROMPTS.includes(shown.value))

// Each start of the loop gets a new number. A loop that sees a newer number stops.
let currentLoop = 0

function pause(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function typePromptsForever(): Promise<void> {
  const loop = ++currentLoop
  for (let index = 0; loop === currentLoop; index = (index + 1) % PROMPTS.length) {
    const finished = await type(PROMPTS[index]!)
    if (!finished) return
    await pause(READING_PAUSE_MS)
  }
}

function stopOnFirstPrompt(): void {
  currentLoop++
  show(PROMPTS[0]!)
}

watch(isLive, (live) => {
  if (live) void typePromptsForever()
  else stopOnFirstPrompt()
}, { immediate: true })

onBeforeUnmount(() => {
  currentLoop++
})
</script>

<template>
  <SitesPrompt class="sites-prompt-loop" :text="shown" :ready="isFullPrompt" />
</template>

<style scoped>
.sites-prompt-loop {
  width: calc(400 * var(--pt));
  margin-top: calc(34 * var(--pt));
  font-size: calc(14 * var(--pt));
  font-weight: 400;
  animation: sites-rise 800ms var(--sites-ease-out) 500ms both;
}
</style>
