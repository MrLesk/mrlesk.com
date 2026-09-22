# Film rig for the groma.md launch video

Every product shot in `../brag.mp4` is the real `groma web`, filmed frame by frame.

`rig.mjs` gives the page a virtual clock before Groma's scripts run. Animation frames, timers and CSS
animations only move when the rig advances the clock, and each video frame is one advance plus one
screenshot. A slow machine still gives even 60 fps motion, and Groma's 220 ms camera flights can run in
slow motion.

| Script | Shot |
| --- | --- |
| `shot-hero.mjs` | Map only. A scripted glide and pull-back, then F2 lifts the map into its C4 layers. Filmed twice with the same camera path (`THEME=blueprint`, `THEME=light`) so the edit can wipe between them. |
| `shot-walk.mjs` | Search "web h", Enter (the camera dives to Web host), How it's built, open `server.ts`. |
| `shot-flow.mjs` | The "Scan project source" flow, one step per second with the Next button. |
| `shot-timelapse.mjs` | Replays the demo order service's history (`SCRATCH/orders-history`, a clone of `slidev-addon-groma-live/demo/orders.bundle`) into a folder Groma watches; commits land on a sixteenth-note grid. Writes `timelapse.json` with the frame of every commit. |
| `shot-curate.mjs` | The order service as a raw first scan (`SCRATCH/orders-raw`, a fresh scan of the demo's last commit), then the agent's curated architecture lands and the map morphs into it. |

The film set is a clean clone of Groma (`SCRATCH/groma-clean`) with its scanners switched off, so the
committed architecture is shown as is, and with `CAMERA_SETTLE_MS` set to 0 in `src/viewers/web/iso/map.ts`.
Groma normally moves a cached bitmap of the map while the camera is in motion and redraws the SVG
250 ms after it settles; the rig runs that zero-delay redraw inside every frame, so no frame shows
the scaled bitmap. A real-time recording needs the other trick: visit the final zoom first so the
redraw is cached there, then zoom out and record the zoom in. `slidev-addon-groma-live/demo/build-orders.sh` rebuilds the
demo history with the real `backlog` and `groma` CLIs.

```bash
export SCRATCH=/path/to/scratch   # holds groma-clean, frames and clips
OUT=$SCRATCH/clips THEME=blueprint TO=300 node shot-hero.mjs
```

`capture-still.mjs` and `verify-deck.mjs` serve the slide decks: the first captures a deck replay's fallback still, the
second records the flash deck's timelapse map in real time.

The filmed clips (`../composition/assets/footage/`), the music track and the render snapshots are not in the repository.
The clips come back from these scripts; `../composition/assets/CREDITS.md` says where the music comes from.
