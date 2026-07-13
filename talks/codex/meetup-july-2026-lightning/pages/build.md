---
title: The build
---

# A van, my mom, a few days

<div class="build-grid">

<figure class="build-photo-wrap">
  <img class="shot build-photo" src="/van-road.jpg" alt="Driving a rented van on the way to collect materials for the Schanigarten" />
  <figcaption>On the road for materials</figcaption>
</figure>

<figure class="build-photo-wrap">
  <img class="shot build-photo" src="/substructure.jpg" alt="The exposed timber substructure being leveled in front of Be Fresh" />
  <figcaption>Level the substructure</figcaption>
</figure>

<figure class="build-photo-wrap">
  <img class="shot build-photo" src="/deck-before-fence.jpg" alt="The completed timber deck platform before the fence was installed" />
  <figcaption>Deck down, fence next</figcaption>
</figure>

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

.build-photo-wrap {
  position: relative;
  margin: 0;
}

.build-photo {
  height: calc(300 * var(--pt));
  object-fit: cover;
  object-position: center 48%;
}

.build-photo-wrap figcaption {
  position: absolute;
  left: calc(12 * var(--pt));
  bottom: calc(12 * var(--pt));
  padding: calc(6 * var(--pt)) calc(9 * var(--pt));
  border-radius: calc(7 * var(--pt));
  background: rgba(255, 255, 255, 0.9);
  color: var(--codex-fg);
  font-size: calc(11.5 * var(--pt));
  font-weight: 600;
  backdrop-filter: blur(calc(6 * var(--pt)));
}

.build-line {
  margin-top: calc(16 * var(--pt));
  font-size: calc(14 * var(--pt));
  color: var(--codex-fg-muted);
}
</style>
