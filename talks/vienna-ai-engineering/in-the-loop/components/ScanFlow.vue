<script setup lang="ts">
import { useIsSlideActive } from '@slidev/client'

// Every language feeds the same scan: seven cards at the bottom, each with a line into the scanner card.
// The lines draw on when the slide opens, then keep flowing upwards. The marks are drawn here, in each
// language's colours, rather than copied logos. Every language listed has a scanner marked Available in
// the Groma.md README. The `more` card counts the README's other scanners, so nobody thinks these five are
// all there is (Alex, 2026-11-06): a card like the others, its mark four of those languages as small tiles.
// The last card stands for the scanner plugins anyone can add. From Tuesday's keynote demo, on paper.
const active = useIsSlideActive()

// The Groma.md README on GitHub lists 24 scanners (12 Available, 12 Experimental) on 2026-11-06. Five have
// their own card, so the `more` card says the rest. Recount when the README's Languages table changes.
const scannersInReadme = 24
const moreCount = scannersInReadme - 5
// Four of the others, in their own colours, for the `more` card's mark.
const moreTiles = [
  { label: 'Go', colour: '#00add8', x: 3, y: 3 },
  { label: 'Py', colour: '#3776ab', x: 25, y: 3 },
  { label: 'Kt', colour: '#7f52ff', x: 3, y: 25 },
  { label: 'Sw', colour: '#f05138', x: 25, y: 25 },
]

const languages = ['java', 'csharp', 'rust', 'php', 'typescript', 'more', 'yours'] as const
const names: Record<(typeof languages)[number], string> = {
  java: 'Java',
  csharp: 'C#',
  rust: 'Rust',
  php: 'PHP',
  typescript: 'TypeScript',
  more: `+${moreCount} more`,
  yours: 'Your favorite language',
}

// The cards sit on a 126 px pitch, centred on the slide: card width plus gap, `.scan-langs` in style.css.
// The lines meet the scanner card along its bottom edge, 46 px apart.
const W = 980
const pitch = 126
const middle = (languages.length - 1) / 2
const paths = languages.map((_, i) => {
  const x = W / 2 + (i - middle) * pitch
  const into = W / 2 + (i - middle) * 46
  return `M ${x} 392 C ${x} 330, ${into} 318, ${into} 262`
})
</script>

<template>
  <div class="scan-flow" :class="{ 'is-active': active }">
    <svg class="scan-lines" viewBox="0 0 980 551" aria-hidden="true">
      <defs>
        <marker id="scan-head" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 1 L 9 5 L 0 9 z" fill="currentColor" />
        </marker>
      </defs>
      <g v-for="(d, i) in paths" :key="i" :style="{ '--i': i }">
        <path class="scan-line" :d="d" pathLength="100" marker-end="url(#scan-head)" />
        <path class="scan-flowing" :d="d" pathLength="100" />
      </g>
    </svg>

    <div class="scan-engine">
      <p class="scan-engine-title">Real-time<br>deterministic<br>offline scans</p>
    </div>

    <ul class="scan-langs">
      <li v-for="(lang, i) in languages" :key="lang" :class="lang" :style="{ '--i': i }">
        <svg v-if="lang === 'java'" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M14 22h18v9a9 9 0 0 1-9 9h0a9 9 0 0 1-9-9z" fill="none" stroke="#e76f00" stroke-width="3.4" stroke-linejoin="round" />
          <path d="M32 25.5h2.5a4 4 0 0 1 0 8H31" fill="none" stroke="#e76f00" stroke-width="3" stroke-linecap="round" />
          <path d="M11 43.5h24" stroke="#5382a1" stroke-width="3" stroke-linecap="round" />
          <path d="M20 17c-2-2.6 2.6-4.4.4-8M26.5 17c-2-2.6 2.6-4.4.4-8" fill="none" stroke="#5382a1" stroke-width="2.6" stroke-linecap="round" />
        </svg>
        <svg v-else-if="lang === 'csharp'" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M24 4 41.3 14v20L24 44 6.7 34V14z" fill="#68217a" />
          <path d="M24 4 41.3 14 24 24z" fill="#9b4f96" />
          <text style="font-family: Inter, system-ui, sans-serif; font-size: 16px; font-weight: 800" x="24" y="30.5" text-anchor="middle" fill="#fff">C#</text>
        </svg>
        <svg v-else-if="lang === 'rust'" viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="24" r="17" fill="none" stroke="#171b1a" stroke-width="5" stroke-dasharray="3.6 3.1" />
          <circle cx="24" cy="24" r="13.5" fill="#171b1a" />
          <text style="font-family: Inter, system-ui, sans-serif; font-size: 17px; font-weight: 800" x="24" y="30" text-anchor="middle" fill="#fff">R</text>
        </svg>
        <svg v-else-if="lang === 'php'" viewBox="0 0 48 48" aria-hidden="true">
          <ellipse cx="24" cy="24" rx="21" ry="12.5" fill="#777bb3" />
          <text style="font-family: Inter, system-ui, sans-serif; font-size: 15px; font-weight: 800; font-style: italic" x="24" y="29.5" text-anchor="middle" fill="#fff">php</text>
        </svg>
        <svg v-else-if="lang === 'typescript'" viewBox="0 0 48 48" aria-hidden="true">
          <rect x="6" y="6" width="36" height="36" rx="4" fill="#3178c6" />
          <text style="font-family: Inter, system-ui, sans-serif; font-size: 17px; font-weight: 800" x="38.5" y="37.5" text-anchor="end" fill="#fff">TS</text>
        </svg>
        <svg v-else-if="lang === 'more'" viewBox="0 0 48 48" aria-hidden="true">
          <g v-for="tile in moreTiles" :key="tile.label">
            <rect :x="tile.x" :y="tile.y" width="20" height="20" rx="3" :fill="tile.colour" />
            <text style="font-family: Inter, system-ui, sans-serif; font-size: 10px; font-weight: 800" :x="tile.x + 10" :y="tile.y + 13.6" text-anchor="middle" fill="#fff">{{ tile.label }}</text>
          </g>
        </svg>
        <svg v-else viewBox="0 0 48 48" aria-hidden="true">
          <rect x="7" y="7" width="34" height="34" rx="4" fill="none" stroke="#1d9e75" stroke-width="2.4" stroke-dasharray="5 4" />
          <path d="M24 16v16M16 24h16" stroke="#1d9e75" stroke-width="3.2" stroke-linecap="round" />
        </svg>
        <span>{{ names[lang] }}</span>
      </li>
    </ul>
  </div>
</template>
