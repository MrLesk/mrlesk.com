---
layout: default
mood: 4
class: full
meter: false
clicks: 2
routeAlias: live-review
---

<GromaAgents
  name="agents"
  origin="http://localhost:4805"
  review
  :views="[
    'from=ee9e69bf64267d04ee5a9b26bbb9255c5fee9752',
    'from=ee9e69bf64267d04ee5a9b26bbb9255c5fee9752&component=payments&tab=how',
    'from=ee9e69bf64267d04ee5a9b26bbb9255c5fee9752&component=payments&tab=how&file=src/payments/payment-gateway.ts',
  ]"
  :captions="[
    'What did my agents change?',
    'Two agents changed the payment gateway.',
    'The lines, file by file.',
  ]"
  :stills="['demo/review-0.webp', 'demo/review-1.webp', 'demo/review-2.webp']"
/>

<!--
⏱ 20:15 to 21:00. Live: Groma.md 0.6.0 compares the service before the agents with what they left.

Click 0. Same map, from before they started to now. Everything that didn't change goes quiet.
Seven components changed.
[click] The payment gateway changed. Two agents touched it: Claude Code added refunds, Codex added
discounted charges. That's what I review first.
[click] When I want the lines, they're here, file by file.

J and K step through every change: mention it, don't demo it.
Pull requests too: the groma.md GitHub Action publishes a before/after map for every PR and keeps one
comment updated with the counts.

ee9e69b is the last commit of the demo history, the service before the agents. Opening this slide makes
sure the agents have finished, so the comparison is ready even when you jump here.
-->
