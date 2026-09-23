# Hyperframes Composition Brief: groma.md

## Objective
Create a 25 second launch film for groma.md that Alex posts on X. People should see what Groma does and want to install it.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape, 1920x1080, 60 fps
- Duration: 25 seconds

## Source Material
- Project root: `~/projects/groma3` (the product), filmed from a clean clone at commit 3ce5689b
- Primary files read: `README.md`, `MANIFESTO.md`, `package.json`, `src/viewers/web/**` (camera, layers, themes), the flash talk in `talks/groma/flash`
- Product name: groma.md
- Tagline / strongest claim: "Your architecture, alive."
- Key UI or visual moment to recreate: nothing is recreated. All product shots are real footage of `groma web`, filmed frame by frame with a virtual clock (`brag-output/capture/rig.mjs`), so camera flights run in slow motion at a steady 60 fps.
- Copy that must appear verbatim:
  - Your architecture, alive.
  - npm i -g groma.md
  - groma web
  - In the loop. Not in the dark.

## Creative Direction
- Tone preset: cinematic, with app-store cleanliness in the feature beats
- Creative direction: "stunning, mouths open, install it immediately; better than the flash talk"
- Interpretation: one dramatic device (dark to light), then confident product shots cut on the beat. Few words, large type, real footage.
- Angle: agents write the code and people stop reading every diff, which leaves them in the dark. The film opens in Groma's blueprint theme, then a light sweep turns the same shot into the paper map.
- Hook: "Agents write the code." then "You're in the dark." over a gliding blueprint map
- Outro / punchline: "In the loop. Not in the dark."
- Avoid: generic SaaS language, abstract filler, mockups, claims beyond the README (no drafts, no design-first planning)

## Visual Identity
- Background: paper `#F7F6F2`; product light theme `#FFFFFF`; dark act `#07152B`
- Text: ink `#171B1A`; on dark `#EAF6FF`
- Accent: Groma green `#1D9E75`
- Display font: Inter 700/800, tight tracking (local woff2 in `assets/fonts`)
- Body and label font: IBM Plex Mono (local ttf in `assets/fonts`)
- Visual references from the project: the drawing-sheet look of the decks (paper, fine grid, frame lines with corner ticks, green offset shadow), the Groma mark, the product's own chrome

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary (bars of the 120 BPM track are every 2 s from 0.02). This is the original plan, cut to the first music track; `build.py` holds the current timings and music, where a repeated bar at 8.02 gives the iso push-in two seconds and every later scene one bar more:
1. In the dark, 0.0 to 4.02 s: `hero-blueprint.mp4` full bleed; "Agents write the code." / "You're in the dark."
2. Lights on, 4.02 to 8.02 s: diagonal light sweep into `hero-light.mp4` (same camera path, 2D); wordmark and "Your architecture, alive."; the view switch appears and at 6.02 the cursor clicks Iso, so the flat plan rises into the isometric map
3. Walk it, 8.02 to 12.02 s: `walk.mp4` in a framed card; search, fly to a component, How it's built, source opens; "Find anything." / "Read what it does." / "Open the code."
4. Trace a flow, 12.02 to 16.02 s: `flow.mp4`; steps 2, 3, 4 land on 13.02, 14.02, 15.02; "Trace a flow, step by step."
5. Watch agents build, 16.02 to 20.02 s: `timelapse.mp4`; commit counter to 48 and commit subjects from `capture/timelapse.json`; "Watch your agents build."
6. Your stack, 20.02 to 21.52 s: "Works with your stack." and twelve language chips
7. Install, 21.52 to 25.0 s: typed `npm i -g groma.md`, `groma web`, "Free. MIT. Local.", wordmark, "In the loop. Not in the dark."

## Audio
- Audio role: cinematic support turning into a confident rhythmic layer
- Audio arc: held back under the dark hook, a hit on lights on, tactile clicks in the product beats, the track's own lift at 16.02 under the timelapse, fade under the closing line
- Music: `assets/music/happy-beats-business-moves-vol-1-by-ende-dot-app.mp3`
- Music treatment: volume lane: 0.26 under the hook, 0.36 from 4.02, fade out 23.8 to 25.0
- Music cue guidance: bundled preset `assets/music/cues/happy-beats-business-moves-vol-1-by-ende-dot-app.music-cues.json`. Beat-locked: lights on 4.02 (bar line), timelapse 16.02 (strong cue), closing line 23.02 (strong cue). Beat grid: walk clicks 8.02/9.02/10.02/11.02, flow steps 13.02/14.02/15.02, timelapse commits on sixteenths from 16.145, chips from 20.14
- Audio-reactive treatment: subtle; bass energy breathes the green glow behind the wordmark and the install command; no waveforms
- Audio-coupled moments: typed commands (key presses), the real clicks (mouse clicks), flow steps (switch ticks), lights on (soft heavy impact), timelapse (light ticks on beats, not on every commit), closing line (bell)
- SFX selection guidance: low high-frequency-risk picks from `sfx-analysis.md`: `impactSoft_heavy_003`, `impactSoft_medium_001`, `click_003`, `click2`, `rollover2`, `switch_007`, `drop_002`, `card-slide-1`, `impactBell_heavy_003`, a handful of `keypress-*`
- Exact SFX choice: decided in the composition from the implemented motion
- Audio files: copied into `composition/assets/`

## Hyperframes Instructions
Standalone `index.html`, one paused GSAP timeline registered as `window.__timelines["main"]`, built synchronously. Footage as muted `<video>` clips (never nested in timed wrappers), camera moves on untimed inner wrappers, text legible at every hold, `npx hyperframes check` clean before render, render at 60 fps.
