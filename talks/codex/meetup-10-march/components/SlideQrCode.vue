<script setup lang="ts">
import QRCode from 'qrcode'
import { computed, ref, watch } from 'vue'

defineOptions({ name: 'SlideQrCode' })

const props = defineProps<{
  url?: string
  baseUrl?: string
}>()

const qrCodeUrl = computed(() => props.url ?? props.baseUrl ?? '')
const svgMarkup = ref('')

watch(
  qrCodeUrl,
  async (url) => {
    if (!url) {
      svgMarkup.value = ''
      return
    }

    svgMarkup.value = await QRCode.toString(url, {
      type: 'svg',
      margin: 1,
      width: 144,
      color: {
        dark: '#080808',
        light: '#ffffff',
      },
    })
  },
  { immediate: true },
)
</script>

<template>
  <div class="rounded-xl bg-white p-2">
    <div v-html="svgMarkup" />
  </div>
</template>
