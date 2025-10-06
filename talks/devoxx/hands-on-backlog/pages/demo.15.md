---
layout: default
transition: slide-up
section: Demo
---

# Execution

<div v-click="0">

Here is the prompt we hand to <span v-mark.red.underline>Claude Sonnet 4.5</span>

<CopyCodeBlock copy-label="Copy prompt" copied-label="Copied!" aria-label="Copy prompt">

```markdown
## Preparation
Read all tasks of this project and understand what is the scope.

## Task
For each task look at the implementation plan and follow it step by step.
Implement all tasks and ensure the acceptance criteria and the goals are met.

## Details
At the end of each task, write the implementation notes and follow the definition of done.

```

</CopyCodeBlock>

</div>
