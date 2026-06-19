---
title: Pricing
level: 2
---

# Pricing

<p class="pricing-lede">
  Codex is included in ChatGPT Free, Go, Plus, Pro, Business, Edu, and Enterprise plans.
</p>

<div class="cards-grid cols-4 pricing-cards mt-10">

<div class="card">
  <div class="card-eyebrow">Free and Go</div>
  <div class="card-price">$0 / $8<span>/mo</span></div>
  <div class="card-meta">Try it out</div>
  <div class="card-body">
    Free covers quick tasks. Go is the lightweight paid entry plan.
  </div>
</div>

<div class="card featured">
  <div class="card-eyebrow">Plus</div>
  <div class="card-price">$20<span>/mo</span></div>
  <div class="card-meta">Focused weekly use</div>
  <div class="card-body">
    Codex on web, CLI, IDE, and iOS, with cloud integrations and current models.
  </div>
</div>

<div class="card">
  <div class="card-eyebrow">Pro</div>
  <div class="card-price">From $100<span>/mo</span></div>
  <div class="card-meta">Higher limits</div>
  <div class="card-body">
    5x or 20x more Codex usage than Plus, plus Codex-Spark research preview.
  </div>
</div>

<div class="card">
  <div class="card-eyebrow">Business</div>
  <div class="card-price">Pay as you go</div>
  <div class="card-meta">Team workspace</div>
  <div class="card-body">
    Codex seats, larger cloud VMs, admin controls, SSO, MFA, and business data protections.
  </div>
</div>

</div>

<style>
.pricing-lede {
  max-width: calc(760 * var(--pt));
  color: var(--codex-fg-muted);
  font-size: calc(15 * var(--pt));
  margin-bottom: calc(14 * var(--pt));
}

.pricing-cards {
  gap: calc(14 * var(--pt));
}

.pricing-cards .card {
  padding: calc(17 * var(--pt));
  gap: calc(7 * var(--pt));
}

.pricing-cards .card-body {
  font-size: calc(12 * var(--pt));
  line-height: 1.38;
}

.pricing-cards .card-price span {
  font-size: 0.38em;
  opacity: 0.72;
}

.pricing-cards .card-price {
  font-size: calc(32 * var(--pt));
  min-height: calc(42 * var(--pt));
}

.pricing-footer {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: calc(14 * var(--pt));
  margin-top: calc(14 * var(--pt));
}

.pricing-footer > div {
  border: 1px solid var(--codex-border);
  border-radius: calc(10 * var(--pt));
  padding: calc(10 * var(--pt)) calc(14 * var(--pt));
  background: rgba(238, 240, 255, 0.42);
}

.pricing-footer strong {
  display: block;
  color: var(--codex-accent);
  font-size: calc(12 * var(--pt));
  margin-bottom: calc(2 * var(--pt));
}

.pricing-footer span {
  color: var(--codex-fg-muted);
  font-size: calc(11 * var(--pt));
  line-height: 1.25;
}
</style>
