<script setup lang="ts">
import { SITE_HEADING, SITE_NAME } from '../lib/example-site'

// The example Site the whole talk follows: a map of everyone at the meetup.
// It goes inside a <BrowserWindow>. Sizes are in em, so it scales with the window.
withDefaults(defineProps<{
  /** Shows the groups of people on the map. */
  pins?: boolean
  /** Makes the map look live, with people who keep arriving. */
  busy?: boolean
}>(), {
  pins: true,
  busy: false,
})
</script>

<template>
  <div class="mini-site">
    <div class="mini-site-nav">
      <i class="mini-site-logo" aria-hidden="true" />
      <span>{{ SITE_NAME }}</span>
    </div>
    <div class="mini-site-heading">{{ SITE_HEADING }}</div>
    <div class="mini-site-map">
      <MapArt :pins="pins" :busy="busy" />
    </div>
  </div>
</template>

<style scoped>
.mini-site {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  padding: 0.9em 1.1em 1.1em;
  background: #ffffff;
  line-height: 1.2;
}

.mini-site-nav {
  flex: none;
  display: flex;
  align-items: center;
  gap: 0.5em;
  color: var(--codex-fg-muted);
  font-size: 0.8em;
  font-weight: 500;
}

.mini-site-logo {
  width: 1.1em;
  height: 1.1em;
  border-radius: 0.3em;
  background: linear-gradient(135deg, var(--codex-grad-1), var(--codex-grad-2));
}

.mini-site-heading {
  flex: none;
  margin: 0.55em 0 0.6em;
  font-size: 1.5em;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.mini-site-map {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--sites-line);
  border-radius: 0.7em;
}
</style>
