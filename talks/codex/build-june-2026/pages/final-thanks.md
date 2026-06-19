---
title: Thank you
level: 1
hideInToc: true
---

<div class="final-thanks">

<div>
  <div class="final-thanks-eyebrow">Thank you</div>
  <h1>Codex: you can just build things!</h1>
</div>

<div class="final-thanks-grid">
  <div class="final-thanks-card">
    <div class="final-thanks-label">WU</div>
    <div class="final-thanks-title">Thank you for hosting</div>
    <p>For giving Codex Build Vienna the space to meet, learn, and ship together.</p>
  </div>

  <div class="final-thanks-card">
    <div class="final-thanks-label">VAIE</div>
    <div class="final-thanks-title">Thank you for organizing</div>
    <p>For helping make the day real and bringing the builder community together.</p>
  </div>

  <div class="final-thanks-card">
    <div class="final-thanks-label">OpenAI</div>
    <div class="final-thanks-title">Thank you for sponsoring</div>
    <p>For supporting the event and the people experimenting with Codex today.</p>
  </div>

  <div class="final-thanks-card participant-card">
    <div class="final-thanks-label">Participants</div>
    <div class="final-thanks-title">The biggest thank you to YOU</div>
    <p>For showing up, building, asking questions, and making this community useful.</p>
  </div>
</div>

</div>

<style>
.final-thanks {
  display: flex;
  flex-direction: column;
  gap: calc(28 * var(--pt));
  margin-top: calc(88 * var(--pt));
}

.final-thanks-eyebrow {
  color: var(--codex-accent);
  font-size: calc(18 * var(--pt));
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
  margin-bottom: calc(12 * var(--pt));
}

.final-thanks h1 {
  max-width: calc(860 * var(--pt));
  font-size: calc(52 * var(--pt));
  line-height: 0.98;
  margin: 0;
}

.final-thanks-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: calc(14 * var(--pt));
}

.final-thanks-card {
  min-height: calc(168 * var(--pt));
  border: 1px solid var(--codex-border);
  border-radius: calc(8 * var(--pt));
  padding: calc(20 * var(--pt));
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background: white;
}

.final-thanks-label {
  color: var(--codex-muted);
  font-size: calc(10 * var(--pt));
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
  margin-bottom: calc(14 * var(--pt));
}

.final-thanks-title {
  font-size: calc(20 * var(--pt));
  font-weight: 750;
  line-height: 1.1;
  margin-bottom: calc(10 * var(--pt));
}

.final-thanks-card p {
  color: var(--codex-text);
  font-size: calc(13 * var(--pt));
  line-height: 1.35;
  margin: 0;
}

.participant-card {
  background: linear-gradient(135deg, var(--codex-accent), #2f43dd);
  border-color: transparent;
  color: white;
}

.participant-card .final-thanks-label,
.participant-card p {
  color: rgba(255, 255, 255, 0.84);
}
</style>
