<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useNav } from '@slidev/client'

const { currentSlideRoute, clicks } = useNav()

// Mirrors layouts/default.vue so the area around the slide gets the same light.
const frontmatter = computed(() => (currentSlideRoute.value?.meta?.slide as any)?.frontmatter ?? {})

const mood = computed(() => {
  const fm = frontmatter.value
  const steps = fm.moodSteps
  if (Array.isArray(steps) && steps.length)
    return steps[Math.min(clicks.value, steps.length - 1)]
  return fm.mood ?? 4
})

watchEffect(() => {
  if (typeof document !== 'undefined')
    document.documentElement.dataset.mood = String(mood.value)
})
</script>

<template>
  <div v-if="frontmatter.meter !== false" class="light-meter" :data-mood="mood" aria-hidden="true">
    <span>LIGHT</span>
    <i v-for="n in 4" :key="n" :class="{ on: n <= mood }" />
  </div>
</template>
