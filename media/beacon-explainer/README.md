# Beacon explainer video

This 26-second, silent Three.js visualization turns the research proposal into a
compact narrative for the Devin Max giveaway reply. All narration is rendered on
screen; no audio track is created.

## Render

```bash
cd media/beacon-explainer
npm ci
npm run render
```

The renderer uses a locally installed Chrome/Chromium, records the procedural
Three.js scene at 1280×720, and converts the result to an H.264/yuv420p MP4 with
`ffmpeg-static`. Set `BEACON_CHROME_PATH` if Chrome is installed elsewhere.

The incident statistics shown in the video are sourced from METR's
[independent investigation](https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/).
The hidden-evaluator and automated-search framing is informed by Anthropic's
[automated alignment researcher study](https://alignment.anthropic.com/2026/automated-alignment-researchers/).
