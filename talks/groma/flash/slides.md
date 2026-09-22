---
theme: penguin
title: "groma.md in 80 seconds"
info: "Flash talk, 80 seconds. Product first: the live Groma map runs inside the slides."
author: Alex Gavrilescu
colorSchema: light
drawings:
  persist: false
mdc: true
transition: fade
layout: default
mood: 4
# Resolved from this deck's parent folder: the shared addon at the repository root.
addons:
  - ../../slidev-addon-groma-live
# Started with `bun run dev` by the addon. Nothing else to run.
gromaLive:
  - name: groma
    cwd: ~/projects/groma3
    port: 4801
  # A small order service an agent built task by task. Its git history is replayed on a live map.
  - name: orders
    port: 4804
    replay:
      source: ../../../slidev-addon-groma-live/demo/orders.bundle
      interval: 300
---

<div class="cover">
  <img src="/groma-lockup.svg" class="cover-lockup" alt="groma.md" />
  <h1>Your architecture,<br><span class="accent">alive.</span></h1>
  <p class="cover-sub">A live map of your codebase, while you and your agents change it.</p>
  <p class="cover-by">Alex Gavrilescu · @mrlesk</p>
</div>

<!--
⏱ 0 to 10s. Speak over this slide, then click.

"Agents write most of my code now. So the real question is: do I still know what my system looks like?
This is Groma."

The clock along the bottom starts on your first click and already counts these 10 seconds.
-->

---
src: ./pages/01-live.md
---

---
src: ./pages/02-timelapse.md
---

---
src: ./pages/03-get.md
---
