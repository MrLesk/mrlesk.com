# slidev-addon-groma-live

Live Groma maps inside Slidev slides. `bun run dev` in the deck is the only command to run:
the addon starts every Groma server the deck needs, the clicker moves their cameras, and
stopping Slidev stops them again.

Used by `talks/groma/flash` and `talks/devoxx/in-the-loop`.

## Use it in a deck

```yaml
# slides.md headmatter
addons:
  - ../../slidev-addon-groma-live   # resolved from the deck's PARENT folder (a Slidev quirk)
gromaLive:
  - name: groma                     # ready when the deck opens
    cwd: ~/projects/groma3
    port: 4801
  - name: keycloak                  # built on stage, one step per click
    port: 4803
    steps:
      - git clone ~/projects/keycloak .   # then `groma web` starts there and sets itself up in the browser
```

Decks use ports 4801 and up so they never meet a Groma you run day to day on 4747.
A port that already answers is left alone, and the startup log names what answered.

A third kind of instance is a timelapse:

```yaml
  - name: orders
    port: 4804
    replay:
      source: ../../../slidev-addon-groma-live/demo/orders.bundle   # from the deck folder; a repo path works too
      interval: 700                                                  # milliseconds per commit
```

The addon clones `source`, lays out its first commit in `~/.groma-live/<name>/work`, and serves
that folder with a real Groma whose scanners are switched off. Playing applies each later commit
on top, so components and tasks appear on the map because their files really appear. The history
must store Groma architecture (`groma/`) and Backlog tasks (`backlog/`).

A fourth kind is a scenario: agents working Backlog.md tasks for real.

```yaml
  - name: agents
    port: 4805
    scenario:
      source: ../../../slidev-addon-groma-live/demo/orders.bundle   # cloned; its HEAD is the "before" commit
      script: ../../../slidev-addon-groma-live/demo/agents.mjs       # what the agents do, phase by phase
      interval: 600                                                  # milliseconds between steps of a phase
```

The addon clones `source` into `~/.groma-live/<name>/work` and serves the clone with scanners off.
Each slide click asks for a phase and the steps run there: real `backlog` commands, real source
edits, and a commit by the agent when its task is done. The clone stays a git repository, so Groma
can compare its HEAD (the service before the agents) with what they left. Going back resets the
clone and replays up to the phase at once.

A fifth kind is live: real Codex agents, one `codex exec` session per Backlog.md task, on a fresh clone.

```yaml
  - name: agents
    port: 4805
    live:
      template: ~/projects/groma3            # cloned at `branch` into ~/.groma-live/<name>/work
      branch: in-the-loop-baseline
      prompt: ./agent-prompt.md              # each agent's first prompt; {agent} and {task} are filled in
      go: Implement your plan now. Do not ask any questions.   # sent to the same sessions on the slide's click
      codexHome: ~/.config/devoxx-keynote/codex                # the demo's Codex config and key, apart from yours
      setup:                                  # commands run in the clone before `groma web` serves it
        - bun install --frozen-lockfile
      rehearsal:                              # Codex config overrides used when GROMA_LIVE_REHEARSAL is set
        model: gpt-6-luna
        model_reasoning_effort: max
        service_tier: fast
      agents:
        - task: TASK-561
          name: codex                         # the assignee; Groma draws the vendor mark it knows for the name
          label: Codex 1
```

An agent with an empty `task` waits for one: when a task is Done, a free agent takes the next task whose
Backlog.md dependencies are all Done. With `anyOrder: true` on the instance it takes the next To Do task whatever
its dependencies, so every agent keeps working.

The agents assign their task to themselves, read it and plan as soon as `bun run dev` starts, changing
nothing. The `<GromaAgents>` slide's click (phase 1) sends `go` to every session; RESET stops them, puts the
clone back on the baseline commit and plans again. With `review`, `{base}` in a view stands for that baseline
commit, so `from={base}` compares it with the working tree, finished or not. Closing Slidev stops the agents.

## Components

