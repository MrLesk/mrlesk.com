<script setup lang="ts">
import CodexFooter from '../components/CodexFooter.vue'
</script>

<template>
  <div class="slidev-layout two-cols">
    <div>
      <slot name="default"></slot>
    </div>
    <div>
      <slot name="right"></slot>
    </div>
    <CodexFooter />
  </div>
</template>
