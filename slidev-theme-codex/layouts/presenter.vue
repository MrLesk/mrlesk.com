<script setup lang="ts">
import { computed, useAttrs } from 'vue'

const attrs = useAttrs()

const presenterImage = computed(() => {
  const image = (attrs.presenterImage as string) || '/codex-logo.gif'
  if (/^https?:\/\//i.test(image)) return image
  const base = (import.meta as ImportMeta).env?.BASE_URL || '/'
  const baseTrimmed = base.endsWith('/') ? base.slice(0, -1) : base
  return image.startsWith('/') ? `${baseTrimmed}${image}` : `${base}${image}`
})

const role = computed(() => (attrs.role as string) || '')
</script>

<template>
  <div class="slidev-layout presenter">
    <div>
      <slot></slot>
    </div>
    <div class="presenter-photo-wrap">
      <img :src="presenterImage" class="presenter-photo" alt="Presenter" />
    </div>
  </div>
</template>
