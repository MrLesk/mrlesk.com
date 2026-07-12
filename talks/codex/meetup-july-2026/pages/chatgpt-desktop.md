---
title: One ChatGPT app
level: 2
---

# ChatGPT and Codex are now one app

<div class="uni-diagram">

<div class="uni-col">
  <div class="diagram-label">Before</div>
  <div class="old-stack">
    <div class="mini-win">
      <div class="win-bar">
        <span class="win-dots"><i></i><i></i><i></i></span>
        <span class="win-name">ChatGPT</span>
        <span class="win-tag">lives on as Classic</span>
      </div>
      <div class="win-body">
        <div class="skel" style="width: 72%"></div>
        <div class="skel" style="width: 48%"></div>
      </div>
    </div>
    <div class="mini-win">
      <div class="win-bar">
        <span class="win-dots"><i></i><i></i><i></i></span>
        <span class="win-name"><img src="/codex-logo.gif" alt="" /> Codex</span>
        <span class="win-tag">merged in</span>
      </div>
      <div class="win-body">
        <div class="skel" style="width: 64%"></div>
        <div class="skel" style="width: 55%"></div>
      </div>
    </div>
  </div>
</div>

<div class="uni-arrow">→</div>

<div class="uni-col">
  <div class="diagram-label">After</div>
  <div class="new-win">
    <div class="win-bar">
      <span class="win-dots"><i></i><i></i><i></i></span>
      <span class="win-name">ChatGPT</span>
    </div>
    <div class="new-app">
      <div class="new-sidebar">
        <div class="side-dropdown">
          <span><img src="/codex-logo.gif" alt="" /> Codex</span>
          <span class="dd-caret">▾</span>
        </div>
        <div class="dd-menu">
          <div class="dd-item">Work</div>
          <div class="dd-item active">Codex <span>✓</span></div>
        </div>
        <div class="side-item">
          <span class="side-icon"></span> Chat
          <span class="win-tag">in both</span>
        </div>
        <div class="skel thread" style="width: 82%"></div>
        <div class="skel thread" style="width: 60%"></div>
      </div>
      <div class="new-main">
        <div class="skel" style="width: 78%"></div>
        <div class="skel" style="width: 52%"></div>
        <div class="new-body-code">
          <div class="skel code-a" style="width: 62%"></div>
          <div class="skel code-b" style="width: 82%"></div>
          <div class="skel code-c" style="width: 55%"></div>
        </div>
      </div>
    </div>
  </div>
</div>

</div>

<style>
/* Before → after diagram, the only content on the slide */
.uni-diagram {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) auto minmax(0, 1.25fr);
  gap: calc(26 * var(--pt));
  align-items: stretch;
  margin-top: calc(38 * var(--pt));
  min-height: calc(310 * var(--pt));
}

.diagram-label {
  font-size: calc(10.5 * var(--pt));
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--codex-fg-muted);
  font-weight: 500;
  margin-bottom: calc(8 * var(--pt));
}

.uni-col {
  display: flex;
  flex-direction: column;
}

.old-stack {
  display: flex;
  flex-direction: column;
  gap: calc(10 * var(--pt));
  flex: 1;
}

.mini-win,
.new-win {
  background: var(--codex-glass);
  border: 1px solid var(--codex-border);
  border-radius: calc(10 * var(--pt));
  overflow: hidden;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.mini-win {
  flex: 1;
  display: flex;
  flex-direction: column;
  opacity: 0.78;
}

.new-win {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--codex-glass-strong);
  border-color: rgba(154, 166, 255, 0.5);
  box-shadow: 0 0 calc(30 * var(--pt)) rgba(110, 123, 255, 0.24);
}

.win-bar {
  display: flex;
  align-items: center;
  gap: calc(8 * var(--pt));
  padding: calc(7 * var(--pt)) calc(12 * var(--pt));
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid var(--codex-border);
}

.win-dots {
  display: inline-flex;
  gap: calc(4 * var(--pt));
}

.win-dots i {
  width: calc(5 * var(--pt));
  height: calc(5 * var(--pt));
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.28);
}

.win-name {
  font-size: calc(12 * var(--pt));
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: calc(6 * var(--pt));
}

.win-name img {
  width: calc(13 * var(--pt));
  height: calc(13 * var(--pt));
  border-radius: calc(3 * var(--pt));
}

.win-tag {
  margin-left: auto;
  font-size: calc(9.5 * var(--pt));
  color: var(--codex-accent);
  background: var(--codex-accent-soft);
  border: 1px solid rgba(134, 146, 255, 0.28);
  border-radius: calc(20 * var(--pt));
  padding: calc(2 * var(--pt)) calc(8 * var(--pt));
  white-space: nowrap;
}

