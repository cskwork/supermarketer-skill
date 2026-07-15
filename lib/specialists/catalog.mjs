function specialist(name, sample, signals) {
  return Object.freeze({
    name,
    sample,
    signals: Object.freeze(signals),
    reference: `vendor/marketingskills/skills/${name}/SKILL.md`,
  });
}

export const SPECIALISTS = Object.freeze([
  specialist('ab-testing', 'Design an A/B test and experiment backlog.', ['a/b test', 'ab test', 'split test', 'experiment backlog', '실험 설계']),
  specialist('ad-creative', 'Create paid social ad creative concepts and variants.', ['ad creative', 'creative variants', 'paid social creative', 'paid social ad', 'image concepts', '광고 소재']),
  specialist('ads', 'Plan paid search ads, audiences, budget, and bidding.', ['paid search', 'ad campaign', 'media buying', 'bidding strategy', '광고 집행']),
  specialist('ai-seo', 'Improve visibility in AI answers and LLM citations.', ['ai search', 'ai answers', 'llm citations', 'answer engine', 'generative engine optimization', 'geo strategy']),
  specialist('analytics', 'Analyze real conversion data and attribution results.', ['conversion data', 'attribution results', 'marketing analytics', 'tracking plan', 'ga4', '실제 전환 데이터']),
  specialist('aso', 'Optimize our App Store listing and mobile app keywords.', ['app store optimization', 'app store listing', 'mobile app keywords', 'aso']),
  specialist('churn-prevention', 'Build a cancellation save flow and churn prevention plan.', ['churn prevention', 'cancellation flow', 'cancel survey', 'retention save', 'win-back churn', '이탈 방지']),
  specialist('co-marketing', 'Design a co-marketing webinar with an integration partner.', ['co-marketing', 'integration partner', 'joint webinar', 'partner campaign', '공동 마케팅']),
  specialist('cold-email', 'Build a cold outbound email sequence for prospects.', ['cold email', 'cold outbound', 'outbound sequence', 'sales outreach email', '콜드 이메일']),
  specialist('community-marketing', 'Build and grow a customer community program.', ['community marketing', 'customer community', 'community program', '커뮤니티 마케팅']),
  specialist('competitor-profiling', 'Research one rival company deeply before a sales call.', ['rival company deeply', 'competitor profile', 'competitive intelligence dossier', 'specific competitor account', '경쟁사 프로파일']),
  specialist('competitors', 'Create a competitor comparison page and battlecard.', ['competitor comparison', 'comparison page', 'battlecard', 'versus page', 'alternative page', '경쟁 비교']),
  specialist('content-strategy', 'Plan content pillars, topics, and an editorial calendar.', ['content strategy', 'content pillars', 'editorial calendar', 'topic cluster', '콘텐츠 전략']),
  specialist('copy-editing', 'Edit and polish this existing copy without changing its message.', ['existing copy', 'edit and polish', 'copy editing', 'proofread', 'tighten this copy', '카피 교정']),
  specialist('copywriting', 'Write landing page copy from scratch.', ['write landing page copy', 'copy from scratch', 'copywriting', 'write the copy', 'sales copy', '카피 작성']),
  specialist('cro', 'Improve conversion rate on our landing page and forms.', ['conversion rate optimization', 'conversion rate on', 'landing page conversion', 'page conversion', 'form conversion', 'cro audit', '전환율 최적화']),
  specialist('customer-research', 'Interview customers to understand why they buy.', ['interview customers', 'customer interviews', 'voice of customer', 'customer research', 'why they buy', '고객 인터뷰']),
  specialist('directory-submissions', 'Submit our startup to relevant SaaS and AI directories.', ['directory submissions', 'startup directories', 'saas directories', 'ai directories', '디렉터리 등록']),
  specialist('emails', 'Design a lifecycle email welcome and nurture automation.', ['lifecycle email', 'welcome email', 'nurture automation', 'drip campaign', 'email sequence', '이메일 자동화']),
  specialist('free-tools', 'Build a free ROI calculator to attract leads and links.', ['free roi calculator', 'free tool', 'interactive calculator', 'lead generation tool', '무료 도구']),
  specialist('image', 'Generate a marketing hero image and product mockup.', ['marketing hero image', 'product mockup', 'generate an image', 'image generation', 'brand image', '마케팅 이미지']),
  specialist('launch', 'Plan our launch announcement and Product Hunt release.', ['launch announcement', 'product hunt', 'release strategy', 'beta launch', 'launch checklist', '출시 전략', '제품 출시']),
  specialist('lead-magnets', 'Create a downloadable checklist lead magnet for email capture.', ['lead magnet', 'downloadable checklist', 'gated content', 'content upgrade', 'email capture content', '리드 마그넷']),
  specialist('marketing-council', 'Ask a marketing council to debate this positioning choice.', ['marketing council', 'board of advisors', 'multiple expert perspectives', 'what would ogilvy', '마케팅 자문단']),
  specialist('marketing-ideas', 'Brainstorm practical marketing ideas to grow our SaaS.', ['marketing ideas', 'growth ideas', 'ways to promote', 'how to market', 'marketing brainstorm', '마케팅 아이디어']),
  specialist('marketing-loops', 'Set up a recurring weekly marketing review loop.', ['marketing loop', 'recurring marketing workflow', 'weekly marketing review', 'marketing on autopilot', 'always-on marketing', '반복 마케팅']),
  specialist('marketing-plan', 'Create a comprehensive 90-day AARRR marketing plan.', ['aarr r marketing plan', 'aarrr marketing plan', '90-day marketing plan', 'comprehensive marketing plan', 'marketing roadmap', '마케팅 계획']),
  specialist('marketing-psychology', 'Apply behavioral science and loss aversion to this funnel.', ['marketing psychology', 'behavioral science', 'loss aversion', 'cognitive bias', 'consumer behavior', '행동 과학']),
  specialist('offers', 'Build an irresistible offer with bonuses and a guarantee.', ['irresistible offer', 'bonus stack', 'guarantee', 'risk reversal', 'offer design', '오퍼 설계']),
  specialist('onboarding', 'Improve activation after signup and shorten time to value.', ['after signup', 'user activation', 'first-run experience', 'time to value', 'onboarding flow', '온보딩']),
  specialist('paywalls', 'Optimize the in-app paywall and trial upgrade screen.', ['in-app paywall', 'upgrade screen', 'feature gate', 'trial to paid', 'limit reached screen', '페이월']),
  specialist('popups', 'Optimize an exit-intent email capture popup.', ['exit-intent', 'email capture popup', 'popup conversion', 'slide-in', 'sticky bar', '팝업 최적화']),
  specialist('pricing', 'Choose SaaS pricing tiers and a value metric.', ['pricing tiers', 'value metric', 'willingness to pay', 'saas pricing', 'pricing strategy', '가격 전략']),
  specialist('product-marketing', 'Define our product positioning, ICP, and product marketing context.', ['product marketing context', 'product positioning', 'ideal customer profile', 'foundational product context', '제품 마케팅 맥락']),
  specialist('programmatic-seo', 'Generate location landing pages at scale from a dataset.', ['pages at scale', 'location landing pages', 'programmatic seo', 'template pages', 'data-driven pages', '대량 seo 페이지']),
  specialist('prospecting', 'Build a qualified prospect list of target accounts.', ['qualified prospect list', 'target account list', 'find prospects', 'prospecting', 'outbound list', '잠재고객 목록']),
  specialist('public-relations', 'Pitch journalists for earned media coverage.', ['pitch journalists', 'earned media', 'press coverage', 'media outreach', 'public relations', '언론 홍보']),
  specialist('referrals', 'Design a referral and affiliate program for customer growth.', ['referral program', 'affiliate program', 'refer a friend', 'ambassador program', 'word of mouth', '추천 프로그램']),
  specialist('revops', 'Set up lead scoring and the marketing-to-sales handoff.', ['lead scoring', 'marketing-to-sales handoff', 'revenue operations', 'mql', 'sql pipeline', 'revops']),
  specialist('sales-enablement', 'Create a sales one-pager, demo script, and objection guide.', ['sales one-pager', 'demo script', 'objection handling', 'sales collateral', 'sales enablement', '세일즈 자료']),
  specialist('schema', 'Add JSON-LD structured data for rich snippets.', ['json-ld', 'structured data', 'schema markup', 'rich snippets', 'schema.org', '구조화 데이터']),
  specialist('seo-audit', 'Audit crawl, indexing, and Core Web Vitals problems.', ['seo audit', 'crawl errors', 'indexing problems', 'core web vitals', 'technical seo', 'seo issues', 'seo 감사']),
  specialist('signup', 'Reduce registration dropoff in our account creation form.', ['registration dropoff', 'account creation', 'signup form', 'signup abandonment', 'registration friction', '가입 전환']),
  specialist('site-architecture', 'Plan our website hierarchy, navigation, and internal links.', ['website hierarchy', 'site architecture', 'site structure', 'internal linking', 'navigation design', '사이트 구조']),
  specialist('sms', 'Plan an SMS welcome and abandoned-cart automation.', ['sms welcome', 'sms marketing', 'text message campaign', 'abandoned-cart text', 'mms campaign', '문자 마케팅']),
  specialist('social', 'Create a LinkedIn content calendar and social posts.', ['linkedin content', 'social media', 'content calendar', 'social posts', 'twitter thread', '소셜 미디어']),
  specialist('video', 'Produce an AI product demo video and editing workflow.', ['product demo video', 'ai video', 'video production', 'video generation', 'explainer video', '영상 제작']),
]);

export const SPECIALIST_NAMES = Object.freeze(SPECIALISTS.map((entry) => entry.name));

export const SPECIALIST_BY_NAME = Object.freeze(Object.fromEntries(
  SPECIALISTS.map((entry) => [entry.name, entry]),
));
