<script setup lang="ts">
import { ref } from 'vue'
import { SITE_HEADING, SITE_NAME } from '../lib/example-site'

// Slide "Live demo": a frame around the participant map.
//
// By default the frame shows a drawn map that links to the live Site. With `embed` it loads
// the live Site inside the slide. That only works when the Site allows this deck's address
// to embed it, so read "The live demo" in README.md before turning it on.
withDefaults(defineProps<{
  /** Address of the live Site. */
  url: string
  /** Loads the live Site inside the slide instead of the drawn map. */
  embed?: boolean
}>(), {
  embed: false,
})

/** How many grey placeholder rows the drawn city list shows. */
const DRAWN_LIST_ROWS = 5

const isExpanded = ref(false)
/** Changing this number makes Vue create the iframe again, which reloads the Site. */
const reloadCount = ref(0)

// A clicked button keeps the keyboard focus, and Space would then press it again instead of
// moving to the next slide. Giving the focus back avoids that.
function releaseFocus(event: MouseEvent): void {
  if (event.currentTarget instanceof HTMLElement) event.currentTarget.blur()
}

function toggleExpanded(event: MouseEvent): void {
  isExpanded.value = !isExpanded.value
  releaseFocus(event)
}

function reload(event: MouseEvent): void {
  reloadCount.value++
  releaseFocus(event)
}
</script>

<template>
  <div class="live-site" :class="{ 'is-expanded': isExpanded }">
    <div class="live-site-bar">
      <span class="live-site-status"><i aria-hidden="true" />Participant map · live site</span>
      <span class="live-site-tools">
        <a class="live-site-tool" :href="url" target="_blank" rel="noreferrer" aria-label="Open the Site in a new tab">
          <SiteIcon name="external" />
        </a>
        <button class="live-site-tool" type="button" @click="toggleExpanded">
          <SiteIcon name="expand" />{{ isExpanded ? 'Collapse' : 'Expand' }}
        </button>
        <button v-if="embed" class="live-site-tool" type="button" aria-label="Reload the Site" @click="reload">
          <SiteIcon name="reload" />
        </button>
      </span>
    </div>

    <div class="live-site-body">
      <iframe
        v-if="embed"
        :key="reloadCount"
        class="live-site-frame"
        :src="url"
        title="Participant map"
        allow="clipboard-read; clipboard-write; fullscreen; geolocation"
        referrerpolicy="no-referrer-when-downgrade"
      />
      <a v-else class="live-site-poster" :href="url" target="_blank" rel="noreferrer">
        <span class="poster-head">
          <span class="poster-site"><i aria-hidden="true" />{{ SITE_NAME }}</span>
          <span class="poster-heading">{{ SITE_HEADING }}</span>
        </span>
        <span class="poster-map"><MapArt busy /></span>
        <span class="poster-list" aria-hidden="true">
          <span class="poster-list-title">Where we’re from</span>
          <span v-for="row in DRAWN_LIST_ROWS" :key="row" class="poster-list-row"><i /><b /><b /></span>
        </span>
        <span class="live-site-open">Open the live map<SiteIcon name="external" /></span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.live-site {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(350 * var(--pt));
  border: 1px solid var(--sites-line);
  border-radius: calc(14 * var(--pt));
  background: #ffffff;
  box-shadow: var(--sites-shadow);
  animation: sites-rise 800ms var(--sites-ease-out) 200ms both;
}

/* Expanded: the frame covers the whole slide. */
.live-site.is-expanded {
  position: absolute;
  inset: 0;
  z-index: 20;
  height: auto;
  border: 0;
  border-radius: 0;
}

.live-site-bar {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(8 * var(--pt)) calc(14 * var(--pt));
  border-bottom: 1px solid var(--sites-line);
  background: #fafbfe;
  font-size: calc(12 * var(--pt));
}

.live-site-status {
  display: flex;
  align-items: center;
  gap: calc(8 * var(--pt));
  color: var(--codex-fg-muted);
  font-weight: 500;
}

.live-site-status i {
  width: calc(7 * var(--pt));
  height: calc(7 * var(--pt));
  border-radius: 50%;
  background: var(--sites-live);
  animation: live-site-dot 1.6s ease-in-out infinite;
}

