---
layout: default
mood: 4
class: full
meter: false
clicks: 5
routeAlias: live-agents
---

<GromaAgents
  name="agents"
  origin="http://localhost:4805"
  :phases="[0, 1, 2, 3, 3, 4]"
  :views="[
    'container=order-service-order-service',
    'container=order-service-order-service',
    'container=order-service-order-service',
    'container=order-service-order-service',
    'task=TASK-11',
    'container=order-service-order-service',
  ]"
  :captions="[
    'What are my agents doing?',
    'Tasks pin to the components they touch.',
    'One task per agent.',
    'They work in parallel, on the map.',
    'Select a task. See its progress.',
    'Finished work flips to a check.',
  ]"
  :stills="['demo/agents-0.webp', 'demo/agents-1.webp', 'demo/agents-2.webp', 'demo/agents-3.webp', 'demo/agents-4.webp', 'demo/agents-5.webp']"
/>

<!--
⏱ 18:45 to 20:15. Live: three agents work three Backlog.md tasks in the order service, for real.

Click 0. The order service before anyone starts. The panel on the left is the agents.
[click] Three tasks, written in Backlog.md, plain Markdown in the repo. Each one names the component
it touches, so it lands on the map.
[click] One to Codex, one to Claude Code, one to Antigravity. Each agent gets its colour.
[click] Now they work. Files change, criteria tick. I'm not reading any code, just watching where they are.
[click] This one is refunds. Its criteria, the components it touches, the files it changed so far.
[click] Finished work flips to a check. And I always knew which agent was doing what.

Every step is real: `backlog` commands, source edits and each agent's commit, in a fresh copy of the
service in ~/.groma-live/agents that Groma.md watches. Entering this slide from the one before resets it,
so every rehearsal starts the same. The steps are in slidev-addon-groma-live/demo/agents.mjs.
-->
