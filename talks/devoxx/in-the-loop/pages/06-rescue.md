---
layout: default
mood: 1
clicks: 4
title: AI to the rescue.
---

<h1 class="title-roll" :class="{ rolled: $clicks >= 4 }"><span>AI to the rescue.</span><span>AI power!</span></h1>

<div class="stage rescue" :class="{ s1: $clicks >= 1, s2: $clicks >= 2, s3: $clicks >= 3, s4: $clicks >= 4 }">
  <WhenActive>
    <div class="term-wrap">
      <Term>
        <p class="ask"><span class="who">codex ›</span> <span class="typed">we have a 500 in production, pls fix!</span><span class="cursor"></span></p>
        <p class="step tail"><span class="state"><i class="spin"></i><span class="ok">✓</span></span> tailing the production worker <span class="note">· my Cloudflare CLI session</span></p>
        <p class="step cause"><span class="ok">✓</span> root cause: one SQL statement</p>
        <p class="step sql">&nbsp;&nbsp;<span class="sql-typed">SELECT * FROM table WHERE x IN (<GrowingIds :running="$clicks >= 3" /></span></p>
        <p class="step fix"><span class="ok">→</span> hotfix and permanent fix proposed</p>
      </Term>
      <div class="stopwatch">
        <svg viewBox="0 0 104 104" aria-hidden="true"><circle class="sweep" cx="52" cy="52" r="51" pathLength="100" /></svg>
        <b>30s</b><span>to diagnose</span>
      </div>
    </div>
  </WhenActive>
  <div class="say-swap">
    <p class="say small dim">I pointed Codex at the problem.</p>
    <p class="say small dim">An ever-growing array. A ticking bomb.</p>
  </div>
</div>

<!--
⏱ 02:30 to 03:30. One terminal, four clicks.

So I did what I had been doing all year. I pointed Codex at the problem:
"we have a 500 in production, pls fix".

[click] Enter. One: it used my Cloudflare CLI session to tail the production worker.

[click] Two: it found the root cause in a SQL WHERE statement.

[click] The code was doing select star from table where x in an ever-growing array. A ticking bomb.
The list keeps growing on screen while you talk.

[click] Within 30 seconds Codex knew the problem, and it proposed a hotfix and a permanent fix.
The badge stamps 30s and the title rolls to "AI power!".
-->