`<GromaFrame origin="http://localhost:4801" :views="[...]" :captions="[...]" :stills="[...]" />`
embeds one map. Each click posts the next Groma query string (`component=web-server&tab=how`) and
the camera flies there. Without a running Groma it shows `stills` (paths inside the deck's `public`).
A shield keeps keyboard focus with Slidev; double-click the map to use it by hand. The button at the top
hands it back and reloads the map on the current click's view, so a flick or a deep zoom never stays on
screen (in Chrome such a map could stay blank). The map may write to the clipboard, so its Copy buttons work.
`inset` (22 slide pixels by default) keeps Groma's header and panels inside a frame the deck draws
near its edge, while the map still fills the slide. Pass `:inset="0"` for a deck without a frame.
For a Groma that opens on its setup, `:setup="['', 'initialize', 'scanners']"` with the instance's `name`
makes those clicks press Continue, then Install & scan, with the values the screen shows; the dev
server sends the form, so the presenter's preview never presses anything. 'scanners' presses Groma
0.7's Plugins step (form `/plugins`, which also offers Backlog.md) or the older Scanners step.

`<GromaRun name="keycloak-devoxx" />` is a terminal that runs that instance's `steps` for real, one per
click, in the throwaway folder `~/.groma-live/<name>` (wiped at the first step). After the last step
the addon starts `groma web` there. RESET starts the beat over.

`<GromaTimelapse name="orders" origin="http://localhost:4804" still="..." />` shows that map, plays
the history on the first click (or by itself with `autoplay`), prints each commit subject, and
rewinds when the slide is opened again.

`<GromaAgents name="agents" origin="http://localhost:4805" :phases="[0, 1, 2, 3, 3, 4]" :views="[...]" />`
drives a scenario: click n shows phase `phases[n]` with view `views[n]` (and the agents panel unless `panels[n]` is
`false`, for a view that frames the pins first), and a panel over Groma's
hierarchy shows what each agent is doing, in the colour of its pins. Entering the slide on its first
click resets the scenario. A script with a `HISTORY` (see demo/agents.mjs) starts from the source's
first commit, an empty folder, and its history phase checks out every later commit in turn, so the map
grows as it did while the panel counts the commits; the agents start where the history ends. With
`review` it shows no panel and only makes sure the agents have
finished, for a comparison such as `from=<before commit>`, which Groma 0.6.0 opens live.

`GromaRun`, `GromaTimelapse` and `GromaAgents` share one demo per dev server, so only the slide
itself moves it: the audience window or the presenter's main view. Slidev also counts the
presenter's next-click preview and the overview as the active slide; those only watch. A preview
that asked for the next click too would fight the slide, and the scenario would reset on every click.

The cards drawn over the map (captions, the run's cost, the timelapse) take the deck's colours:
`--groma-paper`, `--groma-ink`, and `--groma-accent` for the offset shadow, which falls back to `--groma-green`.
A deck can set `--groma-accent` on one slide's layout to give that slide's cards another colour.

## The demo history

`demo/orders.bundle` is a small order service built from an empty project: 9 Backlog.md tasks,
48 commits, one visible event per commit (task planned, in progress, code scanned, component
named, task done). `demo/build-orders.sh` rebuilds it with the real `backlog` and `groma` CLIs and
the real TypeScript scanner, so re-run it when Groma changes how it draws things.
Its `package.json` declares a `bin` entry, so the scan finds the application container ("API server")
and every module the entry point reaches lands inside it.

With a Groma that has the map morph (Backlog TASK-481 in the Groma repo), each replayed commit glides
into place: shared components move, new ones grow out of the ground, routes draw on. Older Gromas
repaint each commit in place.

## Limits

- Dev only. A built or deployed deck shows the stills and never contacts localhost or the dev server,
  so visitors get no local network permission prompt.
- One iframe per Groma origin: every Groma page holds a live `/events` stream and browsers cap connections.
- The camera flights need the embedding hook in Groma (`src/viewers/web/embedding.ts`). A Groma
  without it still works; the iframe reloads on each click instead.
- Deploying through the repository Dockerfile needs this folder copied next to the talk, since the
  addon path is relative.
