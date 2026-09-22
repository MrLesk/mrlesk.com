---
layout: default
mood: 4
class: full
meter: false
clicks: 1
routeAlias: live-java
---

<GromaFrame
  origin="http://localhost:4803"
  :views="['hud=off', '']"
  :captions="['The raw scan. No AI involved.', 'Recognizable, not yet curated.']"
/>

<!--
⏱ 18:30 to 21:00. The map of the copy you just cloned, scanned in front of the audience.

This slide waits until that Groma answers, then shows it. A fresh copy opens on Groma's own setup:
project name, then scanners, then the scan. Double-click the map to use it, walk through the setup,
and let people watch the scan run. The chip at the top gives the keyboard back to the slides.

Click 0 is the whole map without chrome. [click] brings the chrome back so you can read names.

TODO once the raw scan works (see the note on the chapter card): replace the two generic views with
real ones, add captions, and capture stills into public/demo/.
-->
