<template>
  <div
    class="relative rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white/95 via-white/90 to-emerald-50/80 px-6 py-4 text-slate-900 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.55)] backdrop-blur-xl dark:border-slate-700/60 dark:from-slate-900/80 dark:via-slate-900/70 dark:to-emerald-900/30 dark:text-slate-100"
    :class="containerVariantClass"
  >
    <header
      v-if="hasHeader"
      class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.75rem] font-semibold uppercase tracking-[0.12em]"
      :class="badgeVariantClass"
    >
      <span v-if="icon" class="text-base leading-none">{{ icon }}</span>
      <span v-if="title" class="leading-none">{{ title }}</span>
    </header>
    <div class="text-base leading-relaxed text-slate-700 dark:text-slate-200/90">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'Card' })

const props = defineProps<{
  title?: string
  icon?: string
  variant?: 'default' | 'critical' | 'success' | 'warning'
}>()

const hasHeader = computed(() => Boolean(props.title) || Boolean(props.icon))

const variantStyles = computed(() => {
  const baseBadge = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100'

  if (!props.variant) {
    return {
      container: '',
      badge: baseBadge,
    }
  }

  switch (props.variant) {
    case 'critical':
      return {
        container: 'border-l-[6px] border-l-rose-500 dark:border-l-rose-400/70',
        badge: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200',
      }
    case 'success':
      return {
        container: 'border-l-[6px] border-l-emerald-500 dark:border-l-emerald-400/80',
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-100',
      }
    case 'warning':
      return {
        container: 'border-l-[6px] border-l-amber-400 dark:border-l-amber-300/90',
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/25 dark:text-amber-100',
      }
    default:
      return {
        container: 'border-l-[6px] border-l-emerald-400 dark:border-l-emerald-300/80',
        badge: baseBadge,
      }
  }
})

const containerVariantClass = computed(() => variantStyles.value.container)
const badgeVariantClass = computed(() => variantStyles.value.badge)
</script>
