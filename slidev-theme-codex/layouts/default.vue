<script setup lang="ts">
import CodexFooter from '../components/CodexFooter.vue'
</script>

<template>
  <div class="slidev-layout default">
    <div class="my-auto">
      <slot></slot>
    </div>
    <CodexFooter />
  </div>
</template>
