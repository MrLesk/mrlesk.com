<script setup lang="ts">
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

// Click 0: the surveyor sights across a field. Click 1: the field becomes the real
// Groma map and the sight line lands on a component.
// All coordinates are slide pixels (980x552). The map captures were taken at exactly
// that size, so the component sits where the sight line ends: B is the foot of the
// staff, T the front corner of the "Web host" component.
const { $clicks } = useSlideContext()
const mapped = computed(() => $clicks.value >= 1)
const base = import.meta.env.BASE_URL
</script>

<template>
  <div class="scene" :class="{ mapped }">
    <img class="scene-map plain" :src="`${base}map-plain.webp`" alt="" />
    <img class="scene-map selected" :src="`${base}map-selected.webp`" alt="" />

    <svg class="scene-field" viewBox="0 0 980 552" aria-hidden="true">
      <g class="hatch">
        <path d="M268 492h74M372 470h58M300 520h96M452 438h70M520 470h92M604 418h64M668 452h88M700 388h60M760 420h84M560 510h110M812 372h70M838 464h72M716 500h64M428 506h60" />
        <path d="M640 330h46M742 318h58M860 300h50M690 276h40M800 262h62" opacity=".55" />
      </g>
      <g class="poles">
        <line x1="357" y1="382" x2="357" y2="214.6" /><path d="M351 222h12" />
        <line x1="463" y1="329" x2="463" y2="203" /><path d="M458 210h10" />
        <line x1="585" y1="268" x2="585" y2="190" /><path d="M581 196h8" />
      </g>
      <line class="sight" x1="205" y1="230.7" x2="585" y2="190" />
      <text x="188" y="482">A</text>
      <text x="597" y="262">B</text>
    </svg>

    <svg class="scene-line" viewBox="0 0 980 552" aria-hidden="true">
      <defs>
        <!-- The sight line is dashed like the Groma mark, so it is drawn in through a mask. -->
        <mask id="sight-reveal" maskUnits="userSpaceOnUse" x="0" y="0" width="980" height="552">
          <line class="reveal" x1="205" y1="458" x2="585" y2="268" pathLength="100" />
        </mask>
      </defs>
      <line class="ground ink" x1="205" y1="458" x2="585" y2="268" />
      <g mask="url(#sight-reveal)">
        <line class="ground casing" x1="205" y1="458" x2="585" y2="268" />
        <line class="ground green" x1="205" y1="458" x2="585" y2="268" />
      </g>
      <g class="reticle">
        <circle class="ring" cx="585" cy="268" r="12" />
        <circle class="dot" cx="585" cy="268" r="4.5" />
      </g>
      <circle class="landing" cx="585" cy="268" r="12" />
    </svg>

    <img class="scene-surveyor" :src="`${base}surveyor.webp`" alt="A Roman surveyor sighting along a groma" />

    <div class="scene-copy">
      <p class="eyebrow">GROMA · ROMAN SURVEYING INSTRUMENT</p>
      <h1>
        Straight lines through<br>unknown
        <span class="swap"><b class="was">land.</b><b class="now">code.</b></span>
      </h1>
    </div>
  </div>
</template>
