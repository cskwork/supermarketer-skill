export const VERSION = '0.0.1';

export const MODES = Object.freeze([
  'RESEARCH',
  'POSITION',
  'CAMPAIGN',
  'COPY',
  'STATIC',
  'IMAGE',
  'VIDEO',
  'LAUNCH-KIT',
  'EXPERIMENT',
  'LOCALIZE',
  'AUDIT',
  'MEASURE',
]);

export const READINESS_STATES = Object.freeze([
  'DRAFT',
  'REVIEW_READY',
  'LAUNCH_READY',
  'BLOCKED',
]);

export const PERFORMANCE_STATES = Object.freeze([
  'NOT_MEASURED',
  'MEASURING',
  'PERFORMANCE_VALIDATED',
]);

export const ASSET_KINDS = Object.freeze([
  'research',
  'strategy',
  'copy',
  'static',
  'image',
  'video',
  'audio',
  'document',
  'data',
]);

export const ASSET_STATUSES = Object.freeze([
  'draft',
  'rendered',
  'approved',
  'production_pack_only',
]);

export const FALLBACK_STATUSES = Object.freeze([
  'none',
  'ART_DIRECTION_ONLY',
  'PRODUCTION_PACK_ONLY',
]);

export const RIGHTS_STATUSES = Object.freeze([
  'owned',
  'licensed',
  'cleared',
  'not_applicable',
  'pending',
  'restricted',
]);

export const REVIEW_TYPES = Object.freeze([
  'research_method',
  'strategy',
  'claims_brand_rights',
  'creative',
  'accessibility',
  'localization',
  'compliance',
  'artifact_qa',
  'measurement',
]);

export const REVIEW_VERDICTS = Object.freeze([
  'pass',
  'pass_with_risk',
  'fail',
]);

export const FINDING_SEVERITIES = Object.freeze([
  'info',
  'low',
  'medium',
  'high',
  'critical',
  'blocker',
]);

export const FINDING_STATUSES = Object.freeze([
  'open',
  'resolved',
  'accepted',
  'not_applicable',
]);

export const EVIDENCE_PREFIX_KIND = Object.freeze({
  P: 'product',
  C: 'customer',
  M: 'market',
  S: 'channel',
  L: 'legal',
  A: 'analytics',
});

export const CLAIM_TYPES = Object.freeze([
  'factual',
  'quantitative',
  'comparative',
  'testimonial',
  'promotional',
  'pricing',
  'availability',
  'certification',
  'performance',
  'subjective',
  'aspirational',
]);

export const CLAIM_RISKS = Object.freeze(['low', 'medium', 'high', 'regulated']);

export const CLAIM_APPROVALS = Object.freeze([
  'pending',
  'approved',
  'conditional',
  'rejected',
]);

export const REQUIRED_RUN_FILES = Object.freeze([
  'BRIEF.md',
  'EVIDENCE.md',
  'EVIDENCE.yaml',
  'CHANNEL-SPECS.yaml',
  'CLAIMS.yaml',
  'DELIVERABLES.yaml',
  'ASSET-MANIFEST.yaml',
  'REVIEWS.yaml',
  'APPROVALS.yaml',
  'QA.md',
  'run-state.json',
]);

export const MODE_REFERENCE = Object.freeze({
  RESEARCH: 'reference/research.md',
  POSITION: 'reference/positioning.md',
  CAMPAIGN: 'reference/campaign.md',
  COPY: 'reference/copy.md',
  STATIC: 'reference/static.md',
  IMAGE: 'reference/image.md',
  VIDEO: 'reference/video.md',
  'LAUNCH-KIT': 'reference/workflow.md',
  EXPERIMENT: 'reference/experiments.md',
  LOCALIZE: 'reference/localization.md',
  AUDIT: 'reference/qa.md',
  MEASURE: 'reference/measurement.md',
});

export const MODE_PRIMARY_OUTPUT = Object.freeze({
  RESEARCH: 'cited market/customer insight report',
  POSITION: 'positioning and messaging system',
  CAMPAIGN: 'integrated campaign strategy',
  COPY: 'channel-ready copy deck',
  STATIC: 'rendered static assets',
  IMAGE: 'image assets or accepted art-direction pack',
  VIDEO: 'rendered video or accepted production pack',
  'LAUNCH-KIT': 'coordinated strategy and multi-format asset package',
  EXPERIMENT: 'controlled variants and measurement plan',
  LOCALIZE: 'transcreated copy/assets with layout adaptation',
  AUDIT: 'findings-only audit report',
  MEASURE: 'evidence-based results analysis',
});

export function requiredReviewTypes(mode, context = {}) {
  const required = new Set(['artifact_qa']);
  if (mode === 'RESEARCH') required.add('research_method');
  if (['POSITION', 'CAMPAIGN', 'EXPERIMENT', 'LAUNCH-KIT'].includes(mode)) required.add('strategy');
  if (mode !== 'MEASURE') required.add('claims_brand_rights');
  if (['CAMPAIGN', 'COPY', 'STATIC', 'IMAGE', 'VIDEO', 'LAUNCH-KIT', 'LOCALIZE'].includes(mode)) {
    required.add('creative');
  }
  if (['STATIC', 'IMAGE', 'VIDEO', 'LAUNCH-KIT', 'LOCALIZE'].includes(mode)) {
    required.add('accessibility');
  }
  if (mode === 'LOCALIZE' || context.multipleMarkets) required.add('localization');
  if (context.highRiskClaims || context.legalEvidence) required.add('compliance');
  if (mode === 'MEASURE') required.add('measurement');
  return [...required];
}
