---
layout: default
mood: 2
clicks: 2
---

# Look at what I found. Again.

<div class="stage shape" :class="{ seen: $clicks >= 1 }">
  <div class="finds short">
    <div><b>Duplicates</b><span>20+ Button components</span></div>
    <div><b>No middleware</b><span>auth checked in every page</span></div>
    <div><b>Dead code</b><span>leftovers and unused components</span></div>
    <div><b>Wrong tests</b><span>1,700+, mostly UI labels</span></div>
  </div>
  <p v-click class="punch">Every line looked fine... in its own PR.</p>
  <p v-click class="say"><strong>I need to know the architecture.</strong></p>
</div>

<!--
⏱ 07:35. The bridge from "I stopped reviewing" to the architecture map.

Go back to what I found when I opened the code. Twenty versions of a button.
Auth in every page, no middleware. Leftovers between APIs. Seventeen hundred tests checking labels.

[click] Every line looked fine... in its own PR. The problem is how it's all put together.
So I didn't need to review every line. I needed to review one level up, at the architecture.
Something I can read in a few minutes, but still close to the code.
I wanted to know my project so well that I could draw its architecture. And I had no picture of it.

[click] I need to know the architecture.
-->
