<script setup lang="ts">
// The finale's software factory (pages/30-finale.md). lib/factory-scene.ts draws it; style.css, under
// "The factory", colours it by the light and flies the camera up to the platform.
import { scene } from '../lib/factory-scene'

const { parts, focus } = scene()
const base = import.meta.env.BASE_URL
// What the three monitors show once the lights are on: Groma.md stills from this talk's demo.
const pictures: Record<string, string> = {
  left: 'demo/action-map.webp',
  main: 'demo/keycloak-1.webp',
  right: 'demo/keycloak-7.webp',
}
</script>

<template>
  <div class="factory" :style="{ '--focus-x': `${focus.x}px`, '--focus-y': `${focus.y}px`, '--zoom': focus.zoom }">
    <svg viewBox="0 0 980 551" aria-hidden="true">
      <template v-for="(part, index) in parts" :key="index">
        <path v-if="part.kind === 'path'" :class="part.cls" :d="part.d" />
        <!-- An arm: base, upper arm, then the forearm, which swings around the elbow. -->
        <g v-else-if="part.kind === 'arm'" :class="['factory-arm', part.swing]">
          <path v-for="face in part.base" :key="face" class="arm-base" :d="face" />
          <path class="arm-tube" :d="`M${part.shoulder} L${part.elbow}`" />
          <path class="arm-core" :d="`M${part.shoulder} L${part.elbow}`" />
          <g class="forearm" :style="{ transformOrigin: `${part.elbow[0]}px ${part.elbow[1]}px`, animationDelay: `${-index * 0.37}s` }">
            <path class="arm-tool line" :d="`M${part.wrist} L${part.tool} M${part.tool[0] - 4} ${part.tool[1] + 5} L${part.tool[0]} ${part.tool[1]} L${part.tool[0] + 4} ${part.tool[1] + 5}`" />
            <path class="arm-tube" :d="`M${part.elbow} L${part.wrist}`" />
            <path class="arm-core" :d="`M${part.elbow} L${part.wrist}`" />
            <circle class="arm-joint" :cx="part.wrist[0]" :cy="part.wrist[1]" r="5" />
          </g>
          <circle class="arm-joint" :cx="part.shoulder[0]" :cy="part.shoulder[1]" r="5" />
          <circle class="arm-joint" :cx="part.elbow[0]" :cy="part.elbow[1]" r="5" />
        </g>
        <circle v-else-if="part.kind === 'beacon'" class="beacon" :cx="part.at[0]" :cy="part.at[1]" :r="part.r" />
        <g v-else-if="part.kind === 'screen'" :class="['screen', part.cls]" :transform="part.matrix">
          <image :href="base + pictures[part.cls]" :width="part.width" :height="part.height" preserveAspectRatio="xMidYMid slice" />
        </g>
        <path v-else-if="part.kind === 'person'" class="person" :d="part.d" />
      </template>
    </svg>
  </div>
</template>
