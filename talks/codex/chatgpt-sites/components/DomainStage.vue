<script setup lang="ts">
import { useSlideSteps } from '../composables/useSlideSteps'
import { useTypedOnStep } from '../composables/useTypewriter'
import { OWN_DOMAIN, SITE_ADDRESS } from '../lib/example-site'

// Slide "Custom domain": the Site's address in the browser bar changes to a domain you own.
//
//   start    the Site at its chatgpt.site address
//   click 1  the settings card comes in, the domain types itself, the two DNS records turn green
//   click 2  the card leaves and the address bar switches to the new domain
//
// The slide's frontmatter must say `clicks: 2`.
const steps = useSlideSteps(2)
const { stepClasses } = steps

/** Slower than a prompt: people should be able to read the domain as it appears. */
const DOMAIN_CHAR_MS = 70

const { shown: typedDomain } = useTypedOnStep(OWN_DOMAIN, 1, steps, DOMAIN_CHAR_MS)

const DNS_RECORDS = ['Prove the domain is yours', 'Point it to your Site']
</script>

<template>
  <div class="domain" :class="stepClasses">
    <div class="domain-copy">
      <p>Start with your Site URL, connect a domain you own when you are ready.</p>
      <p>Give your site a home that feels like you.</p>
    </div>

    <div class="domain-scene">
      <BrowserWindow class="domain-window">
        <template #address>
          <SiteIcon name="lock" class="domain-lock" />
          <!-- Both addresses share one line. Click 2 slides the first out and the second in. -->
          <span class="domain-address">
            <span class="domain-address-site">{{ SITE_ADDRESS }}</span>
            <span class="domain-address-own">{{ OWN_DOMAIN }}</span>
          </span>
          <span class="domain-verified"><SiteIcon name="check" /></span>
          <i class="domain-shine" aria-hidden="true" />
        </template>

        <MiniSite />

        <!-- The Site's settings, as a card over the page. -->
        <div class="domain-card">
          <div class="domain-card-title">Custom domain</div>
          <div class="domain-card-field">
            <span class="domain-card-input">{{ typedDomain }}<i class="domain-card-caret" aria-hidden="true" /></span>
            <span class="domain-card-button">Add domain</span>
          </div>
          <div class="domain-card-label">DNS records</div>
          <div v-for="(record, index) in DNS_RECORDS" :key="record" class="domain-card-record" :style="{ '--order': index }">
            <span class="domain-card-status"><SiteIcon name="check" /></span>
            {{ record }}
          </div>
        </div>
      </BrowserWindow>
    </div>
  </div>
</template>

<style scoped>
.domain {
  display: grid;
  grid-template-columns: calc(250 * var(--pt)) minmax(0, 1fr);
  /* One row that is exactly as tall as the stage. Without it the row grows to fit the map. */
  grid-template-rows: minmax(0, 1fr);
  align-items: center;
  gap: calc(34 * var(--pt));
  height: calc(300 * var(--pt));
}

.domain-copy {
  animation: sites-rise 700ms var(--sites-ease-out) 200ms both;
}

.domain-copy p {
  margin: 0 0 calc(16 * var(--pt)) 0;
  color: var(--codex-fg-muted);
  font-size: calc(16 * var(--pt));
  line-height: 1.45;
}

.domain-scene {
  height: 100%;
  animation: sites-rise 800ms var(--sites-ease-out) 300ms both;
}

.domain-window {
  height: 100%;
  font-size: calc(11.5 * var(--pt));
  transform: rotate(-1.5deg);
}

/* ── The address bar ────────────────────────────────────────────────────── */

.domain-lock {
  flex: none;
  transition: color 400ms ease;
}

.domain-address {
  position: relative;
  flex: 1;
  height: 1.4em;
  overflow: hidden;
  color: var(--codex-fg);
  font-weight: 500;
  line-height: 1.4;
}

.domain-address > span {
  position: absolute;
  inset: 0;
  transition:
    opacity 300ms ease,
    transform 600ms var(--sites-ease-out);
}

.domain-address-own {
  opacity: 0;
  transform: translateY(110%);
}

