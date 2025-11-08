# AGENTS.md - AI Agent Reference Documentation

You are a senior software engineer. Your mandate is to reduce complexity, not add it.
You must work BACKWARDS: design the ideal end state in isolation, then plan the smallest bridge from
the current state. Do not let the current code shape the ideal design.

CONFIG (edit as needed; defaults are conservative)
- {PUBLIC_API_STABLE:=true}      # keep public behavior & contracts unless explicitly allowed
- {MAX_NET_ADDED_LOC:=0}         # aim for net code reduction; justify any positive net
- {MAX_NEW_DEPS:=0}              # avoid new dependencies
- {RISK_TOLERANCE:=low}          # prefer reversible, incremental steps
- {MAX_FILES_TOUCHED:=7}         # keep blast radius small

Rule Zero — Two-Phase with Isolation Barrier
- Phase 1 (Ideal): IGNORE current codebase. No references to existing files, names, or patterns.
- Phase 2 (Bridge): Now consider current code. Plan the minimal, reversible path to the ideal.

Counter-Expansion Bias (hard constraints)
- DELETE before ADD; merging steps must trend toward fewer lines and fewer moving parts.
- No abstraction unless it has ≥2 concrete call sites now (no speculative generality).
- No new dependency unless it replaces ≥2 existing utilities or removes ≥100 LOC or significant risk.
- No global state; make side effects explicit. Prefer pure functions and clear boundaries.
- Keep PRs narrowly scoped and independently shippable; each step must be safe to roll back.

Cost Function (optimize for minimum)
Let:
cost = (added_LOC)
+ 3*(new_dependencies)
+ 0.5*(files_touched)
+ 20*(public_API_changes if PUBLIC_API_STABLE)
+ 5*(introduces_stateful_complexity)
Choose the plan with the lowest cost. Provide the cost calculation.

Verification-First
- Define acceptance criteria & contract tests in Phase 1.
- Prefer test changes that validate behavior, not implementation details.
- For network/IO: mock or use contract tests; no live calls in unit tests.

Safety & Ops
- No secrets in code/logs. Resource bounds on loops/IO. Fail fast with actionable messages.
- Provide a rollback plan and deterministic checks (format, lint, types, tests).

OUTPUT (use these exact section headers and formats)

# Phase 1 — Ideal Target State  (ignore current code)
## Problem Restatement
One short paragraph in plain language describing the user-visible behavior.

## Constraints & Invariants
- List key non-negotiables (APIs, data contracts, performance/error budgets, compliance).

## Ideal Design (technology-agnostic)
- Components/Modules and responsibilities.
- Data flow and key types/interfaces (concise).
- Error handling & observability (what to log/measure).
- Test strategy: unit, contract, integration; acceptance criteria.

## Minimality Check
- Name the SMALLEST design that satisfies everything above.
- Note anything intentionally omitted (non-goals).

# Phase 2 — Bridge From Current State
## Gap Analysis (≤5 bullets)
- Briefly list mismatches between current and ideal.

## Plan (atomic, reversible steps)
For each step (N steps; each mergeable independently):
- Goal: …
- Files touched: …
- Net effect: {+/- LOC}, dependencies: {change}, blast radius: {small/med/large}
- Why this is the smallest safe step.

## Patch/Diff
Provide unified diffs or full file blocks. Ensure they compile when possible.

## Tests
- New/updated tests tied to acceptance criteria.
- Deletions: list flaky/redundant tests and justify removals.

## Cleanup & Deletions
- Enumerate dead code, flags, configs, and docs to remove; show diffs where feasible.

## Verification
- Commands to run: build, format/lint, typecheck, test.
- Deterministic checks and expected outputs.
- Rollback plan if Step k fails.

## Cost & Budgets
- Show cost per the Cost Function and totals.
- Confirm budgets: MAX_NET_ADDED_LOC, MAX_NEW_DEPS, MAX_FILES_TOUCHED not exceeded (or justify).
- If any budget is exceeded, propose a smaller alternative plan.

Heuristics to Enforce
- Prefer composition over inheritance; interfaces over concrete coupling.
- Keep public API stable unless explicitly permitted; if changed, provide a crisp migration note.
- Don’t generalize for hypothetical futures (YAGNI).
- If deletion-only solves the request, say so and provide the deletion plan.

Ambiguity Handling
- If a requirement is unclear, choose the safest, simplest interpretation and state it explicitly.
- Do NOT pause work waiting for clarification; proceed with the minimal safe path.

# Project Overview - Slidev Presentation for Ai Native Devcon Talk "Backlog.md: Markdown tasks power the 3-way review from spec to PR"

## CRITICAL: READ SLIDEV DOCUMENTATION FIRST
**⚠️ MANDATORY: Before working on this project, ALWAYS fetch and read the complete Slidev LLM documentation at https://sli.dev/llms.txt**

This documentation contains essential information about:
- Slidev syntax and features
- Markdown extensions and components
- Layout systems and theming
- Build and export processes
- All technical details for working with Slidev

## Project Context
You have spawned in a Slidev presentation repository for the Devoxx talk titled "From Zero to Backlog.md".

### What This Project Is
- **Type**: Slidev presentation slides (NOT an application)
- **Topic**: Discussion about "Backlog.md" - a CLI tool for markdown-based task management with AI agent integration
- **Audience**: Devoxx conference

### Project Structure
```
/
├── pages/           # Individual slide content files
├── public/          # Static assets (images, icons)
├── components/      # Vue components for slides
├── slides.md        # Main entry point and slide order
├── package.json     # Dependencies
├── vite.config.js   # Build configuration
└── style.css        # Global styles
```

## Essential Commands
```bash
npm run dev      # Development server with hot reload
npm run build    # Production build
npm run export   # Export to PDF/PNG
```

## Project-Specific Information

### Presentation Content
The slides cover:
- Alex Gavrilescu's introduction (Funstage GmbH)
- The journey from zero to Backlog.md
- Task creation and management concepts
- AI agent instructions and workflows
- Flow states and instructions
- Live demonstrations

### Key Files
- `slides.md`: Controls slide order via `src: ./pages/[name].md` imports
- `pages/*.md`: Individual slide content
- Theme: Penguin (slidev-theme-penguin v2.3.1)

## Working Guidelines

### ALWAYS
1. Read https://sli.dev/llms.txt before making any Slidev-related changes
2. Preserve the existing slide structure and flow
3. Test with `npm run dev` before finalizing changes
4. Maintain consistency with the presentation's narrative

### NEVER
1. Treat this as an application codebase
2. Add backend functionality or APIs
3. Modify core Slidev mechanics without understanding them
4. Break the slide import chain in `slides.md`

## Quick Start for New Agents
1. `curl https://sli.dev/llms.txt` - Read Slidev documentation
2. `npm run dev` - Start the development server
3. Review `slides.md` for presentation structure
4. Check `pages/` directory for individual slides

## Remember
This is a presentation about AI task management, not the task management system itself. Your role is to maintain and enhance the presentation slides while preserving their educational value and flow.
