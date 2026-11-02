# In the loop, not in the dark

Slidev deck for Alex Gavrilescu's Devoxx Belgium 2026 talk (Tools in Action, 30 minutes), now growing into the
50-minute keynote on Friday 2026-10-09, 09:30, Room 4. Notes marked "50-minute timings still to redo" are new.
Read https://sli.dev/llms.txt before changing Slidev mechanics.

## This copy: AI DevCon NYC 2026

This folder started on 2026-11-01 as an unchanged copy of `talks/devoxx/in-the-loop` (working tree included) for
AI DevCon NYC (Tessl, Industry City, Brooklyn): Tuesday 2026-11-03, 16:15, The Landing - Lower Level,
Tools-in-Action, 25 minutes plus 5 minutes of Q&A, recorded for the AI Native Dev YouTube channel. The rest of this
file still describes the Devoxx deck until the talk is adapted. Do not run this deck and the Devoxx one at the same
time: both start the same Groma.md servers (ports 4801 to 4805) in the same `~/.groma-live/<name>` folders.

Changed from the Devoxx deck so far:

- The cover is AI DevCon's own title slide. The organisers ask every speaker to use their template, or at least
  its title slide (speaker guide: https://tessl.notion.site/speaker-guide-nyc-2026). `public/aidevcon/logo.png`,
  `nyc.png` and `dashes.png` are the template's own images, unchanged. They come from Google's SVG export of the
  template's title slide, where they are embedded as PNGs:
  https://docs.google.com/presentation/d/1SRR97QXVTJ-_ZkAerkczWb9Fi3d4mNyxEm3XnZKEjU4/export/svg?pageid=g3fbd5b97d7c_5_75
  The title, subtitle, name and role are real text in the template's places, colours and font (Helvetica); the
  Cover section of `style.css` holds the positions. `speaker.jpg` is `presenter.jpg` from the other talks, resized
  to 720 px.
- Yellow is AI DevCon's colour, not part of the light story, so it stays on the cover. The story's light starts on
  the next slide. The cover is `mood: 0` so the room around it is black too, and it hides the deck frame and the
  light meter.
- The thank-you slide no longer has the "Rate this talk" QR code: it opened the talk in the Devoxx app.
- At Devoxx people asked what happened to the 1,700 tests on "I opened the code. WTF!" and "Look at what I
  found. Again.", and how Groma.md fixed them. Alex's answer: he got rid of most of them, but that's for another
  talk. "Look at what I found. Again." (`pages/14b-shape.md`) now has a first click that crosses out "Wrong tests"
  with the note "Got rid of most. But that's for another talk.", in the finale's strike style. Groma.md did not
  fix the tests; never suggest it did.

## The one idea that shapes everything

The deck is lit like a room. The story starts in the dark, falls to black, and the light
comes back when Groma.md arrives. That is the title, made visible.

- Every slide sets `mood` in its frontmatter: `0` black, `1` dark grey, `2` grey, `3` light grey, `4` paper.
- `moodSteps: [1, 1, 0]` changes the light per click inside one slide.
- `layouts/default.vue` turns the mood into a class, `style.css` derives every colour from it,
  and `global-top.vue` lights the area around the slide plus the small meter top right.
- Colour is part of the light: everything is monochrome until mood 4. Groma.md green only
  appears once Groma.md is on screen. Do not use green on darker slides. One exception, Alex's
  call: the green ticks on "I followed the best practices." The AI DevCon cover is outside the story and keeps
  the conference's yellow (see above).
- The four attempts after the welcome slide step the light 1, 2, 3, 4, one level per attempt,
  so only Groma.md 3 is at full light (Alex's call). The attempt rail drops its green below mood 4, and the
  pictures on the attempts (the code meme, Project Blueprint's first mockup) go grey.

## Voice

- Minimal text. Alex narrates. Detail goes in speaker notes, which carry target timestamps.
- No em dashes anywhere. Plain words.
- The story slides follow Alex's own draft wording. Do not invent facts or numbers.
- Getting started is always three steps: INSTALL `npm i -g groma.md`, SCAN `groma web`, CURATE "your agent".
  Never suggest the first scan is the finished architecture; the agent's curation turns it into one.

## Honesty rules for claims about Groma.md

- Only claim what Groma.md ships today (check `groma --help` and the Groma.md README).
- Design-first drafting is NOT ready. Planning means Backlog.md tasks pinned on the map.
  Do not promise draft plans or "design it in Groma.md first".

## The live demo runs inside the slides

Everything live comes from the shared addon at the repository root, `slidev-addon-groma-live`
(read its README). `bun run dev` is the only command: the addon starts the Groma.md servers listed
under `gromaLive` in the headmatter and stops them with Slidev.

| Beat | Slides | Groma.md server |
| --- | --- | --- |
| 1 Walk the map | `20b` | `~/projects/groma3`, port 4801 |
| 2 Keycloak, scanned on stage | `22a` runs the clone, `22b` shows the Groma.md setup (its clicks press Continue, then Install & scan) and then the map | throwaway clone in `~/.groma-live/keycloak-devoxx`, port 4803 |
| 3 Keycloak curated | `23b` | `~/projects/keycloak`, port 4802 |
| 4 Six Codex agents on six Groma.md tasks (`21b`), then what they changed (`21c`) | `21b`, `21c` | `live`: a fresh clone of `~/projects/groma3` at branch `in-the-loop-baseline` in `~/.groma-live/agents`, one `codex exec` session per task planning from `bun run dev` on, port 4805 |

The beats follow how a team would start with Groma.md (Alex, 2026-10-08): see a map, scan and curate
your own code (Keycloak, beats 2 and 3), and only then let agents work on tasks with the map open (beat 4).
The scans slide `21d` leads into beat 2 and the Karpathy card `21a` into beat 4.

`<GromaFrame>` posts one Groma.md query string per click and the camera flies there. `<GromaRun>` is a
real terminal on the slide: each click runs the next configured command.
`bun scripts/check-views.mjs` (while `bun run dev` is up) checks every view id against the running
maps; add `--stills` to re-capture the fallback images, `--only 21` to limit it to some pages, and
`--deck <url>` when the deck is not on port 3030. Groma.md ignores ids it does not know. For `<GromaAgents>`
slides it moves the agents to the right phase first.

Rehearsed with Groma.md 0.6.2 plus the standalone scanner dependency fix, and the 0.2.1 published
scanners. The fresh Keycloak setup reached its map in about 23 seconds with scanners already cached;
a cold download depends on the network. Start the deck before the talk and let both prepared maps
finish loading. Run `bun scripts/check-views.mjs` before presenting; it checks view IDs, relationships,
comparison revisions, and source files. The raw Keycloak map is intentionally built on stage.

The curated Keycloak relationships live in their source element documents. Do not restore the old
central `relationships.md`. The order-service scenario (`orders.bundle`, `demo/agents.mjs`) is no longer used
by this deck; the flash deck still has it.

## Files

- `slides.md` holds the cover and the slide order. One file per slide in `pages/`.
- `pages/2xb-*-live.md` are the embedded live map slides. `21b` opens zoomed on the Groma application, where the
  six tasks are pinned, without the agents panel (`:panels="[false, true]"`; `hud=off` would hide the pins too).
  Its click brings the panel and the full map, and sends the `go` prompt to the six Codex sessions that planned when `bun run dev` started
  (`<GromaAgents>` on the `live` instance; `agent-prompt.md` is their first prompt, with `{agent}` and `{task}`
  filled in). RESET in the panel stops them, resets the clone and plans again. `21c` opens the comparison from
  the clone's baseline commit (`{base}`, filled in by the deck) to the working tree, finished or not. Never run
  `check-views.mjs` on `21b` or `21c`: for a live instance a phase change is the go signal, and every start or
  RESET costs a planning round on the demo key. Use `--only` for the other pages. `bun run rehearsal` runs the
  agents on GPT-6 Luna at max effort on the Fast tier instead of the keynote setup (GPT-6.1 Sol, medium, Ultrafast).
  `21c` also shows what the run has cost so far, bottom right (`<GromaAgents review cost>`): the addon's
  `setup/run-cost.ts` prices every response in the agents' saved Codex sessions at list prices, with the model
  and tier Codex logged, planning included, and says "so far" while agents still work.
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

## From Tuesday's keynote demo (2026-10-07)

Alex brought four pieces of his demo in Stephan Janssen's opening keynote into this deck, restyled on paper:
`pages/21a-karpathy.md` (Karpathy's "give it success criteria" card, the bridge into the agents beat),
`pages/21d-scans.md` with `components/ScanFlow.vue` (deterministic offline scans and the languages, before
Keycloak gets scanned), `pages/28b-try.md` (QR code to groma.md in `public/qr-groma.svg`, the three steps and
the chips, over Groma.md's own map `public/demo/walk-0.webp`), and a plot twist on the finale: its click strikes
"In" out of "In the loop." and writes "Over" above it. The title stays "In the loop"; the twist is the ending.
Beat 4 is now six real Codex agents on six Groma.md tasks, in the light theme, with no recorded fallback: Alex
chose to go all in. The tasks (2026-10-08) live on the local groma3 branch `in-the-loop-baseline`, checked out in
the worktree `~/projects/groma3-in-the-loop`, picked as the six that touch the most components and relationships
on Groma.md's own map: TASK-561 icons and colour from published icon packs, TASK-562 plans exported and imported,
TASK-563 play history between two commits, TASK-564 a criticality level per component, TASK-565 colour by how the
code moves plus outlier marks, TASK-568 one plugins.json for every plugin kind. Edit them there with
`backlog task edit`, then commit on that branch; never push it.

## Commands

```bash
bun run dev      # slidev --open
bun run build    # production build
```
