---
title: Persistent context
level: 2
---

# Persistent context

<div class="feature-list persistent-context-grid">

<div class="feature">
  <div class="feature-num">01</div>
  <div>
    <div class="feature-title">AGENTS.md</div>
    <p class="feature-body">Repo-local operating rules: build commands, code style, ownership boundaries, and review expectations.</p>
  </div>
</div>

<div class="feature">
  <div class="feature-num">02</div>
  <div>
    <div class="feature-title">Skills</div>
    <p class="feature-body">Reusable task playbooks for domains like frontend QA, documents, Figma, GitHub, or repo-specific workflows.</p>
  </div>
</div>

<div class="feature">
  <div class="feature-num">03</div>
  <div>
    <div class="feature-title">Memories</div>
    <p class="feature-body">Durable user and workspace context: preferences, recurring decisions, tech stacks, and caveats that should survive the next thread.</p>
  </div>
</div>

<div class="feature">
  <div class="feature-num">04</div>
  <div>
    <div class="feature-title">The discipline</div>
    <p class="feature-body">When something goes wrong, improve the loop: update AGENTS.md for repo rules, or turn the workflow into a skill.</p>
  </div>
</div>

</div>

<style>
.persistent-context-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: calc(42 * var(--pt));
  row-gap: calc(30 * var(--pt));
  margin-top: calc(26 * var(--pt));
}

.persistent-context-grid .feature {
  min-height: calc(112 * var(--pt));
}

.persistent-context-grid .feature .feature-title {
  font-weight: 700;
}
</style>
