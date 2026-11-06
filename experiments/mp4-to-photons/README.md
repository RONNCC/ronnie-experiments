# MP4 to photons and sound

Beginner playback journey plus an engineering route for generated-media pipelines.

Implemented: bundled MP4 browser playback; three WebAudio PCM tones; original visual interactions; timestamp/drift arithmetic bench. Codec internals, physical output timing and production streaming are explanations, not custom implementations.

## Regression

With Playwright and Chrome installed:

```sh
node tests/regression.cjs
# Or test the deployed version:
LIVE=https://sghose.me/ronnie-experiments/experiments/mp4-to-photons/ node tests/regression.cjs
```

The test checks native video decode, WebAudio buffer playback completion, original controls, glossary filtering, calculator arithmetic and invalid tick rate, page errors and horizontal overflow at 320/390/1280 px. Audio completion is not an acoustic quality measurement. Screenshots are written to /downloads for manual visual inspection.

The documented FFmpeg command was executed and its output decoded without reported errors. Existing sample.mp4 was not changed. Its actual packet PTS/DTS and stream fields were inspected with ffprobe. New commands produce a comparable example, not a byte-identical reproduction.
