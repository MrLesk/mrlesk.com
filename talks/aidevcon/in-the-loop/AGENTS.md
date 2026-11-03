# In the loop, not in the dark

Slidev deck for Alex Gavrilescu's talk at AI DevCon NYC 2026 (Tessl, Industry City, Brooklyn): Tuesday
2026-11-03, 16:15, The Landing - Lower Level, Tools-in-Action, 25 minutes plus 5 minutes of Q&A, recorded for the
AI Native Dev YouTube channel. Read https://sli.dev/llms.txt before changing Slidev mechanics.

## Where this deck comes from

This folder started on 2026-11-01 as a copy of the Devoxx Belgium 2026 deck, `talks/devoxx/in-the-loop` (working
tree included). Do not run this deck and the Devoxx one at the same time: both start Groma.md servers on ports
4801 to 4805 and use `~/.groma-live/<name>` folders.

Changed from the Devoxx deck:

- The cover is AI DevCon's own title slide. The organisers ask every speaker to use their template, or at least
  its title slide (speaker guide: https://tessl.notion.site/speaker-guide-nyc-2026). `public/aidevcon/logo.png`,
  `nyc.png` and `dashes.png` are the template's own images, unchanged. They come from Google's SVG export of the
  template's title slide, where they are embedded as PNGs:
  https://docs.google.com/presentation/d/1SRR97QXVTJ-_ZkAerkczWb9Fi3d4mNyxEm3XnZKEjU4/export/svg?pageid=g3fbd5b97d7c_5_75
  The title, subtitle, name and role are real text in the template's places, colours and font (Helvetica); the
  Cover section of `style.css` holds the positions. `speaker.jpg` is `presenter.jpg` from the other talks, resized
  to 720 px.
- Yellow is AI DevCon's colour, not part of the light story, so it stays on the cover. The cover is `mood: 0` so
  the room around it is black too, and it hides the deck frame and the light meter.
- The YOLO warning (`pages/00-yolo.md`, Alex, 2026-11-03) comes right after the cover. Alex says out loud that
  every demo is live with no backups; the slide only says WARNING and YOLO, so keep it that way. It is outside the
  light story too, like the cover: `mood: 0`, no frame, no meter, and the conference's yellow as hazard tape.
  The talk is filmed, so nothing on it flashes faster than once a second. The story's light starts after it.
- The thank-you slide no longer has the "Rate this talk" QR code: it opened the talk in the Devoxx app.
- At Devoxx people asked what happened to the 1,700 tests on "I opened the code. WTF!" and "Look at what I
  found. Again.", and how Groma.md fixed them. Alex's answer: he got rid of most of them, but that's for another
  talk. That slide (`pages/14b-shape.md`) now has a first click that crosses out "Wrong tests" with the note
  "Got rid of most. But that's for another talk.", in the finale's strike style. Groma.md did not fix the tests;
  never suggest it did.
- "Look at what I found. Again." is now titled "After a few weeks... again." (Alex, 2026-11-02): clearer that the
  same problems came back weeks after the first findings.
- The live demo is new: a greenfield project built by agents in the background, Keycloak as the brownfield
  project, a brownfield diff, the GitHub Action, then back to the greenfield result (see "The live demo" below).
  The Codex home for the agents is `~/.config/groma-live/codex`. The Keycloak instance scanned on stage is called
  `keycloak`.

## The one idea that shapes everything

The deck is lit like a room. The story starts in the dark, falls to black, and the light
comes back when Groma.md arrives. That is the title, made visible.

- Every slide sets `mood` in its frontmatter: `0` black, `1` dark grey, `2` grey, `3` light grey, `4` paper.
- `moodSteps: [1, 1, 0]` changes the light per click inside one slide.
- `layouts/default.vue` turns the mood into a class, `style.css` derives every colour from it,
  and `global-top.vue` lights the area around the slide plus the small meter top right.
- Colour is part of the light: everything is monochrome until mood 4. Groma.md green only
  appears once Groma.md is on screen. Do not use green on darker slides. One exception, Alex's
  call: the green ticks on "I followed the best practices." The AI DevCon cover and the YOLO warning are outside
  the story and keep the conference's yellow (see above).
- The four attempts after the welcome slide step the light 1, 2, 3, 4, one level per attempt,
  so only Groma.md 3 is at full light (Alex's call). The attempt rail drops its green below mood 4, and the
  pictures on the attempts (the code meme, Project Blueprint's first mockup) go grey.

## Voice

- Minimal text. Alex narrates. Detail goes in speaker notes, which carry target timestamps.
- No em dashes anywhere. Plain words.
- The story slides follow Alex's own draft wording. Do not invent facts or numbers.
- Getting started is always three steps: INSTALL `npm i -g groma.md`, SCAN `groma web`, CURATE "your agent".
  Never suggest the first scan is the finished architecture; the agent's curation turns it into one.

## The live demo

Everything live comes from the shared addon at the repository root, `slidev-addon-groma-live`
(read its README). `bun run dev` is the only command: the addon starts the Groma.md servers listed
under `gromaLive` in the headmatter and stops them with Slidev.

| Order | Slides | Server |
| --- | --- | --- |
| Walk the map | `20`, `20b` | `groma`: Groma.md's own map in `~/projects/groma-aidevcon`, port 4801 |
| Greenfield, started | `21a`, `21`, `21b` | `agents` (`live`): a clone of `~/projects/task-manager` in `~/.groma-live/agents/work`, port 4805 |
| Brownfield, scanned on stage | `21d`, `22`, `22a`, `22b` | `keycloak`: a throwaway clone of `~/projects/keycloak` in `~/.groma-live/keycloak`, port 4803. `22b`'s clicks press Continue, then Install & scan |
| Brownfield, curated | `23`, `23b` | `keycloak-curated`: `~/projects/keycloak`, port 4802 |
| Brownfield diff | `23c` | `keycloak-changed`: `~/projects/keycloak-changed`, port 4804 |
| GitHub Action | `23d` | none: pictures in `public/demo/action-*.webp` of `MrLesk/groma.md-action` |
| Greenfield, finished | `21c`, `21e` | `agents` again, then `task-manager`: `21e` runs `task-manager kanban` and `task-manager list` in the agents' clone (no server, port 0) |

**Colours.** Each project has its own colour: the slides from its beat card on carry `class: greenfield`
(leaf green: `21`, `21b`, `21c`, `21e`) or `class: brownfield` (soil brown: `22`, `22a`, `22b`, `23`, `23b`,
`23c`). The bridges `21a` and `21d` and the GitHub Action `23d` are about Groma.md itself and keep its green.
The colours are in style.css under "Greenfield and brownfield"; they set `--groma-accent`, which the project's
name on its beat card (`<span class="project">`), the caption cards and the cost card use. The beat cards
have no numbers: the demo switches between the two projects, so a count would not match what is on screen.
The loop slide `19` uses both colours (`--greenfield`, `--brownfield`) for the two ways in: greenfield starts
from tasks and comes in at Plan, brownfield starts from a scan and comes in at See.

**Greenfield.** `~/projects/task-manager` is a seed repository: `src/types.ts`, a Groma.md map with one
component, and 20 Backlog.md tasks that depend on each other. Codex 1 starts on TASK-1, the only ready task. When a
task finishes, the addon's orchestrator marks it Done, runs the repository's `.groma-curate.mjs` (it adds that
task's component through the `groma` CLI: title, description, group, icon, colour and relationships), and hands the
tasks that became ready (`backlog task list --ready`) to free slots, up to six agents. The agents write only their
task's file and tick its criteria (`agent-prompt.md`); they run no tests, builds or `groma`. The run continues in the
background while the Keycloak part is on screen.

**Brownfield diff.** `~/projects/keycloak-changed` is the curated Keycloak map at commit `21cb8e51` plus a feature
in its working tree, Adaptive step-up risk, implemented and curated by Codex. `23c` compares `21cb8e51` with that
working tree. The feature is uncommitted: keep that folder as it is.

**The Groma.md the stage runs.** The `groma` command on this machine is
`~/.bun/install/global/node_modules/groma.md`, a link to `~/projects/groma-aidevcon` (Alex's dev checkout is
`~/projects/groma3`). That folder is on the local branch `aidevcon-stage`, which is never pushed:

- groma.md main (`18a97505`) with PRs #194 (icons) and #195 (colours) merged;
- the stage map: icons and colours on Groma.md's own map, Control and Tree combined into Comparison control, and
  only TASK-567, 575 and 643 to 646 open.

`aidevcon-stage-backup` holds the same content as Alex's working tree before it became those commits. The
Angular, React and Vue scanners are built (`dist/package`, ignored by Git); without that build Groma.md opens on
"Restore plugins", and Restore cannot rebuild a local scanner folder. To check the stage build:

```bash
cd ~/projects/groma-aidevcon && groma plugin list   # every line should say found
for scanner in angular react vue; do bun plugins/scanners/$scanner/build.ts; done   # after scanner changes
```

To give `groma` back to the dev checkout after the talk:
`ln -sfn ~/projects/groma3 ~/.bun/install/global/node_modules/groma.md`.

`<GromaFrame>` posts one Groma.md query string per click and the camera flies there. `<GromaRun>` is a
real terminal on the slide: each click runs the next configured command.
`bun scripts/check-views.mjs` (while `bun run dev` is up) checks every view id against the running
maps; add `--stills` to re-capture the fallback images, `--only 21` to limit it to some pages, and
`--deck <url>` when the deck is not on port 3030. Groma.md ignores ids it does not know. For `<GromaAgents>`
slides it moves the agents to the right phase first.

Start the deck before the talk and let the prepared maps finish loading. Run `bun scripts/check-views.mjs` before
presenting; it checks view IDs, relationships, comparison revisions, and source files. The raw Keycloak map is
intentionally built on stage.

The curated Keycloak relationships live in their source element documents. Do not restore the old
central `relationships.md`. The order-service scenario (`orders.bundle`, `demo/agents.mjs`) is no longer used
by this deck; the flash deck still has it.

## Files

- `slides.md` holds the cover and the slide order. One file per slide in `pages/`.
- `pages/2xb-*-live.md` are the embedded live map slides. `21b` shows the greenfield seed map without the agents
  panel (`:panels="[false, true]"`). Its click brings the panel and sends the `go` prompt: Codex 1 starts on
  TASK-1 and the others join as tasks become ready (`<GromaAgents>` on the `live` instance; `agent-prompt.md` is
  the first prompt, with `{agent}` and `{task}` filled in). RESET in the panel stops them and resets the clone.
  `21c` shows the finished greenfield map, then the comparison from the clone's seed commit (`{base}`, filled in
  by the deck). Never run `check-views.mjs` on `21b` or `21c`: for a live instance a phase change is the go
  signal, and every start or RESET costs agent runs on the demo key. Use `--only` for the other pages.
  `bun run rehearsal` runs the agents on Alex's own `~/.codex` with the headmatter's `rehearsal` settings.
  `21b` and `21c` show what the run has cost so far, bottom right (`cost`): the addon's `setup/run-cost.ts` prices
  every response in the agents' saved Codex sessions at list prices.
- `pages/23-demo-curated.md` (no LIVE tag: the curated map was made before the talk) runs
  `components/CodexPaste.vue` on Alex's clicks (2026-10-09): when it opens, the pointer waits on Copy prompt in
  Groma.md's First scan notice from the previous slide; click 1 copies and a Codex terminal opens, click 2 pastes
  the prompt (⌘V), click 3 sends it (⏎) and Codex starts working. The prompt
  is Groma.md's own text from `src/viewers/web/chrome/empty.ts`; keep it word for word. Previews show the end state.
- `pages/06-rescue.md` is one terminal driven by four clicks ("AI to the rescue." rolls into "AI power!").
  Clicks add `s1` to `s4` to the stage and `style.css` transitions on those classes, so stepping back
  rewinds. `components/GrowingIds.vue` grows the `IN (...)` list from click 3.
- `components/SurveyorScene.vue` dissolves the road engraving into the map engraving
  (`public/groma-road.webp`, `public/groma-map.webp`). Both are the light pictures from
  `docs/what-is-a-groma.md` in the Groma.md repository; their green lines keep them to paper slides.
- `public/demo/` holds the fallback stills.
- `pages/14c-ai-diagrams.md` shows three diagrams an AI agent drew of Backlog.md with the archify skill
  (github.com/tt-a1i/archify). Their specs are `diagrams/*.json` (repository revision pinned in the
  architecture spec); the pictures in `public/diagrams/` are the delivered viewers captured at 1440x900,
  1.5x, light theme. To change one, edit its spec, run archify's `validate` and `deliver`, and recapture.
  Its click (Alex, 2026-10-08) makes the point that they go stale right away: the sheets fade to grey, an ink
  STALE stamp lands across them, and the caption becomes "One commit later". Monochrome, as the light is grey.

## Pieces from the Devoxx opening keynote demo (2026-10-07)

For Devoxx, Alex brought four pieces of his demo in Stephan Janssen's opening keynote into this deck, restyled on
paper:
`pages/21a-karpathy.md` (Karpathy's "give it success criteria" card, the bridge into the agents beat),
`pages/21d-scans.md` with `components/ScanFlow.vue` (deterministic offline scans and the languages, before
Keycloak gets scanned), `pages/28b-try.md` (QR code to groma.md in `public/qr-groma.svg`, the three steps and
the chips, over Groma.md's own map `public/demo/walk-0.webp`), and a plot twist on the finale: its click strikes
"In" out of "In the loop." and writes "Over" above it. The title stays "In the loop"; the twist is the ending.
The agents run live, with no recorded fallback: Alex chose to go all in.

## Commands

```bash
bun run dev      # slidev --open
bun run build    # production build
```
