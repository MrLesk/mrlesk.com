---
layout: default
mood: 4
class: full greenfield
meter: false
clicks: 1
routeAlias: live-review
---

<GromaAgents
  name="agents"
  origin="http://localhost:4805"
  review
  cost
  :views="['container=kanban', 'from={base}&container=kanban']"
  :captions="['Greenfield complete: 21 components across 4 groups.', 'Architecture diff: everything the 20 agents built from the seed commit.']"
  :stills="['demo/walk-0.webp', 'demo/walk-0.webp']"
/>

<!--
⏱ Part 1: Greenfield, the result (architecture map and diff).
Straight after the run: all 20 tasks are Done, and the map now has 20 components organized across Model & Parser, Storage & Query, Terminal UI, and Board & Commands, complete with C4 relationships.
-->
