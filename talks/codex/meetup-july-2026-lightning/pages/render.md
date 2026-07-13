---
title: The render
---

<div class="render-grid">

<div class="render-copy">
  <div class="render-eyebrow">Before buying a single board</div>
  <h1>Pitch the outcome, not the parts</h1>
  <p class="lede">Codex used the approved plan and the real storefront to render the finished terrace.</p>
  <div class="codex-callout">Mom approved the direction.</div>
</div>

<img class="shot render-shot" src="/codex-render.png" alt="Codex render of the planned Schanigarten with a timber deck, tables, chairs, and planters" />

</div>

<!--
Before spending a single euro, I asked Codex to render the final result with the imagen tool, based on the approved plan and the real storefront.
That picture is what convinced my mom, the CEO of this project.
-->

<style>
.render-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.88fr) minmax(0, 1.12fr);
  align-items: center;
  gap: calc(34 * var(--pt));
  min-height: calc(458 * var(--pt));
}

.render-copy h1 {
  margin: calc(14 * var(--pt)) 0 calc(18 * var(--pt));
  font-size: calc(46 * var(--pt));
  line-height: 1.02;
}

.render-eyebrow {
  color: var(--codex-accent);
  font-size: calc(12 * var(--pt));
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.render-copy .codex-callout {
  margin-top: calc(24 * var(--pt));
}

.render-shot {
  height: calc(430 * var(--pt));
  object-fit: cover;
  object-position: center 48%;
}
</style>
