<script setup lang="ts">
// A slide on the blue Codex gradient with one big message in the middle.
// The `behind` slot holds things that move behind the message, for example <FloatingBits>.
defineProps<{
  /** A small line above the message. */
  eyebrow?: string
}>()
</script>

<template>
  <div class="gradient-stage">
    <AuroraBackdrop />
    <slot name="behind" />
    <div class="gradient-stage-body">
      <p v-if="eyebrow" class="gradient-stage-eyebrow">{{ eyebrow }}</p>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.gradient-stage {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #ffffff;
}

.gradient-stage-body {
  position: relative;
  max-width: calc(800 * var(--pt));
  padding: 0 calc(40 * var(--pt));
  text-align: center;
}

.gradient-stage-eyebrow {
  margin: 0 0 calc(18 * var(--pt)) 0;
  font-size: calc(17 * var(--pt));
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  animation: deck-rise 800ms var(--deck-ease-out) both;
}
</style>
