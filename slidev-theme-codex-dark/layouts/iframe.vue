<script setup lang="ts">
const props = defineProps<{
  url?: string
  frontmatter?: Record<string, unknown>
}>()

const target = (props.frontmatter?.url as string | undefined) ?? props.url ?? 'about:blank'
</script>

<template>
  <div class="slidev-layout iframe-full">
    <iframe
      :src="target"
      frameborder="0"
      allow="clipboard-read; clipboard-write; camera; microphone; fullscreen"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals"
      referrerpolicy="no-referrer-when-downgrade"
    />
  </div>
</template>

<style>
.slidev-layout.iframe-full {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #ffffff;
}

.slidev-layout.iframe-full iframe {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}
</style>
