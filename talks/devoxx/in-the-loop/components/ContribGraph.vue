<script setup lang="ts">
// Alex's real GitHub contribution graph, Dec 2025 to Sep 2026, sampled cell by cell
// from his screenshot. Rows are weekdays (Sunday first), columns are weeks.
// "." means no cell (the current week is not finished).
const rows = [
  '101110111111111131212231041110143122343222',
  '11101111111111112011111101111014422211211.',
  '11101111101011111011111111111111431021211.',
  '11101111111111111011211111110114111121111.',
  '01111111111111111111111111010111220121211.',
  '11110111111111121031110010110022111111112.',
  '10010110101011121011210010110142112111312.',
]

const months = [
  { label: 'Dec', col: 0 },
  { label: 'Jan', col: 4 },
  { label: 'Feb', col: 8 },
  { label: 'Mar', col: 12 },
  { label: 'Apr', col: 17 },
  { label: 'May', col: 21 },
  { label: 'Jun', col: 26 },
  { label: 'Jul', col: 30 },
  { label: 'Aug', col: 34 },
  { label: 'Sep', col: 39 },
]

// July 12th 2026 was a Sunday: row 0, column 31.
const peak = { row: 0, col: 31 }
</script>

<template>
  <div class="contrib">
    <div class="contrib-months">
      <span v-for="m in months" :key="m.label" :style="{ '--c': m.col }">{{ m.label }}</span>
    </div>
    <div class="contrib-grid">
      <template v-for="(row, r) in rows" :key="r">
        <i
          v-for="(level, c) in row.split('')"
          :key="`${r}-${c}`"
          :class="[`l${level === '.' ? 'x' : level}`, { peak: r === peak.row && c === peak.col }]"
          :style="{ '--c': c, '--r': r }"
        />
      </template>
      <div class="contrib-tip" :style="{ '--c': peak.col }">237 contributions on July 12th.</div>
    </div>
  </div>
</template>
