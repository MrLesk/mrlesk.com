<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { useIsSlideActive } from '@slidev/client'
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

const isActive = useIsSlideActive()
const { width: winW, height: winH } = useWindowSize()

const surfaceStyle = computed(() => {
  const targetRatio = 9 / 16
  const viewportRatio = winW.value / winH.value
  let w, h

  if (viewportRatio > targetRatio) {
    h = winH.value
    w = h * targetRatio
  } else {
    w = winW.value
    h = w / targetRatio
  }

  return {
    width: `${w}px`,
    height: `${h}px`,
  }
})
</script>

<template>
  <div class="slidev-layout codex-portrait-stage" />
  <Teleport to="body">
    <div v-if="isActive" class="codex-portrait-overlay">
      <div class="codex-portrait-surface" :style="surfaceStyle">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.codex-portrait-stage {
  height: 100%;
  padding: 0;
  position: relative;
}

.codex-portrait-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #111;
}

.codex-portrait-surface {
  background:
    radial-gradient(circle at 72% 18%, rgba(118, 132, 255, 0.14), transparent 18%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.52), rgba(255, 255, 255, 0)),
    var(--codex-bg, #f0f1f5);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 2rem;
  box-shadow: 0 28px 90px rgba(15, 23, 42, 0.14);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 2.4rem;
}

.codex-portrait-surface :deep(h2) {
  font-size: 1.8rem;
  font-weight: 600;
  line-height: 2.2rem;
  margin-top: 0.8rem;
}

.codex-portrait-surface :deep(p) {
  color: rgba(0, 0, 0, 0.65);
  font-size: 0.95rem;
  line-height: 1.6rem;
  margin-top: 0.8rem;
}

.codex-portrait-surface :deep(ul) {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: disc;
  margin-top: 1.2rem;
  padding-left: 1.25rem;
}

.codex-portrait-surface :deep(li) {
  color: rgba(0, 0, 0, 0.72);
  font-size: 0.88rem;
  line-height: 1.45rem;
}

.codex-portrait-surface :deep(li::marker) {
  color: #3442E0;
}

.codex-portrait-surface :deep(code) {
  background: rgba(0, 0, 0, 0.06);
  border-radius: 0.25rem;
  font-size: 0.82rem;
  padding: 0.1rem 0.35rem;
}
</style>
