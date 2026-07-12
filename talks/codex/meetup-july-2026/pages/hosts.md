---
title: VAIE & Volee
hideInToc: true
---

<div class="hosts-duo">

<div class="host-card hosts-panel">
  <div class="host-eyebrow">Organized by</div>
  <div class="host-logo">
    <span class="vaie-mark hosts-mark">
      <span class="vaie-text">
        <span class="vaie-line-1">
          <span class="vaie-vienna">Vienna</span>
          <span class="vaie-ai">AI</span>
        </span>
        <span class="vaie-eng">Engineering</span>
      </span>
      <img class="vaie-logo" src="/vaie-logo.png" alt="" />
    </span>
  </div>
  <div class="host-qr">
    <SlideQrCode url="https://www.meetup.com/vienna-ai-engineering/" :size="120" />
  </div>
  <div class="host-footer">
    <strong>Join the group &amp; catch our next events</strong>
    <a href="https://www.meetup.com/vienna-ai-engineering/" target="_blank">meetup.com/vienna-ai-engineering</a>
  </div>
</div>

<div class="host-card volee-panel">
  <div class="host-eyebrow">Venue partner</div>
  <div class="host-logo">
    <img class="volee-script" src="/volee-logo-white.svg" alt="Volee" />
  </div>
  <div class="host-qr">
    <SlideQrCode url="https://www.volee.at" :size="120" />
  </div>
  <div class="host-footer">
    <strong>Thank you for hosting us tonight</strong>
    <a href="https://www.volee.at" target="_blank">volee.at</a>
  </div>
</div>

</div>

<style>
/* Two brand cards, identical skeleton: eyebrow / logo / QR / footer CTA.
   Fixed row heights keep every band aligned across both cards. */
.hosts-duo {
  display: grid;
  grid-template-columns: calc(300 * var(--pt)) calc(300 * var(--pt));
  justify-content: space-between;
  align-items: stretch;
  max-width: calc(850 * var(--pt));
  margin: 0 auto;
}

.host-card {
  display: grid;
  grid-template-rows: calc(18 * var(--pt)) calc(92 * var(--pt)) auto calc(46 * var(--pt));
  row-gap: calc(16 * var(--pt));
  justify-items: center;
  align-items: center;
  border-radius: calc(16 * var(--pt));
  padding: calc(24 * var(--pt));
  box-shadow: 0 calc(14 * var(--pt)) calc(40 * var(--pt)) rgba(0, 0, 0, 0.55);
}

.host-eyebrow {
  font-size: calc(11 * var(--pt));
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-weight: 600;
  align-self: center;
}

.host-logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.host-footer {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: calc(3 * var(--pt));
  align-self: center;
}

.host-footer strong {
  font-size: calc(14 * var(--pt));
  font-weight: 650;
}

.host-footer a {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: calc(12 * var(--pt));
  border-bottom: none !important;
}

/* Left: VAIE on soft paper. */
.hosts-panel {
  background: #edeff6;
}

.hosts-panel .host-eyebrow {
  color: var(--codex-accent-deep);
}

.hosts-mark {
  gap: calc(12 * var(--pt));
  margin: 0;
}

.hosts-mark .vaie-line-1,
.hosts-mark .vaie-eng {
  font-size: calc(22 * var(--pt));
}

.hosts-mark .vaie-text {
  gap: calc(4 * var(--pt));
}

.hosts-mark .vaie-logo {
  height: calc(56 * var(--pt));
}

.hosts-mark .vaie-vienna { color: #6c6d70; }
.hosts-mark .vaie-ai,
.hosts-mark .vaie-eng { color: #00275c; }

.hosts-panel .host-footer strong {
  color: #10162c;
}

.hosts-panel .host-footer a {
  color: #3442e0;
}

/* Right: Volee on their brand red (#B81516, sampled from their site). */
.volee-panel {
  background: #b81516;
}

.volee-panel .host-eyebrow {
  color: rgba(255, 255, 255, 0.85);
}

.volee-script {
  width: calc(215 * var(--pt));
  height: auto;
  display: block;
}

.volee-panel .host-footer strong {
  color: rgba(255, 255, 255, 0.95);
}

.volee-panel .host-footer a {
  color: #ffffff !important;
}
</style>

<!--
VAIE: Vienna AI Engineering. Bogdan and I run this community; the Codex meetups are VAIE events.
We talk about the art and craftsmanship of creating reliable AI-powered applications that users love.
Scan the left QR to join the meetup group and hear about the next ones first.
And a big thank you to Volee for opening their doors in Prater for us tonight.
-->
