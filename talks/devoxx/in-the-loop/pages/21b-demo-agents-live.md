---
layout: default
mood: 4
class: full
meter: false
clicks: 1
routeAlias: live-agents
---

<GromaAgents
  name="agents"
  origin="http://localhost:4805"
  :phases="[0, 1]"
  :views="['container=cli', '']"
  :panels="[false, true]"
  :captions="['Six Backlog.md tasks ready.', 'Six Codex agents on GPT-6.1 Sol Ultrafast.']"
  :stills="['demo/walk-0.webp', 'demo/walk-1.webp']"
  cost
/>

<!--
⏱ 25:15 to 27:30 (50-minute timings still to redo). Live: six Codex agents work six Groma.md tasks, for real.

Click 0. Groma.md's own map again, zoomed on the Groma application, where the six tasks are pinned. No agents panel yet:
the panel, its RESET button and the full map come with the click. Readiness before the click
is in the dev server's console ("Codex N planned TASK-..."). Six tasks from the roadmap, written in Backlog.md, plain Markdown in the
repo. Each one names the components it will touch, so it is pinned on the map before anyone edits a line.
[click] Six Codex agents on GPT-6.1 Sol Ultrafast start at the same time, one task each. They took their tasks
and planned when the deck started, so they go straight to work. From here it runs by itself: tasks turn
In Progress, files change, criteria tick. I'm not reading any code, just watching where they are.

The six: icons and colours on elements from published icon packs, one explicit file for every plugin, plans
exported and imported, colour by how the code moves, play the history between two commits, and how critical
each component is. Real roadmap work across several components each, so they are still working when we move on.

Bottom right, from the click that starts them: what the run has cost so far, planning included, at list prices
from the sessions Codex saved. It counts up every few seconds while they work, and the review slide shows the
same number.

RESET (top of the agents panel) stops them, puts the copy back on the baseline and has them plan again, for
rehearsals: wait until every card says "ready". Every `bun run dev` start and every RESET pays for a planning
round on the demo key. There is no recorded fallback: if Groma.md can't start, this slide shows a still of its map.
-->
