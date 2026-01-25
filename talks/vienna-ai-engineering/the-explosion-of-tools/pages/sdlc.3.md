---
layout: default
timeline:
    preset: sdlc
    current: planning
section: SDLC
---

# Create a plan before writing code

LLMs function as "autocomplete" by nature. Our goal is to make them gather context and virtually navigate the entire path to the goal to verify they are heading in
the right direction. This can be achieved by asking our Agents to create a plan for their changes that we can review.

<div v-click>
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
