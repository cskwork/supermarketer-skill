# Video adapter contract

A video adapter assembles or generates a marketing video from an approved production plan.

## Inputs

- script and time-coded storyboard;
- shot list and source assets;
- voiceover, on-screen text, and captions;
- duration, ratio, resolution, frame rate, codec/container, audio, and file-size constraints;
- music, voice, footage, logo, likeness, and disclosure rights;
- first-frame, thumbnail, silent-viewing, and end-card requirements.

## Rendered outputs

- real video file;
- caption and transcript files when required;
- thumbnail/first-frame derivative when required;
- lineage and source-rights record;
- metadata verified with `ffprobe` by the core package.

## `PRODUCTION_PACK_ONLY` output

The pack must include all ten files listed in `PRODUCTION-PACK.yaml`: script, storyboard, shot list, voiceover, on-screen text, captions, prompt pack, source-asset list, edit plan, and output spec. It must be explicitly accepted by an accountable owner. `rendered_path` must remain empty.
