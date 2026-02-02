---
layout: default
section: Spec-driven flow
timeline:
  preset: spec-flow
  current: spec
---

<h1 class="pt-4">1) Start with the idea</h1>

**Goal:** We want to add the possibility to schedule some tasks to be started at a certain time

<v-clicks>

* Add a virtual status for Backlog.md tasks: "Scheduled"
* Tasks should have a new "StartAfter" field
* When backlog starts, we create a timer for each task with StartAfter field move them to "In progress"
* This should trigger the existing onStatusChange command if present

</v-clicks>

<img class="mt-6" v-click="3" src="/flow.2.svg"/>
