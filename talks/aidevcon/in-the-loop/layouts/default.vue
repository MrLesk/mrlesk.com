<script setup lang="ts">
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $frontmatter, $clicks } = useSlideContext()

// `mood` is the light in the room: 0 black, 1 dark grey, 2 grey, 3 light grey, 4 paper.
// `moodSteps` sets it per click, so the light can change inside one slide.
const mood = computed(() => {
  const steps = $frontmatter.moodSteps
  if (Array.isArray(steps) && steps.length)
    return steps[Math.min($clicks.value, steps.length - 1)]
  return $frontmatter.mood ?? 4
})
</script>

<template>
  <div class="slidev-layout sheet" :class="`mood-${mood}`">
    <div class="sheet-body">
      <slot />
    </div>
  </div>
</template>
