---
layout: default
mood: 1
---

# AI power!

<div class="stage">
  <WhenActive>
    <div class="term-wrap">
      <Term>
        <p><span class="who">codex ›</span> we have a 500 in production, pls fix!</p>
        <p><span class="ok">✓</span> tailing the production worker <span class="note">· my Cloudflare CLI session</span></p>
        <p><span class="ok">✓</span> root cause: one SQL statement</p>
        <p class="sql">&nbsp;&nbsp;SELECT * FROM table WHERE x IN (<span class="grow">1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22</span>…</p>
        <p><span class="ok">→</span> hotfix and permanent fix proposed</p>
      </Term>
      <div class="badge-time"><b>30s</b><span>to diagnose</span></div>
    </div>
  </WhenActive>
  <p class="say small dim">An ever-growing array. A ticking bomb.</p>
</div>

<!--
⏱ 02:45

Within 30 seconds Codex knew the problem.

One: it used my Cloudflare CLI session to tail the production worker.
Two: it found the root cause in a SQL WHERE statement. The code was doing
select star from table where x in an ever-growing array. A ticking bomb.

It proposed a hotfix and a permanent fix.
-->
