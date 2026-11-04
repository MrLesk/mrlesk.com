---
layout: default
# Full bleed for the production line. Grey light while people build the car, black for the dark factory,
# and the lights come on when the camera reaches the platform.
class: full
mood: 2
moodSteps: [2, 0, 4, 4, 4]
clicks: 4
---

<script setup>
// One name per click, so style.css can say what each click shows (see "Title callback" and "The factory").
const beats = ['car', 'factory', 'deck', 'title', 'twist']
</script>

<div class="finale" :data-beat="beats[$clicks]">
  <FactoryFloor />
  <p class="finale-label"><span class="before">Factories before.</span><span class="after">Factories after.</span></p>
  <div class="finale-title">
    <GromaMark />
    <h1><span class="accent"><span class="twist"><span class="twist-was">In</span><span class="twist-now">Over</span></span> the loop.</span><br>Not in the dark.</h1>
  </div>
</div>

<!--
⏱ 30:15

"Factories before." A production line in grey light, with a person at every station.
DRAFT, your words: This is how we built software. Building the car: a human at every station.
We wrote it, tested it, reviewed it, by hand.

[click] "Factories after." The lights go out. The people leave their stations, a robot arm takes each one,
and a platform rises behind the line: empty, with its monitors off.
DRAFT: Now we build the factory instead. Agents execute at every station, and up there is where humans should
oversee it. In a dark factory, nobody is up there. That's the factory I was running.

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
