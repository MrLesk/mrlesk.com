---
title: Tonight
hideInToc: true
---

# Tonight

<div class="agenda-rows">

<div class="agenda-row">
  <div class="agenda-time">18:00</div>
  <div>
    <div class="agenda-title">Doors open</div>
    <div class="agenda-note">Food, drinks, and hellos</div>
  </div>
</div>

<div class="agenda-row current">
  <div class="agenda-time">18:30</div>
  <div>
    <div class="agenda-title">Welcome keynote: Codex updates</div>
    <div class="agenda-note">You are here</div>
  </div>
</div>

<div class="agenda-row">
  <div class="agenda-time">18:45</div>
  <div>
    <div class="agenda-title">Lightning talks</div>
    <div class="agenda-note">Builders from this community</div>
  </div>
</div>

<div class="agenda-row">
  <div class="agenda-time">19:30</div>
  <div>
    <div class="agenda-title">Networking</div>
    <div class="agenda-note">Refreshments and good conversation</div>
  </div>
</div>

<div class="agenda-row">
  <div class="agenda-time">21:00</div>
  <div>
    <div class="agenda-title">Wrap-up</div>
    <div class="agenda-note">See you at the next one</div>
  </div>
</div>

</div>

<style>
/* Fixed design-canvas height so the row stack always runs from the title
   down to just above the footer; each row flexes to an equal share, so the
   layout holds whether the evening has 3 items or 8. */
.agenda-rows {
  display: flex;
  flex-direction: column;
  gap: calc(8 * var(--pt));
  margin-top: calc(12 * var(--pt));
  height: calc(374 * var(--pt));
}

.agenda-row {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: calc(90 * var(--pt)) 1fr;
  align-items: center;
  gap: calc(20 * var(--pt));
  background: var(--codex-glass);
  border: 1px solid var(--codex-border);
  border-radius: calc(12 * var(--pt));
  padding: 0 calc(20 * var(--pt));
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.agenda-row.current {
  background: linear-gradient(135deg, rgba(110, 123, 255, 0.9) 0%, rgba(52, 66, 224, 0.9) 100%);
  border-color: rgba(255, 255, 255, 0.24);
}

.agenda-time {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: calc(20 * var(--pt));
  font-weight: 600;
  color: var(--codex-accent);
}

.agenda-row.current .agenda-time {
  color: #ffffff;
}

.agenda-title {
  font-size: calc(19 * var(--pt));
  font-weight: 600;
  line-height: 1.2;
}

.agenda-note {
  font-size: calc(13 * var(--pt));
  color: var(--codex-fg-muted);
  margin-top: calc(2 * var(--pt));
}

.agenda-row.current .agenda-note {
  color: rgba(255, 255, 255, 0.85);
}
</style>
