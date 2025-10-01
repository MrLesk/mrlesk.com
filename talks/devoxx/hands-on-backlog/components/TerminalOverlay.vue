<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watchEffect } from 'vue'

const props = withDefaults(defineProps<{
  src: string
  width?: number
  height?: number
  corner?: 'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  inset?: number
  border?: boolean
  shadow?: boolean
  zIndex?: number
}>(), {
  width: 960,
  height: 540,
  corner: 'center',
  inset: 24,
  border: true,
  shadow: true,
  zIndex: 60, // above most slide content
})

const show = ref(true)

// Ensure cleanup of the teleported element when slide changes
onMounted(() => {
  show.value = true
})
onBeforeUnmount(() => {
  show.value = false
})

const style = ref<Record<string, string>>({})

watchEffect(() => {
  const base: Record<string, string> = {
    position: 'fixed',
    width: props.width + 'px',
    height: props.height + 'px',
    zIndex: String(props.zIndex),
    pointerEvents: 'auto',
  }

  const inset = props.inset + 'px'

  switch (props.corner) {
    case 'bottom-right':
      Object.assign(base, { right: inset, bottom: inset })
      break
    case 'bottom-left':
      Object.assign(base, { left: inset, bottom: inset })
      break
    case 'top-right':
      Object.assign(base, { right: inset, top: inset })
      break
    case 'top-left':
      Object.assign(base, { left: inset, top: inset })
      break
    case 'center':
    default:
      Object.assign(base, {
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      })
  }

  style.value = base
})
</script>

<template>
  <teleport to="body">
    <div v-if="show" :style="style" class="slidev-terminal-overlay">
      <iframe
        :src="src"
        title="Live Terminal"
        style="width: 100%; height: 100%; display: block;"
        :class="[
          shadow ? 'shadow-xl' : '',
          border ? 'border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden' : '',
        ]"
      />
    </div>
  </teleport>
  <!--
    Render a small placeholder so the component can be used inline in slides
    without affecting layout; the actual content is teleported to body.
  -->
  <div style="width:0;height:0;overflow:hidden" aria-hidden="true" />
</template>

<style scoped>
/* Ensure overlay accepts mouse/keyboard events */
.slidev-terminal-overlay { pointer-events: auto; }
</style>
