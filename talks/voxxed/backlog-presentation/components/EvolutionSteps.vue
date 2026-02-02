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
      <div
        class="step-arrow"
        :class="{ 'is-visible': clicks >= splitStepClick }"
        aria-hidden="true"
      ></div>
      <div class="split-column">
        <div
          class="step-card split-parent"
          :class="{ 'is-visible': clicks >= splitStepClick }"
          :style="{ '--card-color': splitCardColor }"
        >
          <div class="step-title">{{ splitStep.title }}</div>
          <div class="step-subtitle">{{ splitStep.subtitle }}</div>
        </div>
        <div
          class="split-branch"
          :class="{ 'is-visible': clicks >= splitChildrenClick }"
          aria-hidden="true"
        >
          <div class="split-arrows">
            <div class="split-arrow"></div>
            <div class="split-arrow"></div>
          </div>
          <div class="split-cards">
            <div
              v-for="(child, childIndex) in splitChildren"
              :key="child.title"
              class="step-card split-child"
              :class="{ 'is-visible': clicks >= splitChildrenClick }"
              :style="{ '--card-color': splitChildColors[childIndex] }"
            >
              <div class="step-title">{{ child.title }}</div>
              <div class="step-subtitle" v-if="child.subtitle">{{ child.subtitle }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-for="i in totalClicks"
      :key="`evolution-click-${i}`"
      v-click="i"
      class="evolution-click-marker"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $clicks } = useSlideContext()

const clicks = computed(() => $clicks?.value ?? 0)

const steps = [
  { title: 'Code completion', subtitle: '(no AI)' },
  { title: 'Copy-paste AI Chat', subtitle: '(ChatGPT)' },
  { title: 'IDE Extensions', subtitle: '(GitHub Copilot)' },
]

const splitStep = { title: 'IDE/CLI Agents', subtitle: '(Cursor, Claude Code)' }
const splitChildren = [
  { title: 'STEER Mode', subtitle: '' },
  { title: 'DELEGATE Mode', subtitle: '' },
]

const cardColors = ['#15cd89', '#30dc9d', '#4cebb0']
const splitCardColor = '#67fac4'
const splitChildColors = ['#7efbd0', '#97fde0']

const splitStepClick = steps.length
const splitChildrenClick = splitStepClick + 1
const totalClicks = splitChildrenClick
</script>

<style scoped>
.evolution-steps {
  --card-min-width: 140px;
  --arrow-width: 36px;
  --row-gap: 12px;
  --split-gap: 12px;
  --split-child-width: 130px;
  --split-branch-gap: 10px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.steps-row {
  display: flex;
  align-items: center;
  gap: var(--row-gap);
  overflow: visible;
}

.step-card {
  min-width: var(--card-min-width);
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
  width: var(--arrow-width);
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

.split-column {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: var(--card-min-width);
  overflow: visible;
}

.split-branch {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translate(-50%, 8px);
  width: calc(2 * var(--split-child-width) + var(--split-gap));
  display: grid;
  grid-template-rows: auto auto;
  row-gap: var(--split-branch-gap);
  opacity: 0;
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.split-branch.is-visible {
  opacity: 1;
  transform: translate(-50%, 0);
}

.split-arrows {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: var(--split-gap);
  justify-items: center;
}

.split-arrow {
  position: relative;
  width: 2px;
  height: 26px;
  background: var(--slidev-theme-primary, #3e5166);
}

.split-arrow::after {
  content: '';
  position: absolute;
  left: -4px;
  bottom: -6px;
  width: 0;
  height: 0;
  border-top: 10px solid var(--slidev-theme-primary, #3e5166);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
}

.split-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: var(--split-gap);
  row-gap: var(--split-gap);
}

.split-child {
  min-width: var(--split-child-width);
}

.split-parent {
  max-width: var(--card-min-width);
}

.evolution-click-marker {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
}
</style>
