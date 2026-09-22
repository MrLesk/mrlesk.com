---
theme: penguin
title: "In the loop, not in the dark"
info: "Staying in control in the era of dark software factories. Devoxx Belgium 2026, Tools in Action."
author: Alex Gavrilescu
colorSchema: light
drawings:
  persist: false
mdc: true
transition: fade
layout: default
mood: 1
# Resolved from this deck's parent folder: the shared addon at the repository root.
addons:
  - ../../slidev-addon-groma-live
# The addon starts these with `bun run dev`. Nothing else to run, on stage or before.
gromaLive:
  - name: groma
    cwd: ~/projects/groma3
    port: 4801
  - name: keycloak-curated
    cwd: ~/projects/keycloak
    port: 4802
  # A small order service an agent built task by task. Its git history is replayed on a live map.
  - name: orders
    port: 4804
    replay:
      source: ../../../slidev-addon-groma-live/demo/orders.bundle
      interval: 700
  # Built on stage from the GromaRun slide, in the throwaway folder ~/.groma-live/keycloak.
  # Groma proposes the folder name as the project name, so the folder is called keycloak.
  - name: keycloak
    port: 4803
    steps:
      - git clone ~/projects/keycloak .
---

<div class="cover">
  <p class="eyebrow">Devoxx Belgium 2026 · Tools in Action</p>
  <h1><span class="lit">In the loop,</span><br><span class="unlit">not in the dark.</span></h1>
  <p class="cover-sub">Staying in control in the era of dark software factories</p>
  <p class="cover-by">Alex Gavrilescu</p>
</div>

<!--
⏱ 00:00

The room starts dark on purpose. The light in these slides follows the story:
it falls to black, then comes back when Groma arrives. The meter top right shows it.

One memory for the audience: I lost ownership of my code to my agents, and I got it back
by keeping the architecture in front of me.

Pace: the story is one beat per slide, about 25 seconds each. Groma must be on screen by 08:30.
-->

---
src: ./pages/01-goal.md
---

---
src: ./pages/02-productive.md
---

---
src: ./pages/03-error.md
---

---
src: ./pages/04-not-first.md
---

---
src: ./pages/05-different.md
---

---
src: ./pages/06-rescue.md
---

---
src: ./pages/07-power.md
---

---
src: ./pages/08-relief.md
---

---
src: ./pages/09-issues.md
---

---
src: ./pages/10-afterthought.md
---

---
src: ./pages/11-wtf.md
---

---
src: ./pages/12-dark-factory.md
---

---
src: ./pages/13-best-practices.md
---

---
src: ./pages/14-not-satisfied.md
---

---
src: ./pages/15-what-if.md
---

---
src: ./pages/16-should-be-easy.md
---

---
src: ./pages/17-welcome.md
---

---
src: ./pages/18-surveyor.md
---

---
src: ./pages/19-loop.md
---

---
src: ./pages/20-demo-walk.md
---

---
src: ./pages/20b-demo-walk-live.md
---

---
src: ./pages/21-demo-agents.md
---

---
src: ./pages/21b-demo-agents-live.md
---

---
src: ./pages/21c-demo-agents-recording.md
---

---
src: ./pages/22-demo-java.md
---

---
src: ./pages/22a-demo-java-run.md
---

---
src: ./pages/22b-demo-java-live.md
---

---
src: ./pages/23-demo-curated.md
---

---
src: ./pages/23b-demo-curated-live.md
---

---
src: ./pages/24-attempt-blueprint.md
---

---
src: ./pages/25-attempt-groma.md
---

---
src: ./pages/26-attempt-groma2.md
---

---
src: ./pages/27-attempt-groma3.md
---

---
src: ./pages/28-spec.md
---

---
src: ./pages/29-answers.md
---

---
src: ./pages/30-finale.md
---

---
src: ./pages/31-thanks.md
---
