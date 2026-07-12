# Image adapter contract

An image adapter generates or edits a product image, key visual, illustration, icon, or background.

## Inputs

- intended use and crop set;
- dimensions/resolution;
- product-truth constraints;
- permitted source images and likenesses;
- prohibited visual elements;
- style direction without unauthorized imitation;
- required transparency/background behavior.

## Outputs

For `rendered`:

- real image file;
- lineage record with tool/model, prompt/instructions, inputs, edits, and substitutions;
- rights status and source list;
- critical-detail inspection notes;
- alt text when non-decorative.

For `ART_DIRECTION_ONLY`:

- `PROMPT-PACK.md`;
- `SOURCE-ASSET-LIST.md`;
- `OUTPUT-SPEC.md`;
- accepted `PRODUCTION-PACK.yaml` record;
- no `rendered_path` claim.
