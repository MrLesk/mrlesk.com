<template>
  <span class="prompt-chip">
    <slot />
  </span>
</template>

<style scoped>
.prompt-chip {
  @apply inline-flex items-center gap-1 font-medium tracking-tight;
  @apply rounded-lg border px-3 py-1 text-sm;
  background-color: #d1fae5;
  color: #0b3a2c;
  border-color: rgba(13, 148, 136, 0.55);
  box-shadow: 0 12px 24px -18px rgba(13, 148, 136, 0.65);
  letter-spacing: 0.01em;
}

html.dark .prompt-chip {
  background-color: rgba(45, 212, 191, 0.22);
  color: #ecfdf5;
  border-color: rgba(45, 212, 191, 0.6);
  box-shadow: 0 12px 24px -20px rgba(45, 212, 191, 0.6);
}
</style>
