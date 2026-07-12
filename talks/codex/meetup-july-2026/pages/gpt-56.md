---
title: GPT-5.6
level: 2
---

<div class="deepswe-slide">

<div class="deepswe-rail">
  <h1>GPT-5.6</h1>

  <div class="rail-item">
    <div class="rail-title">Sol</div>
    <p>Best coding model yet: state of the art, at a fraction of the cost.</p>
  </div>

  <div class="rail-item">
    <div class="rail-title">Terra & Luna</div>
    <p>The efficiency tiers. Terra is the model Free & Go plans get in Codex.</p>
  </div>

  <div class="rail-item">
    <div class="rail-title">max & ultra</div>
    <p>New effort settings. <code>ultra</code> coordinates 4 agents in parallel, Plus and up.</p>
  </div>
</div>

<figure class="deepswe-frame">
  <img src="/deepswe-leaderboard.svg" alt="DeepSWE leaderboard: score versus average cost per task, with the GPT-5.6 family on the efficiency frontier" />
  <figcaption>DeepSWE v1.1 · cost view · 113 tasks · updated July 9, 2026 · <a href="https://deepswe.datacurve.ai" target="_blank">deepswe.datacurve.ai</a></figcaption>
</figure>

</div>

<style>
.deepswe-slide {
  display: grid;
  grid-template-columns: calc(200 * var(--pt)) minmax(0, 1fr);
  gap: calc(26 * var(--pt));
  align-items: center;
  margin-top: calc(4 * var(--pt));
}

/* Solid #10162c on purpose: it matches the label-halo color baked into the
   captured SVG, so the chart text blends seamlessly. */
.deepswe-frame {
  margin: 0;
  background: #10162c;
  border: 1px solid var(--codex-border);
  border-radius: calc(12 * var(--pt));
  padding: calc(12 * var(--pt)) calc(12 * var(--pt)) calc(8 * var(--pt));
  box-shadow: 0 calc(10 * var(--pt)) calc(34 * var(--pt)) rgba(0, 0, 0, 0.45);
}

.deepswe-frame img {
  width: 100%;
  height: auto;
  display: block;
}

.deepswe-frame figcaption {
  margin-top: calc(5 * var(--pt));
  font-size: calc(10.5 * var(--pt));
  color: var(--codex-fg-muted);
  text-align: right;
}

.deepswe-frame figcaption a {
  color: var(--codex-accent);
  border-bottom: none;
}

.deepswe-rail h1 {
  font-size: calc(34 * var(--pt));
  line-height: 1;
  margin: 0 0 calc(22 * var(--pt)) 0;
}

.rail-item {
  border-left: 2px solid rgba(134, 146, 255, 0.4);
  padding-left: calc(12 * var(--pt));
  margin-bottom: calc(16 * var(--pt));
}

.rail-item:last-child {
  margin-bottom: 0;
}

.rail-item .rail-title {
  font-size: calc(15 * var(--pt));
  font-weight: 650;
  margin-bottom: calc(3 * var(--pt));
}

.rail-item p {
  font-size: calc(12 * var(--pt));
  line-height: 1.42;
  color: rgba(233, 237, 249, 0.9);
  margin: 0;
}
</style>

<!--
GPT-5.6 family: Sol, Terra, Luna. Live in ChatGPT, Codex, and the API since July 9, rolling out globally.

- Sol: flagship. Best coding model yet, state of the art on DeepSWE, Terminal-Bench 2.1, and the Coding Agent Index with half the output tokens, half the time, roughly a third less cost.
- Terra: balanced tier, competitive with GPT-5.5 at lower cost. It's the model Free & Go plans get in Codex.
- Luna: fastest and cheapest, close to last generation's peak at less than half the estimated cost.
- Names: the number is the generation, Sol/Terra/Luna are durable capability tiers that advance on their own cadence.
- max: even more reasoning time than xhigh, available to everyone with GPT-5.6 in Codex (toggle in settings).
- ultra: coordinates 4 agents in parallel by default, Plus and up in Codex. In the API this is the multi-agent beta in the Responses API.
- Chart: DeepSWE by Datacurve, 113 real long-horizon engineering tasks. Green curves are the GPT-5.6 family pushing the score-vs-cost frontier to the top right corner.
-->

