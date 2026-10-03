---
layout: default
mood: 4
class: full
meter: false
clicks: 10
routeAlias: live-walk
---

<GromaFrame
  origin="http://localhost:4801"
  :views="[
    'hud=off&container=cli',
    '',
    'system=groma-md',
    'container=export',
    'component=web-server',
    'component=web-server&tab=how&file=src/viewers/web/server.ts&line=19',
    'actor=developer',
    'flow=scan-project-source&step=1',
    'flow=scan-project-source&step=2',
    'flow=scan-project-source&step=3',
    'flow=scan-project-source&step=4',
  ]"
  :captions="[
    'Groma.md, mapped by Groma.md.',
    'C4 model: system, containers, components, code.',
    'System.',
    'Containers.',
    'Components.',
    'Code.',
    'Start from an actor.',
    'Follow a flow, step by step.',
    'Follow a flow, step by step.',
    'Follow a flow, step by step.',
    'Follow a flow, step by step.',
  ]"
  :stills="['demo/walk-0.webp', 'demo/walk-1.webp', 'demo/walk-2.webp', 'demo/walk-3.webp', 'demo/walk-4.webp', 'demo/walk-5.webp', 'demo/walk-6.webp', 'demo/walk-7.webp', 'demo/walk-8.webp', 'demo/walk-9.webp', 'demo/walk-10.webp']"
  :scale="0.6"
/>

<!--
⏱ 14:45 to 18:30. This is the real app, running on your laptop, driven by your clicker.

Click 0. The whole application, no chrome. "This is the architecture of Groma.md. Nobody drew it."
[click] The C4 model: system, containers, components, code. The whole map at once.
[click] System: the Groma.md system, the people who use it and the systems it talks to.
[click] Containers: what runs inside the system. Browser map is highlighted.
[click] Components: the Web host, inside the Groma application.
[click] Code: the Web host's source, at the exact line.
[click] Now the flows. Select an actor: the Developer, and the flows that start from them.
[click] x4. Follow "Scan project source" step by step. Say what happens at each step, not the code.

`bun run dev` starts Groma.md for you. If it can't start, this slide shows captured stills of the same eleven views.
To pan and zoom by hand, double-click the map. The chip at the top gives the keyboard back to the slides.
-->
