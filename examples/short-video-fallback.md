# Scenario: 15-second vertical product video without a renderer

## Request

Create a 15-second vertical video ad for a new product feature.

## Environment

- Research and text tools available.
- Image tool optional.
- No video generation or editing adapter.
- No publishing authorization.

## Expected route

`VIDEO`

## Expected outputs

- `BRIEF.md`
- `EVIDENCE.md`
- `CHANNEL-SPECS.yaml` with current sourced placement requirements
- `CLAIMS.yaml`
- `MESSAGE-HOUSE.md` if message is not already approved
- `CREATIVE-BRIEF.md`
- final script
- time-coded storyboard
- shot list
- voiceover
- on-screen text
- caption file
- generation/source prompts
- edit decision plan
- thumbnail/first-frame direction
- `ASSET-MANIFEST.yaml`
- `QA.md`

## Required status

```text
Render status: PRODUCTION_PACK_ONLY
Readiness: REVIEW_READY
Performance: NOT_MEASURED
```

It must not create an empty `.mp4`, invent a rendered path, or state that a video was made.
