<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useSlideContext } from '@slidev/client'

// Backup for a live demo beat: steps through stills (one per click) or plays a video.
// Files live in public/demo. A missing file shows a neutral note instead of a broken image.
const props = defineProps<{ files: string[], labels?: string[] }>()

const { $clicks } = useSlideContext()
const base = import.meta.env.BASE_URL
const missing = reactive(new Set<string>())

const index = computed(() => Math.min($clicks.value, props.files.length - 1))
const file = computed(() => props.files[index.value])
const isVideo = computed(() => /\.(mp4|webm|mov)$/i.test(file.value))
</script>

<template>
  <div class="backup-stack">
    <div v-if="missing.has(file)" class="backup-empty">
      <span>NOT RECORDED YET</span>
      <span>public/demo/{{ file }}</span>
    </div>
    <video v-else-if="isVideo" :key="file" :src="`${base}demo/${file}`" controls muted playsinline @error="missing.add(file)" />
    <img v-else :key="file" :src="`${base}demo/${file}`" :alt="labels?.[index] ?? ''" @error="missing.add(file)" />
  </div>
  <p v-if="labels?.length" class="backup-caption">{{ index + 1 }} / {{ files.length }} · {{ labels[index] }}</p>
</template>
