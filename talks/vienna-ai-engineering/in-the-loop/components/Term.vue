<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <div class="term">
    <div class="term-bar">
      <i /><i /><i />
      <span>{{ title ?? 'production' }}</span>
    </div>
    <div class="term-body">
      <slot />
    </div>
  </div>
</template>
