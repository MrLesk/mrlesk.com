---
layout: default
transition: slide-up
section: Spec-driven flow
hideIndicator: true
---

# What is Spec-driven AI Development?

<Arrow v-click="2" x1="350" y1="160" x2="512" y2="160" />
<Arrow v-click="3" x1="700" y1="218" x2="700" y2="336" />
<Arrow v-click="4" x1="514" y1="400" x2="356" y2="400" />
<Arrow v-click="5" x1="170" y1="336" x2="170" y2="220" />

<div class="mt-14 grid grid-cols-2 grid-rows-2 gap-x-40 gap-y-30">
  <Card
    class="w-full bg-emerald-200/90!"
    accent="#33d399"
    title="Step 01"
    :gradient="false"
    v-click="1">
    <h4>Know what to build</h4>
    <div class="text-sm mt-2">Idea, PRD, deliverables</div>
  </Card>

  <Card
    class="w-full bg-amber-200/90!"
    :accent="'#f6d272'"
    title="Step 02"
    :gradient="false"
    v-click="2">
    <h4 >Tasks creation &amp; decomposition</h4>
    <div class="text-sm mt-2">Break intent into atomic Backlog.md tasks</div>
  </Card>

  <Card
    class="w-full bg-violet-200/95! "
    :accent="'#c9b5ff'"
    title="Step 04"
    :gradient="false"
    v-click="4">
    <h4 >Code implementation</h4>
    <div class="text-sm mt-2">Build, learn, improve, document</div>
  </Card>

<Card
    class="w-full bg-sky-200/95!"
    :accent="'#8fd4ff'"
    title="Step 03"
    :gradient="false"
    v-click="3">
    <h4 >Research + Implementation plan</h4>
    <div class="text-sm mt-2">Build context for AI Agents</div>
</Card>
</div>
