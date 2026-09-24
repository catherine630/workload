# Phesi Trial Accelerator: explainer video

`phesi-trial-accelerator.mp4`: 55 s, 1920×1080, 30 fps, H.264, no audio.

| Time | Scene |
|---|---|
| 0–5s | Title: Trial Accelerator |
| 5–12s | 01 A new drug, indication: breast cancer |
| 12–20s | 02 Define the target patient profile (example HR+/HER2− mBC criteria) |
| 20–28s | 03 The largest source of global clinical data (world map lights up by region) |
| 28–37s | 04 AI in real time: a scan filters global data down to matching patients |
| 37–44s | 05 Key opinion leaders connected to nearby matching patients |
| 44–50s | Outcome: the right patients, the right experts, anywhere in the world |
| 50–55s | End card: www.phesi.com |

## Editing and re-rendering
- `scene.html` holds all copy, colours and timings (`render(t)` is deterministic per timestamp).
- `phesi-trial-accelerator.html` is a standalone preview that loops in a browser.
- Re-render: `npm i playwright world-atlas topojson-client d3-geo imageio-ffmpeg`, then run
  `FFMPEG=/path/to/ffmpeg node render.mjs`. For review stills: `node render.mjs stills 10 30`.
- `build-dots.mjs` regenerates the dotted world map (`dots.json`) from Natural Earth land data.
