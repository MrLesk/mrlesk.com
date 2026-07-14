---
title: This is surprisingly close
---

# This is surprisingly close

<div class="reveal-grid">

<div>
  <div class="reveal-label">Codex render</div>
  <img class="shot reveal-shot reveal-shot-render" src="/codex-render.png" alt="Codex render of the finished Schanigarten" />
</div>

<div>
  <div class="reveal-label">Built by hand</div>
  <img class="shot reveal-shot reveal-shot-real" src="/actual-build.png" alt="The timber Schanigarten built in front of Be Fresh in Vienna" />
</div>

</div>

<p class="reveal-line">Same size. Same basic structure. And it fit the curb.</p>

<!--
On the left is what Codex rendered before we bought anything.
On the right is what we actually built.
It is not pixel perfect, but the important parts are surprisingly close.
-->

<style>
.reveal-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(18 * var(--pt));
  margin-top: calc(14 * var(--pt));
}

.reveal-shot {
  height: calc(330 * var(--pt));
  object-fit: cover;
}

.reveal-shot-render {
  object-position: center 48%;
}

.reveal-shot-real {
  object-position: center 50%;
}

.reveal-label {
  font-size: calc(11 * var(--pt));
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--codex-accent);
  font-weight: 500;
  margin-bottom: calc(8 * var(--pt));
}

.reveal-line {
  margin: calc(14 * var(--pt)) 0 0;
  color: var(--codex-fg-muted);
  font-size: calc(14 * var(--pt));
  text-align: center;
}
</style>
