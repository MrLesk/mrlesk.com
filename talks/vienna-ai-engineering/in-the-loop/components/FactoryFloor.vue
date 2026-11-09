<script setup lang="ts">
// The finale's production line (pages/30-finale.md). lib/factory-scene.ts draws it; style.css, under
// "The factory", shows the scene of each beat, colours it by the light and moves the camera.
import { useId } from 'vue'
import { scene } from '../lib/factory-scene'
import type { P2 } from '../lib/factory-scene'

const { platform, workshop, floor, cameras } = scene()
// Back to front. The platform and the people's workshop are their own groups, because each is only there for
// part of the story: the workshop while people build the car, the platform after.
const groups = [
  { cls: 'factory-platform', parts: platform },
  { cls: 'factory-workshop', parts: workshop },
  { cls: 'factory-floor', parts: floor },
]
const base = import.meta.env.BASE_URL
// What the three monitors show once the lights are on: Groma.md stills from this talk's demo.
const pictures: Record<string, string> = {
  left: 'demo/action-map.webp',
  main: 'demo/keycloak-1.webp',
  right: 'demo/keycloak-7.webp',
}
// The soft light around a weld or a lamp is one gradient, bright in the middle and gone at the edge. Slidev can
// show a slide twice on one page (the presenter's preview), so every copy of this component names its own.
const glowId = useId()
const glow = { fill: `url(#${glowId})` }

/** A point as a CSS transform-origin. */
const origin = ([x, y]: P2) => `${x}px ${y}px`
/** How far into its round an arm starts, so the four do not move in step. */
const armDelay = (order: number) => `${-order * 0.85}s`
</script>

