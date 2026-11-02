---
layout: default
mood: 4
class: full
meter: false
clicks: 1
routeAlias: live-review
---

<GromaAgents
  name="agents"
  origin="http://localhost:4805"
  review
  cost
  :views="['from={base}', 'from={base}&container=cli']"
  :captions="['What did my agents change?', 'Changed components, inside the application.']"
  :stills="['demo/walk-0.webp', 'demo/walk-0.webp']"
/>

<!--
⏱ 27:30 to 28:30 (50-minute timings still to redo). Live: Groma.md compares the baseline commit with what
the agents left in the working tree, finished or not.

Click 0. Same map, from before they started to now. Everything that didn't change goes quiet. Added, modified
and removed components stand out, and the ones several agents touched are the ones I review first.
[click] Inside the Groma application. Double-click the map, then click a changed component: what changed,
then the files, line by line.

J and K step through every change: mention it, don't demo it. Pull requests too: the groma.md GitHub Action
publishes a before/after map for every PR and keeps one comment updated with the counts.

Bottom right: what the run has cost so far, planning included, at list prices from the sessions Codex saved.
It says "so far" while agents still work, and keeps counting. Rehearsals on Luna show cents.

{base} is the baseline commit of the clone, filled in by the deck when the slide opens.
-->
