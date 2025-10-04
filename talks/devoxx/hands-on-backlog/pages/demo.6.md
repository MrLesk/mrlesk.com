---
layout: default
transition: slide-up
section: Demo
---

# PRD → Task breakdown

<div v-click="0">

Here is the prompt we hand to <span v-mark.red.underline>GPT-5 High</span>

<CopyCodeBlock copy-label="Copy prompt" copied-label="Copied!" aria-label="Copy prompt">

```markdown
## Context
In the root of the project you will find the @prd.md file.

## Task
Create relevant tasks and subtasks using backlog CLI tool according to the the task guidelines.
Tasks should be atomic and fit a good PR size.

## Details
I want to see tests and type checks as early as possible.

```

</CopyCodeBlock>

</div>
