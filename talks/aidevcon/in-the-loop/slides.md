---
theme: penguin
title: "In the loop, not in the dark"
info: "Staying in control in the era of dark software factories. AI DevCon NYC 2026, Tools-in-Action."
author: Alex Gavrilescu
colorSchema: light
drawings:
  persist: false
mdc: true
transition: fade
layout: default
# The cover is AI DevCon's own title slide (see AGENTS.md): black all round, no deck frame, no light meter.
mood: 0
class: full aidevcon
meter: false
# Resolved from this deck's parent folder: the shared addon at the repository root.
addons:
  - ../../slidev-addon-groma-live
# The addon starts these with `bun run dev`. Nothing else to run, on stage or before.
gromaLive:
  # ~/projects/groma-aidevcon is a clean clone of groma.md main for this talk, apart from Alex's dev checkout.
  - name: groma
    cwd: ~/projects/groma-aidevcon
    port: 4801
  - name: keycloak-curated
    cwd: ~/projects/keycloak
    port: 4802
  - name: keycloak-changed
    cwd: ~/projects/keycloak-changed
    port: 4804
  # Part 1 & Part 4: Greenfield project (`~/projects/task-manager`, 20 dependent Backlog.md tasks).
  # Starts with 1 agent on TASK-1 (the only --ready task at Wave 0); as dependencies finish, more and more
  # agents unlock across the 6 worker slots until all 20 tasks and components are built.
  - name: agents
    port: 4805
    live:
      template: ~/projects/task-manager
      prompt: ./agent-prompt.md
      go: Implement your plan now. Write only the target TypeScript file, tick the acceptance criteria, and skip all tests, linting, or verification.
      codexHome: ~/.config/groma-live/codex
      # `bun run rehearsal` uses Alex's default ~/.codex subscription with GPT-6.1 Terra medium effort.
      rehearsal:
        model: gpt-6.1-terra
        model_reasoning_effort: medium
      agents:
        - task: TASK-1
          name: codex
          label: Codex 1
        - task: ""
          name: codex
          label: Codex 2
        - task: ""
          name: codex
          label: Codex 3
        - task: ""
          name: codex
          label: Codex 4
        - task: ""
          name: codex
          label: Codex 5
        - task: ""
          name: codex
          label: Codex 6
  # Built on stage from the GromaRun slide, in the throwaway folder ~/.groma-live/keycloak.
  - name: keycloak
    port: 4803
    steps:
      - git clone ~/projects/keycloak .
  # Part 4 finale: runs `task-manager kanban` inside the live Greenfield clone built by the agents.
  - name: task-manager
    port: 0
    cwd: ~/.groma-live/agents/work
    steps:
      - task-manager kanban
      - task-manager list
---

<div class="aidevcon-cover">
  <img class="aidevcon-dashes" src="/aidevcon/dashes.png" alt="" />
  <img class="aidevcon-logo" src="/aidevcon/logo.png" alt="aiDevCon by Tessl" />
  <img class="aidevcon-badge" src="/aidevcon/nyc.png" alt="NYC" />
  <img class="aidevcon-photo" src="/aidevcon/speaker.jpg" alt="Alex Gavrilescu" />
  <h1><span class="lit">In the loop,</span><br><span class="unlit">not in the dark.</span></h1>
  <p class="aidevcon-sub">Staying in control in the era of dark software factories</p>
  <div class="aidevcon-by">
    <p class="aidevcon-name">Alex Gavrilescu</p>
    <p>Engineering lead · Funstage GmbH</p>
  </div>
</div>

<!--
⏱ 00:00

This cover is AI DevCon's title slide, from their template. The light story starts after the YOLO warning.

The room starts dark on purpose. The light in these slides follows the story:
it falls to black, then comes back when Groma.md arrives. The meter top right shows it.

One memory for the audience: I lost ownership of my code to my agents, and I got it back
by keeping the architecture in front of me.

Pace: the story is one beat per slide, about 25 seconds each. Groma.md must be on screen by 08:30.
-->

---
src: ./pages/00-yolo.md
---

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
src: ./pages/14b-shape.md
---

---
src: ./pages/14c-ai-diagrams.md
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
src: ./pages/21a-karpathy.md
---

---
src: ./pages/21-demo-agents.md
---

---
src: ./pages/21b-demo-agents-live.md
---

---
src: ./pages/21d-scans.md
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
src: ./pages/23c-demo-brownfield-diff.md
---

---
src: ./pages/23d-github-action.md
---

---
src: ./pages/21c-demo-agents-review.md
---

---
src: ./pages/21e-demo-kanban-run.md
---

---
src: ./pages/28-spec.md
---

---
src: ./pages/28b-try.md
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
