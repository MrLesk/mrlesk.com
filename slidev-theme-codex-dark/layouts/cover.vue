<script setup lang="ts">
const props = defineProps<{
  presenter?: string
  frontmatter?: Record<string, unknown>
}>()

// `presenter` is a Slidev feature flag. Older decks in this repository also
// used it as the display name, so prefer the unambiguous custom field while
// retaining backwards compatibility with those string-valued decks.
const presenterName = (props.frontmatter?.presenterName as string | undefined)
  ?? (typeof props.frontmatter?.presenter === 'string' ? props.frontmatter.presenter : undefined)
  ?? props.presenter

const base = (import.meta as ImportMeta).env?.BASE_URL || '/'
const trimmed = base.endsWith('/') ? base.slice(0, -1) : base
const wordmark = `${trimmed}/openai-wordmark.png`
</script>

<template>
  <div class="slidev-layout cover">
    <img class="cover-wordmark" :src="wordmark" alt="OpenAI" />
    <div class="cover-mark">Codex</div>
    <div class="cover-text">
      <div class="cover-body">
        <slot></slot>
      </div>
    </div>
    <div v-if="presenterName" class="cover-footer">{{ presenterName }}</div>
  </div>
</template>
