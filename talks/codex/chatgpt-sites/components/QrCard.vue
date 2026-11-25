<script setup lang="ts">
// A white card with a QR code and two lines of text. The whole card is a link to `url`.
defineProps<{
  /** Where the QR code leads. */
  url: string
  /** The line in bold under the code. */
  title: string
  /** The small line under the title, usually the address in a short form. */
  caption: string
}>()
</script>

<template>
  <a class="qr-card" :href="url" target="_blank" rel="noreferrer" :aria-label="`${title}: ${url}`">
    <QrCode :url="url" />
    <strong class="qr-card-title">{{ title }}</strong>
    <span class="qr-card-caption">{{ caption }}</span>
  </a>
</template>

<style scoped>
.qr-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  width: calc(256 * var(--pt));
  padding: calc(22 * var(--pt)) calc(22 * var(--pt)) calc(18 * var(--pt));
  /* The theme underlines every link. This card is one big link, so it drops the line. */
  border: 0 !important;
  border-radius: calc(18 * var(--pt));
  background: #ffffff;
  box-shadow: 0 calc(18 * var(--pt)) calc(50 * var(--pt)) rgba(10, 8, 60, 0.4);
  color: var(--codex-fg) !important;
  text-align: center;
}

.qr-card-title {
  margin-top: calc(16 * var(--pt));
  font-size: calc(15 * var(--pt));
  font-weight: 600;
  line-height: 1.25;
}

.qr-card-caption {
  margin-top: calc(4 * var(--pt));
  color: var(--codex-fg-muted);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: calc(9 * var(--pt));
  line-height: 1.4;
  white-space: nowrap;
}
</style>
