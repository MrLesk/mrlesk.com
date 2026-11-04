<script setup lang="ts">
import { useIsSlideActive } from '@slidev/client'

// Slidev mounts slides ahead of time. Entrance animations hang off `.is-active`
// so they start when the slide is shown, not when it is preloaded.
const active = useIsSlideActive()
</script>

<template>
  <div class="when-active" :class="{ 'is-active': active }">
    <slot />
  </div>
</template>
