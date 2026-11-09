<script setup lang="ts">
// The look of Alex's Codex meetup decks, for the one slide after the thank-you (pages/32-save-the-dates.md).
// That slide is not part of this talk's story, so it does not use the lit room of layouts/default.vue: it shows
// the Prater at night with shooting stars, the Codex mark top right, and whatever the slide puts on it.
// The look comes from slidev-theme-codex-dark at the repository root; its colours and the stars are in style.css
// under "Save the dates", and the two pictures are copies in public/codex/.
const base = import.meta.env.BASE_URL
</script>

<template>
  <div class="slidev-layout codex-night" :style="{ '--codex-night': `url(${base}codex/prater-night.jpg)` }">
    <!-- Seven shooting stars cross the sky, one every few seconds (style.css sets each one's track). -->
    <div class="codex-stars" aria-hidden="true">
      <i v-for="n in 7" :key="n" :class="`star star-${n}`" />
    </div>
    <img class="codex-mark" :src="`${base}codex/codex-logo.png`" alt="Codex" />
    <slot />
  </div>
</template>
