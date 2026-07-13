---
title: The shopping list
---

# Codex made the shopping cart

<div class="shopping-proof">

<div class="shopping-copy">
  <div class="shopping-total">EUR 1,355.36</div>
  <div class="shopping-total-label">total material cost</div>

  <div class="shopping-fact">
    <strong>EUR 909.55</strong>
    <span>structure & deck</span>
  </div>

  <div class="shopping-fact">
    <strong>EUR 445.81</strong>
    <span>walls & fence</span>
  </div>

  <div class="shopping-fact">
    <strong>30+ linked items</strong>
    <span>Quantities, unit prices, alternatives—and a reason for every part.</span>
  </div>
</div>

<img class="shot materials-shot" src="/materials-list.png" alt="Codex-generated materials list with products, quantities, prices, links, and reasons" />

</div>

<p class="shopping-note">Priced May 14 · availability checked across Vienna stores</p>

<!--
Codex researched every part with quantities, prices, direct product links, and which Vienna shops had stock: OBI, Hornbach, Bauhaus.
It also explained why every item was there. When something was unavailable it found an alternative, like Bautenschutzmatte cut into pads when the small Auflagepads were gone.
Delivery, cutting service, and tools were not included.
-->

<style>
.shopping-proof {
  display: grid;
  grid-template-columns: minmax(0, 0.62fr) minmax(0, 1.38fr);
  align-items: center;
  gap: calc(26 * var(--pt));
  margin-top: calc(14 * var(--pt));
}

.shopping-total {
  color: var(--codex-accent);
  font-size: calc(40 * var(--pt));
  font-weight: 700;
  line-height: 1;
}

.shopping-total-label {
  margin-top: calc(6 * var(--pt));
  color: var(--codex-fg-muted);
  font-size: calc(14 * var(--pt));
}

.shopping-fact {
  border-top: 1px solid var(--codex-border);
  margin-top: calc(18 * var(--pt));
  padding-top: calc(14 * var(--pt));
}

.shopping-fact strong,
.shopping-fact span {
  display: block;
}

.shopping-fact strong {
  color: var(--codex-fg);
  font-size: calc(17 * var(--pt));
  line-height: 1.15;
}

.shopping-fact span {
  margin-top: calc(4 * var(--pt));
  color: var(--codex-fg-muted);
  font-size: calc(12.5 * var(--pt));
  line-height: 1.35;
}

.materials-shot {
  height: calc(365 * var(--pt));
  object-fit: contain;
  background: #ffffff;
}

.shopping-note {
  margin: calc(12 * var(--pt)) 0 0;
  color: var(--codex-fg-muted);
  font-size: calc(12.5 * var(--pt));
}
</style>
