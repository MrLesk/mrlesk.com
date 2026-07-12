---
title: Render vs reality
---

# Render vs reality

<div class="reveal-grid">

<div>
  <div class="reveal-label">Codex render</div>
  <div class="ph"><span>Imagen rendering</span><code>public/render.jpg</code></div>
</div>

<div>
  <div class="reveal-label">Built by hand</div>
  <div class="ph"><span>Finished terrace photo</span><code>public/real-terrace.jpg</code></div>
</div>

</div>

<!--
Left: what Codex rendered before we bought anything.
Right: what actually stands in the street today.
Almost identical, down to the planters and the red-white corner markers.
-->

<style>
.reveal-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(18 * var(--pt));
  margin-top: calc(14 * var(--pt));
}

.reveal-grid .ph {
  min-height: calc(340 * var(--pt));
}

.reveal-label {
  font-size: calc(11 * var(--pt));
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--codex-accent);
  font-weight: 500;
  margin-bottom: calc(8 * var(--pt));
}
</style>
