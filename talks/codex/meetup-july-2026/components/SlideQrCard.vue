<script setup lang="ts">
import SlideQrCode from './SlideQrCode.vue'

withDefaults(defineProps<{
  url: string
  title: string
  subtitle: string
  ariaLabel?: string
  monoSubtitle?: boolean
  size?: number
}>(), {
  ariaLabel: undefined,
  monoSubtitle: false,
  size: 190,
})
</script>

<template>
  <div class="slide-qr-card">
    <span class="slide-qr-code">
      <SlideQrCode :url="url" :size="size" :aria-label="ariaLabel ?? title" />
    </span>
    <span class="slide-qr-divider" aria-hidden="true"></span>
    <a
      class="slide-qr-caption"
      :href="url"
      target="_blank"
      rel="noreferrer"
      :aria-label="ariaLabel ?? title"
    >
      <strong>{{ title }}</strong>
      <span :class="{ 'is-mono': monoSubtitle }">{{ subtitle }}</span>
    </a>
  </div>
</template>

<style scoped>
.slide-qr-card {
  box-sizing: border-box;
  width: calc(238 * var(--pt));
  padding: calc(24 * var(--pt));
  border-radius: calc(16 * var(--pt));
  background: #edeff6;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(14 * var(--pt));
  color: #10162c;
  text-align: center;
  box-shadow: 0 calc(14 * var(--pt)) calc(44 * var(--pt)) rgba(0, 0, 0, 0.55);
}

.slide-qr-code {
  display: block;
  line-height: 0;
}

.slide-qr-code :deep(svg) {
  width: calc(190 * var(--pt));
  height: calc(190 * var(--pt));
  display: block;
  image-rendering: pixelated;
}

.slide-qr-divider {
  width: 100%;
  height: calc(1 * var(--pt));
  background: rgba(78, 99, 164, 0.18);
}

.slide-qr-caption {
  min-height: calc(42 * var(--pt));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(2 * var(--pt));
  color: inherit;
  text-decoration: none;
  border-bottom: none !important;
}

.slide-qr-caption strong {
  font-size: calc(15 * var(--pt));
  font-weight: 650;
  line-height: 1.2;
}

.slide-qr-caption span {
  max-width: 100%;
  color: rgba(16, 22, 44, 0.6);
  font-size: calc(12 * var(--pt));
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.slide-qr-caption span.is-mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: calc(8.5 * var(--pt));
}
</style>
