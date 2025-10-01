<template>
  <SectionIndicator />
  <BacklogScreensaver :idle-delay="10_000" />
</template>

<script setup>
import SectionIndicator from './components/SectionIndicator.vue'
import BacklogScreensaver from './components/BacklogScreensaver.vue'
</script>
