---
layout: default
title: News from OpenAI
clicks: 4
---

# News from OpenAI

<NewsCards :items="NEWS" shape="tall" />

<script setup lang="ts">
import { NEWS } from '../lib/news'
</script>

<!--
Each click brings in one card.

[click] GPT-6.2 Astra and GPT-6.2 Sol came out on 17 November. Astra is the frontier model for hard reasoning and coding. Sol is the faster, cheaper one for everyday work. Both are in ChatGPT Work, in Codex and in the API.

[click] dots: an agent in ChatGPT that keeps working between chats, with its own cloud computer, connected apps and memory. Launched at DevDay on 29 September.
"Coming soon to the EU for Plus and Pro" is early information. OpenAI's help page still said on 27 November that dots are not available in the EU, the UK or Switzerland.

[click] ChatGPT Space: one shared place to build pages, slides and files together. It has been rolling out to Plus since 20 November, step by step, so not everyone has it yet.

[click] Chat and Work are becoming one experience. It starts as a test with a small group. From December, Chat, Work and Codex share one usage allowance. Codex keeps its own area in the app.

Sources (checked 2026-11-27): OpenAI API changelog and community post for GPT-6.2; help.openai.com "Getting started with your dot"; ChatGPT release notes of 20 November for Space; press reports of OpenAI's email to subscribers for Chat and Work.
-->
