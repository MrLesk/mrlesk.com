---
layout: default
title: New API goodies to try
clicks: 6
---

# New API goodies to try

<NewsCards :items="API_NEWS" shape="wide" />

<script setup lang="ts">
import { API_NEWS } from '../lib/news'
</script>

<!--
Each click brings in one card.

[click] GPT-6.2 Astra and Sol in the API since 17 November: `gpt-6.2-astra` at $8 in and $40 out per million tokens, `gpt-6.2-sol` at $2 in and $10 out.

[click] Background completion windows in the Responses API, public beta since 17 November. You accept the answer within 2 hours and pay 30% less, or within 8 hours and pay 40% less. It is a normal Responses call, no file upload like Batch.

[click] GPT-Image-2.6 Sunburst and GPT-Image-2.6 Flare, since 4 November: adjustable complexity, SVG output and animated GIFs.

[click] The Decisions API, generally available since 22 October. You send text, images or JSON with up to 400 questions. It returns typed answers: a probability, a choice from a fixed set, or a score. OpenAI says about 10x faster than the Responses API. It runs on `gpt-6-luna`.

[click] GPT-Live-1.1 since 19 November: better pronunciation, accents and transcription in several languages. Outbound phone calls over SIP are open to all organizations since 2 November.

[click] The Agents API can use a computer: agents finish tasks in a browser that OpenAI hosts. Your app handles the approvals and the sign-in. Since 29 September.

Source: developers.openai.com/api/docs/changelog and the model pages (checked 2026-11-27).
-->
