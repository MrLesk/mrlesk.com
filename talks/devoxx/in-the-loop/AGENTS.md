# In the loop, not in the dark

Slidev deck for Alex Gavrilescu's Devoxx Belgium 2026 talk (Tools in Action, 30 minutes).
Read https://sli.dev/llms.txt before changing Slidev mechanics.

## The one idea that shapes everything

The deck is lit like a room. The story starts in the dark, falls to black, and the light
comes back when Groma arrives. That is the title, made visible.

- Every slide sets `mood` in its frontmatter: `0` black, `1` dark grey, `2` grey, `3` light grey, `4` paper.
- `moodSteps: [1, 1, 0]` changes the light per click inside one slide.
- `layouts/default.vue` turns the mood into a class, `style.css` derives every colour from it,
  and `global-top.vue` lights the area around the slide plus the small meter top right.
- Colour is part of the light: everything is monochrome until mood 4. Groma green only
  appears once Groma is on screen. Do not use green on darker slides.

## Voice

- Minimal text. Alex narrates. Detail goes in speaker notes, which carry target timestamps.
- No em dashes anywhere. Plain words.
- The story slides follow Alex's own draft wording. Do not invent facts or numbers.
- Getting started is always three steps: INSTALL `npm i -g groma.md`, SCAN `groma web`, CURATE "your agent".
  Never suggest the first scan is the finished architecture; the agent's curation turns it into one.

## Honesty rules for claims about Groma

- Only claim what Groma ships today (check `groma --help` and the Groma README).
- Design-first drafting is NOT ready. Planning means Backlog.md tasks pinned on the map.
  Do not promise draft plans or "design it in Groma first".

## The live demo runs inside the slides

Everything live comes from the shared addon at the repository root, `slidev-addon-groma-live`
(read its README). `bun run dev` is the only command: the addon starts the Groma servers listed
under `gromaLive` in the headmatter and stops them with Slidev.

| Beat | Slides | Groma server |
| --- | --- | --- |
| 1 Walk the map, 2 tasks | `20b`, `21b` | `~/projects/groma3`, port 4801 |
| 2 Timelapse of an agent-built order service | `21c` | replay of `slidev-addon-groma-live/demo/orders.bundle`, port 4804 |
| 3 Keycloak, scanned on stage | `22a` runs the clone, `22b` shows Groma's own setup and then the map | throwaway clone, port 4803 |
| 4 Keycloak curated | `23b` | `~/projects/keycloak`, port 4802 |

`<GromaFrame>` posts one Groma query string per click and the camera flies there. `<GromaRun>` is a
real terminal on the slide: each click runs the next configured command.
`bun scripts/check-views.mjs` (while `bun run dev` is up) checks every view id against the running
maps; add `--stills` to re-capture the fallback images. Groma ignores ids it does not know.

Beat 3 works since Groma 0.5.0 and the 0.2.0 scanners on npm: Groma's setup installs them, scans and
opens the raw map. It takes about 4 minutes from "Install & scan" to the map (about 15 s install,
2 minutes scan, 1.5 minutes preparing the map), longer than the slide's slot. The curated Keycloak map
(`~/projects/keycloak/groma`, not in git) uses the 0.2.0 scanners too, so its Groma server scans for
about 50 s after `bun run dev` before slide `23b` answers.

## Files

- `slides.md` holds the cover and the slide order. One file per slide in `pages/`.
- `pages/2xb-*-live.md` are the embedded live map slides; `21c` is the timelapse of the demo order service.
- `pages/06-rescue.md` is one terminal driven by four clicks ("AI to the rescue." rolls into "AI power!").
  Clicks add `s1` to `s4` to the stage and `style.css` transitions on those classes, so stepping back
  rewinds. `components/GrowingIds.vue` grows the `IN (...)` list from click 3.
- `components/SurveyorScene.vue` dissolves the road engraving into the map engraving
  (`public/groma-road.webp`, `public/groma-map.webp`). Both are the light pictures from Groma's
  `docs/what-is-a-groma.md`; their green lines keep them to paper slides.
- `public/demo/` holds the fallback stills.

## Commands

```bash
bun run dev      # slidev --open
bun run build    # production build
```
