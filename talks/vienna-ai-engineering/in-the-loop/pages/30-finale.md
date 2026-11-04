---
layout: default
# Full bleed for the factory. The factory floor is dark; the lights come on when the camera reaches the platform.
class: full
mood: 0
moodSteps: [0, 4, 4, 4]
clicks: 3
---

<script setup>
// One name per click, so style.css can say what each click shows (see "Title callback").
const beats = ['factory', 'deck', 'title', 'twist']
</script>

<div class="finale" :data-beat="beats[$clicks]">
  <FactoryFloor />
  <div class="finale-title">
    <GromaMark />
    <h1><span class="accent"><span class="twist"><span class="twist-was">In</span><span class="twist-now">Over</span></span> the loop.</span><br>Not in the dark.</h1>
  </div>
</div>

<!--
⏱ 30:15

The lights go out on a software factory: the agents build cars on the floor, and nobody is up on the platform.
DRAFT, your words: This is the software factory everyone is building. Agents execute down on the floor.
Up there is where a human should oversee it. In a dark factory, nobody is up there.

[click] The camera goes up to the platform and the lights come on: someone is at the console, and the monitors
show Groma.md (the GitHub Action's diff, Keycloak, OpenID Connect).
Closing line: "A dark factory runs with the lights off because nobody is inside.
I walked back in, and I turned the lights on."

[click] "In the loop. Not in the dark." Let the title sit for a second.

[click] The plot twist: "In" gets struck out and "Over" takes its place.
DRAFT, your words: You just watched six agents work at once. I'm not in the loop of every one of them anymore.
I'm over it: the map shows me the whole loop, and I step in where it matters.

Pause. Then the thank you slide.
-->
