<script setup lang="ts">
// A drawn browser window: three dots, an address bar and a page.
// Sizes are in em, so a parent sets the size of the whole window with one font-size.
//
// Slots:
//   default  the page
//   address  the address bar's content, when plain text is not enough
//   actions  small controls at the right end of the bar
defineProps<{
  /** Plain text for the address bar. */
  address?: string
}>()
</script>

<template>
  <div class="browser-window">
    <div class="browser-bar">
      <span class="browser-dots" aria-hidden="true"><i /><i /><i /></span>
      <span class="browser-address"><slot name="address">{{ address }}</slot></span>
      <span class="browser-actions"><slot name="actions" /></span>
    </div>
    <div class="browser-page"><slot /></div>
  </div>
</template>

<style scoped>
.browser-window {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--sites-line);
  border-radius: 0.9em;
  background: #ffffff;
  box-shadow: var(--sites-shadow);
  color: var(--codex-fg);
}

.browser-bar {
  flex: none;
  display: flex;
  align-items: center;
  gap: 0.8em;
  padding: 0.6em 0.8em;
  border-bottom: 1px solid var(--sites-line);
  background: #fafbfe;
}

.browser-dots {
  flex: none;
  display: flex;
  gap: 0.35em;
}

.browser-dots i {
  width: 0.6em;
  height: 0.6em;
  border-radius: 50%;
  background: #d7dae6;
}

.browser-address {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.5em;
  height: 2em;
  padding: 0 0.9em;
  overflow: hidden;
  border: 1px solid var(--sites-line);
  border-radius: 1em;
  background: #ffffff;
  color: var(--codex-fg-muted);
  font-size: 0.9em;
  white-space: nowrap;
}

.browser-actions {
  flex: none;
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.browser-actions:empty {
  display: none;
}

.browser-page {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