.win-body {
  padding: calc(12 * var(--pt));
  display: flex;
  flex-direction: column;
  gap: calc(7 * var(--pt));
  flex: 1;
  justify-content: center;
}

.skel {
  height: calc(6 * var(--pt));
  border-radius: calc(4 * var(--pt));
  background: rgba(255, 255, 255, 0.13);
}

/* Unified app: sidebar with Work/Codex dropdown + Chat entry below */
.new-app {
  flex: 1;
  display: grid;
  grid-template-columns: calc(128 * var(--pt)) 1fr;
}

.new-sidebar {
  border-right: 1px solid var(--codex-border);
  background: rgba(255, 255, 255, 0.03);
  padding: calc(10 * var(--pt));
  display: flex;
  flex-direction: column;
  gap: calc(7 * var(--pt));
}

.side-dropdown {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(6 * var(--pt));
  font-size: calc(11.5 * var(--pt));
  font-weight: 600;
  color: var(--codex-fg);
  background: var(--codex-accent-soft);
  border: 1px solid rgba(154, 166, 255, 0.45);
  border-radius: calc(7 * var(--pt));
  padding: calc(4 * var(--pt)) calc(9 * var(--pt));
}

.side-dropdown span {
  display: inline-flex;
  align-items: center;
  gap: calc(5 * var(--pt));
}

.side-dropdown img {
  width: calc(12 * var(--pt));
  height: calc(12 * var(--pt));
  border-radius: calc(3 * var(--pt));
}

.dd-caret {
  color: var(--codex-fg-muted);
  font-size: calc(10 * var(--pt));
}

.dd-menu {
  border: 1px solid var(--codex-border);
  border-radius: calc(7 * var(--pt));
  overflow: hidden;
  background: rgba(8, 12, 26, 0.92);
  margin: calc(-2 * var(--pt)) 0 calc(2 * var(--pt));
}

.dd-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: calc(11 * var(--pt));
  color: var(--codex-fg-muted);
  padding: calc(3.5 * var(--pt)) calc(9 * var(--pt));
}

.dd-item.active {
  background: rgba(110, 123, 255, 0.3);
  color: #ffffff;
  font-weight: 600;
}

.dd-item.active span {
  color: var(--codex-accent);
}

.side-item {
  display: flex;
  align-items: center;
  gap: calc(6 * var(--pt));
  font-size: calc(11.5 * var(--pt));
  font-weight: 500;
  color: var(--codex-fg);
  padding: calc(2 * var(--pt)) 0;
}

.side-icon {
  width: calc(9 * var(--pt));
  height: calc(9 * var(--pt));
  border: calc(1.4 * var(--pt)) solid var(--codex-fg-muted);
  border-radius: 50% 50% 50% calc(2 * var(--pt));
  flex: none;
}

.skel.thread {
  height: calc(5 * var(--pt));
  background: rgba(255, 255, 255, 0.1);
}

.new-main {
  padding: calc(12 * var(--pt));
  display: flex;
  flex-direction: column;
  gap: calc(8 * var(--pt));
  justify-content: center;
}

.new-body-code {
  background: rgba(4, 7, 16, 0.75);
  border: 1px solid var(--codex-border);
  border-radius: calc(8 * var(--pt));
  padding: calc(10 * var(--pt));
  display: flex;
  flex-direction: column;
  gap: calc(7 * var(--pt));
  margin-top: calc(2 * var(--pt));
}

.skel.code-a { background: rgba(154, 166, 255, 0.55); }
.skel.code-b { background: rgba(127, 224, 178, 0.45); }
.skel.code-c { background: rgba(255, 255, 255, 0.2); }

.uni-arrow {
  align-self: center;
  font-size: calc(34 * var(--pt));
  color: var(--codex-accent);
  text-shadow: 0 0 calc(20 * var(--pt)) rgba(134, 146, 255, 0.5);
  padding-top: calc(14 * var(--pt));
}

</style>

<!--
Two apps became one ChatGPT in early July, macOS and Windows, worldwide.
- One shared space: your chats and history live together. Switch between Work and Codex; Chat is right there in both.
- Work is the agent with Codex inside: on chatgpt.com and mobile, selecting Work is how you tap Codex. It ships docs, decks, sheets, and sites.
- Classic sticks around: the old app remains as ChatGPT Classic with updates and security fixes. New agent features land only in the new app.
- Existing users keep their projects, settings, and workflows.
-->
