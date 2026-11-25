---
theme: codex
title: OpenAI GPT-Live 1 on stage
author: Alex Gavrilescu
info: A real-time voice demo with OpenAI GPT-Live 1 and Slidev.
layout: speech
defaults:
  layout: speech
addons:
  - slidev-addon-speech-navigation
speechNavigation:
  language: en
  behavior: balanced
  liveModel: gpt-live-1
  model: gpt-6-luna
  reveals: speech
colorSchema: light
aspectRatio: 16/9
canvasWidth: 980
transition: fade
drawings:
  enabled: false
---

<div class="cover-copy">
  <h1>OpenAI<br><span>GPT-Live 1</span><br>on stage</h1>
  <p class="cover-purpose">A Slidev addon</p>
  <p class="byline">Alex Gavrilescu <span>@mrlesk</span></p>
</div>
<img class="cover-art" src="/voice-slides.png" alt="A blue sound wave passes through slide images." />


---
class: hands-free-slide
---

# Present naturally

<p class="reveal-caption"><span></span>No need for clickers</p>

<img class="speaker-art" src="/alex-speaker-laptop.png" alt="Alex moves his hands beside a laptop on a stand." />
<img class="audience-art" src="/audience-full-feet.png" alt="The audience sits on the right. The chair legs are visible through the footer." />
<div class="benefit-labels">
  <div v-click="1" class="benefit-item"><span class="benefit-number" aria-hidden="true">01</span><span class="benefit-copy">Move your <strong>hands 🤌</strong></span></div>
  <div v-click="2" class="benefit-item"><span class="benefit-number" aria-hidden="true">02</span><span class="benefit-copy">Hold an <strong>object ⌨️</strong></span></div>
  <div v-click="3" class="benefit-item"><span class="benefit-number" aria-hidden="true">03</span><span class="benefit-copy">Look at the <strong>audience 👀</strong></span></div>
</div>


---

# Use images and speaker notes

<div class="visual-context">
  <div class="context-source">
    <div class="context-label"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 22h8M12 18v4M7 13l3-3 3 3 3-5 3 5"/></svg><span>Slide image</span></div>
    <div class="slide-sample context-scene" role="img" aria-label="Alex uses his hands to speak to the audience.">
      <img class="context-speaker" src="/alex-speaker-laptop.png" alt="" />
      <img class="context-audience" src="/audience-full-feet.png" alt="" />
    </div>
  </div>
  <div class="context-plus" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg></div>
  <div class="context-source">
    <div class="context-label"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z M14 3v6h6M8 13h8M8 17h5"/></svg><span>Speaker notes</span></div>
    <div class="notes-sample"><p>“Use both hands to <strong>show an object.</strong>”</p><span class="note-caption">Example instruction</span></div>
  </div>
</div>
<p class="context-takeaway">Add your regular <strong>speaker notes.</strong></p>


---

# OpenAI voice. Slidev actions.

<MeaningDiagram />
<p class="bottom-statement">GPT-Live 1 listens. Decisions controls the slides.</p>


---

# Set up the addon

<div class="setup-flow">
<div class="setup-install">
<div class="step-heading"><span>01</span> Install</div>

```bash
npm install -D \
  slidev-addon-speech-navigation \
  playwright-chromium
```

<div class="setup-listen"><SpeechMicIcon /><div><div class="step-heading"><span>03</span> Listen</div><p>Select <strong>Speech nav</strong><br>in Presenter view.</p></div></div>
<p class="setup-key">Put the API key in <code>.env</code>.</p>
</div>
<div class="setup-enable">
<div class="step-heading"><span>02</span> Configure</div>

```yaml
addons:
  - slidev-addon-speech-navigation
speechNavigation:
  language: en
  behavior: balanced
  liveModel: gpt-live-1
  model: gpt-6-luna
  reveals: speech
```

<p><strong>GPT-Live 1</strong> listens. <strong>Decisions</strong> selects actions.</p>
</div>
</div>


---

# Pause when you need to

<PaceDiagram />
<p class="bottom-statement">Pause mutes audio. Resume starts with new speech.</p>


---

# You have control

<div class="controls-feature-layout">
<ControlDiagram />
<div class="control-features">
<div class="control-feature"><span class="feature-index">01</span><div><h2>Rehearse first</h2><p>See suggestions. Use manual controls.</p></div></div>
<div class="control-feature"><span class="feature-index">02</span><div><h2>See the decision</h2><p>Recent speech. A short reason.</p></div></div>
<div class="control-feature"><span class="feature-index">03</span><div><h2>Keep a slide</h2><p>Use a manual hold for questions.</p>

```yaml
speechNavigation:
  hold: true
```

</div></div>
</div>
</div>
<p class="bottom-statement">Manual controls are always available.</p>


---
speechNavigation:
  hold: true
---

<div class="closing-copy"><p class="eyebrow">Build with OpenAI GPT-Live 1</p><h1>Use it for<br>your next<br><span>talk</span></h1><p class="closing-name">Alex Gavrilescu <span>@mrlesk</span></p></div>
<div class="closing-hold"><span></span>Manual hold · Time for questions</div>
<div class="qr-wrap"><img src="/repository-qr.svg" alt="Scan this QR code to open the addon on GitHub." /><a href="https://github.com/MrLesk/slidev-addon-speech-navigation">github.com/MrLesk/<br><strong>slidev-addon-speech-navigation</strong></a></div>
