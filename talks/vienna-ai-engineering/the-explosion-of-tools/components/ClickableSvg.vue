<template>
  <div class="clickable-svg">
    <!-- Hidden elements to register clicks with Slidev -->
    <span v-for="i in groups.length" :key="i" v-click="i" class="hidden" aria-hidden="true"></span>
    <div v-html="processedSvg"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useSlideContext } from '@slidev/client'

const props = defineProps<{
  src: string
  groups: string[][]  // Array of arrays - each inner array contains IDs to reveal on that click
}>()

const BASE_URL = import.meta.env.BASE_URL || '/'

const { $clicks } = useSlideContext()
const svgContent = ref('')

onMounted(async () => {
  // Handle absolute paths by prepending BASE_URL
  const url = props.src.startsWith('/') ? `${BASE_URL}${props.src.slice(1)}` : props.src
  const response = await fetch(url)
  svgContent.value = await response.text()
})

const clicks = computed(() => $clicks.value)

const processedSvg = computed(() => {
  if (!svgContent.value) return ''

  let svg = svgContent.value

  // For each group, find matching elements and set their opacity based on clicks
  props.groups.forEach((groupIds, clickIndex) => {
    const isVisible = clicks.value >= clickIndex + 1
    const opacity = isVisible ? 1 : 0

    groupIds.forEach(id => {
      const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      // Match the opening <g tag with this id pattern
      const pattern = new RegExp(`(<g[^>]*id="[^"]*${escapedId}[^"]*")`, 'g')
      svg = svg.replace(pattern, `$1 style="opacity: ${opacity}; transition: opacity 0.3s ease;"`)
    })
  })

  return svg
})
</script>

<style scoped>
.clickable-svg :deep(svg) {
  max-width: 100%;
  height: auto;
}

.hidden {
  display: none;
}
</style>
