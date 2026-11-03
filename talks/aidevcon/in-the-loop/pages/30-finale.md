---
layout: default
# Full bleed for the photo. The room goes dark for this morning's slide and the lights come on at the deck.
class: full
mood: 4
moodSteps: [4, 0, 0, 4, 4]
clicks: 4
---

<script setup>
// One name per click, so style.css can say what each click shows (see "Title callback").
const beats = ['title', 'photo', 'factory', 'deck', 'twist']
</script>

<div class="finale" :data-beat="beats[$clicks]">
  <!-- Alex's photo of a slide shown at AI DevCon this morning (2026-11-03). -->
  <div class="keynote-photo">
    <img src="/keynote-factory.webp" alt="This morning's slide: building the car, building the factory" />
  </div>
  <div class="observation-deck" aria-hidden="true">
    <svg viewBox="0 0 980 551">
      <!-- The agents on the factory floor below the deck: a base, two arm parts with joints, a gripper. -->
      <g class="observation-arm left">
        <path d="M34 551 L42 530 H90 L98 551" />
        <path d="M66 524 L104 466" />
        <g class="lower">
          <path d="M104 466 L162 490 M162 490 l12 -8 M162 490 l10 12" />
        </g>
        <circle cx="66" cy="524" r="7" />
        <circle cx="104" cy="466" r="7" />
      </g>
      <g class="observation-arm right">
        <path d="M946 551 L938 530 H890 L882 551" />
        <path d="M914 524 L876 466" />
        <g class="lower">
          <path d="M876 466 L818 490 M818 490 l-12 -8 M818 490 l-10 12" />
        </g>
        <circle cx="914" cy="524" r="7" />
        <circle cx="876" cy="466" r="7" />
      </g>
      <path class="observation-stand" d="M490 290 V336" />
      <path class="observation-console" d="M196 336 H784 L840 392 H140 Z" />
      <path class="observation-console-edge" d="M140 392 H840 V404 H140 Z" />
      <g class="observation-lights">
        <rect x="246" y="356" width="22" height="6" rx="3" />
        <rect x="278" y="356" width="10" height="6" rx="3" />
        <rect x="692" y="356" width="10" height="6" rx="3" />
        <rect x="712" y="356" width="22" height="6" rx="3" />
      </g>
      <!-- The person at the console, seen from behind. -->
      <ellipse class="observation-person" cx="490" cy="420" rx="33" ry="39" />
      <path class="observation-person" d="M360 551 C364 494 408 468 458 461 L468 449 H512 L522 461 C572 468 616 494 620 551 Z" />
    </svg>
    <div class="observation-screens">
      <figure class="observation-screen left"><img src="/demo/action-map.webp" alt="" /></figure>
      <figure class="observation-screen main"><img src="/demo/keycloak-1.webp" alt="" /></figure>
      <figure class="observation-screen right"><img src="/demo/keycloak-7.webp" alt="" /></figure>
    </div>
  </div>
  <div class="finale-title">
    <GromaMark />
    <h1><span class="accent"><span class="twist"><span class="twist-was">In</span><span class="twist-now">Over</span></span> the loop.</span><br>Not in the dark.</h1>
  </div>
</div>

<!--
⏱ 30:15

"In the loop. Not in the dark." Let the title sit for a second.

[click] The lights go out and this morning's slide comes up.
DRAFT, your words: This morning we saw this slide. Building the car: humans at every station.
Building the factory: agents execute, humans oversee.

[click] The camera flies into the factory.
DRAFT: That's the dark factory from the start of this talk. Agents do the work. Somebody still has to oversee it.

[click] The camera goes up to the platform and the lights come on: the factory's observation deck, with Groma.md
on its screens (the GitHub Action's diff, Keycloak, OpenID Connect).
Closing line: "A dark factory runs with the lights off because nobody is inside.
I walked back in, and I turned the lights on."

[click] Back to the title, then the plot twist: "In" gets struck out and "Over" takes its place.
DRAFT, your words: You just watched six agents work at once. I'm not in the loop of every one of them anymore.
I'm over it: the map shows me the whole loop, and I step in where it matters.

Pause. Then the thank you slide.
-->
