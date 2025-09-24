<template>
  <div class="slidev-layout intro-terminal grid">
    <LayoutHeader />
    <CornerCurves class="intro-terminal__curve" />
    <div class="intro-terminal__content">
      <slot />
    </div>
    <div v-if="showTerminal" class="intro-terminal__terminal">
      <slot name="terminal">
        <TtydFrame
          :src="terminalSrc"
          :title="terminalTitle"
          :height="terminalHeight"
        />
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'
import LayoutHeader from 'slidev-theme-penguin/components/LayoutHeader.vue'
import CornerCurves from 'slidev-theme-penguin/components/corner-curves/CornerCurves.vue'
import TtydFrame from '../components/TtydFrame.vue'

const { $frontmatter } = useSlideContext()

const showTerminal = computed(() => $frontmatter.showTerminal !== false)
const terminalSrc = computed(() => $frontmatter.terminalSrc || 'http://localhost:7681/')
const terminalTitle = computed(() => $frontmatter.terminalTitle || 'Live CLI')
const terminalHeight = computed(() => $frontmatter.terminalHeight ?? 420)
</script>

<style scoped>
.slidev-layout.intro-terminal {
  @apply h-full relative;
  grid-template-rows: minmax(0, 1fr) auto;
  row-gap: 2.5rem;
  padding: 3rem clamp(1rem, 4vw, 4rem);
}

.intro-terminal__curve {
  @apply absolute left-0 top-0 transform rotate-90;
}

.intro-terminal__content {
  @apply flex flex-col justify-center text-center mx-auto max-w-4xl;
}

.intro-terminal__content :deep(h1) {
  @apply text-6xl leading-[1.15] font-display font-extrabold text-primary;
}

.intro-terminal__content :deep(h1 + p) {
  @apply opacity-60 -mt-4 text-2xl;
}

.intro-terminal__content :deep(a) {
  @apply text-secondary-400 hover:text-secondary-500 dark:(text-white hover:text-gray-200);
}

.intro-terminal__terminal {
  @apply w-full max-w-5xl mx-auto;
}
</style>
