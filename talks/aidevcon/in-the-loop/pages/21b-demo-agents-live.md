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
  :captions="['Seed repo: 20 dependent tasks queued.', '1 agent starts, then 6 unlock in waves.']"
  :stills="['demo/walk-0.webp', 'demo/walk-1.webp']"
  cost
/>

<!--
⏱ Part 1: Greenfield Start.
Click 0: Seed architecture map with 20 dependent tasks queued.
Only TASK-1 is --ready at the start.
Click 1: Start the run. Codex 1 starts on TASK-1; as soon as TASK-1 finishes, Wave 1 tasks become --ready and Codex 2, 3, 4, 5 spawn one after another, followed by Codex 6 on Wave 2.
Watch components, icons, colors, and C4 relationships appear live for ~1 minute, then leave them cooking and move to Brownfield (Keycloak).
-->
