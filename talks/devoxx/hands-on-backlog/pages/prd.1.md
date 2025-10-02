---
layout: default
section: PRD
---

# What are we building?

<CopyCodeBlock class="w-186" copy-label="Copy prompt" copied-label="Copied!" aria-label="Copy prompt">

```markdown
## Goal & Time constraint
We are here at Devoxx conference for a 30 minutes live demo of building a product using AI tools.

Your goal is to create a very minimalistic PRD from the product information below that can be implemented by an AI agent.

Given the short time we have available and given that this is a demo, try to focus on the core
parts of the product MVP and leave behind any deployment/CI/CD/production quality aspects.

## Requirements
Build a cross-platform app that allows live transcription from voice to smart notes: AI recognizes when we are talking about an existing note or want to create a new note.
AI understands if we are creating a new note or we want to modify existing text by understanding user intents (make the previous paragraph a bullet point list)

## Technology requirements
Cross platform app using Expo framework but for this demo we will focus on macOS only.
Use Gemma E2B for processing audio input and storing notes.
We want full coverage with unit tests.

## Quality requirements
Works 100% offline using local LLMs. No external calls to OpenAI or other APIs.

## Output format
Output the PRD in a prd.md file in the root of the project

```

</CopyCodeBlock>
