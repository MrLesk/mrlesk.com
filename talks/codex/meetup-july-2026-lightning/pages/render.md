---
title: Before buying anything, I showed my mom this
---

<div class="render-grid">

<div class="render-copy">
  <div class="render-eyebrow">Before buying anything</div>
  <h1>Before buying anything, I showed my mom this</h1>
  <p class="lede">Codex used the approved plan and a photo of the storefront to make this render.</p>
  <div class="codex-callout">Mom said yes.</div>
</div>

<img class="shot render-shot" src="/codex-render.png" alt="Codex render of the planned Schanigarten with a timber deck, tables, chairs, and planters" />

</div>

<!--
Before spending any money, I asked Codex to render the terrace using the approved plan and a photo of the storefront.
This was much easier to discuss than a list of boards. Mom said yes.
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