<template>
  <div class="factory" :style="{ '--camera-car': cameras.car, '--camera-factory': cameras.factory, '--camera-deck': cameras.deck }">
    <svg viewBox="0 0 980 551" aria-hidden="true">
      <defs>
        <radialGradient :id="glowId">
          <stop class="glow-core" offset="0" />
          <stop class="glow-mid" offset="0.3" />
          <stop class="glow-edge" offset="1" />
        </radialGradient>
      </defs>
      <g v-for="group in groups" :key="group.cls" :class="group.cls">
        <template v-for="(part, index) in group.parts" :key="index">
          <path v-if="part.kind === 'path'" :class="part.cls" :d="part.d" />

          <!-- An agent: the base, then the upper arm, which turns around the shoulder, and on it the forearm, which
               turns around the elbow and carries the tool. The weld's light sits at the tool's tip. -->
          <g
            v-else-if="part.kind === 'arm'"
            class="factory-arm"
            :style="{
              transformOrigin: origin(part.shoulder),
              '--turn': part.turn,
              '--order': part.order,
              '--upper': `${part.sizes.upper}px`,
              '--fore': `${part.sizes.fore}px`,
            }"
          >
            <path v-for="face in part.base" :key="face.d" :class="face.cls" :d="face.d" />
            <g class="arm-upper" :style="{ transformOrigin: origin(part.shoulder), animationDelay: armDelay(part.order) }">
              <path class="arm-shell" :d="`M${part.shoulder} L${part.elbow}`" />
              <path class="arm-core" :d="`M${part.shoulder} L${part.elbow}`" />
              <g class="arm-fore" :style="{ transformOrigin: origin(part.elbow), animationDelay: armDelay(part.order) }">
                <path class="arm-tool line" :d="`M${part.wrist} L${part.tip} M${part.tip[0] - 4} ${part.tip[1] - 6} L${part.tip[0] + 4} ${part.tip[1] - 6}`" />
                <path class="arm-shell" :d="`M${part.motor} L${part.wrist}`" />
                <path class="arm-core" :d="`M${part.motor} L${part.wrist}`" />
                <circle class="arm-joint" :cx="part.wrist[0]" :cy="part.wrist[1]" :r="part.sizes.joint * 0.75" />
                <!-- Same delay as the arm, so the light only comes on while the tool holds still (see style.css). -->
                <g class="weld-light" :style="{ transformOrigin: origin(part.tip), animationDelay: armDelay(part.order) }">
                  <circle class="weld-glow" :cx="part.tip[0]" :cy="part.tip[1]" :r="part.sizes.glow" :style="glow" />
                  <path class="weld-sparks" :d="part.sparks" />
                </g>
              </g>
              <circle class="arm-joint" :cx="part.elbow[0]" :cy="part.elbow[1]" :r="part.sizes.joint" />
              <circle class="arm-bolt" :cx="part.elbow[0]" :cy="part.elbow[1]" :r="part.sizes.joint * 0.3" />
            </g>
            <circle class="arm-joint" :cx="part.shoulder[0]" :cy="part.shoulder[1]" :r="part.sizes.joint" />
            <circle class="arm-bolt" :cx="part.shoulder[0]" :cy="part.shoulder[1]" :r="part.sizes.joint * 0.3" />
          </g>

          <!-- A pillar's lamp and the light around it. They breathe one after the other, not all at once. -->
          <g v-else-if="part.kind === 'beacon'" class="beacon" :style="{ animationDelay: `${-(index % 7) * 0.34}s` }">
            <circle class="beacon-glow" :cx="part.at[0]" :cy="part.at[1]" :r="part.r * 5" :style="glow" />
            <circle class="beacon-lamp" :cx="part.at[0]" :cy="part.at[1]" :r="part.r" />
          </g>

          <!-- A monitor's picture, and a streak of light across its glass. -->
          <g v-else-if="part.kind === 'screen'" :class="['screen', part.cls]" :transform="part.matrix">
            <image :href="base + pictures[part.cls]" :width="part.width" :height="part.height" preserveAspectRatio="xMidYMid slice" />
            <path class="screen-sheen" :d="`M0 0 H${part.width * 0.42} L${part.width * 0.14} ${part.height} H0 Z`" />
          </g>

          <g v-else-if="part.kind === 'person'" class="person">
            <ellipse class="shadow" :cx="part.shadow.cx" :cy="part.shadow.cy" :rx="part.shadow.rx" :ry="part.shadow.ry" />
            <path class="person-body" :d="part.d" />
          </g>

          <!-- A worker building a car: the body, then the working arm, whose forearm and tool swing around the elbow. -->
          <g
            v-else-if="part.kind === 'worker'"
            :class="['worker', part.job]"
            :style="{ '--turn': part.facing, '--limb': `${part.sizes.limb}px`, '--trunk': `${part.sizes.trunk}px`, '--tool': `${part.sizes.tool}px` }"
          >
            <ellipse class="shadow" :cx="part.shadow.cx" :cy="part.shadow.cy" :rx="part.shadow.rx" :ry="part.shadow.ry" />
            <path class="limb" :d="part.restArm" />
            <path class="limb" :d="part.legs" />
            <path class="trunk" :d="part.trunk" />
            <circle class="head" :cx="part.head.at[0]" :cy="part.head.at[1]" :r="part.head.r" />
            <path class="hat" :d="part.hat" />
            <path class="limb" :d="part.upperArm" />
            <g class="worker-forearm" :style="{ transformOrigin: origin(part.elbow), animationDelay: `${-index * 0.23}s` }">
              <path class="limb" :d="part.forearm" />
              <path class="tool" :d="part.tool" />
              <path v-if="part.toolEnd" class="limb" :d="part.toolEnd" />
              <g v-if="part.sparks" class="weld-light" :style="{ transformOrigin: origin(part.tip), animationDelay: `${-index * 0.17}s` }">
                <circle class="weld-glow" :cx="part.tip[0]" :cy="part.tip[1]" :r="part.sizes.glow" :style="glow" />
                <path class="weld-sparks" :d="part.sparks" />
              </g>
            </g>
          </g>
        </template>
      </g>
    </svg>
  </div>
</template>
