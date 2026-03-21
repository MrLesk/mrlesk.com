---
layout: new-section
transition: slide-up
section: Backlog.md
hideIndicator: true
---

<div  class="flex items-center justify-center">
    <img class="w-80" src="/backlog.png">
</div>

<div class="text-left mt-4" v-click>

```bash
backlog task create "my new task" -d "detailed description"
backlog task list -s "To Do"
backlog task edit 123 -s "In Progress" -a "Alex"
backlog search "api" --status "In Progress"
```
</div>
