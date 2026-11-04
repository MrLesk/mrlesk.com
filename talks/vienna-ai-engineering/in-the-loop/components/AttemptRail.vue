<script setup lang="ts">
import { useIsSlideActive } from '@slidev/client'

// The four attempts at building Groma.md. Leave `current` out to show the whole history at once.
// With `current` (0-3) the rail tells the story one attempt at a time: earlier attempts are crossed
// out, the current one is open, later ones are not there yet. Arriving on a slide crosses out the
// attempt that was open on the slide before, then brings in the current one; the one that works gets
// a tick. `is-active` replays that each time the slide is shown, not when Slidev preloads it.
defineProps<{ current?: number }>()

const active = useIsSlideActive()

const attempts = [
  { name: 'project Blueprint', ok: false },
  { name: 'groma.md 1', ok: false },
  { name: 'groma.md 2', ok: false },
  { name: 'groma.md 3', ok: true },
]
</script>

<template>
  <ol class="rail" :class="{ focused: current !== undefined, 'is-active': active }">
    <li
      v-for="(a, i) in attempts"
      :key="a.name"
      :class="{
        ok: a.ok,
        fail: !a.ok,
        past: current !== undefined && i < current,
        'just-past': current !== undefined && i === current - 1,
        current: current === i,
        first: current === 0,
        later: current !== undefined && i > current,
      }"
    >
      <span class="rail-no">ATTEMPT {{ i + 1 }}</span>
      <strong>{{ a.name }}<i v-if="a.ok" class="rail-tick">✓</i></strong>
      <em>{{ a.ok ? 'works' : 'fail' }}</em>
    </li>
  </ol>
</template>
