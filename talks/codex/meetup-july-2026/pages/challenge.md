---
title: The Build Week Challenge
level: 1
---

# The Build Week Challenge

<div class="challenge-dates">
  <div class="challenge-date">
    <div class="cd-day">Jul 13</div>
    <div class="cd-label">Challenge opened</div>
  </div>
  <div class="challenge-date highlight">
    <div class="cd-day">Jul 21</div>
    <div class="cd-label">Submissions close: 5 days from tonight</div>
  </div>
  <div class="challenge-date">
    <div class="cd-day">Aug 12</div>
    <div class="cd-label">Winners announced</div>
  </div>
</div>

<div class="cards-grid cols-3" style="margin-top: calc(16 * var(--pt));">

<div class="card">
  <div class="card-eyebrow">How it works</div>
  <div class="card-body">Register on Devpost and build with Codex this week: from scratch or on an existing project, solo or as a team. Submit a description, demo video, and repo.</div>
</div>

<div class="card">
  <div class="card-eyebrow">How it's judged</div>
  <div class="card-body">Technical implementation, design & user experience, potential impact, and quality of the idea, with thoughtful use of GPT-5.6 and Codex.</div>
</div>

<div class="card featured">
  <div class="card-eyebrow">What you can win</div>
  <div class="card-body">Cash awards, OpenAI credits, DevDay passes, spotlight opportunities, and special experiences with the OpenAI team.</div>
</div>

</div>

<div class="codex-callout">openai.com/build-week → Register on Devpost</div>

<style>
.challenge-dates {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: calc(14 * var(--pt));
  margin-top: calc(14 * var(--pt));
}

.challenge-date {
  background: var(--codex-glass);
  border: 1px solid var(--codex-border);
  border-radius: calc(12 * var(--pt));
  padding: calc(14 * var(--pt)) calc(18 * var(--pt));
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.challenge-date.highlight {
  border-color: rgba(154, 166, 255, 0.55);
  box-shadow: 0 0 calc(26 * var(--pt)) rgba(110, 123, 255, 0.28);
}

.cd-day {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: calc(24 * var(--pt));
  font-weight: 600;
  color: var(--codex-accent);
  line-height: 1;
}

.cd-label {
  font-size: calc(12 * var(--pt));
  color: var(--codex-fg-muted);
  margin-top: calc(6 * var(--pt));
}

.challenge-date.highlight .cd-label {
  color: var(--codex-fg);
}
</style>
