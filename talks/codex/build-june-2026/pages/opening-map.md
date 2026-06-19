---
title: House rules
---

# House rules

<p class="house-intro">
  Build time uses one room: <strong>Classroom</strong>. Festsaal 2 stays for food and shared moments.
</p>

<div class="room-grid">

<div class="room-card featured">
  <div class="room-eyebrow">Festsaal 2 · this room</div>
  <div class="room-title">Food and shared moments</div>
  <ul>
    <li>Breakfast and Keynote</li>
    <li>Lunch break</li>
    <li>Presentations, closing, and final networking</li>
  </ul>
</div>

<div class="room-card">
  <div class="room-eyebrow">Classroom</div>
  <div class="room-title">Focused build time</div>
  <ul>
    <li>Pre-selected track groups after the kickoff</li>
    <li>Mentor help and peer debugging</li>
    <li>Small demos, reviews, and iteration</li>
  </ul>
</div>

</div>

<div class="rules-grid">

<div class="rule-item">
  <strong>Ask early</strong>
  <span>If you are blocked, grab a mentor or someone nearby.</span>
</div>

<div class="rule-item">
  <strong>Keep paths clear</strong>
  <span>Watch laptop chargers, bags, and food queues so people can move safely.</span>
</div>

<div class="rule-item">
  <strong>Respect each other</strong>
  <span>If you need assistance, talk to a staff member right away.</span>
</div>

<div class="rule-item">
  <strong>No food in the classroom</strong>
  <span>Water bottles are fine, but please leave food in Festsaal 2.</span>
</div>

</div>

<style>
.house-intro {
  margin: calc(8 * var(--pt)) 0 0 0;
  color: var(--codex-fg-muted);
  font-size: calc(18 * var(--pt));
  line-height: 1.35;
}

.house-intro strong {
  color: var(--codex-fg);
  font-weight: 650;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(18 * var(--pt));
  margin-top: calc(22 * var(--pt));
}

.room-card {
  min-height: calc(190 * var(--pt));
  background: #ffffff;
  border: 1px solid var(--codex-border);
  border-radius: calc(14 * var(--pt));
  padding: calc(22 * var(--pt));
  display: flex;
  flex-direction: column;
  gap: calc(10 * var(--pt));
  box-shadow: 0 calc(8 * var(--pt)) calc(24 * var(--pt)) rgba(20, 14, 80, 0.08);
}

.room-card.featured {
  background: linear-gradient(135deg, var(--codex-grad-1) 0%, var(--codex-grad-2) 100%);
  border-color: transparent;
  color: #ffffff;
}

.room-eyebrow {
  color: var(--codex-accent);
  font-size: calc(12 * var(--pt));
  font-weight: 650;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.room-card.featured .room-eyebrow {
  color: rgba(255, 255, 255, 0.82);
}

.room-title {
  color: var(--codex-fg);
  font-size: calc(28 * var(--pt));
  font-weight: 650;
  letter-spacing: 0;
  line-height: 1.1;
}

.room-card.featured .room-title {
  color: #ffffff;
}

.room-card ul {
  margin: calc(4 * var(--pt)) 0 0 0;
  padding-left: calc(18 * var(--pt));
  color: var(--codex-fg);
  font-size: calc(15 * var(--pt));
  line-height: 1.38;
}

.room-card.featured ul {
  color: rgba(255, 255, 255, 0.92);
}

.room-card li + li {
  margin-top: calc(5 * var(--pt));
}

.rules-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: calc(14 * var(--pt));
  margin-top: calc(18 * var(--pt));
}

.rule-item {
  min-height: calc(118 * var(--pt));
  border: 1px solid rgba(3, 10, 24, 0.08);
  border-radius: calc(12 * var(--pt));
  padding: calc(15 * var(--pt));
  display: flex;
  flex-direction: column;
  gap: calc(7 * var(--pt));
  background: rgba(52, 66, 224, 0.045);
}

.rule-item strong {
  color: var(--codex-fg);
  font-size: calc(16 * var(--pt));
  line-height: 1.1;
}

.rule-item span {
  color: var(--codex-fg-muted);
  font-size: calc(12 * var(--pt));
  line-height: 1.35;
}
</style>
