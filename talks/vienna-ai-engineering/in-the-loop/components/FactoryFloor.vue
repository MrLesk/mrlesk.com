<script setup lang="ts">
// The finale's production line (pages/30-finale.md). lib/factory-scene.ts draws it; style.css, under
// "The factory", shows the scene of each beat, colours it by the light and moves the camera.
import { scene } from '../lib/factory-scene'

const { platform, floor, cameras } = scene()
// The platform rises behind the line, so it is drawn first, as its own group.
const groups = [
  { cls: 'factory-platform', parts: platform },
  { cls: 'factory-floor', parts: floor },
]
const base = import.meta.env.BASE_URL
// What the three monitors show once the lights are on: Groma.md stills from this talk's demo.
const pictures: Record<string, string> = {
  left: 'demo/action-map.webp',
  main: 'demo/keycloak-1.webp',
  right: 'demo/keycloak-7.webp',
}
</script>

<template>
  <div class="factory" :style="{ '--camera-car': cameras.car, '--camera-factory': cameras.factory, '--camera-deck': cameras.deck }">
    <svg viewBox="0 0 980 551" aria-hidden="true">
      <g v-for="group in groups" :key="group.cls" :class="group.cls">
        <template v-for="(part, index) in group.parts" :key="index">
          <path v-if="part.kind === 'path'" :class="part.cls" :d="part.d" />
          <!-- An arm grows from its base: upper arm, then the forearm, which swings around the elbow. -->
          <g v-else-if="part.kind === 'arm'" :class="['factory-arm', part.swing]" :style="{ transformOrigin: `${part.shoulder[0]}px ${part.shoulder[1]}px` }">
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
          <path v-else-if="part.kind === 'person'" :class="['person', part.role]" :d="part.d" />
        </template>
      </g>
    </svg>
  </div>
</template>
