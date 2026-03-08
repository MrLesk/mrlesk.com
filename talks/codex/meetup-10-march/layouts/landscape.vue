<template>
  <div class="slidev-layout codex-landscape">
    <slot />
  </div>
</template>

<style scoped>
.codex-landscape {
  background:
    radial-gradient(circle at 88% 20%, rgba(118, 132, 255, 0.12), transparent 20%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0)),
    var(--codex-bg);
  height: 100%;
  padding: 1.8rem 1.8rem 2rem;
  position: relative;
}
</style>
