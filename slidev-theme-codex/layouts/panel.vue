<script setup lang="ts">
const base = (import.meta as ImportMeta).env?.BASE_URL || '/'
const trimmed = base.endsWith('/') ? base.slice(0, -1) : base
const logo = `${trimmed}/codex-logo.gif`
</script>

<template>
  <div class="slidev-layout panel">
    <img class="panel-mark" :src="logo" alt="Codex" />
    <div class="panel-text">
      <slot></slot>
    </div>
  </div>
</template>
