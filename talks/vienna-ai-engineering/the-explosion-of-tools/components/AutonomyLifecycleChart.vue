<template>
  <section
    class="autonomy-chart"
    :class="{ 'is-interactive': interactive, 'is-active': isActive }"
    role="group"
    aria-label="AI autonomy across the feature lifecycle"
    @click="activate"
  >
    <header class="chart-header">
      <div>
        <p class="chart-title">{{ title }}</p>
        <p v-if="subtitle" class="chart-subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="interactive" class="chart-hint">
        <span>{{ labels[selectedIndex] }}</span>
        <span class="chart-hint-separator">·</span>
        <span>{{ values[selectedIndex] }}%</span>
      </div>
    </header>

    <div class="chart-body">
      <LineChart :data="chartData" :options="chartOptions" :height="height" />
    </div>

  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    storageKey?: string
    interactive?: boolean
    step?: number
    min?: number
    max?: number
    height?: number | string
    labels?: string[]
    initial?: number[]
    autoFocus?: boolean
    title?: string
    subtitle?: string
  }>(),
  {
    storageKey: 'ai-autonomy-lifecycle',
    interactive: true,
    step: 10,
    min: 0,
    max: 100,
    height: '100%',
    labels: () => ['Idea', 'Planning', 'Implementation', 'Verification', 'Production Troubleshooting'],
    initial: () => [],
    autoFocus: true,
    title: 'AI Autonomy',
    subtitle: 'Feature development lifecycle',
  },
)

const isActive = ref(false)
const selectedIndex = ref(0)
const values = ref<number[]>([])
const accentColor = ref('#34d399')
const primaryColor = ref('#3e5166')

const labels = computed(() => props.labels)

const clamp = (value: number) => Math.min(props.max, Math.max(props.min, value))

const normalizeValues = (incoming: number[]) => {
  const normalized = labels.value.map((_, index) => {
    const next = incoming[index] ?? props.initial[index] ?? 0
    return clamp(Math.round(next))
  })
  return normalized
}

values.value = normalizeValues(props.initial)

const parseRgbString = (color: string) => {
  const match = color.match(/rgba?\\(([^)]+)\\)/i)
  if (!match) return null
  const parts = match[1].split(',').map((part) => Number.parseFloat(part.trim()))
  if (parts.length < 3 || parts.some((value) => Number.isNaN(value))) return null
  return [parts[0], parts[1], parts[2]]
}

const hexToRgb = (color: string) => {
  const normalized = color.replace('#', '').trim()
  if (normalized.length === 3) {
    const r = Number.parseInt(normalized[0] + normalized[0], 16)
    const g = Number.parseInt(normalized[1] + normalized[1], 16)
    const b = Number.parseInt(normalized[2] + normalized[2], 16)
    return [r, g, b]
  }
  if (normalized.length === 6) {
    const r = Number.parseInt(normalized.slice(0, 2), 16)
    const g = Number.parseInt(normalized.slice(2, 4), 16)
    const b = Number.parseInt(normalized.slice(4, 6), 16)
    return [r, g, b]
  }
  return null
}

