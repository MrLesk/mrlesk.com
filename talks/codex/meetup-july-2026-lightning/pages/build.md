---
title: The build
---

# A van, my mom, a few days

<div class="build-grid">

<div class="ph">
  <span>Van full of wood</span>
  <code>public/build-1.jpg</code>
</div>

<div class="ph">
  <span>Substructure & dry fit</span>
  <code>public/build-2.jpg</code>
</div>

<div class="ph">
  <span>Deck boards going down</span>
  <code>public/build-3.jpg</code>
</div>

</div>

<p class="build-line">Rented a van. Dry-fit everything. Then screwed it all down.</p>

<!--
I rented a van and unloaded every board right in front of the restaurant.
Built it with my mom over a few days: frame, feet, leveling, deck boards, then the fence panels and posts.
The plans said dry-fit before fastening. That advice saved us twice.
-->

<style>
.build-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: calc(16 * var(--pt));
  margin-top: calc(16 * var(--pt));
}

.build-grid .ph {
  min-height: calc(300 * var(--pt));
}

.build-line {
  margin-top: calc(16 * var(--pt));
  font-size: calc(14 * var(--pt));
  color: var(--codex-fg-muted);
}
</style>
