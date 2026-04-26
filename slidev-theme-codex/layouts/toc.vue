<script setup lang="ts">
import CodexFooter from '../components/CodexFooter.vue'

defineProps<{ eyebrow?: string }>()
</script>

<template>
  <div class="slidev-layout toc">
    <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
    <div class="toc-content">
      <slot></slot>
    </div>
    <CodexFooter />
  </div>
</template>

<style>
.slidev-layout.toc {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.slidev-layout.toc .eyebrow {
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--codex-accent);
  margin: 0 0 1rem 0;
}

.slidev-layout.toc h1,
.slidev-layout.toc h2 {
  margin-bottom: 1.75rem;
}

.slidev-layout.toc .toc-content .slidev-toc {
  font-size: 1.4rem;
  line-height: 1.6;
}

.slidev-layout.toc .slidev-toc-item {
  display: flex;
  align-items: baseline;
  gap: 0.9rem;
  padding: 0.45rem 0;
  border-bottom: 1px solid var(--codex-border);
  color: var(--codex-fg);
  transition: color 0.2s ease;
}

.slidev-layout.toc .slidev-toc-item:last-child {
  border-bottom: none;
}

.slidev-layout.toc .slidev-toc-item::before {
  content: counter(toc-counter, decimal-leading-zero);
  counter-increment: toc-counter;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.85rem;
  color: var(--codex-fg-muted);
  min-width: 2ch;
}

.slidev-layout.toc .slidev-toc {
  counter-reset: toc-counter;
}

.slidev-layout.toc .slidev-toc-item a {
  border-bottom: none;
  color: inherit;
  flex: 1;
}

.slidev-layout.toc .slidev-toc-item a:hover {
  color: var(--codex-accent);
}

.slidev-layout.toc .slidev-toc-item-active,
.slidev-layout.toc .slidev-toc-item.active {
  color: var(--codex-accent);
  font-weight: 600;
}
</style>
