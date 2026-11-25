<script setup lang="ts">
// The look of Alex's Codex meetup decks, for the one slide after the thank-you (pages/32-save-the-dates.md).
// That slide is not part of this talk's story, so it does not use the lit room of layouts/default.vue: it shows a
// picture of TU Wien by day, where the first event is, with the Codex mark top right and whatever the slide puts
// on it. The look comes from slidev-theme-codex-dark at the repository root; its colours are in style.css under
// "Save the dates", and the picture and the mark are in public/codex/.
const base = import.meta.env.BASE_URL
</script>

<template>
  <div class="slidev-layout codex-look" :style="{ '--codex-picture': `url(${base}codex/tu-wien-day.jpg)` }">
    <img class="codex-mark" :src="`${base}codex/codex-logo.png`" alt="Codex" />
    <slot />
  </div>
</template>
