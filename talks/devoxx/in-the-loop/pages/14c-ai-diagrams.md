---
layout: default
mood: 2
clicks: 1
---

# AI already draws beautiful diagrams.

<div class="stage drawn" :class="{ stale: $clicks >= 1 }">
  <p class="drawn-quote">“Instead of writing, ask your LLM to create a diagram.” <span class="eyebrow">Andrej Karpathy</span></p>
  <WhenActive class="drawn-table">
    <img class="drawn-sheet s1" src="/diagrams/backlog-md-architecture.webp" alt="The architecture of Backlog.md, drawn by AI" />
    <img class="drawn-sheet s2" src="/diagrams/backlog-md-sequence.webp" alt="An agent moving a Backlog.md task, drawn by AI" />
    <img class="drawn-sheet s3" src="/diagrams/backlog-md-workflow.webp" alt="How an agent works a Backlog.md task, drawn by AI" />
  </WhenActive>
  <div class="stale-stamp" aria-hidden="true">STALE</div>
  <p class="eyebrow drawn-caption"><span class="cap-was">Backlog.md, drawn by AI with archify</span><span class="cap-now">One commit later</span></p>
</div>

<!--
⏱ 07:50. Same light. DRAFT: the title and these notes are mine, change them freely.

Karpathy put it simply: instead of writing, ask your LLM to create a diagram.
There are skills for it now. archify turns a repository into an architecture diagram.

These three are Backlog.md: the architecture, an agent moving a task, and how an agent works a task.
An AI agent drew them straight from the repository.

They look great. But they're pictures.

[click] And they go stale right after they're drawn. One commit later, they're already wrong, and when the
code changes, you have to ask again.
-->
