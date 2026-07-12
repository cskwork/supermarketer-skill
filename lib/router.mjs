import { MODE_PRIMARY_OUTPUT, MODE_REFERENCE, MODES } from './constants.mjs';

const SIGNALS = Object.freeze({
  MEASURE: [
    /\b(?:ctr|cvr|cac|roas|lift|attribution|campaign results?|performance analysis|analy[sz]e results?|post[- ]launch data)\b/i,
    /성과\s*(?:분석|측정)|전환율|클릭률|광고\s*결과|캠페인\s*결과|매출\s*기여/i,
  ],
  AUDIT: [
    /\b(?:audit|critique|review|compliance check|brand check|claims check)\b/i,
    /감사|검수|리뷰|비평|컴플라이언스\s*확인|브랜드\s*체크/i,
  ],
  LOCALIZE: [
    /\b(?:locali[sz]e|locali[sz]ation|transcreate|adapt (?:to|for) .+ market|translate designed asset)\b/i,
    /현지화|트랜스크리에이션|시장별\s*각색|디자인\s*번역/i,
  ],
  EXPERIMENT: [
    /\b(?:a\/?b test|split test|creative test|experiment|variants?|optimi[sz]e creative)\b/i,
    /A\/?B\s*테스트|실험|변형\s*테스트|소재\s*테스트|최적화\s*실험/i,
  ],
  'LAUNCH-KIT': [
    /\b(?:full launch kit|launch package|campaign pack|all materials|multi[- ]channel bundle|complete marketing package)\b/i,
    /전체\s*(?:런칭|마케팅)\s*(?:키트|패키지|자료)|멀티채널\s*패키지|모든\s*마케팅\s*자료/i,
  ],
  VIDEO: [
    /\b(?:video|reel|shorts?|ad film|commercial|storyboard|motion creative|demo video|tiktok)\b/i,
    /영상|릴스|쇼츠|광고\s*필름|스토리보드|모션\s*소재|데모\s*비디오/i,
  ],
  STATIC: [
    /\b(?:poster|banner|carousel|flyer|social creative|display ad|print ad|key visual layout)\b/i,
    /포스터|배너|캐러셀|전단|플라이어|정적\s*소재|소셜\s*크리에이티브/i,
  ],
  IMAGE: [
    /\b(?:product image|hero image|key visual|illustration|icon|photo edit|background removal|image generation)\b/i,
    /제품\s*이미지|키\s*비주얼|일러스트|아이콘|사진\s*편집|이미지\s*생성|배경\s*제거/i,
  ],
  COPY: [
    /\b(?:headline|ad copy|landing page copy|email copy|social copy|caption|tagline|script copy|copywriting|release note|launch announcement|social post|x post|twitter post|blog post|newsletter|product description|copy)\b/i,
    /카피|헤드라인|문구|이메일\s*본문|랜딩\s*페이지\s*문안|태그라인|캡션/i,
  ],
  CAMPAIGN: [
    /\b(?:campaign|gtm|go[- ]to[- ]market|launch plan|channel plan|content plan|demand generation)\b/i,
    /캠페인|GTM|고투마켓|출시\s*계획|채널\s*계획|콘텐츠\s*계획|수요\s*창출/i,
  ],
  POSITION: [
    /\b(?:positioning|message house|messaging|value proposition|differentiation|\bicp\b|\bjtbd\b)\b/i,
    /포지셔닝|메시지\s*하우스|가치\s*제안|차별화|핵심\s*고객|구매\s*과업/i,
  ],
  RESEARCH: [
    /\b(?:market research|customer research|audience research|competitor research|category analysis|demand research|trend research)\b/i,
    /시장\s*조사|고객\s*조사|타깃\s*조사|경쟁사\s*조사|카테고리\s*분석|수요\s*조사|트렌드\s*조사/i,
  ],
});

const ORDER = ['MEASURE', 'AUDIT', 'LOCALIZE', 'EXPERIMENT', 'LAUNCH-KIT', 'VIDEO', 'STATIC', 'IMAGE', 'COPY', 'CAMPAIGN', 'POSITION', 'RESEARCH'];

function assetClassCount(scores) {
  return ['VIDEO', 'STATIC', 'IMAGE', 'COPY'].filter((mode) => (scores[mode] ?? 0) > 0).length;
}

export function routeObjective(objective, override = null) {
  if (override) {
    const mode = String(override).toUpperCase();
    if (!MODES.includes(mode)) throw new Error(`Unknown mode: ${override}`);
    return {
      mode,
      confidence: 1,
      matched: ['explicit override'],
      reference: MODE_REFERENCE[mode],
      primary_output: MODE_PRIMARY_OUTPUT[mode],
      overridden: true,
    };
  }
  const text = String(objective ?? '').trim();
  if (!text) throw new Error('Objective is required.');
  const scores = {};
  const matched = {};
  for (const [mode, patterns] of Object.entries(SIGNALS)) {
    scores[mode] = 0;
    matched[mode] = [];
    for (const pattern of patterns) {
      const hit = text.match(pattern);
      if (hit) {
        scores[mode] += 1;
        matched[mode].push(hit[0]);
      }
    }
  }

  if (assetClassCount(scores) >= 2 || /(?:strategy|전략).*(?:poster|video|image|copy|포스터|영상|이미지|카피)/i.test(text)) {
    scores['LAUNCH-KIT'] += 3;
    matched['LAUNCH-KIT'].push('coordinated multi-asset request');
  }
  if (scores.AUDIT > 0 && /\b(?:fix|revise|rewrite|redesign|correct)\b|수정|개선|고쳐/i.test(text)) {
    const deliveryCandidates = ['VIDEO', 'STATIC', 'IMAGE', 'COPY', 'CAMPAIGN', 'POSITION'];
    const delivery = deliveryCandidates.find((mode) => scores[mode] > 0);
    if (delivery) scores[delivery] += 2;
  }
  if (scores.MEASURE > 0 && !/\b(?:actual|real|observed|results?|data)\b|실제|데이터|결과/i.test(text)) {
    scores.MEASURE -= 0.5;
    scores.EXPERIMENT += 0.5;
  }

  let selected = 'CAMPAIGN';
  let best = 0;
  for (const mode of ORDER) {
    const score = scores[mode] ?? 0;
    if (score > best) {
      selected = mode;
      best = score;
    }
  }
  const confidence = best <= 0 ? 0.35 : Math.min(0.98, 0.55 + best * 0.16);
  return {
    mode: selected,
    confidence,
    matched: matched[selected],
    reference: MODE_REFERENCE[selected],
    primary_output: MODE_PRIMARY_OUTPUT[selected],
    overridden: false,
    scores,
  };
}
