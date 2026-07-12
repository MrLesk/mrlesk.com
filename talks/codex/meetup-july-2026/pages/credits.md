---
title: One more thing
hideInToc: true
---

<div class="credits-slide">

<div class="credits-copy">
  <div class="credits-kicker">One more thing…</div>
  <h1>€100 in Codex credits</h1>
</div>

<div class="credits-qr">
  <!-- Replace the placeholder below with the real QR:
       drop credits-qr.png into ./public and swap in
       <img src="/credits-qr.png" alt="Codex credits QR code" /> -->
  <div class="credits-qr-placeholder">QR</div>
  <div class="credits-qr-caption">
    <strong>Scan to claim</strong>
    <span>One per attendee · tonight only</span>
  </div>
</div>

</div>

<style>
.credits-slide {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(calc(240 * var(--pt)), 0.55fr);
  align-items: center;
  gap: calc(48 * var(--pt));
  margin-top: calc(74 * var(--pt));
}

.credits-kicker {
  color: var(--codex-accent);
  font-size: calc(18 * var(--pt));
  font-weight: 700;
  margin-bottom: calc(30 * var(--pt));
}

.credits-copy h1 {
  font-size: calc(64 * var(--pt));
  line-height: 0.98;
  margin: 0 0 calc(22 * var(--pt));
  color: #ffffff;
  text-shadow: 0 calc(2 * var(--pt)) calc(28 * var(--pt)) rgba(0, 0, 0, 0.6);
}

/* White panel on purpose: QR codes want a light quiet zone to scan
   reliably from across the room. */
.credits-qr {
  background: #ffffff;
  border-radius: calc(16 * var(--pt));
  padding: calc(24 * var(--pt));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(14 * var(--pt));
  box-shadow: 0 calc(14 * var(--pt)) calc(44 * var(--pt)) rgba(0, 0, 0, 0.55);
}

.credits-qr img,
.credits-qr-placeholder {
  width: calc(190 * var(--pt));
  height: calc(190 * var(--pt));
}

.credits-qr img {
  display: block;
  image-rendering: pixelated;
}

.credits-qr-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  border: calc(3 * var(--pt)) dashed rgba(16, 22, 44, 0.28);
  border-radius: calc(10 * var(--pt));
  color: rgba(16, 22, 44, 0.4);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: calc(30 * var(--pt));
  font-weight: 600;
  letter-spacing: 0.1em;
}

.credits-qr-caption {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: calc(2 * var(--pt));
}

.credits-qr-caption strong {
  color: #10162c;
  font-size: calc(15 * var(--pt));
  font-weight: 650;
}

.credits-qr-caption span {
  color: rgba(16, 22, 44, 0.6);
  font-size: calc(12 * var(--pt));
}
</style>

<!--
Our thank-you for building with us tonight.
Scan, redeem on your account, and ship something before the challenge closes on Tuesday.
-->
