<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useNav } from '@slidev/client'

// An 80 second flash talk needs a clock the speaker can read without looking away.
// The line along the bottom starts on the first advance and assumes the opening words
// over the cover already took `headStart` seconds. Going back to the cover resets it.
const LIMIT = 80
const headStart = 10

const { currentPage } = useNav()
const startedAt = ref<number>()
const now = ref(Date.now())
let ticker: ReturnType<typeof setInterval> | undefined

watch(currentPage, page => {
  if (page <= 1) startedAt.value = undefined
  else if (startedAt.value === undefined) startedAt.value = Date.now() - headStart * 1000
}, { immediate: true })

const elapsed = computed(() => startedAt.value === undefined ? 0 : (now.value - startedAt.value) / 1000)
const amount = computed(() => Math.min(1, elapsed.value / LIMIT))
const state = computed(() => elapsed.value >= LIMIT ? 'over' : elapsed.value >= LIMIT - 15 ? 'late' : 'fine')

onMounted(() => { ticker = setInterval(() => { now.value = Date.now() }, 250) })
onBeforeUnmount(() => clearInterval(ticker))
</script>

<template>
  <div v-if="startedAt !== undefined" class="talk-clock" :class="state" aria-hidden="true">
    <i :style="{ transform: `scaleX(${amount})` }" />
    <span>{{ Math.max(0, Math.ceil(LIMIT - elapsed)) }}</span>
  </div>
</template>
