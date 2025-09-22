<template>
  <div class="action-prompt" :class="variantClass">
    <header v-if="hasHeader" class="action-prompt__badge">
      <span v-if="icon" class="action-prompt__icon">{{ icon }}</span>
      <span v-if="title" class="action-prompt__title">{{ title }}</span>
    </header>
    <div class="action-prompt__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'ActionPrompt' })

const props = withDefaults(defineProps<{
  title?: string
  icon?: string
  variant?: 'default' | 'critical' | 'success'
}>(), {
  title: 'Action',
  icon: '🚀',
  variant: 'default',
})

const hasHeader = computed(() => Boolean(props.title) || Boolean(props.icon))

const variantClass = computed(() => `action-prompt--${props.variant}`)
</script>
