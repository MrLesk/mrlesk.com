---
layout: default
mood: 4
class: full
meter: false
clicks: 1
routeAlias: live-tasks
---

<GromaFrame
  origin="http://localhost:4801"
  :views="[
    'task=TASK-444',
    'component=java-src-index&tab=tasks',
  ]"
  :captions="[
    'A task, pinned where the work happened.',
    'Every component knows its tasks.',
  ]"
  :stills="['demo/tasks-0.webp', 'demo/tasks-1.webp']"
  :scale="0.6"
/>

<!--
⏱ 14:45 to 15:30. Still Groma's own map, live.

Click 0. One Backlog.md task, and the four language scanners it touched, lit up on the map.
"Task tracking told me what the agents did. Now I also see where."
[click] The other direction: pick the Java scanner adapter and read every task that ever touched it.

Then the fast-forward recording shows the same thing from an empty project.
-->
