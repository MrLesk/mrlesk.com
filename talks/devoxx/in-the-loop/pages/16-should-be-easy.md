---
layout: default
mood: 3
---

# Reviewing should become easier.

<div class="stage">
  <WhenActive>
    <div class="flow">
      <div class="flow-step">
        <div class="flow-pic task-pic"><b /><span v-for="n in 3" :key="n"><i /><s /></span></div>
        <strong>Task</strong>
      </div>
      <span class="flow-arrow">→</span>
      <div class="flow-step">
        <div class="flow-pic code-pic"><i v-for="([x, w], n) in [[0, 46], [8, 70], [16, 52], [16, 64], [8, 30], [8, 74], [16, 58], [24, 44], [16, 36], [8, 22], [0, 62], [8, 48]]" :key="n" :style="{ marginLeft: `${x}%`, width: `${w}%`, '--i': n }" /></div>
        <strong>Code</strong>
      </div>
      <span class="flow-arrow">→</span>
      <div class="flow-step review">
        <div class="flow-pic arch-pic">
          <svg viewBox="0 0 180 112" aria-hidden="true">
            <path d="M90 30 V40 M40 40 H140 M40 40 V48 M140 40 V48 M40 72 V81 H140 V72 M90 81 V88" />
            <rect x="60" y="6" width="60" height="24" />
            <rect x="10" y="48" width="60" height="24" />
            <rect x="110" y="48" width="60" height="24" />
            <rect x="60" y="88" width="60" height="18" />
          </svg>
        </div>
        <strong>Review architecture</strong>
      </div>
    </div>
  </WhenActive>
</div>

<!--
⏱ 08:10

Reviewing should become easier. I give an agent a Backlog.md task, the agent writes the code,
and I review the architecture.
Should be easy. What could go wrong?
-->
