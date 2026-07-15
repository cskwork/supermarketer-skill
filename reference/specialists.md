# Marketing specialist routing

Use this reference after the root router selects an execution `mode` and a domain `specialty`. The axes stay independent: for example, `AUDIT + pricing`, `COPY + emails`, and `MEASURE + ads` use different workflows over the same specialist knowledge.

## Load order

1. Load `.supermarketer/rules/RULES.md`, `.supermarketer/product/PRODUCT-TRUTH.md`, `.supermarketer/brand/BRAND.md`, and `.supermarketer/legal/CLAIM-RULES.md` when present.
2. Load the selected mode playbook from `reference/`.
3. Load `vendor/marketingskills/skills/<specialty>/SKILL.md`.
4. Load only the vendored references that playbook requires for the current objective.

Never create `.agents/product-marketing.md`. When a vendored playbook requests it, adapt that instruction to the canonical product and brand truth files above.

## Catalog

| Family | Specialists |
|---|---|
| Strategy and orchestration | `product-marketing`, `marketing-plan`, `marketing-ideas`, `marketing-council`, `marketing-loops`, `launch`, `revops`, `sales-enablement` |
| Research and competitive work | `customer-research`, `prospecting`, `competitors`, `competitor-profiling`, `marketing-psychology` |
| Copy, content, and channels | `copywriting`, `copy-editing`, `content-strategy`, `emails`, `cold-email`, `sms`, `social` |
| Paid and creative production | `ads`, `ad-creative`, `image`, `video` |
| Conversion and lifecycle | `cro`, `signup`, `onboarding`, `paywalls`, `popups`, `lead-magnets`, `churn-prevention` |
| Pricing and offer | `pricing`, `offers` |
| Search and discovery | `seo-audit`, `programmatic-seo`, `ai-seo`, `schema`, `site-architecture`, `aso`, `directory-submissions` |
| Earned, partner, and product-led growth | `public-relations`, `co-marketing`, `community-marketing`, `referrals`, `free-tools` |
| Analytics and experimentation | `analytics`, `ab-testing` |

## Neighbor boundaries and handoffs

- Use `copy-editing` for supplied copy that must be preserved and improved; use `copywriting` for net-new copy. Hand off to the relevant channel specialist for delivery constraints.
- Use `prospecting` to build and qualify a list, `competitor-profiling` for deep research on one company, `competitors` for comparisons and battlecards, then `cold-email` for outbound copy.
- Use `ads` for targeting, budget, bidding, and campaign operations; use `ad-creative` for paid creative concepts and variants; use `social` for organic content.
- Use `signup` before account creation, `onboarding` after signup, `paywalls` for in-product upgrades, `popups` for overlays, and `cro` for broader page/form conversion.
- Use `pricing` for tiers, packaging, value metrics, and price level; use `offers` for bonuses, guarantees, urgency, naming, and risk reversal.
- Use `seo-audit` for diagnosis, `programmatic-seo` for data-driven pages at scale, `schema` for structured data, `site-architecture` for hierarchy/internal links, `ai-seo` for answer-engine visibility, and `aso` for app stores.
- Use `marketing-plan` for a comprehensive roadmap, `launch` for a release moment, `marketing-loops` for recurring operation, and `marketing-council` for multiple advisory perspectives.
- Use `analytics` for real observed data and instrumentation; use `ab-testing` for experiment design. The execution mode remains `MEASURE` only when real outcome data exists.
- Use `public-relations` for earned media, `co-marketing` for joint partner programs, `referrals` for customer/affiliate advocacy, and `community-marketing` for owned communities.

Related specialists are handoffs, not permission to load every playbook. Load a second specialist only when its work is an explicit deliverable or a blocking dependency, and record the handoff in the run.

## Adaptation and evidence rules

- Treat vendored knowledge as a domain playbook, not product truth. Adapt examples to the current product, audience, market, brand, and evidence.
- The snapshot is fixed at upstream commit `130847d0945555c43b0b1774e2a4f99d35a32ebe`. Verify time-sensitive platform rules, prices, laws, channel specifications, benchmarks, and tool capabilities against current authoritative sources before using them.
- Upstream tool mentions are optional guidance. The package does not bundle their credentials or executable CLIs. Missing tools never justify invented research, fake renders, or false success.
- No specialist may publish, send, schedule, deploy, change bids, use customer lists, or spend. Follow the root approval and `publish-check` contract; the CLI still performs no external action.
