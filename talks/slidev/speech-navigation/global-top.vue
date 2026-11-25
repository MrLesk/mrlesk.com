<script setup lang="ts">
import { useNav } from '@slidev/client'
import LiveCostCounter from './components/LiveCostCounter.vue'

const { isPresenter, isPrintMode } = useNav()
const isDevelopment = Boolean(import.meta.hot)
</script>

<template>
  <LiveCostCounter v-if="isDevelopment && !isPresenter && !isPrintMode" />
</template>
