---
layout: default
---

<div class="sheet-id">01 · DEFINITION</div>

# What is <span class="accent">groma.md</span>?

<div class="split split-definition">
  <div class="definition-copy">
    <p class="lede">A living map of your system’s architecture, stored inside your repository.</p>
    <p>It helps you understand unfamiliar codebases and describe where the architecture should go next.</p>
    <div class="truth-pair">
      <div><strong>Intent</strong><span>What each part is for</span></div>
      <div><strong>Evidence</strong><span>What scanners found in code</span></div>
    </div>
  </div>
  <div class="blueprint-mini" aria-label="A small system blueprint">
    <div class="bp-title">SYSTEM BLUEPRINT</div>
    <div class="bp-domain domain-one"><span>WEB</span><i class="bp-node dashed">App</i><i class="bp-node">Checkout</i></div>
    <div class="bp-domain domain-two"><span>CORE</span><i class="bp-node selected">Orders</i><i class="bp-node">Inventory</i></div>
    <div class="bp-domain domain-three"><span>IDENTITY</span><i class="bp-node dashed">Login</i></div>
    <img src="/groma-mark-topdown.svg" class="bp-register" alt="" />
  </div>
</div>
