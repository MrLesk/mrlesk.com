<template>
  <div class="callout-card" :class="variantClass">
    <header v-if="hasHeader" class="callout-card__header">
      <span v-if="icon" class="callout-card__icon">{{ icon }}</span>
      <span v-if="title" class="callout-card__title">{{ title }}</span>
    </header>
    <div class="callout-card__body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
defineOptions({ name: 'CalloutCard' })

const props = withDefaults(defineProps<{
  title?: string
  icon?: string
  variant?: 'default' | 'success' | 'warning'
}>(), {
  title: 'Hint',
  icon: '💡',
  variant: 'default',
})

const hasHeader = computed(() => Boolean(props.title) || Boolean(props.icon))

const variantClass = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'callout-card--success'
    case 'warning':
      return 'callout-card--warning'
    default:
      return 'callout-card--default'
  }
})
</script>
