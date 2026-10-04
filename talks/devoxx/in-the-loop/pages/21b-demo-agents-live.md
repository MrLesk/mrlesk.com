---
layout: default
mood: 4
class: full
meter: false
clicks: 6
routeAlias: live-agents
---

<GromaAgents
  name="agents"
  origin="http://localhost:4805"
  :phases="[0, 1, 2, 3, 4, 4, 5]"
  :views="[
    '',
    '',
    'container=order-service-order-service',
    'container=order-service-order-service',
    'container=order-service-order-service',
    'task=TASK-11',
    'container=order-service-order-service',
  ]"
  :captions="[
    'It starts with an empty folder.',
    'Watch the agents build it.',
    'Tasks pin to the components they touch.',
    'One task per agent.',
    'They work in parallel, on the map.',
    'Select a task. See its progress.',
    'Finished work flips to a check.',
  ]"
  :stills="['demo/agents-0.webp', 'demo/agents-1.webp', 'demo/agents-2.webp', 'demo/agents-3.webp', 'demo/agents-4.webp', 'demo/agents-5.webp', 'demo/agents-6.webp']"
/>

<!--
⏱ 18:45 to 20:15. Live: three agents work three Backlog.md tasks in the order service, for real.

Click 0. An empty folder: the order service's first commit. The map has nothing to show yet.
[click] Its history replays, 48 commits in about eight seconds: agents worked TASK-1 to TASK-9, and the
map grows with every commit. The panel on the left counts them. This is the service before today's agents.
[click] Three tasks, written in Backlog.md, plain Markdown in the repo. Each one names the component
it touches, so it lands on the map.
[click] One to Codex, one to Claude Code, one to Antigravity. Each agent gets its colour.
[click] Now they work. Files change, criteria tick. I'm not reading any code, just watching where they are.
[click] This one is refunds. Its criteria, the components it touches, the files it changed so far.
[click] Finished work flips to a check. And I always knew which agent was doing what.

Every step is real: the history is checked out commit by commit, then `backlog` commands, source edits
and each agent's commit, in a fresh copy of the service in ~/.groma-live/agents that Groma.md watches. Entering this slide from the one before resets it,
so every rehearsal starts the same. The steps are in slidev-addon-groma-live/demo/agents.mjs.
-->
