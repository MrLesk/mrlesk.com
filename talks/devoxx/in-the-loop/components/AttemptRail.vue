<script setup lang="ts">
// The four attempts at building Groma. `current` highlights one of them (0-3);
// leave it out to show the whole history at once.
defineProps<{ current?: number }>()

const attempts = [
  { name: 'project Blueprint', ok: false },
  { name: 'groma', ok: false },
  { name: 'groma 2', ok: false },
  { name: 'groma 3', ok: true },
]
</script>

<template>
  <ol class="rail" :class="{ focused: current !== undefined }">
    <li
      v-for="(a, i) in attempts"
      :key="a.name"
      :class="{ ok: a.ok, fail: !a.ok, current: current === i }"
    >
      <span class="rail-no">ATTEMPT {{ i + 1 }}</span>
      <strong>{{ a.name }}</strong>
      <em>{{ a.ok ? 'works' : 'fail' }}</em>
    </li>
  </ol>
</template>
