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

# Prompt for ChatGPT Canvas mode

```markdown
## Goal
Your goal is to create a very minimalistic PRD using Canvas mode from the product information below that we can
implement in few hours.

## Time constraint
We are here at Devoxx conference for a live demo of building a product using AI tools.
Given the short time we have available and given that this is a demo, try to focus on the core
parts of the product MVP and leave behind any non critical aspect.

## Requirements
AI recognizes when we are talking about an existing story or want to create a new story
AI understand if we are adding new text or we want to modify existing text (make the previous paragraph a bullet point
list)

## Technology requirements
Cross platform app using Expo framework
Uses multimodal LLM for processing audio input and storing notes

## Quality requirements
Ideally works 100% offline using local LLMs

## Output format
Output the PRD in a prd.md file in the root of the project
```

[ChatGPT](https://chat.openai.com/?q=We%20are%20here%20at%20Devoxx%20conference%20for%20a%20live%20demo%20of%20building%20a%20product%20using%20AI%20tools.%0AYour%20goal%20is%20to%20create%20a%20very%20minimalistic%20PRD%20using%20Canvas%20mode%20from%20the%20product%20information%20below%20that%20we%20can%0Aimplement%20in%20few%20hours.%20Given%20the%20short%20time%20we%20have%20available%20and%20given%20that%20this%20is%20a%20demo%2C%20try%20to%20focus%20on%20the%20core%0Aparts%20of%20the%20product%20MVP%20and%20leave%20behind%20any%20non%20critical%20aspect.%0ACross%20platform%20app%20using%20Expo%20framework%0AUses%20offline%20multimodal%20LLM%20for%20processing%20audio%20input%20and%20storing%20notes%0AAI%20recognizes%20when%20we%20are%20talking%20about%20an%20existing%20story%20or%20want%20to%20create%20a%20new%20story%0AAI%20understand%20if%20we%20are%20adding%20new%20text%20or%20we%20want%20to%20modify%20existing%20text%20%28make%20the%20previous%20paragraph%20a%20bullet%20point%0Alist%29%0AIdeally%20works%20100%25%20offline%20using%20local%20LLMs&hints=canvas)

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
