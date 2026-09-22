# groma.md in 80 seconds

Slidev deck for Alex Gavrilescu's 80 second flash talk. Product first: the live Groma map runs
inside the slides and follows the clicker. Read https://sli.dev/llms.txt before changing Slidev mechanics.

## Shape

Four slides, about 160 spoken words. The script and target times are in the speaker notes.

1. `slides.md`: cover, spoken over for the first 10 seconds.
2. `pages/01-live.md`: `<GromaFrame>` with one Groma query string per click.
3. `pages/02-timelapse.md`: `<GromaTimelapse autoplay>`, 15 seconds of a project being built on a live map.
4. `pages/03-get.md`: the three steps (install, scan, your agent curates) and a QR code to groma.md.

`global-top.vue` draws the 80 second clock along the bottom. It starts on the first advance and
assumes 10 seconds were already spent on the cover.

## How the embedded map is driven

Everything live comes from the shared addon at the repository root, `slidev-addon-groma-live`
(read its README). The deck's headmatter lists two Groma servers: `~/projects/groma3` on port 4801
and the timelapse of the demo order service on port 4804.
`bun run dev` starts it and stops it again. There is nothing else to run.

`<GromaFrame>` posts one Groma query string per click and the camera flies there. If Groma cannot
start, the slide shows the images in `public/stills/` instead.

The views use ids from Groma's own repository (`web-server`, `scan-project-source`, `TASK-444`, container `cli`).
Pointing the deck at another project means changing the views and re-capturing the stills.

## Voice

Minimal text, Alex narrates. No em dashes. Only claim what Groma ships today.

Getting started is always three steps: INSTALL `npm i -g groma.md`, SCAN `groma web`, CURATE "your agent".
Never suggest the first scan is the finished architecture; the agent's curation turns it into one.

## Commands

```bash
bun run dev   # starts Slidev and Groma
```
