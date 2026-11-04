---
layout: default
mood: 4
clicks: 1
---

<!-- The click adds Backlog.md: it types onto the install line and the bundle tag lands (see "Try it" in style.css). -->
<div class="try" :class="{ bundled: $clicks >= 1 }">
  <img class="try-map" src="/demo/walk-0.webp" alt="">
  <img class="try-lockup" src="/groma-lockup.svg" alt="groma.md">
  <h1>Your architecture as a <em>live C4 map</em>, stored as <em>OKF Markdown</em> files in your repository.</h1>
  <div class="try-row">
    <figure class="try-qr">
      <img src="/qr-groma.svg" alt="QR code for https://groma.md">
      <figcaption>Scan for groma.md</figcaption>
    </figure>
    <div class="try-steps">
      <p class="try-now">Try it now</p>
      <div class="try-terminal">
        <div><i>1</i><span>INSTALL</span><code>npm i -g groma.md <em>backlog.md</em></code></div>
        <div><i>2</i><span>SCAN</span><code>groma web</code></div>
        <div class="curate"><i>3</i><span>CURATE</span><b>your agent</b></div>
      </div>
      <ul class="try-chips">
        <li>FREE</li>
        <li>MIT</li>
        <li>LOCAL</li>
        <li>NO ACCOUNT</li>
        <li>NO DB</li>
      </ul>
      <!-- Groma.md and Backlog.md come as a pair: Backlog.md keeps the tasks, Groma.md the overview. -->
      <div class="try-bundle">
        <p>Bundle</p>
        <div><b>Backlog.md</b><span>tasks</span></div>
        <div><b>Groma.md</b><span>overview</span></div>
      </div>
    </div>
  </div>
</div>

<!--
⏱ 29:15 (50-minute timings still to redo). From Tuesday's keynote demo. Phones out.

The map lives in your repository as Markdown, next to the code: no database, no account, nothing
leaves your machine. Install it, run groma web, and ask your agent to curate the first scan.
[click] Backlog.md joins the install line and the bundle tag lands.
DRAFT, your words: Get Backlog.md with it, they work together. Backlog.md manages the tasks, Groma.md the overview,
and the tasks show up pinned on the map.
The QR code opens groma.md. Behind the steps, Groma.md's own map, the one from the first demo.
-->
