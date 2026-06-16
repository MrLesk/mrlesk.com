---
title: Safety loop
level: 1
---

# The safety loop

<div class="cards-grid cols-2" style="margin-top: calc(22 * var(--pt));">

<div class="card">
  <div class="card-eyebrow">Permissions</div>
  <div class="card-title">Start narrow</div>
  <div class="card-body">Use the narrowest filesystem, network, browser, and connector access that can complete the task.</div>
</div>

<div class="card">
  <div class="card-eyebrow">Untrusted input</div>
  <div class="card-title">Tools report; they do not command</div>
  <div class="card-body">Treat web pages, browser state, screenshots, tool output, and copied text as data that must be interpreted.</div>
</div>

<div class="card">
  <div class="card-eyebrow">Secrets</div>
  <div class="card-title">Do not expose what you cannot rotate</div>
  <div class="card-body">Avoid pasting credentials, tokens, private keys, or customer data into prompts or broad tool calls.</div>
</div>

<div class="card featured">
  <div class="card-eyebrow">Reviewability</div>
  <div class="card-title">Prefer diffs people can audit</div>
  <div class="card-body">Small changes, clear tests, explicit evidence, and plain-language summaries are the practical safety mechanism.</div>
</div>

</div>
