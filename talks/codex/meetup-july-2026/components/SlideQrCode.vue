<script setup lang="ts">
import QRCode from 'qrcode'
import { computed, ref, watch } from 'vue'

defineOptions({ name: 'SlideQrCode' })

const props = defineProps<{
  url?: string
  baseUrl?: string
  size?: number
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
      width: props.size ?? 144,
      color: {
        dark: '#080808',
        // Match the deck's soft paper panels instead of pure white.
        light: '#edeff6',
      },
    })
  },
  { immediate: true },
)
</script>

<template>
  <div class="rounded-xl p-2" style="background: #edeff6">
    <div v-html="svgMarkup" />
  </div>
</template>
