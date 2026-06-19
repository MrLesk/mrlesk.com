---
title: Save the date
level: 1
hideInToc: true
---

<div class="save-date-slide">

<div class="save-date-copy">
  <div class="save-date-kicker">Codex Community Meetup</div>
  <h1>Save the date!</h1>
  <h2>Thursday, July 16, 2026 - 18:00</h2>
  <p>Our next meetup is at <strong>Volee</strong> in Prater.</p>
</div>

<div class="save-date-panel">
  <img src="/codex-logo.gif" alt="Codex" />
  <div class="save-date-day">16</div>
  <div class="save-date-month">July</div>
  <div class="save-date-place">Volee<br />Prater</div>
</div>

</div>

<style>
.save-date-slide {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(calc(250 * var(--pt)), 0.55fr);
  align-items: center;
  gap: calc(48 * var(--pt));
  margin-top: calc(88 * var(--pt));
}

.save-date-copy {
  max-width: calc(760 * var(--pt));
}

.save-date-kicker {
  color: var(--codex-accent);
  font-size: calc(18 * var(--pt));
  font-weight: 700;
  letter-spacing: 0;
  margin-bottom: calc(38 * var(--pt));
}

.save-date-copy h1 {
  font-size: calc(72 * var(--pt));
  line-height: 0.95;
  margin: 0 0 calc(18 * var(--pt));
}

.save-date-copy h2 {
  font-size: calc(28 * var(--pt));
  line-height: 1.15;
  margin: 0 0 calc(34 * var(--pt));
}

.save-date-copy p {
  color: var(--codex-text);
  font-size: calc(24 * var(--pt));
  line-height: 1.28;
  margin: 0;
}

.save-date-panel {
  min-height: calc(360 * var(--pt));
  border: 1px solid var(--codex-border);
  border-radius: calc(8 * var(--pt));
  padding: calc(24 * var(--pt));
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(244, 247, 255, 0.95));
  box-shadow: 0 calc(14 * var(--pt)) calc(38 * var(--pt)) rgba(30, 42, 120, 0.1);
}

.save-date-panel img {
  width: calc(72 * var(--pt));
  height: calc(72 * var(--pt));
  object-fit: contain;
  margin-bottom: calc(26 * var(--pt));
}

.save-date-day {
  color: var(--codex-accent);
  font-size: calc(92 * var(--pt));
  font-weight: 760;
  line-height: 0.88;
}

.save-date-month {
  font-size: calc(31 * var(--pt));
  font-weight: 720;
  line-height: 1;
  margin-top: calc(12 * var(--pt));
}

.save-date-place {
  color: var(--codex-fg-muted);
  font-size: calc(20 * var(--pt));
  font-weight: 600;
  line-height: 1.22;
  margin-top: calc(26 * var(--pt));
}
</style>
