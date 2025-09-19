<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useNav } from '@slidev/client'

const { currentSlideNo, total, slides } = useNav()

// Build maps for sections and their boundaries
const sectionMap = ref<Map<number, string>>(new Map())
const sectionBoundaries = ref<Map<string, { start: number, end: number }>>(new Map())

watchEffect(() => {
  const map = new Map<number, string>()
  const boundaries = new Map<string, { start: number, end: number }>()
  let currentSectionName = ''
  let sectionStart = 1

  // slides is an array of all slide metadata
  if (slides.value) {
    slides.value.forEach((slide: any, index: number) => {
      const slideNo = index + 1
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

const sectionProgress = computed(() => {
  const section = currentSection.value
  if (!section) return 0

  const bounds = sectionBoundaries.value.get(section)
  if (!bounds) return 0

  const sectionLength = bounds.end - bounds.start + 1
  const positionInSection = currentSlideNo.value - bounds.start + 1
  return (positionInSection / sectionLength) * 100
})

const sectionSlideNumbers = computed(() => {
  const section = currentSection.value
  if (!section) return ''

  const bounds = sectionBoundaries.value.get(section)
  if (!bounds) return ''

  const positionInSection = currentSlideNo.value - bounds.start + 1
  const sectionLength = bounds.end - bounds.start + 1
  return `${positionInSection} / ${sectionLength}`
})
</script>

<template>
  <div class="section-indicator">
    <div class="section-name">{{ currentSection }}</div>
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: sectionProgress + '%' }"></div>
    </div>
    <div class="slide-number">{{ currentSlideNo }} / {{ total }}</div>
  </div>
</template>

<style scoped>
.section-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 10px 16px;
  z-index: 50;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.4;
  min-width: 140px;
  text-align: center;
}

.section-name {
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 6px;
  letter-spacing: 0.02em;
}

.progress-bar {
  width: 100%;
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.slide-number {
  font-size: 11px;
  color: #6b7280;
  font-variant-numeric: tabular-nums;
}

/* Dark mode support */
html.dark .section-indicator {
  background: rgba(30, 30, 30, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
}

html.dark .section-name {
  color: #e5e7eb;
}

html.dark .progress-bar {
  background: rgba(255, 255, 255, 0.1);
}

html.dark .progress-fill {
  background: linear-gradient(90deg, #34d399, #10b981);
}

html.dark .slide-number {
  color: #9ca3af;
}

/* Hide on intro/cover slides if needed */
.slidev-layout.intro .section-indicator,
.slidev-layout.cover .section-indicator {
  /* Uncomment to hide on intro slides */
  /* display: none; */
}

/* Ensure it doesn't interfere with navigation controls */
@media print {
  .section-indicator {
    display: none;
  }
}
</style>