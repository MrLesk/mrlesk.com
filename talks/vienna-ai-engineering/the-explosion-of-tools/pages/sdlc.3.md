---
layout: default
timeline:
    preset: sdlc
    current: planning
section: SDLC
transition: slide-up
---

# Create a plan before writing code

LLMs function as "autocomplete" and struggle when context is **too scarce or overwhelming**.
To verify the direction before writing code:

- Define clear **Acceptance Criteria**
- Ask for a **Plan** to validate the path

<div v-click class="mt-3">
Some approaches that can help you achieve this goal:
</div>


<ClickableSvg
src="/plan.svg"
class="mt-4"
:groups="[
  ['cp_0-0', 'cp_0-1', 'tx_approach', 'tx_descript'],
  ['cp_1-0', 'cp_1-1', 'ic_2_1uuw', 'tx_manual', 'tx_agentwri'],
  ['cp_2-0', 'cp_2-1', 'ic_2_1lse', 'tx_builtin', 'tx_useinteg'],
  ['cp_3-0', 'cp_3-1', 'ic_2_18it', 'tx_novendor', 'tx_usebackl'],
]"/>

- **Manual**: Ask the Agent to write a plan in a markdown file for review
- **Built-in**: Use Claude Code, GitHub Copilot, or Cursor's plan mode
- **No vendor lock-in**: Use Backlog.md to create tasks and have Agents fill the plan section
