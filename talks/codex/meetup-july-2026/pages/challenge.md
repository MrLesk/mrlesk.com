---
title: The Build Week Challenge
level: 1
---

<div class="challenge-kicker">The Build Week Challenge</div>

<h1 class="prize-amount">Win up to $100,000</h1>

<p class="prize-extras">plus OpenAI credits, DevDay passes, spotlights, and time with the OpenAI team</p>

<div class="cards-grid cols-3 challenge-facts">

<div class="card">
  <div class="card-eyebrow">Who</div>
  <div class="card-body">Solo or as a team. From scratch or on an existing project.</div>
</div>

<div class="card">
  <div class="card-eyebrow">Judged at OpenAI</div>
  <div class="card-body">By the team behind Codex, including Vienna's own Peter Steinberger 🇦🇹</div>
</div>

<div class="card">
  <div class="card-eyebrow">Deadline</div>
  <div class="card-body">Submissions close July 21: five days from tonight.</div>
</div>

</div>

<div class="challenge-cta">
  <div class="codex-callout">openai.com/build-week → Register on Devpost</div>
  <div class="challenge-qr">
    <img src="/build-week-qr.png" alt="QR code to openai.com/build-week" />
  </div>
</div>

<style>
.challenge-kicker {
  font-size: calc(12 * var(--pt));
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--codex-accent);
  margin: calc(6 * var(--pt)) 0 calc(16 * var(--pt));
}

/* The money line is the slide's one headline; the title above is a kicker. */
.slidev-layout.default h1.prize-amount {
  font-size: calc(64 * var(--pt));
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
  margin: 0 0 calc(16 * var(--pt));
  background: linear-gradient(90deg, #ffffff 30%, #9aa6ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 calc(2 * var(--pt)) calc(20 * var(--pt)) rgba(110, 123, 255, 0.35));
}

.prize-extras {
  margin: 0;
  font-size: calc(15 * var(--pt));
  color: var(--codex-fg-muted);
}

.challenge-facts {
  margin-top: calc(24 * var(--pt));
}

.challenge-facts .card {
  padding: calc(14 * var(--pt)) calc(16 * var(--pt));
  gap: calc(5 * var(--pt));
}

/* URL and QR read as one unit: the pill names the link, the QR is the link. */
.challenge-cta {
  display: flex;
  align-items: center;
  gap: calc(20 * var(--pt));
  margin-top: calc(22 * var(--pt));
}

.challenge-cta .codex-callout {
  margin-top: 0;
}

/* White panel on purpose: QR codes want a light quiet zone to scan reliably. */
.challenge-qr {
  background: #ffffff;
  border-radius: calc(10 * var(--pt));
  padding: calc(7 * var(--pt));
  box-shadow: 0 calc(8 * var(--pt)) calc(24 * var(--pt)) rgba(0, 0, 0, 0.45);
  line-height: 0;
}

.challenge-qr img {
  width: calc(80 * var(--pt));
  height: calc(80 * var(--pt));
  image-rendering: pixelated;
}
</style>

<!--
Everything else lives on Devpost: full rules, tracks, and submission requirements.
Dates: opened July 13, submissions close Tuesday July 21 (five days from tonight), judging runs July 22 to August 7, winners announced August 12.
Judged on technical implementation, design and user experience, potential impact, and quality of the idea, with thoughtful use of GPT-5.6 and Codex.
The judges: Thibault Sottiaux (Head of Product & Platform), Kath Korevec and Tara Seshan (Product), Leah Belsky (VP of Education), and Peter Steinberger, Vienna's own, from PSPDFKit to OpenAI.
A submission is a project description, demo video, and repo.
-->
