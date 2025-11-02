---
theme: penguin
title: "Backlog - AI Engineer Code Summit"
author: Alex Gavrilescu
colorSchema: "light"
drawings:
  persist: false
mdc: true
transition: slide-left
layout: default
css: unocss
---

<h1 class="text-center">Have you ever seen a terminal Kanban board?</h1>

<TtydFrame class="max-w-220 h-100" src="http://localhost:7681"></TtydFrame>

---
src: ./pages/task.1.md
---

---
src: ./pages/task.2.md
---

---
layout: two-cols
timeline:
  preset: backlog-flow
  current: task-creation
title: Task Creation
---

# Task Creation

- Capture the problem statement while the context is fresh
- Link supporting evidence like logs, screenshots, or user notes
- Assign metadata that drives automation (labels, owner, urgency)

::right::
### What the AI does
- Generates the initial backlog task file structure
- Normalizes metadata and cross-references dependencies
- Flags missing context the team should supply

---
layout: two-cols
timeline:
  preset: backlog-flow
  current: implementation-plan
title: Implementation Plan
---

# Implementation Plan

- Break the task into verifiable acceptance criteria
- Outline the step-by-step remediation or delivery plan
- Surface risks, open questions, and runtime assumptions

::right::
### What the AI does
- Synthesizes remediation steps from historical fixes
- Maps ACs to code owners and suggests test coverage
- Highlights blockers that require human decisions

---
layout: two-cols
timeline:
  preset: backlog-flow
  current: task-execution
title: Task Execution
---

# Task Execution

- Drive coding, testing, and rollout directly from the plan
- Track progress and status changes inside the markdown task
- Capture validation evidence for future retrospectives

::right::
### What the AI does
- Keeps the task file in sync with commits and environments
- Generates status summaries for stakeholders in real time
- Suggests follow-up work based on telemetry and outcomes

---
src: ./pages/backlog.3.5.md
---
