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
  :captions="['20 tasks, 20 agents queued.', '20 tasks, 20 agents queued.']"
  :stills="['demo/walk-0.webp', 'demo/walk-1.webp']"
  cost
  every-agent
/>

<!--
⏱ Part 1: Greenfield, the run.
Click 0: The agents panel lists all 20 agents: Codex 1 to 6 ready on TASK-1 to TASK-6, Codex 7 to 20 queued.
Scroll the list to show the queue. The 20 tasks wait as a row of pins on the CLI container.
Every task gets its own fresh Codex session, six at a time.
Click 1: Start the run. All six start at once. As each one finishes, the next queued agent starts on the next To Do task,
in any order: they may break things, that's fine. The list scrolls by itself to the agents at work, and the count next
to AGENTS says how many of the 20 tasks are done.
They finish in about 30 seconds on Ultrafast. Watch components, icons, colours and C4 relationships appear live;
when the map stops changing, go on to the review.
-->