.live-site-tools {
  display: flex;
  align-items: center;
  gap: calc(6 * var(--pt));
}

/* The theme underlines every link. The tools are buttons, so they drop the line. */
.live-site-tool {
  display: flex;
  align-items: center;
  gap: calc(6 * var(--pt));
  padding: calc(5 * var(--pt)) calc(8 * var(--pt));
  border: 0 !important;
  border-radius: calc(7 * var(--pt));
  background: transparent;
  color: var(--codex-accent);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background 200ms ease;
}

.live-site-tool:hover {
  background: var(--codex-accent-soft);
}

.live-site-body {
  position: relative;
  flex: 1;
  min-height: 0;
}

.live-site-frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

/* The drawn Site: heading and map on the left, the list of cities on the right. */
.live-site-poster {
  display: grid;
  grid-template-columns: minmax(0, 1fr) calc(200 * var(--pt));
  grid-template-rows: auto minmax(0, 1fr);
  box-sizing: border-box;
  height: 100%;
  border: 0 !important;
  color: var(--codex-fg);
}

.poster-head {
  display: flex;
  flex-direction: column;
  gap: calc(6 * var(--pt));
  padding: calc(14 * var(--pt)) calc(18 * var(--pt)) calc(10 * var(--pt));
}

.poster-site {
  display: flex;
  align-items: center;
  gap: calc(7 * var(--pt));
  color: var(--codex-fg-muted);
  font-size: calc(11 * var(--pt));
  font-weight: 500;
}

.poster-site i {
  width: calc(12 * var(--pt));
  height: calc(12 * var(--pt));
  border-radius: calc(3 * var(--pt));
  background: linear-gradient(135deg, var(--codex-grad-1), var(--codex-grad-2));
}

.poster-heading {
  font-size: calc(22 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.poster-map {
  overflow: hidden;
  margin: 0 0 calc(16 * var(--pt)) calc(18 * var(--pt));
  border: 1px solid var(--sites-line);
  border-radius: calc(12 * var(--pt));
}

.poster-list {
  grid-row: 1 / span 2;
  grid-column: 2;
  display: flex;
  flex-direction: column;
  gap: calc(14 * var(--pt));
  margin-left: calc(16 * var(--pt));
  padding: calc(18 * var(--pt)) calc(16 * var(--pt));
  border-left: 1px solid var(--sites-line);
}

.poster-list-title {
  font-size: calc(13 * var(--pt));
  font-weight: 600;
}

/* A row of the list: a round count and two lines of text, all as grey placeholders. */
.poster-list-row {
  display: grid;
  grid-template-columns: calc(26 * var(--pt)) 1fr;
  column-gap: calc(10 * var(--pt));
  row-gap: calc(5 * var(--pt));
  align-items: center;
}

.poster-list-row i {
  grid-row: 1 / span 2;
  width: calc(26 * var(--pt));
  height: calc(26 * var(--pt));
  border-radius: 50%;
  background: var(--codex-accent-soft);
}

.poster-list-row b {
  height: calc(7 * var(--pt));
  border-radius: calc(4 * var(--pt));
  background: #e6e9f2;
}

.poster-list-row b:last-child {
  width: 55%;
  background: #eff1f7;
}

.live-site-open {
  position: absolute;
  bottom: calc(34 * var(--pt));
  left: calc((100% - 200 * var(--pt)) / 2);
  display: flex;
  align-items: center;
  gap: calc(8 * var(--pt));
  padding: calc(9 * var(--pt)) calc(18 * var(--pt));
  border-radius: 999px;
  background: var(--codex-accent);
  box-shadow: 0 calc(10 * var(--pt)) calc(26 * var(--pt)) rgba(52, 66, 224, 0.4);
  color: #ffffff;
  font-size: calc(14 * var(--pt));
  font-weight: 600;
  translate: -50% 0;
  animation: live-site-open 2.4s ease-in-out infinite;
}

@keyframes live-site-dot {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(20, 161, 102, 0.5);
  }
  50% {
    box-shadow: 0 0 0 calc(5 * var(--pt)) rgba(20, 161, 102, 0);
  }
}

@keyframes live-site-open {
  0%,
  100% {
    translate: -50% 0;
  }
  50% {
    translate: -50% calc(-4 * var(--pt));
  }
}
</style>
