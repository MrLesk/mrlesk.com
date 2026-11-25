<script setup lang="ts">
const bars = Array.from({ length: 19 }, (_, i) => ({ x: 59 + i * 8, h: 8 + Math.abs(Math.sin(i * 1.7)) * 44 }))
</script>
<template>
  <svg class="pace-diagram" viewBox="0 0 870 325" role="img" aria-labelledby="pace-title pace-desc">
    <title id="pace-title">Pause and resume without a new connection</title>
    <desc id="pace-desc">Listening sends audio. Pause mutes audio and cancels pending decisions. Resume starts with new speech. The connection stays open.</desc>
    <g fill="#f5f6fc" stroke="#e2e6f3"><rect x="10" y="24" width="242" height="216" rx="16"/><rect x="314" y="24" width="242" height="216" rx="16"/><rect x="618" y="24" width="242" height="216" rx="16"/></g>
    <g style="font-size: 24px" font-weight="500" text-anchor="middle" fill="#030a18"><text x="131" y="65">Listening</text><text x="435" y="65">Pause</text><text x="739" y="65">Resume</text></g>
    <g stroke="#3442e0" stroke-width="3" stroke-linecap="round"><line v-for="(b,i) in bars" :key="i" :x1="b.x" :x2="b.x" :y1="128-b.h/2" :y2="128+b.h/2"/><line v-for="(b,i) in bars" :key="`r${i}`" :x1="b.x+608" :x2="b.x+608" :y1="128-b.h/2" :y2="128+b.h/2"/></g>
    <circle cx="435" cy="128" r="34" fill="#e9ecff"/><path d="M426 116v24m18-24v24" fill="none" stroke="#3442e0" stroke-width="6" stroke-linecap="round"/>
    <g text-anchor="middle" fill="#626d84" style="font-size: 17px"><text x="131" y="204">Audio on</text><text x="435" y="204">Audio muted</text><text x="739" y="204">New speech</text></g>
    <g fill="none" stroke="#a5aedd" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M268 128h30m-8-8 8 8-8 8M572 128h30m-8-8 8 8-8 8"/></g>
    <path d="M131 253v17h608v-17" fill="none" stroke="#d2d8ef" stroke-width="1.5"/>
    <text x="435" y="305" text-anchor="middle" fill="#3442e0" style="font-size: 19px">The connection stays open.</text>
  </svg>
</template>