const withAlpha = (color: string, alpha: number) => {
  const rgb = color.startsWith('rgb') ? parseRgbString(color) : hexToRgb(color)
  if (!rgb) return color
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`
}

const resolveThemeColors = () => {
  if (typeof window === 'undefined') return
  const styles = window.getComputedStyle(document.documentElement)
  const themePrimary = styles.getPropertyValue('--slidev-theme-primary').trim()
  const themeSecondary = styles.getPropertyValue('--slidev-theme-secondary').trim()

  if (themePrimary) {
    primaryColor.value = themePrimary
  }
  if (themeSecondary) {
    accentColor.value = themeSecondary
  }
}

const loadFromStorage = () => {
  if (typeof window === 'undefined') return
  const raw = window.localStorage.getItem(props.storageKey)
  if (!raw) {
    values.value = normalizeValues(props.initial)
    return
  }
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      values.value = normalizeValues(parsed)
      return
    }
  } catch {
    // Ignore malformed storage.
  }
  values.value = normalizeValues(props.initial)
}

const persist = () => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(props.storageKey, JSON.stringify(values.value))
}

const activate = () => {
  if (!props.interactive) return
  isActive.value = true
}

const handleKey = (event: KeyboardEvent) => {
  if (!props.interactive || !isActive.value) return
  const key = event.key.toLowerCase()
  if (!['w', 'a', 's', 'd'].includes(key)) return

  event.preventDefault()

  if (key === 'a') {
    selectedIndex.value = (selectedIndex.value - 1 + labels.value.length) % labels.value.length
    return
  }

  if (key === 'd') {
    selectedIndex.value = (selectedIndex.value + 1) % labels.value.length
    return
  }

  const delta = key === 'w' ? props.step : -props.step
  const current = values.value[selectedIndex.value] ?? 0
  values.value[selectedIndex.value] = clamp(current + delta)
}

const chartData = computed(() => {
  const data = values.value.map((value) => value)
  const activeIndex = props.interactive ? selectedIndex.value : -1
  const accent = accentColor.value
  const accentSoft = withAlpha(accentColor.value, 0.18)
  const muted = withAlpha(primaryColor.value, 0.45)

  return {
    labels: labels.value,
    datasets: [
      {
        label: 'AI Autonomy',
        data,
        borderColor: accent,
        backgroundColor: accentSoft,
        fill: false,
        tension: 0.4,
        cubicInterpolationMode: 'monotone',
        pointRadius: data.map((_, index) => (index === activeIndex ? 7 : 4)),
        pointHoverRadius: 8,
        pointBackgroundColor: data.map((_, index) => (index === activeIndex ? accent : muted)),
        pointBorderColor: 'rgba(255, 255, 255, 0.9)',
        pointBorderWidth: 2,
      },
    ],
  }
})

const chartOptions = computed(() => ({
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: true,
        color: 'rgba(148, 163, 184, 0.25)',
        lineWidth: 1,
        drawTicks: false,
      },
      ticks: {
        color: '#94a3b8',
        font: {
          size: 12,
          weight: '600',
        },
        autoSkip: false,
        maxRotation: 0,
        callback: (value: string | number) => {
          const label = labels.value[Number(value)] ?? value
          return String(label).split(' ')
        },
      },
      title: {
        display: true,
        text: 'Feature development lifecycle',
        color: '#94a3b8',
        font: {
          size: 12,
          weight: '600',
        },
      },
    },
    y: {
      min: props.min,
      max: props.max,
      ticks: {
        color: '#94a3b8',
        stepSize: props.step,
        callback: (value: number | string) => `${value}%`,
      },
      grid: {
        color: 'rgba(148, 163, 184, 0.2)',
      },
      title: {
        display: true,
        text: 'AI autonomy',
        color: '#94a3b8',
        font: {
          size: 12,
          weight: '600',
        },
      },
    },
  },
}))

onMounted(() => {
  resolveThemeColors()
  loadFromStorage()
  if (props.interactive && props.autoFocus) {
    isActive.value = true
  }
  if (props.interactive) {
    window.addEventListener('keydown', handleKey)
  }
})

onBeforeUnmount(() => {
  if (props.interactive) {
    window.removeEventListener('keydown', handleKey)
  }
})

watch(
  () => values.value,
  () => {
    if (props.interactive) {
      persist()
    }
  },
  { deep: true },
)
</script>

<style scoped>
.autonomy-chart {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.02), rgba(15, 23, 42, 0.06));
  border: none;
}

html.dark .autonomy-chart {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.7), rgba(2, 6, 23, 0.9));
}

.autonomy-chart.is-interactive {
  cursor: pointer;
}

.autonomy-chart.is-active {
  box-shadow: none;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.chart-body {
  flex: 1;
  min-height: 260px;
}

.chart-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--slidev-theme-foreground, #0f172a);
  margin: 0;
}

.chart-subtitle {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
}

.chart-hint {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--slidev-theme-secondary, #34d399);
}

.chart-hint-separator {
  color: #94a3b8;
}

</style>
