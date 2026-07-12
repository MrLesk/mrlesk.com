<script setup lang="ts">
const props = defineProps<{
  contact?: string
  frontmatter?: Record<string, unknown>
}>()

const contact = (props.frontmatter?.contact as string | undefined) ?? props.contact

const base = (import.meta as ImportMeta).env?.BASE_URL || '/'
const trimmed = base.endsWith('/') ? base.slice(0, -1) : base
const logo = `${trimmed}/codex-logo.gif`
</script>

<template>
  <div class="slidev-layout thanks">
    <img class="thanks-mark" :src="logo" alt="Codex" />
    <div class="thanks-body">
      <slot></slot>
    </div>
    <div v-if="contact" class="thanks-contact">{{ contact }}</div>
  </div>
</template>
