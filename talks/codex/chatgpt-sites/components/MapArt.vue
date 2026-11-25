<script setup lang="ts">
// A drawn city map: a river, roads, parks and groups of people. It stands in for the
// participant map of the live demo. It is a picture, not data.
//
// A parent can restyle it with CSS variables:
//   --map-pin             colour of the groups (default: the theme's blue)
//   --map-pin-tone-delay  wait before a colour change shows
//   --map-pins-delay      wait before the groups drop in
withDefaults(defineProps<{
  /** Shows the groups of people. When this turns on, they drop in one after another. */
  pins?: boolean
  /** Adds single people who keep arriving and leaving, for a map that should look live. */
  busy?: boolean
}>(), {
  pins: true,
  busy: false,
})

/** Where each group sits on the drawing's 400 x 250 grid, and its radius. */
const GROUPS = [
  { x: 196, y: 138, radius: 17 },
  { x: 128, y: 96, radius: 11 },
  { x: 262, y: 172, radius: 12 },
  { x: 304, y: 92, radius: 9 },
  { x: 92, y: 186, radius: 9 },
  { x: 232, y: 58, radius: 7 },
  { x: 338, y: 204, radius: 7 },
]

/** Single people for the `busy` map. They pop in and out in this order. */
const VISITORS = [
  { x: 168, y: 176 },
  { x: 232, y: 118 },
  { x: 150, y: 132 },
  { x: 284, y: 140 },
  { x: 208, y: 204 },
  { x: 110, y: 148 },
  { x: 250, y: 92 },
  { x: 60, y: 110 },
]
</script>

<template>
  <svg
    class="map-art"
    :class="{ 'has-pins': pins, 'is-busy': busy }"
    viewBox="0 0 400 250"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <rect class="map-land" width="400" height="250" />
    <path class="map-park" d="M286 118c18-10 44-8 58 6s8 38-10 46-44 2-54-14-8-30 6-38z" />
    <path class="map-park" d="M30 40c14-12 40-10 50 4s2 34-14 40-38-2-44-16 0-22 8-28z" />
    <path class="map-river" d="M-10 64C50 56 96 112 172 112s120 44 248 20" />
    <path class="map-canal" d="M150 110c26 28 66 44 112 36" />
    <g class="map-roads">
      <ellipse cx="196" cy="144" rx="74" ry="48" />
      <path d="M196 144 40 240M196 144l172 84M196 144 336 30M196 144 70 14M196 144l10 116M196 144 150-10" />
    </g>
    <path class="map-lanes" d="M0 150h120M276 144h124M96 250l40-70M300 250l-30-60M250 0l-14 60M20 100l80 30" />

    <!-- The outer group places a marker. The inner one is what CSS moves. -->
    <g v-for="(visitor, index) in VISITORS" :key="`visitor-${index}`" :transform="`translate(${visitor.x} ${visitor.y})`">
      <circle class="map-visitor" r="4.5" :style="{ '--order': index }" />
    </g>
    <g v-for="(group, index) in GROUPS" :key="`group-${index}`" :transform="`translate(${group.x} ${group.y})`">
      <g class="map-group" :style="{ '--order': index }">
        <circle class="map-group-halo" :r="group.radius * 1.75" />
        <circle class="map-group-dot" :r="group.radius" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.map-art {
  display: block;
  width: 100%;
  height: 100%;
  --group-colour: var(--map-pin, var(--codex-accent));
}

.map-land {
  fill: #eef1f7;
}

.map-park {
  fill: #dcefe4;
}

.map-river,
.map-canal,
.map-roads,
.map-lanes {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.map-river {
  stroke: #c6d6ff;
  stroke-width: 15;
}

.map-canal {
  stroke: #d3e0ff;
  stroke-width: 6;
}

.map-roads {
  stroke: #ffffff;
  stroke-width: 5;
}

.map-lanes {
  stroke: #ffffff;
  stroke-width: 2.4;
}

/* Groups: hidden until the map has pins, then they drop in one after another. */
.map-group {
  opacity: 0;
  transform: translateY(-16px) scale(0.3);
  transform-box: fill-box;
  transform-origin: center;
  transition:
    opacity 260ms ease,
    transform 520ms var(--sites-ease-spring);
}

.map-art.has-pins .map-group {
  opacity: 1;
  transform: none;
  transition-delay: calc(var(--map-pins-delay, 0ms) + var(--order) * 110ms);
}

.map-group-dot {
  fill: var(--group-colour);
  stroke: #ffffff;
  stroke-width: 2.4;
  transition: fill 600ms ease var(--map-pin-tone-delay, 0ms);
}

.map-group-halo {
  fill: var(--group-colour);
  opacity: 0.16;
  transform-box: fill-box;
  transform-origin: center;
  transition: fill 600ms ease var(--map-pin-tone-delay, 0ms);
  animation: map-group-halo 2.8s ease-in-out infinite;
  animation-delay: calc(var(--order) * 320ms);
}

/* Single visitors: only on a busy map, and each keeps popping in and out. */
.map-visitor {
  fill: var(--group-colour);
  stroke: #ffffff;
  stroke-width: 1.6;
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
}

.map-art.is-busy .map-visitor {
  animation: map-visitor 6.4s ease-in-out infinite;
  animation-delay: calc(var(--order) * 800ms);
}

@keyframes map-group-halo {
  0%,
  100% {
    transform: scale(0.82);
    opacity: 0.2;
  }
  50% {
    transform: scale(1.12);
    opacity: 0.08;
  }
}

@keyframes map-visitor {
  0%,
  8% {
    opacity: 0;
    transform: translateY(-10px) scale(0.2);
  }
  16%,
  70% {
    opacity: 1;
    transform: none;
  }
  82%,
  100% {
    opacity: 0;
    transform: scale(0.2);
  }
}
</style>
