<script setup lang="ts">
import QRCode from 'qrcode'
import { ref, watch } from 'vue'

// A QR code for `url`, drawn as an SVG that fills the width of its parent.
const props = defineProps<{
  /** Where the QR code leads. */
  url: string
}>()

const qrCodeSvg = ref('')

watch(() => props.url, async (url) => {
  qrCodeSvg.value = await QRCode.toString(url, {
    type: 'svg',
    margin: 0,
    color: { dark: '#030a18', light: '#ffffff' },
  })
}, { immediate: true })
</script>

<template>
  <!-- The SVG is made here from our own address, so it is safe to insert as HTML. -->
  <span class="qr-code" v-html="qrCodeSvg" />
</template>

<style scoped>
.qr-code {
  display: block;
  width: 100%;
  line-height: 0;
}

.qr-code :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
}
</style>
