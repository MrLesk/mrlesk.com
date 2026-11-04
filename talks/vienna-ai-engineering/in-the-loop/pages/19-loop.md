---
layout: default
mood: 4
---

# In the loop.

<div class="stage">
  <div class="loop">
    <svg viewBox="0 0 820 330" aria-hidden="true">
      <path d="M250 46 H560" /><path class="head" d="M570 46 l-12 -6 v12 z" />
      <path d="M640 92 V228" /><path class="head" d="M640 238 l-6 -12 h12 z" />
      <path d="M570 284 H260" /><path class="head" d="M250 284 l12 -6 v12 z" />
      <path d="M180 238 V102" /><path class="head" d="M180 92 l-6 12 h12 z" />
      <!-- Where each project comes in, one click each: greenfield up into Plan, then brownfield down into See. -->
      <g v-click="1"><path class="greenfield" d="M40 146 V102" /><path class="greenfield head" d="M40 92 l-6 12 h12 z" /></g>
      <g v-click="2"><path class="brownfield" d="M780 184 V228" /><path class="brownfield head" d="M780 238 l-6 -12 h12 z" /></g>
    </svg>
    <div class="loop-node n1"><span>PLAN</span><strong>Backlog.md tasks, pinned on the map</strong></div>
    <div class="loop-node n2"><span>BUILD</span><strong>Agents write the code</strong></div>
    <div class="loop-node n3"><span>SEE</span><strong>Save a file. The map updates in real time.</strong></div>
    <div class="loop-node n4"><span>REVIEW</span><strong>Review the architecture changes of each task.</strong></div>
    <div class="loop-you"><strong>You</strong><span>IN THE LOOP</span></div>
    <div v-click="1" class="loop-entry greenfield"><span>GREENFIELD</span>start from tasks</div>
    <div v-click="2" class="loop-entry brownfield"><span>BROWNFIELD</span>start from a scan</div>
  </div>
</div>

<!--
⏱ 13:50

This is the loop from the title, and you're in the middle of it.

Groma.md scans your code, draws it as a C4 architecture map, and keeps that map open while you and
your agents work. Tasks are pinned on the components they touch, including the ones still to do.
Agents write the code, the map updates in real time as files are saved, and you review the architecture
changes of each task on the map.

There are two ways in. [click] A greenfield project starts with the plan: tasks for the agents.
[click] A brownfield one starts with a scan of the code you already have. After that it's the same loop.
The demo has one of each.

HONESTY NOTE: the abstract says "you design it in Groma and let the agents write the code".
Design-first drafting isn't ready. Today planning means Backlog.md tasks pinned on the map.
Say that plainly if someone asks. Don't promise draft plans.
-->
