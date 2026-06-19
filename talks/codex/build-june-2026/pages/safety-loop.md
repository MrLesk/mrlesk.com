---
title: Safety loop
level: 1
---

# The safety loop

<div class="cards-grid cols-2" style="margin-top: calc(22 * var(--pt));">

<div class="card">
  <div class="card-eyebrow">Default</div>
  <div class="card-title">Ask for approval</div>
  <div class="card-body">Let Codex work inside the sandbox, but make it pause before crossing the boundary: network, files outside the workspace, or side-effecting tools.</div>
</div>

<div class="card">
  <div class="card-eyebrow">Approve for me</div>
  <div class="card-title">Auto-review stays bounded</div>
  <div class="card-body">Codex can keep moving in the workspace, while extra-access requests are reviewed automatically. It can make mistakes, so use it deliberately.</div>
</div>

<div class="card">
  <div class="card-eyebrow">Sandbox</div>
  <div class="card-title">The boundary is real</div>
  <div class="card-body">macOS uses Seatbelt. Windows native runs in PowerShell with the Windows sandbox: elevated when available, unelevated as fallback.</div>
</div>

<div class="card featured">
  <div class="card-eyebrow">Full access</div>
  <div class="card-title">Only when you mean it</div>
  <div class="card-body">Full access can edit any file and run networked commands without approval. Keep it for isolated environments or very trusted workflows.</div>
</div>

</div>
