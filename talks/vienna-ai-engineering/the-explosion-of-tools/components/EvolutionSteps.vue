<template>
  <div class="evolution-steps">
    <div class="steps-row">
      <template v-for="(step, index) in steps" :key="step.title">
        <div
          class="step-card"
          :class="{ 'is-visible': clicks >= index }"
          :style="{ '--card-color': cardColors[index] }"
        >
          <div class="step-title">{{ step.title }}</div>
          <div class="step-subtitle">{{ step.subtitle }}</div>
        </div>
        <div
          v-if="index < steps.length - 1"
          class="step-arrow"
          :class="{ 'is-visible': clicks >= index + 1 }"
          aria-hidden="true"
        ></div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $clicks } = useSlideContext()

const clicks = computed(() => $clicks.value)

const steps = [
  { title: 'Code completion', subtitle: '(no AI)' },
  { title: 'Copy-paste AI Chat', subtitle: '(ChatGPT)' },
  { title: 'IDE Extensions', subtitle: '(GitHub Copilot)' },
  { title: 'IDE/CLI Agents', subtitle: '(Cursor, Claude Code)' },
]

const cardColors = ['#15cd89', '#30dc9d', '#4cebb0', '#67fac4']
</script>

<style scoped>
.evolution-steps {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.steps-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.step-card {
  min-width: 160px;
  padding: 12px 18px;
  border-radius: 14px;
  border: none;
  background: var(--card-color);
  color: var(--slidev-theme-primary, #3e5166);
  font-weight: 600;
  text-align: center;
  box-shadow: 0 8px 18px rgba(21, 205, 137, 0.15);
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.step-card.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.step-title {
  font-size: 16px;
  line-height: 1.2;
}

.step-subtitle {
  margin-top: 4px;
  font-size: 14px;
  line-height: 1.2;
  font-weight: 500;
}

.step-arrow {
  position: relative;
  width: 52px;
  height: 2px;
  background: var(--slidev-theme-primary, #3e5166);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.step-arrow::after {
  content: '';
  position: absolute;
  right: -2px;
  top: -5px;
  width: 0;
  height: 0;
  border-left: 10px solid var(--slidev-theme-primary, #3e5166);
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}

.step-arrow.is-visible {
  opacity: 1;
}
</style>
