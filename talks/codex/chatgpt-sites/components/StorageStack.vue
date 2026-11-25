<script setup lang="ts">
import { useSlideSteps } from '../composables/useSlideSteps'

// Slide "Storage & database": the Site is the top sheet of a stack. Each click lifts the
// sheets apart to show what sits under the page.
//
//   start    one stack, only the page on top
//   click 1  the page lifts: file storage is under it
//   click 2  the files lift too: the database is at the bottom
//
// The slide's frontmatter must say `clicks: 2`.
const { step, stepClasses } = useSlideSteps(2)

/** The files on the storage sheet: a short type label and its colour. */
const FILES = [
  { type: 'IMG', colour: '#8a5bff' },
  { type: 'PDF', colour: '#3442e0' },
  { type: 'CSV', colour: '#14a166' },
  { type: 'IMG', colour: '#8a5bff' },
  { type: 'MP4', colour: '#ffb224' },
  { type: 'PDF', colour: '#3442e0' },
]

/** How many rows the database sheet shows under its header. */
const DATABASE_ROWS = 4
</script>

<template>
  <div class="storage" :class="stepClasses">
    <!-- Left: the two things a Site comes with. Each lights up on its click. -->
    <div class="storage-features">
      <div class="storage-feature is-files" :class="{ 'is-on': step >= 1 }">
        <span class="storage-feature-icon"><SiteIcon name="file" /></span>
        <div class="storage-feature-title">File storage</div>
        <p class="storage-feature-note">Images, uploads, and the files your site needs.</p>
        <span class="storage-feature-fact">No fixed size limit</span>
      </div>
      <div class="storage-feature is-database" :class="{ 'is-on': step >= 2 }">
        <span class="storage-feature-icon"><SiteIcon name="database" /></span>
        <div class="storage-feature-title">A database</div>
        <p class="storage-feature-note">Save the information your app works with.</p>
        <span class="storage-feature-fact">Up to 10 GB per Site</span>
      </div>
    </div>

    <!-- Right: the stack, drawn at an angle. Sheets are listed bottom to top. -->
    <div class="stack-scene" aria-hidden="true">
      <div class="stack">
        <div class="stack-ground" />

        <div class="stack-sheet is-database">
          <div class="stack-face">
            <div class="stack-table-row is-header"><i /><i /></div>
            <div v-for="row in DATABASE_ROWS" :key="row" class="stack-table-row" :style="{ '--order': row }"><i /><i /></div>
          </div>
        </div>

        <div class="stack-sheet is-files">
          <div class="stack-face">
            <span v-for="(file, index) in FILES" :key="index" class="stack-file" :style="{ '--file-colour': file.colour, '--order': index }">
              {{ file.type }}
            </span>
          </div>
        </div>

        <div class="stack-sheet is-page">
          <div class="stack-face"><MiniSite /></div>
        </div>
      </div>

      <!-- The labels are not tilted. Each one follows the height of its sheet. -->
      <span class="stack-label is-page">Your site</span>
      <span class="stack-label is-files">File storage</span>
      <span class="stack-label is-database">A database</span>
    </div>
  </div>
</template>

<style scoped>
.storage {
  display: grid;
  grid-template-columns: calc(300 * var(--pt)) minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  align-items: center;
  gap: calc(20 * var(--pt));
  height: calc(290 * var(--pt));
}

/* ── The two features ───────────────────────────────────────────────────── */

.storage-features {
  display: flex;
  flex-direction: column;
  gap: calc(22 * var(--pt));
  animation: sites-rise 700ms var(--sites-ease-out) 200ms both;
}

.storage-feature {
  display: grid;
  grid-template-columns: calc(40 * var(--pt)) 1fr;
  column-gap: calc(14 * var(--pt));
  opacity: 0.32;
  transition: opacity 500ms ease;
}

.storage-feature.is-on {
  opacity: 1;
}

.storage-feature.is-files {
  --feature-colour: var(--codex-accent);
}

.storage-feature.is-database {
  --feature-colour: var(--sites-live);
}

