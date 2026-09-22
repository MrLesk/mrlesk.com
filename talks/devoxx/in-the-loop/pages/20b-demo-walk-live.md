---
layout: default
mood: 4
class: full
meter: false
clicks: 9
routeAlias: live-walk
---

<GromaFrame
  origin="http://localhost:4801"
  :views="[
    'hud=off&container=cli',
    'container=cli',
    'actor=developer',
    'flow=scan-project-source&step=1',
    'flow=scan-project-source&step=2',
    'flow=scan-project-source&step=3',
    'flow=scan-project-source&step=4',
    'component=web-server',
    'component=web-server&tab=how',
    'component=web-server&tab=how&file=src/viewers/web/server.ts&line=19',
  ]"
  :captions="[
    'Groma, mapped by Groma.',
    'Systems, containers, components.',
    'Start from an actor.',
    'Follow a flow, step by step.',
    'Follow a flow, step by step.',
    'Follow a flow, step by step.',
    'Follow a flow, step by step.',
    'What a component does.',
    'How it is built.',
    'Down to the source.',
  ]"
  :stills="['demo/walk-0.webp', 'demo/walk-1.webp', 'demo/walk-2.webp', 'demo/walk-3.webp', 'demo/walk-4.webp', 'demo/walk-5.webp', 'demo/walk-6.webp', 'demo/walk-7.webp', 'demo/walk-8.webp', 'demo/walk-9.webp']"
  :scale="0.6"
/>

<!--
⏱ 10:45 to 14:30. This is the real app, running on your laptop, driven by your clicker.

Click 0. The whole application, no chrome. "This is Groma's own architecture. Nobody drew it."
[click] The hierarchy appears: systems, containers, components.
[click] Select an actor: the Developer, and the flows that start from them.
[click] x4. Follow "Scan project source" step by step. Say what happens at each step, not the code.
[click] A component: what it does, and everything it talks to.
[click] How it is built: the files and functions behind it.
[click] Down to the source, at the exact line.

`bun run dev` starts Groma for you. If it cannot start, this slide shows captured stills of the same ten views.
To pan and zoom by hand, double-click the map. The chip at the top gives the keyboard back to the slides.
-->
