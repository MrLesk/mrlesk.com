<script setup lang="ts">
defineProps<{ eyebrow?: string }>()
</script>

<template>
  <div class="slidev-layout section-divider">
    <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
    <slot></slot>
  </div>
</template>
