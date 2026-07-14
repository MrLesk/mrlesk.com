---
layout: two-cols
title: It passed inspection
---

# It passed inspection

<div class="feature-list">

<div class="feature">
  <div class="feature-num">01</div>
  <div>
    <div class="feature-title">Mom did the finishing touches</div>
    <p class="feature-body">Paint, flowers, pots, tables, chairs, and umbrellas.</p>
  </div>
</div>

<div class="feature">
  <div class="feature-num">02</div>
  <div>
    <div class="feature-title">The Magistrat checked it</div>
    <p class="feature-body">It matched the approved plan.</p>
  </div>
</div>

<div class="feature">
  <div class="feature-num">03</div>
  <div>
    <div class="feature-title">People eat there now</div>
    <p class="feature-body">The terrace has been open ever since.</p>
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
Mom handled the paint, flowers, furniture, and umbrellas.
Then the Magistrat came, checked the terrace against the approved plan, and signed it off.
People have been eating there ever since.
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