.storage-feature-icon {
  grid-row: 1 / span 3;
  display: grid;
  place-items: center;
  width: calc(40 * var(--pt));
  height: calc(40 * var(--pt));
  border-radius: calc(11 * var(--pt));
  background: color-mix(in srgb, var(--feature-colour) 12%, #ffffff);
  color: var(--feature-colour);
  font-size: calc(21 * var(--pt));
}

.storage-feature-title {
  font-size: calc(20 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.storage-feature-note {
  margin: calc(3 * var(--pt)) 0 calc(8 * var(--pt)) 0;
  color: var(--codex-fg-muted);
  font-size: calc(14 * var(--pt));
  line-height: 1.4;
}

/* The fact pops in when its feature lights up. */
.storage-feature-fact {
  justify-self: start;
  padding: calc(3 * var(--pt)) calc(10 * var(--pt));
  border-radius: 999px;
  background: color-mix(in srgb, var(--feature-colour) 12%, #ffffff);
  color: var(--feature-colour);
  font-size: calc(12 * var(--pt));
  font-weight: 600;
  opacity: 0;
  transform: scale(0.7);
  transform-origin: left center;
  transition:
    opacity 300ms ease,
    transform 500ms var(--sites-ease-spring);
}

.storage-feature.is-on .storage-feature-fact {
  opacity: 1;
  transform: none;
  transition-delay: 500ms;
}

/* ── The stack ──────────────────────────────────────────────────────────── */

/* How far each sheet floats above the ground. The clicks change these three numbers, and
   both the sheets and their labels follow them. */
.stack-scene {
  position: relative;
  height: 100%;
  --lift-database: 0px;
  --lift-files: calc(12 * var(--pt));
  --lift-page: calc(24 * var(--pt));
  animation: sites-rise 800ms var(--sites-ease-out) 300ms both;
}

.s1 .stack-scene {
  --lift-files: calc(14 * var(--pt));
  --lift-page: calc(124 * var(--pt));
}

.s2 .stack-scene {
  --lift-files: calc(82 * var(--pt));
  --lift-page: calc(160 * var(--pt));
}

/* The whole stack is tilted once. Its sheets then only move up and down. */
.stack {
  position: absolute;
  top: 74%;
  left: 40%;
  width: calc(270 * var(--pt));
  height: calc(176 * var(--pt));
  transform: translate(-50%, -50%) rotateX(58deg) rotateZ(-38deg);
  transform-style: preserve-3d;
}

.stack-ground,
.stack-sheet,
.stack-face {
  position: absolute;
  inset: 0;
  border-radius: calc(12 * var(--pt));
}

.stack-ground {
  background: rgba(20, 14, 80, 0.2);
  filter: blur(calc(14 * var(--pt)));
  transform: translate(calc(-10 * var(--pt)), calc(14 * var(--pt)));
}

.stack-sheet {
  transform-style: preserve-3d;
  transition: transform 1000ms var(--sites-ease-out);
}

/* A darker copy just below each sheet gives it thickness. */
.stack-sheet::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--sheet-edge);
  transform: translateZ(calc(-7 * var(--pt)));
}

.stack-sheet.is-database {
  --sheet-colour: #edf9f3;
  --sheet-edge: #b9dfcc;
  transform: translateZ(var(--lift-database));
}

.stack-sheet.is-files {
  --sheet-colour: #f1f2ff;
  --sheet-edge: #c3c8f4;
  transform: translateZ(var(--lift-files));
}

.stack-sheet.is-page {
  --sheet-colour: #ffffff;
  --sheet-edge: #d5d9e8;
  transform: translateZ(var(--lift-page));
}

.stack-face {
  overflow: hidden;
  border: 1px solid var(--sites-line);
  background: var(--sheet-colour);
  font-size: calc(9.4 * var(--pt));
}

/* The files: tiles that pop in when the page lifts. */
.stack-sheet.is-files .stack-face {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: calc(10 * var(--pt));
  padding: calc(16 * var(--pt));
}

.stack-file {
  display: grid;
  place-items: center;
  border-radius: calc(8 * var(--pt));
  background: #ffffff;
  box-shadow: inset 0 calc(-5 * var(--pt)) 0 var(--file-colour);
  color: var(--file-colour);
  font-size: calc(11 * var(--pt));
  font-weight: 700;
  opacity: 0;
  transform: scale(0.4);
  transition:
    opacity 250ms ease,
    transform 500ms var(--sites-ease-spring);
}

.s1 .stack-file {
  opacity: 1;
  transform: none;
  transition-delay: calc(450ms + var(--order) * 80ms);
}

/* The database: a header and rows that slide in when the files lift. */
.stack-sheet.is-database .stack-face {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: calc(9 * var(--pt));
  padding: calc(16 * var(--pt)) calc(18 * var(--pt));
}

.stack-table-row {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: calc(14 * var(--pt));
  opacity: 0;
  transform: translateX(calc(-20 * var(--pt)));
  transition:
    opacity 300ms ease,
    transform 500ms var(--sites-ease-out);
}

.stack-table-row i {
  height: calc(9 * var(--pt));
  border-radius: calc(5 * var(--pt));
  background: rgba(20, 161, 102, 0.3);
}

.stack-table-row.is-header i {
  background: var(--sites-live);
}

.stack-table-row.is-header,
.s2 .stack-table-row {
  opacity: 1;
  transform: none;
}

.s2 .stack-table-row {
  transition-delay: calc(450ms + var(--order) * 90ms);
}

/* ── The labels ─────────────────────────────────────────────────────────── */

/* A sheet that floats `lift` above the ground looks 0.85 x lift higher on screen (the sine of
   the 58 degree tilt), so each label moves up by that much to stay beside its sheet. */
.stack-label {
  position: absolute;
  top: calc(74% - 7 * var(--pt));
  left: calc(40% + 172 * var(--pt));
  display: flex;
  align-items: center;
  gap: calc(8 * var(--pt));
  font-size: calc(13 * var(--pt));
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  transition:
    opacity 400ms ease,
    transform 1000ms var(--sites-ease-out);
}

.stack-label::before {
  content: '';
  width: calc(22 * var(--pt));
  height: 1px;
  background: currentColor;
  opacity: 0.4;
}

.stack-label.is-page {
  opacity: 1;
  transform: translateY(calc(-50% - var(--lift-page) * 0.85));
}

.stack-label.is-files {
  color: var(--codex-accent);
  transform: translateY(calc(-50% - var(--lift-files) * 0.85));
}

.stack-label.is-database {
  color: var(--sites-live);
  transform: translateY(calc(-50% - var(--lift-database) * 0.85));
}

.s1 .stack-label.is-files,
.s2 .stack-label.is-database {
  opacity: 1;
  transition-delay: 500ms, 0ms;
}
</style>
