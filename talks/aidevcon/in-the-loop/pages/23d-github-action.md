---
layout: default
mood: 4
routeAlias: github-action
---

<div class="action-slide">
  <div class="action-stage">
    <div class="action-map">
      <img src="/demo/action-map.webp" alt="Groma PR comparison map" />
    </div>
    <div class="action-comment">
      <img src="/demo/action-comment.webp" alt="GitHub Actions PR comment with Groma architecture comparison" />
    </div>
  </div>
  <div class="action-strip">
    <div>
      <p class="eyebrow">GITHUB ACTION · MARKETPLACE</p>
      <h2>Every PR gets a before/after map.</h2>
    </div>
    <code>MrLesk/groma.md-action</code>
  </div>
</div>

<style>
.action-slide {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 2px 6px 0;
}
.action-stage {
  position: relative;
  width: 780px;
  height: 392px;
  margin: 0 auto;
}
.action-map {
  width: 700px;
  height: 384px;
  overflow: hidden;
  background: #fff;
  border: 1.5px solid #171b1a;
  box-shadow: 9px 9px 0 -3px #1d9e75, 0 16px 36px rgba(23, 27, 26, 0.14);
}
.action-map img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.action-comment {
  position: absolute;
  right: -12px;
  bottom: 8px;
  width: 396px;
  height: 142px;
  overflow: hidden;
  background: #fff;
  border: 1.5px solid #171b1a;
  box-shadow: 7px 7px 0 -2px #1d9e75, 0 12px 30px rgba(23, 27, 26, 0.2);
}
.action-comment img {
  display: block;
  width: calc(100% + 2px);
  margin: -1px 0 0 -1px;
}
.action-strip {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-top: 6px;
}
.action-strip .eyebrow {
  margin: 0 0 2px !important;
  color: #12694d;
  font-family: "Fira Code", ui-monospace, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
}
.action-strip h2 {
  margin: 0 !important;
  color: #171b1a;
  font-size: 31px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.05;
}
.action-strip code {
  padding: 5px 10px;
  border: 1px solid #171b1a;
  background: #fff;
  color: #171b1a;
  font-size: 12px;
}
</style>

<!--
⏱ Quick mention of `groma-action` on the GitHub Marketplace right after the Brownfield diff.
Every pull request automatically comments a before/after architecture summary table and links directly to the interactive Groma comparison map.
-->
