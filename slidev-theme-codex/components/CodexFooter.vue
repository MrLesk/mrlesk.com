<script setup lang="ts">
import { useSlideContext } from '@slidev/client'

const { $slidev } = useSlideContext()

const base = (import.meta as ImportMeta).env?.BASE_URL || '/'
const logo = `${base.replace(/\/$/, '')}/codex-logo.gif`
</script>

<template>
  <div class="codex-footer">
    <span class="codex-mark">
      <img :src="logo" alt="Codex" />
      Codex Community Meetup
    </span>
    <span class="codex-page">{{ $slidev?.nav?.currentPage }} / {{ $slidev?.nav?.total }}</span>
  </div>
</template>
