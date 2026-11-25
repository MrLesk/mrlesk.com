<script setup lang="ts">
// Slide "Publish and share": publish, share, choose who can visit. The room saw the choices on
// the Visibility slide, so this is the short version for doing it now.
// The slide's one click starts the countdown in the corner; nothing here reacts to it.
// For as long as the slide is on screen, the three steps light up one after another.
const CHOICES = [
  { icon: 'lock', label: 'Just you', isPicked: false },
  { icon: 'people', label: 'Specific people', isPicked: false },
  { icon: 'globe', label: 'Public', isPicked: true },
] as const
</script>

<template>
  <div class="publish">
    <div class="publish-flow">
      <span class="publish-step" style="--order: 0"><i>1</i>Publish</span>
      <SiteIcon name="chevron" class="publish-arrow" />
      <span class="publish-step" style="--order: 1"><i>2</i>Share</span>
      <SiteIcon name="chevron" class="publish-arrow" />
      <div class="publish-choices" style="--order: 2">
        <span class="publish-choices-title"><i>3</i>Who can visit</span>
        <span v-for="choice in CHOICES" :key="choice.label" class="publish-choice" :class="{ 'is-picked': choice.isPicked }">
          <SiteIcon :name="choice.icon" />{{ choice.label }}
          <SiteIcon v-if="choice.isPicked" name="check" class="publish-picked" />
        </span>
      </div>
    </div>

    <p class="publish-task">Send the link to your neighbor.</p>
    <p class="publish-warning">No private data on a public page.</p>
  </div>
</template>

<style scoped>
.publish {
  margin-top: calc(18 * var(--pt));
}

.publish-flow {
  display: flex;
  align-items: center;
  gap: calc(18 * var(--pt));
  animation: sites-rise 800ms var(--sites-ease-out) 200ms both;
}

/* The three steps share one look and take turns in the light: a third of the loop each. */
.publish-step,
.publish-choices {
  border: 1px solid var(--sites-line);
  background: #ffffff;
  animation: publish-turn 4.5s ease-in-out infinite;
  animation-delay: calc(900ms + var(--order) * 1500ms);
}

.publish-step {
  display: flex;
  align-items: center;
  gap: calc(12 * var(--pt));
  padding: calc(14 * var(--pt)) calc(24 * var(--pt)) calc(14 * var(--pt)) calc(14 * var(--pt));
  border-radius: 999px;
  font-size: calc(24 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.02em;
}

.publish-step i,
.publish-choices-title i {
  display: grid;
  place-items: center;
  width: calc(30 * var(--pt));
  height: calc(30 * var(--pt));
  border-radius: 50%;
  background: var(--codex-accent-soft);
  color: var(--codex-accent);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: calc(13 * var(--pt));
  font-style: normal;
  font-weight: 600;
}

.publish-arrow {
  flex: none;
  color: var(--codex-fg-muted);
  font-size: calc(22 * var(--pt));
}

.publish-choices {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: calc(6 * var(--pt));
  padding: calc(14 * var(--pt));
  border-radius: calc(18 * var(--pt));
}

.publish-choices-title {
  display: flex;
  align-items: center;
  gap: calc(12 * var(--pt));
  margin-bottom: calc(4 * var(--pt));
  font-size: calc(18 * var(--pt));
  font-weight: 600;
}

.publish-choice {
  display: flex;
  align-items: center;
  gap: calc(10 * var(--pt));
  padding: calc(7 * var(--pt)) calc(12 * var(--pt));
  border-radius: calc(10 * var(--pt));
  color: var(--codex-fg-muted);
  font-size: calc(16 * var(--pt));
  font-weight: 500;
}

.publish-choice.is-picked {
  background: var(--sites-live-soft);
  color: var(--sites-live);
  font-weight: 600;
}

.publish-picked {
  margin-left: auto;
}

.publish-task {
  margin: calc(28 * var(--pt)) 0 calc(4 * var(--pt)) 0;
  font-size: calc(24 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.02em;
  animation: sites-rise 800ms var(--sites-ease-out) 450ms both;
}

.publish-warning {
  margin: 0;
  color: var(--codex-fg-muted);
  font-size: calc(15 * var(--pt));
  animation: sites-rise 800ms var(--sites-ease-out) 550ms both;
}

@keyframes publish-turn {
  0%,
  33%,
  100% {
    border-color: var(--sites-line);
    box-shadow: 0 0 0 0 rgba(52, 66, 224, 0);
  }
  6%,
  27% {
    border-color: var(--codex-accent);
    box-shadow: 0 calc(10 * var(--pt)) calc(26 * var(--pt)) rgba(52, 66, 224, 0.2);
  }
}
</style>
