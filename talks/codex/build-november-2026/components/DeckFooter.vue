<script setup lang="ts">
import { useSlideContext } from '@slidev/client'

// The line at the bottom of the white slides: the event's name and the page number.
const { $slidev } = useSlideContext()

const base = import.meta.env.BASE_URL.replace(/\/$/, '')
</script>

<template>
  <div class="codex-footer">
    <span class="codex-mark">
      <img :src="`${base}/codex-logo-static.png`" alt="">
      Codex Community Build · Vienna
    </span>
    <span class="codex-page">{{ $slidev?.nav?.currentPage }} / {{ $slidev?.nav?.total }}</span>
  </div>
</template>
