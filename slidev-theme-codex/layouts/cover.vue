<script setup lang="ts">
const props = defineProps<{
  presenter?: string
  frontmatter?: Record<string, unknown>
}>()

const presenterName = (props.frontmatter?.presenter as string | undefined) ?? props.presenter

const base = (import.meta as ImportMeta).env?.BASE_URL || '/'
const trimmed = base.endsWith('/') ? base.slice(0, -1) : base
const logo = `${trimmed}/codex-logo.gif`
const wordmark = `${trimmed}/openai-wordmark.png`
</script>

<template>
  <div class="slidev-layout cover">
    <img class="cover-wordmark" :src="wordmark" alt="OpenAI" />
    <div class="cover-text">
      <div class="cover-body">
        <slot></slot>
      </div>
    </div>
    <div v-if="presenterName" class="cover-footer">{{ presenterName }}</div>
    <div class="cover-hero">
      <img :src="logo" alt="Codex" />
    </div>
  </div>
</template>
