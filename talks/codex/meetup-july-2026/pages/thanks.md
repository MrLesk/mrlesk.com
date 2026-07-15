---
layout: thanks
title: Thank you
contact: 'Volee · Vienna AI Engineering · OpenAI · thank you for making tonight happen'
hideInToc: true
---

<div class="thanks-share">

<div class="thanks-copy">
  <h1>Thank you</h1>
  <p>To our speakers and everyone who joined us tonight: thank you for the questions, ideas, and energy.</p>
</div>

<SlideQrCard class="thanks-slides-card" url="https://mrlesk.com/talks/codex/meetup-july-2026/" title="Scan for the slides" subtitle="Open the keynote in your browser" aria-label="Open the keynote slides"></SlideQrCard>

</div>

<style>
.thanks-share {
  display: grid;
  grid-template-columns: minmax(0, 1fr) calc(270 * var(--pt));
  align-items: center;
  gap: calc(60 * var(--pt));
  width: 100%;
}

.thanks-copy {
  min-width: 0;
}

.thanks-slides-card {
  justify-self: end;
  margin-right: calc(16 * var(--pt));
}

:global(.slidev-layout.thanks .thanks-mark) {
  right: calc(56 * var(--pt));
}
</style>

<!--
The QR points to the deployed keynote, not the lightning talk:
https://mrlesk.com/talks/codex/meetup-july-2026/
-->
