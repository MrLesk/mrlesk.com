---
layout: default
---

<div class="sheet-id">09 · SHARED MODEL</div>

# Agents can “see” the blueprint

<div class="same-model">
  <div class="reader human-reader">
    <div class="reader-label">HUMAN VIEW</div>
    <div class="reader-blueprint">
      <div class="mini-domain"><strong>COMMERCE</strong><span>Checkout</span><span>Orders</span><span>Inventory</span></div>
      <div class="mini-domain"><strong>IDENTITY</strong><span>Login</span><span>Profile</span></div>
    </div>
    <p>Bounded visual blueprint</p>
  </div>
  <div class="shared-core">
    <img src="/groma-mark-topdown.svg" alt="" />
    <strong>ONE MODEL</strong>
    <span>ONE SEMANTIC PATH</span>
  </div>
  <div class="reader agent-reader">
    <div class="reader-label">AGENT VIEW</div>
    <pre><code>$ groma blueprint traverse checkout<br><br>component: Checkout<br>intent: Approved cart → order<br>relationships:<br>&nbsp;&nbsp;- creates: Orders<br>evidence: bound</code></pre>
    <p>Bounded plaintext and JSON</p>
  </div>
</div>

<p class="same-model-note">Agents already grep code. Groma adds the intent only your team can provide.</p>
