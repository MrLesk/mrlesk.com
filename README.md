# mrlesk.com (minimal)

A super‑minimal Astro site with only public info: About + links to LinkedIn and GitHub.

## Develop

- Install deps: `npm i` (or `pnpm i` / `bun i`)
- Run dev server: `npm run dev`
- Build static site: `npm run build`
- Preview build: `npm run preview`

## Structure

- `src/pages/index.astro` — single static page with inline styles
- `public/robots.txt` — allow indexing
- `astro.config.mjs` — static output, site URL

## Notes

- Keep it light: avoid adding details about experience or education here.
- Update links/content in `index.astro` as needed.
