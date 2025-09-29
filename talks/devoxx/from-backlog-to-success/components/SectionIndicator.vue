<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useNav } from '@slidev/client'

const { currentSlideNo, total, slides } = useNav()

// Build maps for sections and their boundaries
const sectionMap = ref<Map<number, string>>(new Map())
const sectionBoundaries = ref<Map<string, { start: number, end: number }>>(new Map())
const hiddenSlides = ref<Set<number>>(new Set())

watchEffect(() => {
  const map = new Map<number, string>()
  const boundaries = new Map<string, { start: number, end: number }>()
  const hidden = new Set<number>()
  let currentSectionName = ''
  let sectionStart = 1

  // slides is an array of all slide metadata
  if (slides.value) {
    slides.value.forEach((slide: any, index: number) => {
      const slideNo = index + 1
      // Check if this slide should hide the indicator
      const hideIndicator = slide.meta?.frontmatter?.hideIndicator ||
                           slide.meta?.slide?.frontmatter?.hideIndicator ||
                           slide.frontmatter?.hideIndicator

      if (hideIndicator) {
        hidden.add(slideNo)
      }

      // Check if this slide defines a new section - try different property paths
      const section = slide.meta?.frontmatter?.section ||
                     slide.meta?.slide?.frontmatter?.section ||
                     slide.frontmatter?.section

      if (section && section !== currentSectionName) {
        // Save the end of the previous section
        if (currentSectionName) {
          boundaries.set(currentSectionName, {
            start: sectionStart,
            end: slideNo - 1
          })
        }
        currentSectionName = section
        sectionStart = slideNo
      }

      // Map this slide to its section
      if (currentSectionName) {
        map.set(slideNo, currentSectionName)
      }
    })

    // Save the last section
    if (currentSectionName) {
      boundaries.set(currentSectionName, {
        start: sectionStart,
        end: slides.value.length
      })
    }
  }

  sectionMap.value = map
  sectionBoundaries.value = boundaries
  hiddenSlides.value = hidden
})

const currentSection = computed(() => {
  // Get current slide's metadata
  const currentSlide = slides.value?.[currentSlideNo.value - 1]

  // Try different property paths to find the section
  const section = currentSlide?.meta?.frontmatter?.section ||
                 currentSlide?.meta?.slide?.frontmatter?.section ||
                 currentSlide?.frontmatter?.section ||
                 sectionMap.value.get(currentSlideNo.value) || ''

  return section
})

function getSectionStats(section: string) {
  const entries = Array.from(sectionMap.value.entries())
    .filter(([, name]) => name === section)
    .map(([slideNo]) => slideNo)
    .sort((a, b) => a - b)

  if (!entries.length)
    return { position: 0, total: 0 }

  const position = entries.indexOf(currentSlideNo.value) + 1
  return {
    position: position > 0 ? position : entries.length,
    total: entries.length,
  }
}

const sectionProgress = computed(() => {
  const section = currentSection.value
  if (!section) return 0

  const { position, total } = getSectionStats(section)
  if (!total) return 0

  return (position / total) * 100
})

const sectionSlideNumbers = computed(() => {
  const section = currentSection.value
  if (!section) return ''

  const { position, total } = getSectionStats(section)
  if (!total) return ''

  return `${position} / ${total}`
})

const isVisible = computed(() => {
  return !hiddenSlides.value.has(currentSlideNo.value)
})
</script>

<template>
  <div v-if="isVisible" class="section-indicator">
    <div class="section-name">{{ currentSection }}</div>
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: sectionProgress + '%' }"></div>
    </div>
    <div class="slide-number">{{ currentSlideNo }} / {{ total }}</div>
  </div>
</template>

<style scoped>
.section-indicator {
  @apply fixed bottom-5 right-5 z-50 text-center;
  @apply px-4 py-2.5;
  @apply border rounded-lg shadow-lg;

  min-width: 140px;
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.95);
  border-color: rgba(0, 0, 0, 0.1);
}

html.dark .section-indicator {
  background-color: rgba(30, 30, 30, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
}

.section-name {
  @apply text-sm font-semibold mb-1.5;

  color: var(--slidev-theme-primary);
  letter-spacing: 0.02em;
}

html.dark .section-name {
  color: var(--slidev-theme-secondary);
}

.progress-bar {
  @apply w-full h-1 rounded-sm overflow-hidden mb-1.5;

  background: rgba(0, 0, 0, 0.1);
}

html.dark .progress-bar {
  background: rgba(255, 255, 255, 0.1);
}

.progress-fill {
  @apply h-full rounded-sm;

  height: 3px;
  background: var(--slidev-theme-secondary);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-number {
  @apply text-xs opacity-60;

  font-variant-numeric: tabular-nums;
}

/* Hide on print */
@media print {
  .section-indicator {
    display: none;
  }
}
</style>
