---
layout: two-cols
title: Green light
---

# Green light

<div class="feature-list">

<div class="feature">
  <div class="feature-num">01</div>
  <div>
    <div class="feature-title">CEO finishing touches</div>
    <p class="feature-body">Mom painted the wall, added flowers and pots, picked tables, chairs, and umbrellas.</p>
  </div>
</div>

<div class="feature">
  <div class="feature-num">02</div>
  <div>
    <div class="feature-title">Magistrat inspection</div>
    <p class="feature-body">Everything checked out against the approved plan.</p>
  </div>
</div>

<div class="feature">
  <div class="feature-num">03</div>
  <div>
    <div class="feature-title">Open for guests</div>
    <p class="feature-body">Serving on the new terrace ever since.</p>
  </div>
</div>

<div class="feature">
  <div class="feature-num">04</div>
  <div>
    <div class="feature-title">Come see it</div>
    <p class="feature-body">Zentagasse 33, in Vienna’s 5th district.</p>
  </div>
</div>

</div>

::right::

<img class="shot greenlight-shot" src="/final-terrace.png" alt="The finished Be Fresh Schanigarten with painted timber fencing, tables, chairs, umbrellas, and planters" />

<!--
The last mile was all mom: paint, flowers, furniture, umbrellas.
Then the Magistrat came, verified everything matched the stamped plan, and gave the green light.
-->

<style>
.slidev-layout.two-cols:has(.greenlight-shot) .feature-list {
  gap: calc(14 * var(--pt));
  margin-top: calc(10 * var(--pt));
}

.greenlight-shot {
  height: calc(430 * var(--pt));
  object-fit: cover;
  object-position: center 48%;
}
</style>
