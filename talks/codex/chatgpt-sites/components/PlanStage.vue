<script setup lang="ts">
import { useSlideSteps } from '../composables/useSlideSteps'

// Slide "Plans & limits".
//
//   start    the three plans, and the two kinds of limits
//   click 1  what running a Site includes today
//   click 2  what changes on February 1, 2027: a monthly hosting allowance per plan
//
// The slide's frontmatter must say `clicks: 2`.
//
// Every number here comes from OpenAI's Sites docs: "Usage and cost" and the Help Center
// article, checked on 2026-11-25. OpenAI says it "plans" to start charging on February 1,
// 2027 and calls the rates approximate: check them again before each talk.
const { step, stepClasses } = useSlideSteps(2)

/** `credits` is the monthly hosting allowance from February 1, 2027. */
const PLANS = [
  { name: 'Plus', colour: 'var(--codex-accent)', credits: 125, per: 'credits a month' },
  { name: 'Pro', colour: 'var(--codex-grad-3)', credits: 375, per: 'credits a month' },
  { name: 'Business', colour: 'var(--sites-live)', credits: 125, per: 'credits a seat, a month' },
]

const INCLUDED_TODAY = ['As many Sites as you want', '10 GB database per Site', 'No fixed limit for files']
</script>

<template>
  <div class="plans" :class="stepClasses">
    <div class="plans-row">
      <div v-for="(plan, index) in PLANS" :key="plan.name" class="plan" :style="{ '--plan-colour': plan.colour, '--order': index }">
        <div class="plan-name"><i aria-hidden="true" />{{ plan.name }}</div>
        <!-- Click 2: the hosting allowance opens under the plan's name. -->
        <div class="plan-allowance">
          <CountUp class="plan-credits" :to="plan.credits" :run="step >= 2" />
          <span class="plan-per">{{ plan.per }}</span>
        </div>
      </div>
    </div>

    <p class="plans-change">
      <strong>From February 1, 2027:</strong> a monthly hosting allowance. <span>Planned, may still change.</span>
    </p>

    <div class="limits">
      <div class="limit">
        <div class="limit-title">Building &amp; editing</div>
        <p class="limit-note">Counts toward your Codex usage.</p>
      </div>
      <div class="limit">
        <div class="limit-title">Running your site</div>
        <p class="limit-note">Hosting and storage have separate limits.</p>
        <!-- Click 1: what is included today. -->
        <div class="limit-facts">
          <span v-for="(fact, index) in INCLUDED_TODAY" :key="fact" class="limit-fact" :style="{ '--order': index }">{{ fact }}</span>
          <span class="limit-fact is-free" :style="{ '--order': INCLUDED_TODAY.length }">Hosting is free through January 31, 2027</span>
        </div>
      </div>
    </div>

    <p class="plans-footnote">Not available on Free or Go. Workspace availability and policies apply.</p>
  </div>
</template>

<style scoped>
/* The footnote stays at the bottom of the stage. The stage is at least this tall and grows
   when its content needs more room. */
.plans {
  display: flex;
  flex-direction: column;
  min-height: calc(326 * var(--pt));
}

/* When a column runs out of room, the browser squeezes the items that hide their overflow.
   That once cut a line of text in half. No item here may be squeezed. */
.plans > * {
  flex: none;
}

/* ── The three plans ────────────────────────────────────────────────────── */

.plans-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: calc(34 * var(--pt));
  margin-top: calc(14 * var(--pt));
}

.plan {
  padding-bottom: calc(10 * var(--pt));
  border-bottom: 1px solid var(--sites-line);
  animation: sites-rise 700ms var(--sites-ease-out) both;
  animation-delay: calc(200ms + var(--order) * 120ms);
}

.plan-name {
  display: flex;
  align-items: center;
  gap: calc(14 * var(--pt));
  font-size: calc(34 * var(--pt));
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.plan-name i {
  width: calc(10 * var(--pt));
  height: calc(10 * var(--pt));
  border-radius: 50%;
  background: var(--plan-colour);
}

/* Closed until click 2, then it opens and the number counts up. */
.plan-allowance {
  display: flex;
  align-items: baseline;
  gap: calc(8 * var(--pt));
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition:
    max-height 700ms var(--sites-ease-out),
    opacity 400ms ease;
}

.s2 .plan-allowance {
  max-height: calc(44 * var(--pt));
  opacity: 1;
  transition-delay: calc(var(--order) * 120ms);
}

.plan-credits {
  color: var(--plan-colour);
  font-size: calc(30 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.03em;
}

.plan-per {
  color: var(--codex-fg-muted);
  font-size: calc(12.5 * var(--pt));
}

.plans-change {
  overflow: hidden;
  max-height: 0;
  margin: 0;
  color: var(--codex-fg);
  font-size: calc(13.5 * var(--pt));
  opacity: 0;
  transition:
    max-height 700ms var(--sites-ease-out),
    margin 700ms var(--sites-ease-out),
    opacity 400ms ease;
}

.plans-change span {
  color: var(--codex-fg-muted);
}

.s2 .plans-change {
  max-height: calc(32 * var(--pt));
  margin-top: calc(10 * var(--pt));
  opacity: 1;
  transition-delay: 300ms;
}

/* ── The two kinds of limits ────────────────────────────────────────────── */

.limits {
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: calc(34 * var(--pt));
  margin-top: calc(30 * var(--pt));
  animation: sites-rise 700ms var(--sites-ease-out) 600ms both;
}

.limit-title {
  font-size: calc(18 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.015em;
}

.limit-note {
  margin: calc(3 * var(--pt)) 0 0 0;
  color: var(--codex-fg-muted);
  font-size: calc(14 * var(--pt));
}

.limit-facts {
  display: flex;
  flex-wrap: wrap;
  gap: calc(7 * var(--pt));
  margin-top: calc(11 * var(--pt));
}

.limit-fact {
  padding: calc(4 * var(--pt)) calc(11 * var(--pt));
  border-radius: 999px;
  background: var(--codex-accent-soft);
  color: var(--codex-accent);
  font-size: calc(12 * var(--pt));
  font-weight: 600;
  opacity: 0;
  transform: scale(0.7);
  transition:
    opacity 300ms ease,
    transform 500ms var(--sites-ease-spring);
}

.limit-fact.is-free {
  background: var(--sites-live-soft);
  color: var(--sites-live);
}

.s1 .limit-fact {
  opacity: 1;
  transform: none;
  transition-delay: calc(var(--order) * 110ms);
}

.plans-footnote {
  margin: auto 0 0 0;
  color: var(--codex-fg-muted);
  font-size: calc(11.5 * var(--pt));
  animation: sites-rise 700ms var(--sites-ease-out) 800ms both;
}
</style>
