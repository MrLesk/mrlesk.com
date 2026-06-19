---
title: WU Vienna
hideInToc: true
---

<div class="sponsor-grid wu-sponsor-grid">

<div class="sponsor-text">

  <div class="sponsor-eyebrow">Venue partner</div>
  <img class="sponsor-logo wu-logo" src="/wu-logo.png" alt="WU Vienna" />

  <h2>Thank you, WU</h2>

  <p>
    WU brings students, researchers, and partners together on Campus WU for business, economics, and the communities building what comes next.
  </p>

  <p class="sponsor-thanks">
    Thank you for hosting Codex Build Vienna and giving builders the space to learn, collaborate, and ship together.
  </p>

</div>

<div class="wu-facts" aria-label="WU facts">
  <div class="wu-fact">
    <strong>21,833</strong>
    <span>students</span>
  </div>
  <div class="wu-fact">
    <strong>2,603</strong>
    <span>employees</span>
  </div>
  <div class="wu-fact">
    <strong>90,000</strong>
    <span>m2 Campus WU premises</span>
  </div>
  <div class="wu-fact">
    <strong>240</strong>
    <span>partner universities</span>
  </div>
</div>

</div>

<style>
.wu-sponsor-grid {
  grid-template-columns: 1.12fr 1fr;
  gap: calc(36 * var(--pt));
}

.wu-sponsor-grid .sponsor-text .wu-logo {
  height: calc(74 * var(--pt));
  margin-bottom: calc(24 * var(--pt));
}

.wu-sponsor-grid .sponsor-text h2 {
  margin-bottom: calc(12 * var(--pt));
}

.wu-facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(14 * var(--pt));
}

.wu-fact {
  min-height: calc(104 * var(--pt));
  border: 1px solid var(--codex-border);
  border-radius: calc(14 * var(--pt));
  padding: calc(18 * var(--pt));
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: calc(7 * var(--pt));
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(247, 249, 255, 0.9));
  box-shadow: 0 calc(8 * var(--pt)) calc(24 * var(--pt)) rgba(20, 14, 80, 0.08);
}

.wu-fact strong {
  color: var(--codex-accent);
  font-size: calc(31 * var(--pt));
  line-height: 1;
  font-weight: 650;
  letter-spacing: 0;
}

.wu-fact span {
  color: var(--codex-fg-muted);
  font-size: calc(13 * var(--pt));
  line-height: 1.25;
  font-weight: 500;
}
</style>
