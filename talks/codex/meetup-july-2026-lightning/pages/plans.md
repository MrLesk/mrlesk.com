---
title: The build plans
---

# IKEA instructions, custom made

<div class="plans-grid">

<div class="ph">
  <span>Build plan page: platform & cut schedule</span>
  <code>public/plan-page-1.png</code>
</div>

<div class="ph">
  <span>Build plan page: walls & posts</span>
  <code>public/plan-page-2.png</code>
</div>

</div>

<!--
Codex turned the requirements into step-by-step build plans: cut schedules, exploded views, fastening details.
The details matter: 12 rows of boards, each row one 3 m plus one 2 m board. Support heights of 12 mm on the sidewalk side and 32 mm on the street side so the deck lands flush with the curb. Fence cut to 1800 + 1800 + 1400 in front and 1700 on each side.
I never had to figure out a step on my own.
-->

<style>
.plans-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(18 * var(--pt));
  margin-top: calc(16 * var(--pt));
}

.plans-grid .ph {
  min-height: calc(330 * var(--pt));
}
</style>
