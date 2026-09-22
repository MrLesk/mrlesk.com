---
layout: default
mood: 4
class: full
clicks: 4
---

<GromaFrame
  origin="http://localhost:4801"
  :views="[
    'hud=off&container=cli',
    'component=web-server',
    'component=web-server&tab=how',
    'flow=scan-project-source&step=1',
    'flow=scan-project-source&step=2',
  ]"
  :captions="[
    'Scanned from the code. No AI.',
    'Every box is real code.',
    'Down to the source.',
    'Trace a flow, step by step.',
    'Trace a flow, step by step.',
  ]"
  :stills="['stills/walk-overview.webp', 'stills/walk-component.webp', 'stills/walk-how.webp', 'stills/walk-flow-1.webp', 'stills/walk-flow-2.webp']"
  :scale="0.6"
/>

<!--
This is the real app, running on your laptop, driven by your clicks.

⏱ 10 to 24s. The whole application, no chrome.
"Nobody drew this. It is scanned from the code: deterministic, offline, no AI guessing.
Save a file and the map updates."

[click] ⏱ 24 to 32s. A component opens.
"Every box is real code. Pick one and read what it does."

[click] ⏱ 32 to 38s. How it is built.
"And how it is built, down to the source."

[click] ⏱ 38 to 43s. A flow opens on its first step.
"Start from an actor and trace a flow through the system."

[click] ⏱ 43 to 48s. The same flow moves to its second step.
"Step by step: who calls what, and why."

The next slide is the timelapse.

Nothing to start by hand: `bun run dev` also starts Groma (the groma-live addon does it).
If Groma cannot start, this slide shows captured stills instead, so the talk still works.
Double-click the map to pan and zoom by hand. Click the chip at the top to give the keyboard back to the slides.
-->
