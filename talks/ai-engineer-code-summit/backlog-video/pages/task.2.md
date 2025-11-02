---
layout: default
timeline:
  preset: backlog-flow
  current: task-creation
---

<TtydFrame class="max-w-220 h-100 mt-4" src="http://localhost:7682" >
  <template #click-0>
    Use Backlog.md workflow to create a task for the following feature requirements:
    ## Backlog.md Kanban board - Move mode feature
    * Press `m` key to toggle move mode
    * The current task is highlighted for moving
    * Using up/down arrow keys we can move the task up and down in the list triggering a live reordering
    * Using left/right arrow keys we can change status column for that task
    * Pressing `m` key again or `Enter` we will confirm the move
    * Pressing `Esc` will cancel the move and return the task to its original position
    * The footer should show instructions for triggering the move mode and confirming/canceling the move
  </template>
</TtydFrame>
