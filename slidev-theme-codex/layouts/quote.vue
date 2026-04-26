<script setup lang="ts">
defineProps<{ author?: string }>()
</script>

<template>
  <div class="slidev-layout quote">
    <blockquote>
      <slot></slot>
    </blockquote>
    <div v-if="author" class="quote-attrib">— {{ author }}</div>
  </div>
</template>
