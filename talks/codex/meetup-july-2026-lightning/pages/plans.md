---
title: The build plans
---

# IKEA instructions, custom made

<div class="plans-grid">

<figure>
  <figcaption><span>01</span> Level the platform</figcaption>
  <img class="shot plan-page" src="/base-structure-plan.png" alt="Codex build plan showing the cross-beam grid, support heights, and connection details" />
</figure>

<figure>
  <figcaption><span>02</span> Cut the boundary</figcaption>
  <img class="shot plan-page" src="/fence-layout-plan.png" alt="Codex build plan showing the fence layout, elevations, and panel cutting schedule" />
</figure>

</div>

<!--
Codex turned the requirements into step-by-step build plans: cut schedules, exploded views, fastening details.
The details matter: 12 rows of boards, each row one 3 m plus one 2 m board. Support heights of 12 mm on the sidewalk side and 32 mm on the street side so the deck lands flush with the curb. Fence cut to 1800 + 1800 + 1400 in front and 1700 on each side.
I never had to figure out a step on my own.
-->

<style>
.plans-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(18 * var(--pt));
  margin-top: calc(12 * var(--pt));
}

.plans-grid figure {
  margin: 0;
}

.plans-grid figcaption {
  display: flex;
  align-items: center;
  gap: calc(8 * var(--pt));
  margin-bottom: calc(8 * var(--pt));
  color: var(--codex-fg);
  font-size: calc(14 * var(--pt));
  font-weight: 600;
}

.plans-grid figcaption span {
  color: var(--codex-accent);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: calc(11 * var(--pt));
  letter-spacing: 0.08em;
}

.plan-page {
  height: calc(350 * var(--pt));
  object-fit: contain;
  background: #ffffff;
}
</style>