.domain-verified {
  flex: none;
  display: grid;
  place-items: center;
  width: 1.5em;
  height: 1.5em;
  border-radius: 50%;
  background: var(--sites-live);
  color: #ffffff;
  font-size: 0.8em;
  opacity: 0;
  transform: scale(0.2);
  transition:
    opacity 250ms ease,
    transform 500ms var(--sites-ease-spring);
}

/* A band of light that runs over the bar once, when the new address is in. */
.domain-shine {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -40%;
  width: 35%;
  background: linear-gradient(100deg, transparent, rgba(20, 161, 102, 0.22), transparent);
  opacity: 0;
}

.s2 .domain-lock {
  color: var(--sites-live);
}

.s2 .domain-address-site {
  opacity: 0;
  transform: translateY(-110%);
}

.s2 .domain-address-own {
  opacity: 1;
  transform: none;
  transition-delay: 250ms;
}

.s2 .domain-verified {
  opacity: 1;
  transform: none;
  transition-delay: 700ms;
}

.s2 .domain-shine {
  animation: domain-shine 1100ms ease-out 500ms both;
}

/* ── The settings card ──────────────────────────────────────────────────── */

.domain-card {
  position: absolute;
  top: 9%;
  right: 4%;
  z-index: 2;
  box-sizing: border-box;
  width: 54%;
  padding: 1.1em 1.2em 1.2em;
  border: 1px solid var(--sites-line);
  border-radius: 0.9em;
  background: #ffffff;
  box-shadow: var(--sites-shadow);
  opacity: 0;
  transform: translateX(115%);
  transition:
    opacity 300ms ease,
    transform 700ms var(--sites-ease-out);
}

.s1 .domain-card {
  opacity: 1;
  transform: none;
}

.s2 .domain-card {
  opacity: 0;
  transform: translateX(115%);
}

.domain-card-title {
  font-weight: 600;
}

.domain-card-field {
  display: flex;
  gap: 0.5em;
  margin: 0.7em 0 1em;
}

.domain-card-input {
  flex: 1;
  display: flex;
  align-items: center;
  height: 2.3em;
  padding: 0 0.8em;
  border: 1px solid rgba(52, 66, 224, 0.4);
  border-radius: 0.6em;
  box-shadow: 0 0 0 0.2em var(--codex-accent-soft);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.9em;
}

.domain-card-caret {
  width: 0.1em;
  height: 1.2em;
  margin-left: 0.1em;
  background: var(--codex-accent);
  animation: domain-caret 1.1s steps(1) infinite;
}

.domain-card-button {
  display: flex;
  align-items: center;
  padding: 0 0.9em;
  border-radius: 0.6em;
  background: var(--codex-fg);
  color: #ffffff;
  font-size: 0.85em;
  font-weight: 600;
}

.domain-card-label {
  margin-bottom: 0.4em;
  color: var(--codex-fg-muted);
  font-size: 0.8em;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* The records come in once the domain is typed. Each one checks itself a moment later. */
.domain-card-record {
  display: flex;
  align-items: center;
  gap: 0.6em;
  padding: 0.35em 0;
  font-size: 0.92em;
  opacity: 0;
  transform: translateY(0.5em);
  transition:
    opacity 300ms ease,
    transform 500ms var(--sites-ease-out);
}

.s1 .domain-card-record {
  opacity: 1;
  transform: none;
  transition-delay: calc(1100ms + var(--order) * 200ms);
}

.domain-card-status {
  flex: none;
  display: grid;
  place-items: center;
  width: 1.35em;
  height: 1.35em;
  border: 0.15em solid var(--sites-line);
  border-top-color: var(--codex-accent);
  border-radius: 50%;
  color: transparent;
  font-size: 0.85em;
  animation: domain-status-spin 0.9s linear infinite;
  transition:
    background 300ms ease,
    border-color 300ms ease,
    color 300ms ease;
}

.s1 .domain-card-status {
  border-color: var(--sites-live);
  background: var(--sites-live);
  color: #ffffff;
  transition-delay: calc(2100ms + var(--order) * 600ms);
}

@keyframes domain-shine {
  0% {
    left: -40%;
    opacity: 1;
  }
  100% {
    left: 110%;
    opacity: 1;
  }
}

@keyframes domain-caret {
  0%,
  55% {
    opacity: 1;
  }
  56%,
  100% {
    opacity: 0;
  }
}

@keyframes domain-status-spin {
  to {
    rotate: 360deg;
  }
}
</style>
