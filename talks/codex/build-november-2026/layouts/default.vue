<script setup lang="ts">
import DeckFooter from '../components/DeckFooter.vue'
</script>

<!-- A slide with a title at the top, its content below and the deck's footer.
     It takes the place of the theme's layout of the same name, whose footer names the meetup. -->
<template>
  <div class="slidev-layout default">
    <slot />
    <DeckFooter />
  </div>
</template>
