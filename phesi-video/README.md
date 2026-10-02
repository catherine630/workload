# Phesi Trial Accelerator: explainer video

`phesi-trial-accelerator.mp4`: 35.5 s, 1920×1080, 30 fps, H.264, no audio.

| Time | Scene |
|---|---|
| 0–9s | 01 Search the world: world map lights up by region; feasibility insights from every region |
| 9–17s | 02 AI in real time: a scan filters global data down to matching patients |
| 17–25s | 03 Key opinion leaders connected to nearby matching patients |
| 25–31s | Outcome: the right patients, the right experts, anywhere in the world |
| 31–35.5s | End card: www.phesi.com |

The original opening scenes (title, new drug, patient profile) were removed; `OFFSET` in `scene.html` sets where the video starts.

## Editing and re-rendering
- `scene.html` holds all copy, colours and timings (`render(t)` is deterministic per timestamp).
- `phesi-trial-accelerator.html` is a standalone preview that loops in a browser.
- Re-render: `npm i playwright world-atlas topojson-client d3-geo imageio-ffmpeg`, then run
  `FFMPEG=/path/to/ffmpeg node render.mjs`. For review stills: `node render.mjs stills 10 30`.
- `build-dots.mjs` regenerates the dotted world map (`dots.json`) from Natural Earth land data.
