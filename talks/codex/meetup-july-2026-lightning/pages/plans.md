---
title: It also made the build plans
---

# It also made the build plans

<div class="plans-grid">

<figure>
  <figcaption><span>01</span> How to level it</figcaption>
  <img class="plan-page" src="/base-structure-plan.png" alt="Codex build plan showing the cross-beam grid, support heights, and connection details" />
</figure>

<figure>
  <figcaption><span>02</span> Where to cut the fence</figcaption>
  <img class="plan-page" src="/fence-layout-plan.png" alt="Codex build plan showing the fence layout, elevations, and panel cutting schedule" />
</figure>

</div>

<!--
Then I asked for build instructions.
Codex worked out the board layout, support heights, cuts, and fastening details.
The important part was that I could take these plans outside and actually build from them.
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
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--codex-fg);
}
</style>
