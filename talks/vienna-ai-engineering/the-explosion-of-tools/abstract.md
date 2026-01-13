# The explosion of tools in the Agentic AI world

## Abstract

The landscape of AI coding tools is exploding. We evolved quickly from simple autocomplete to the GitHub Copilot era, and now we face a new wave of Agentic CLI tools, protocols like MCP, ACP and A2A, and frameworks like ADK. It moves so fast that catching up feels impossible.

This talk aims to ground us. I will guide you through this explosion of tools, separating the hype from the reality. We will focus on practical applications and identify the specific tools that actually help us ship real software right now.

## Table of Contents

### Context
* The evolution: from manual coding to copy-pasting (ChatGPT), Copilot, and finally Agents
* Prompt Engineering became context engineering
* AGENTS.md vs SKILLS
* Harnesses: Codex, Gemini CLI, Claude Code, Pi, amp, Droid
* Protocols: MCP, ACP, A2A, UCP
* SDKs: Google ADK, Anthropic Agent SDK, OpenAI AgentKit
* Assistants: Ralph, Clawd
* AI and SDLC

### Planning
* Describe your idea (preferably using a PRD format)
* Let the agent gather context by reading files, documentation or search on the internet
* The problem of too little context
* The problem of too much context
* Use acceptance criteria to confirm that the model has understood the intent
* Store the plan in markdown files

### Coding
* The 'YOLO' approach
* Ensure that agents have access to the docs
* Don't run out of context window (MCP vs CLI)
* Improve your Agent instructions: code builds, test pass, lint/format pass, definition of done
* Single or parallel tasks (depends on your budget) and your capacity to coordinate agents
* Conductor or Claude Desktop for Git Worktrees

### Verification
* Maximize agent self-verification
* If web use: Chrome dev tools MCP (NO) -> agent browser
* Others: connect the agent to logs, traces, debug tools

### Conclusion
* AI is moving very fast
* You need to experiment: invest the time and you will see results
* Keep joining AI Engineering Vienna for news and updates
