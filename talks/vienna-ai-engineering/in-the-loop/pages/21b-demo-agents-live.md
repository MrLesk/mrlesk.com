---
layout: default
mood: 4
class: full greenfield
meter: false
clicks: 1
routeAlias: live-agents
---

<GromaAgents
  name="agents"
  origin="http://localhost:4805"
  :phases="[0, 1]"
  :views="['', '']"
  :panels="[false, true]"
  :captions="['Seed repo: 20 tasks queued.', '6 agents start at once.']"
  :stills="['demo/walk-0.webp', 'demo/walk-1.webp']"
  cost
/>

<!--
⏱ Part 1: Greenfield, the run.
Click 0: Seed architecture map with 20 tasks queued. Codex 1 to 6 have planned TASK-1 to TASK-6.
Click 1: Start the run. All six agents start at once. As each one finishes it takes the next To Do task,
in any order: they may break things, that's fine.
They finish in about 30 seconds on Ultrafast. Watch components, icons, colours and C4 relationships appear live;
when the map stops changing, go on to the review.
-->
