---
layout: default
section: Context
transition: slide-up
---

# Skills

Skills are specific instructions that help customize Agent's behavior

<div class="flex gap-x-20">
<div v-click="1">

**Characteristics of a Skill**

<v-clicks at="2">

- Consists of a main markdown file **SKILL.md**
- Can contain nested scripts
- Can contain references to other skills
- They are automatically discovered at startup
- Agents use them on demand depending on the task
- Utility: `npx add-skill owner/skill-name`
- Repo with popular skills: https://skills.sh

</v-clicks>
</div>
<div v-click="9">

**The structure of a SKILL.md:**

<v-clicks at="10">

- name
- description
- content -> *loaded on demand*

</v-clicks>

<card class="w-92 mt-6" v-click="13">
Skills are becoming popular because they don't waste too much <strong>context window</strong>
</card>

</div>
</div>


