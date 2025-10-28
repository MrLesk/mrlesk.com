---
theme: penguin
title: "My Presentation Title"
author: Alex Gavrilescu
colorSchema: "auto"
drawings:
  persist: false
mdc: true
transition: slide-left
layout: intro
css: unocss
---

<style src="./style.css"></style>

# My Presentation Title

Subtitle or tagline here

---
layout: default
---

# First Slide

Your content here

---
layout: quote
---

> This is a quote

Attribution here

---
layout: default
---

# Example with Card Component

<Card variant="info" title="Info" icon="ℹ️">
This is an info card with content
</Card>

<Card variant="success" title="Success" icon="✓">
This card shows success state
</Card>

---
layout: default
---

# Code Example

<CopyCodeBlock>

```javascript
function hello() {
  console.log('Hello, world!')
}
```

</CopyCodeBlock>

---
layout: default
---

# YouTube Video

<YoutubeEmbed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />

---
layout: default
---

# Inline Badges

Regular text with <PromptChip>a chip</PromptChip> inline

<PromptChip variant="primary" size="lg">Primary Large</PromptChip>

<PromptChip variant="accent" size="sm">Accent Small</PromptChip>

---
layout: center
---

# Thank You!
