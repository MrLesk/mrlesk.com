<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { COST_PATH, type CostSummary } from 'slidev-addon-speech-navigation/src/shared/contracts'
import { formatCostUsd } from 'slidev-addon-speech-navigation/src/core/cost'

const cost = ref<CostSummary | null>(null)
const displayed = ref(0)
const unavailable = ref(false)
const label = computed(() => unavailable.value ? 'unavailable' : cost.value?.partial ? 'partial est. USD' : 'est. USD')
const controller = new AbortController()
let timer: ReturnType<typeof setTimeout> | undefined
let frame = 0
let reducedMotion = false

function countUp(target: number) {
  cancelAnimationFrame(frame)
  if (reducedMotion) { displayed.value = target; return }
  const start = displayed.value
  const startedAt = performance.now()
  const update = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / 800)
    displayed.value = start + (target - start) * (1 - (1 - progress) ** 3)
    if (progress < 1) frame = requestAnimationFrame(update)
  }
  frame = requestAnimationFrame(update)
}

async function refresh() {
  try {
    const response = await fetch(COST_PATH, { cache: 'no-store', signal: controller.signal })
    if (!response.ok) throw new Error('Cost unavailable')
    const next = await response.json() as CostSummary
    if (controller.signal.aborted) return
    if (cost.value && cost.value.runId !== next.runId) displayed.value = 0
    cost.value = next
    unavailable.value = false
    countUp(next.totalUsd)
  }
  catch {
    if (!controller.signal.aborted) unavailable.value = true
  }
  finally {
    if (!controller.signal.aborted) timer = setTimeout(refresh, 1_000)
  }
}

onMounted(() => {
  reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  void refresh()
})
onBeforeUnmount(() => {
  controller.abort()
  clearTimeout(timer)
  cancelAnimationFrame(frame)
})
</script>

<template>
  <div v-if="cost" class="live-cost-counter" :data-active="cost.activeLiveSessions > 0 && !unavailable" :data-total="cost.totalUsd" :title="`Estimated cost for this Slidev run. Standard list prices, checked ${cost.pricingDate}. Not an invoice.`">
    <span class="live-cost-label"><i aria-hidden="true" />Live cost<small>{{ label }}</small></span>
    <output aria-label="Estimated API cost in US dollars" aria-live="off">{{ unavailable ? '—' : formatCostUsd(displayed) }}</output>
  </div>
</template>

<style scoped>
.live-cost-counter { position: absolute; z-index: 6; right: 144px; bottom: 12px; display: flex; align-items: center; gap: 13px; padding-left: 17px; border-left: 1px solid #dce1ee; color: #3442e0; pointer-events: none; }
.live-cost-label { position: relative; padding-left: 10px; color: #626d84; font-size: 9px; font-weight: 600; line-height: 1.15; letter-spacing: .07em; text-transform: uppercase; }
.live-cost-label i { position: absolute; left: 0; top: 2px; width: 4px; height: 4px; border-radius: 50%; background: #9ca6be; }
[data-active="true"] .live-cost-label i { background: #16876a; box-shadow: 0 0 0 2px #16876a12; }
.live-cost-label small { display: block; margin-top: 4px; color: #8a94ad; font-size: 7px; font-weight: 400; letter-spacing: .04em; }
.live-cost-counter output { min-width: 101px; font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 20px; font-weight: 500; font-variant-numeric: tabular-nums; line-height: 1; letter-spacing: -.9px; text-align: right; }
</style>
