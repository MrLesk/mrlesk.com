---
# You can also start simply with 'default'
theme: apple-basic
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: https://cover.sli.dev
# some information about your slides (markdown enabled)
title: "Hands-on: Backlog.md - Plan Tasks with AI"
info: |
  ## Slidev Starter Template
  Presentation slides for developers.

  Learn more at [Sli.dev](https://sli.dev)
# apply unocss classes to the current slide
class: text-center
# https://sli.dev/features/drawing
drawings:
  presenterOnly: false
# slide transition: https://sli.dev/guide/animations.html#slide-transitions
transition: slide-left
# enable MDC Syntax: https://sli.dev/features/mdc
mdc: true
# open graph
seoMeta:
  # By default, Slidev will use ./og-image.png if it exists,
  # or generate one from the first slide if not found.
  ogImage: auto
  # ogImage: https://cover.sli.dev
---

# Hands-on: Backlog.md - Plan Tasks with AI

by Alex Gavrilescu

<TerminalOverlay src="http://localhost:7680" :width="1100" :height="580" corner="center" />

<!--
Notes
-->

# Istoria - AI Voice to Story Builder

* Cross platform app using Expo framework
* Uses offline multimodal LLM for processing audio input and storing notes
* AI recognizes when we are talking about an existing story or want to create a new story
* AI understand if we are adding new text or we want to modify existing text (make the previous paragraph a bullet point
  list)
* Ideally works 100% offline using local LLMs

# PRD First

### We will use ChatGPT Canvas mode to create a very minimalistic PRD

---

<!--
Proceed with Backlog init while we are wating for the PRD
-->

---
transition: slide-up
---

# 3. Hands-on

---
transition: slide-up
---

# Initialize Backlog.md

---
transition: slide-up
---

# Run Codex

### Use --yolo and --search for this demo

---

# Prompt for Codex

```markdown
Given the @prd.md document create all the necessary Backlog tasks and subtasks for the implementation of this feature. Do not implement anything. Your goal is to create the tasks only. For creating the best structured tasks you have to:
1. Research about the tools that we want to use as a senior developer
2. Think as a senior architect about an overall product architecture: understand the entities and their relationships, what should be core domain logic and what goes into the presentation layer.
3. Think as hard as you can as a Product manager about the possible tasks and subtasks necessary for implementing this product.

Follow Backlog.md instructions carefully about task splitting and required sections for each task. Tasks should not conflict with each other and only implement a clear and simple deliverable.
I want to see the TESTS, pre-commit hook with linting, formatting checks and a basic CI pipeline (test, build-test, smoke-test) as soon as possible so that each of the following tasks will be tested both locally and on Github

Spend as much time as you need. This is not a trivial task and it is imperative that is done correctly at the first attempt.
```

<!--
Proceed with Backlog custom instructions while we are wating for Codex to finish
-->

---
transition: slide-up
---

# Let's talk about AGENTS.md instructions

---
transition: slide-up
---

# Task structure

1. Why (Description)
2. What (Acceptance Criteria)
3. How (Implementation Plan)

### Frontmatter (special markdown section for metadata fields)

---

# Definition of Done

---
transition: slide-up
---

# Tips

---
transition: slide-up
---

# Don’t reference future tasks

---
transition: slide-up
---

# Keep a task as big as a PR

---
transition: slide-up
---

# One task per context window

---

# Ask to simplify implementation

---
transition: slide-up
---

# Let's see the results

---
layout: iframe
url: http://localhost:7681/
---

---

# Q&A Time

QR CODE HERE

---

# Thank you!

## Important Links

[Backlog.md](https://backlog.md) · [GitHub](https://github.com/slidevjs/slidev) · [Showcases](https://sli.dev/resources/showcases)

<PoweredBySlidev mt-10 />
