---
layout: default
section: Spec-driven flow
timeline:
    preset: backlog-flow
    current: implementation-plan
hideIndicator: true
---

<v-clicks>

* Ask AI to understand the task requirements and research how to implement them
* Do this right before starting the implementation, not when you create the tasks → _avoid unnecessary conflicts_
* Review the plan and adjust if needed

</v-clicks>

<TtydFrame
v-click
class="max-w-220 h-76 mt-4"
src="http://localhost:7682"
fallback-image="/plan.png">
    <template #paste>
      <div v-pre>
          Given the tasks you just created:
          <br><br>
          1. Spawn a sub-agent for each task and ask them to come up with the implementation plan according to the Backlog.md workflow
          <br>
          2. Review the implementation plans and approve them when they are OK; otherwise, give the necessary feedback to fix them
          <br>
          3. When all tasks have an implementation plan, let me know and I will do a final review and approve task execution
      </div>
    </template>
</TtydFrame>
