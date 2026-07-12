# Static adapter contract

A static adapter produces posters, banners, carousels, flyers, display ads, or social creatives.

## Inputs

- asset and deliverable IDs;
- exact dimensions and format;
- approved copy and claim IDs;
- brand tokens and logo constraints;
- approved imagery/source assets;
- safe-zone, crop, and accessibility requirements;
- editable/source-output requirement when supported.

## Outputs

- actual rendered file for every required size/variant;
- editable/source file when the adapter supports it;
- preview or contact sheet when useful;
- lineage record;
- alt-text file for non-decorative assets.

## Hard rule

Static output cannot use a production-pack fallback. A textual description, prompt, HTML mockup without render, or missing file cannot satisfy a poster deliverable.
