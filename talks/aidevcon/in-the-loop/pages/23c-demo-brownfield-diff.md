---
layout: default
mood: 4
class: full brownfield
meter: false
clicks: 2
routeAlias: live-brownfield-diff
---

<GromaFrame
  origin="http://localhost:4804"
  :views="[
    'from=21cb8e518be6673f25ba237f788ebb70f9735e80',
    'from=21cb8e518be6673f25ba237f788ebb70f9735e80&container=keycloak-server',
    'from=21cb8e518be6673f25ba237f788ebb70f9735e80&component=step-up-risk',
  ]"
  :captions="[
    'Brownfield diff: Adaptive Step-Up Auth across 3 containers.',
    'Inside keycloak-server: 1 added component, 4 modified.',
    'Adaptive step-up risk: new component, relationships, and code diff.',
  ]"
  :stills="['demo/keycloak-0.webp', 'demo/keycloak-1.webp', 'demo/keycloak-7.webp']"
  :scale="0.6"
/>

<!--
⏱ Part 3: Brownfield Diff (keycloak-changed on :4804).
Shows a multi-component feature implemented and curated by Codex (GPT-6 Astra xhigh) on top of the curated Keycloak map.
Everything untouched dims out; the added component (Adaptive step-up risk) and modified components across keycloak-server, admin-console, and account-console stand out immediately.
-->
