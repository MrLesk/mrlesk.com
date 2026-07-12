<script setup lang="ts">
import { computed } from 'vue'
import { useNav } from '@slidev/client'

// Full-bleed night layouts show the sharp render and full-strength stars.
// Everything else keeps the ambient blur from #slide-content and dims the
// stars to a glimmer, as if behind the overlay.
const { currentLayout } = useNav()
const fullBleed = computed(() => ['cover', 'thanks', 'panel'].includes(currentLayout.value ?? ''))
</script>

<template>
  <!-- Painted under every slide: optional sharp background, then the
       shooting-star layer. Layout scrims and content render on top. -->
  <div v-if="fullBleed" class="night-bg-sharp" aria-hidden="true"></div>
  <div class="night-sky" :class="{ dim: !fullBleed }" aria-hidden="true">
    <i v-for="n in 7" :key="n" :class="`star star-${n}`"></i>
  </div>
</template>
