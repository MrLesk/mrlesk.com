<script setup lang="ts">
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

// Click 0: a Roman surveyor at his groma while soldiers build a road along his line.
// Click 1: the land dissolves into an architecture map and the line lands on a component.
// Both engravings come from Groma's "What is a groma?" page and place the surveyor at the
// same spot, so he stays put while the ground changes under him.
const { $clicks } = useSlideContext()
const mapped = computed(() => $clicks.value >= 1)
const base = import.meta.env.BASE_URL
</script>

<template>
  <div class="scene" :class="{ mapped }">
    <img class="scene-art land" :src="`${base}groma-road.webp`" alt="Roman soldiers build a road along a straight green line set out by a surveyor with a groma" />
    <img class="scene-art code" :src="`${base}groma-map.webp`" alt="The surveyor with his groma at the edge of an architecture map, a green line running to one component" />

    <div class="scene-copy">
      <p class="eyebrow">GROMA · ROMAN SURVEYING INSTRUMENT</p>
      <h1>
        Straight lines through<br>unknown
        <span class="swap"><b class="was">land.</b><b class="now">code.</b></span>
      </h1>
    </div>
  </div>
</template>
