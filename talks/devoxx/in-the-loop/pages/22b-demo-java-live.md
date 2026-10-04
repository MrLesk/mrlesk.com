---
layout: default
mood: 4
class: full
meter: false
clicks: 4
routeAlias: live-java
---

<GromaFrame
  name="keycloak-devoxx"
  origin="http://localhost:4803"
  :setup="['', 'initialize', 'scanners']"
  :views="['', '', '', 'hud=off', '']"
  :captions="['', '', '', 'The raw scan. No AI involved.', 'Recognizable, not yet curated.']"
/>

<!--
⏱ 22:30 to 25:00. The map of the copy you just cloned, scanned in front of the audience.

This slide waits until that Groma.md server answers, then shows it. A fresh copy opens on the Groma.md setup,
and your clicks press its buttons, with the values on screen:

Click 0. "Initialize Groma": the project is called keycloak-devoxx, after the folder.
[click] Continue. Groma.md looks at the code and proposes scanners.
[click] Install & scan. Let people watch the scan run; the map opens by itself when it's done.
[click] The whole map without chrome.
[click] The chrome comes back so you can read names.

Double-click the map to use it by hand. The chip at the top gives the keyboard back to the slides.

TODO: replace the two generic views with
real ones, add captions, and capture stills into public/demo/.
-->
