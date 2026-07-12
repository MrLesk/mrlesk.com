---
title: This week is Build Week
level: 1
---

# This week is Build Week

<div class="bw-wrap">

<div class="bw-track">
  <span class="bw-tick" style="left: 12.5%"></span>
  <span class="bw-tick" style="left: 25%"></span>
  <span class="bw-tick" style="left: 50%"></span>
  <span class="bw-tick" style="left: 62.5%"></span>
  <span class="bw-tick" style="left: 75%"></span>
  <span class="bw-tick" style="left: 87.5%"></span>
  <span class="bw-dot bw-dot-start" style="left: 0%"></span>
  <span class="bw-dot bw-dot-tonight" style="left: 37.5%"></span>
  <span class="bw-dot bw-dot-end" style="left: 100%"></span>
</div>

<div class="bw-cards">
  <div class="bw-card bw-card-start">
    <div class="bw-eyebrow">Jul 13</div>
    <div class="bw-title">Build Week<br />begins</div>
  </div>

  <div class="bw-card bw-card-tonight">
    <div class="bw-eyebrow">Tonight · Jul 16</div>
    <div class="bw-title">Vienna</div>
    <div class="bw-body">One of 60+ community events worldwide</div>
  </div>

  <div class="bw-card bw-card-end">
    <div class="bw-eyebrow">Jul 21</div>
    <div class="bw-title">Challenge<br />deadline</div>
    <div class="bw-tag">5 days left</div>
  </div>
</div>

</div>

<style>
.bw-wrap {
  margin: calc(104 * var(--pt)) 0 0;
}

.bw-track {
  position: relative;
  height: calc(4 * var(--pt));
  border-radius: calc(4 * var(--pt));
  background: linear-gradient(90deg, rgba(134, 146, 255, 0.3), rgba(134, 146, 255, 0.7) 40%, rgba(255, 190, 110, 0.75));
}

.bw-tick {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: calc(7 * var(--pt));
  height: calc(7 * var(--pt));
  border-radius: 50%;
  background: rgba(243, 245, 252, 0.28);
}

.bw-dot {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
}

/* Luna → Terra → Sol: the GPT-5.6 tiers marking the week, matching the
   cover art (moon left, sunset right). */
.bw-dot-start {
  width: calc(26 * var(--pt));
  height: calc(26 * var(--pt));
  /* Oversized inside the circular clip: the render's rough outer pixels fall
     outside the circle, leaving the browser's clean antialiased edge. */
  background: url('/luna.png') center / 120% no-repeat;
  box-shadow: 0 0 calc(14 * var(--pt)) rgba(220, 228, 248, 0.45);
  /* Left edge flush with the Jul 13 card below. */
  transform: translate(0, -50%);
}

.bw-dot-tonight {
  width: calc(46 * var(--pt));
  height: calc(46 * var(--pt));
  background: url('/terra.png') center / 120% no-repeat;
  border: calc(2 * var(--pt)) solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 0 calc(32 * var(--pt)) rgba(134, 146, 255, 0.85);
}

.bw-dot-end {
  width: calc(30 * var(--pt));
  height: calc(30 * var(--pt));
  background: url('/sol.png') center / 120% no-repeat;
  box-shadow: 0 0 calc(24 * var(--pt)) rgba(255, 150, 60, 0.7);
  /* Right edge flush with the deadline card below. */
  transform: translate(-100%, -50%);
}

.bw-cards {
  position: relative;
  /* Clear air below the Luna/Terra/Sol markers: Terra alone reaches ~23pt
     under the track line. */
  margin-top: calc(48 * var(--pt));
  height: calc(150 * var(--pt));
}

.bw-card {
  position: absolute;
  top: 0;
  background: var(--codex-glass);
  border: 1px solid var(--codex-border);
  border-radius: calc(12 * var(--pt));
  padding: calc(14 * var(--pt)) calc(18 * var(--pt));
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  text-align: center;
  /* Outer cards hug their content; explicit br tags keep the two-line titles. */
  width: max-content;
}

.bw-card-start { left: 0; text-align: left; }

.bw-card-tonight {
  left: 37.5%;
  transform: translateX(-50%);
  width: calc(250 * var(--pt));
  background: linear-gradient(135deg, rgba(110, 123, 255, 0.92) 0%, rgba(52, 66, 224, 0.92) 100%);
  border-color: rgba(255, 255, 255, 0.24);
  box-shadow: 0 calc(12 * var(--pt)) calc(36 * var(--pt)) rgba(30, 42, 140, 0.5);
}

.bw-card-end { right: 0; text-align: right; }

.bw-eyebrow {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: calc(11 * var(--pt));
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--codex-accent);
  font-weight: 500;
  margin-bottom: calc(5 * var(--pt));
}

.bw-card-tonight .bw-eyebrow { color: rgba(255, 255, 255, 0.85); }
.bw-card-end .bw-eyebrow { color: #ffd9a3; }

.bw-title {
  font-size: calc(22 * var(--pt));
  font-weight: 650;
  line-height: 1.1;
}

.bw-card-tonight .bw-title {
  font-size: calc(30 * var(--pt));
  color: #ffffff;
}

.bw-body {
  font-size: calc(13 * var(--pt));
  color: rgba(255, 255, 255, 0.88);
  margin-top: calc(6 * var(--pt));
  line-height: 1.35;
}

.bw-tag {
  display: inline-block;
  margin-top: calc(8 * var(--pt));
  font-size: calc(11 * var(--pt));
  font-weight: 600;
  color: #ffd9a3;
  background: rgba(255, 170, 64, 0.14);
  border: 1px solid rgba(255, 190, 110, 0.4);
  border-radius: calc(20 * var(--pt));
  padding: calc(2 * var(--pt)) calc(10 * var(--pt));
}

</style>

<!--
The timeline markers are Luna, Terra, Sol: the GPT-5.6 tiers. Tonight we are on Terra; the deadline burns like Sol.
Build Week: a global week for exploring what's possible with Codex. We are right in the middle of it.
Livestreams all week: Greg Brockman, Thibault Sottiaux, Corey Ching and the Codex team.
OpenAI Academy sessions: Codex Sites streams tonight at 21:00 our time, Creative Building follows July 21.
Discord office hours running through the week. Everything at openai.com/build-week.
And the one thing to remember: the Build Week Challenge closes Tuesday. Real prizes, judged at OpenAI. Details on the next slides.
-->
