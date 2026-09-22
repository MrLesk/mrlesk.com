---
layout: default
mood: 4
routeAlias: demo-java
---

<div class="beat">
  <div class="beat-no"><b>3</b><span>OF 4 · DEMO</span></div>
  <div>
    <span class="live">LIVE</span>
    <h1>Map Keycloak, live.</h1>
    <p class="beat-line">8,467 Java files. The raw result, no AI involved.</p>
    <div class="cmds"><code>git clone</code><i>→</i><code>groma web</code></div>
    <div class="tags"><span>DETERMINISTIC</span><span>OFFLINE</span><span>SAME CODE, SAME MAP</span></div>
  </div>
</div>


<!--
⏱ 17:00. Chapter card. The next slide runs the two commands for you. No `groma init`: `groma web` sets the project up in the browser.

OPEN PROBLEM: a fresh Keycloak scan finds nothing today. ~/projects/keycloak/groma/scanners.json points at
the built scanners in groma3/plugins/scanners/*/dist/package. Those builds (0.1.1, Sep 19) still say
"groma ^0.3.0", your Groma is 0.4.0, so `groma scanner check` reports every scanner as blocked.
The scanner source already says ">=0.3.0": the builds are just stale. Your existing Keycloak map opens
fine because it is read from the stored Markdown, not rescanned.
TESTED: with scanners.json pointing at the source folders (plugins/scanners/java instead of
plugins/scanners/java/dist/package) a fresh Keycloak scan works. It takes 76 seconds and writes about
6,350 raw documents, so plan what you say during that minute.
-->
