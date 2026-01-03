---
title: "Steer vs Delegate: Two Approaches to AI-Assisted Engineering"
summary: "An analysis of two distinct AI interaction models, 'Steer' and 'Delegate,' and how they impact developer cognition and software quality."
dateISO: "2026-01-03"
tags:
    - "AI Agents"
    - "Workflow"
    - "Productivity"
---
## Context

From simple code completion with GitHub Copilot to the recent rise of autonomous CLI-based agents, developer workflows have evolved rapidly.

The evolution of coding assistants in recent years looks more or less like this:

![The evolution of AI coding assistants](/blog/diagrams/context.svg)

## Steer Mode

**Steer Mode** is the direct evolution of code completion. In this mode, developers review code in real-time and "steer" agents whenever they are about to make a mistake or veer off course.

The quality of the resulting software in Steer Mode is directly proportional to the skills of the developer and the power of the AI model. The developer must master not just coding, but also prompting, QA, and increasingly, **context engineering**.

This approach optimizes for individual throughput, leveraging AI to handle the heavy lifting while developers maintain high-level control. However, this approach shows its limits as task complexity increases. Over time, AI context windows fill up, requiring lossy "context compactions," and the model's reasoning capabilities may degrade. Eventually, the need for steering becomes constant, and the cognitive load of tracking the agent's state becomes a major burden.

### The Advantages

- **Increased Velocity:** Enhances individual contributor throughput.
- **Multitasking:** Capable of tackling one to a few smaller tasks in parallel.
- **Upskilling:** Agents can teach developers new patterns or libraries on the fly.
- **Precision:** Best suited for complex debugging or architectural tasks requiring deep context.

### The Challenges

- **Cognitive Load:** Keeping track of multiple agent states creates significant mental overhead.
- **Scalability:** It scales linearly with the developer's attention span.
- **Siloed Context:** Deep knowledge of the implementation details remains solely in the developer's head.

## Delegate Mode

The second approach, **Delegate Mode**, is an emerging workflow where developers often employ "yolo mode" (continuous execution without manual confirmation steps). In this model, developers function more like a team lead, instructing agents with high-level specifications and expecting a working solution.

In this scenario, the developer becomes less familiar with the specific lines of code. Detailed code review becomes optional; what matters are the **correctness of the specifications** and the **acceptance criteria**. Developers using this mode must create a robust "Definition of Done" that agents can use to self-verify before handing over a task.

When using Delegate Mode, we must be realistic about current AI limits. A rough view of autonomy across the SDLC looks like this:

![Autonomy across the SDLC](/blog/diagrams/ai-autonomy.svg)

To achieve the best results, developers should shift their effort from writing code to **cleaning up specs** and building plans *with* the AI, as these specs act as the foundation for the verification phase. Tools such as the [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp) allow AI agents to test their own changes directly, particularly for web-related features.

In most cases, developers must rely on unit, integration, and E2E tests, as well as linting, formatting, and type checking, to maximize the agent's success rate. Production deployment remains almost exclusively a human-led process, driven by security policies and the need for high reliability.

### The Advantages

- **Better Communication:** Forcing clear specs helps the entire human team understand the intent.
- **Quality Assurance:** Cleaner specs lead to easier automated QA and verification.
- **Scale:** Levers cloud-based agentic platforms to run tasks asynchronously.
- **Parallelization:** Can dramatically parallelize work if there are no dependencies between tasks.

### The Challenges

- **Black Box:** Developers are less familiar with the codebase, leading to longer troubleshooting sessions when things break.
- **Spec Difficulty:** Ambiguous intent is hard to spec for a Proof of Concept (PoC).
- **Skill Atrophy:** Over-reliance may lead to a decline in foundational coding skills.

## 2026 Prediction

Developer skillsets will continue to evolve: while 2024 was the year of **Prompt Engineering** and 2025 focused on **Context Engineering**, 2026 will be defined by the mastery of **Agentic Orchestration**. We will see individual developers managing multiple parallel projects simultaneously.

I expect two primary shifts:

1. **Advanced Verification Ecosystems:** Moving beyond automated visual testing toward deep system integration, including memory and CPU profiling, autonomous debugging, and connecting AI agents directly to live logs for real-time troubleshooting.
2. **High-Level Observability:** As AI takes over the bulk of code generation, the human role will shift toward maintaining architectural integrity through tools that provide a high-level overview of complex, agent-generated systems.
