<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  frontmatter?: Record<string, unknown>
}>()

const base = (import.meta as ImportMeta).env?.BASE_URL || '/'
const trimmed = base.endsWith('/') ? base.slice(0, -1) : base

const resolveImage = (image?: string) => {
  if (!image) return ''
  if (/^https?:\/\//i.test(image)) return image
  return image.startsWith('/') ? `${trimmed}${image}` : `${base}${image}`
}

const left = computed(() => {
  const fm = props.frontmatter || {}
  return {
    image: resolveImage((fm.leftImage as string) || ''),
    name: (fm.leftName as string) || '',
    role: (fm.leftRole as string) || '',
  }
})

const right = computed(() => {
  const fm = props.frontmatter || {}
  return {
    image: resolveImage((fm.rightImage as string) || ''),
    name: (fm.rightName as string) || '',
    role: (fm.rightRole as string) || '',
  }
})
</script>

<template>
  <div class="slidev-layout presenters">
    <div class="presenters-grid">

      <div class="presenter-col">
        <img v-if="left.image" :src="left.image" class="presenter-photo" :alt="left.name" />
        <h2 v-if="left.name">{{ left.name }}</h2>
        <p v-if="left.role" class="presenter-role" v-html="left.role" />
        <div class="presenter-bio">
          <slot name="left"></slot>
        </div>
      </div>

      <div class="presenter-col">
        <img v-if="right.image" :src="right.image" class="presenter-photo" :alt="right.name" />
        <h2 v-if="right.name">{{ right.name }}</h2>
        <p v-if="right.role" class="presenter-role" v-html="right.role" />
        <div class="presenter-bio">
          <slot name="right"></slot>
        </div>
      </div>

    </div>
  </div>
</template>
