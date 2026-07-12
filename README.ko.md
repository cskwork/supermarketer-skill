# SuperMarketer Skill

SuperMarketer는 제품 마케팅 조사, 포지셔닝, 캠페인, 카피, 포스터·정적 크리에이티브, 이미지, 영상, 현지화, 실험, 감사, 출시 패키징, 성과 분석을 하나의 검증 가능한 흐름으로 처리하는 **실행 가능한 스킬 패키지**입니다.

얇은 에이전트 라우터와 무의존성 Node.js CLI, 실행별 vault, 구조화된 근거·주장·채널·자산 기록, 결정론적 게이트, 독립 검수, 미디어 검사, 명시적 fallback, 무결성 인증, ZIP 패키징, 게시 승인 범위 검사, 실제 성과 검증을 결합했습니다.

## 구현 범위

- 12개 한·영 모드: `RESEARCH`, `POSITION`, `CAMPAIGN`, `COPY`, `STATIC`, `IMAGE`, `VIDEO`, `LAUNCH-KIT`, `EXPERIMENT`, `LOCALIZE`, `AUDIT`, `MEASURE`.
- 프로젝트 초기화와 하나의 마케팅 목적당 하나의 독립 실행 vault.
- 근거, 주장, 채널 규격, 납품물, 자산, 검수, 승인, 제작 패키지, 실행 상태, 측정 정보를 위한 YAML/JSON source of truth.
- 안정적인 오류 코드와 실패 종료 코드를 제공하는 12개 통합 launch-readiness 게이트.
- 근거–주장–자산–납품물, 권리, 접근성, 생성 이력, 검수자 연결 검사.
- 절대 경로, `..` 경로 탈출, governed-file 심볼릭 링크, realpath 우회 차단.
- PNG, JPEG, GIF, WebP, SVG, PDF, 영상 메타데이터 검사. 렌더 영상 검증은 `ffprobe` 사용.
- 파일 존재, SHA-256, 용량, 형식, 크기, 비율, 길이, 카피 제한, 자막, alt text, 권리, lineage, 제작자–검수자 분리 검사.
- 정직한 `ART_DIRECTION_ONLY`, `PRODUCTION_PACK_ONLY` fallback. 정적 소재는 비렌더 fallback 금지.
- 최종 게이트 보고서와 인증 당시 파일 집합을 연결하는 트랜잭션형 `Z-READY.md` 인증.
- 인증 후 파일 변경·삭제·심볼릭 링크 교체뿐 아니라 검토되지 않은 새 파일 추가도 차단.
- 외부 런타임 라이브러리 없이 ZIP, package manifest, checksum sidecar 생성.
- 실제 외부 동작을 하지 않고 정확한 인간 승인 범위만 검증하는 `publish-check`.
- 실제 post-launch 데이터, 사전 선언 규칙, 계산 근거 해시, 독립 측정 검수를 요구하는 `validate-results`.
- 원본·규칙·계산·상태·마커 일관성을 재검사하는 `Z-VALIDATED.md` 및 `verify-results`.
- 정상 흐름과 공격적 실패를 포함한 자동 계약 테스트 37개.

## 요구 사항

- Node.js 20 이상.
- npm runtime dependency 없음.
- 선택 시스템 도구:
  - 렌더 영상 검증: `ffprobe`
  - PDF 페이지 메타데이터: `pdfinfo`
  - 호스트 어댑터 제작: `ffmpeg`, ImageMagick

```bash
node bin/supermarketer.mjs doctor
```

## 설치

하나의 canonical checkout을 유지하고 직접 실행하거나 로컬 npm link를 만듭니다.

```bash
cd supermarketer-skill
npm link
supermarketer version
```

여러 에이전트 런타임의 링크·복사본 drift는 수정 없이 검사할 수 있습니다.

```bash
supermarketer install-audit . \
  ~/.agents/skills/supermarketer \
  ~/.codex/skills/supermarketer \
  ~/.claude/skills/supermarketer
```

## 기본 실행

```bash
# 1. 상시 제품·브랜드·법무 규칙과 실행 저장 공간 생성
supermarketer init ./my-project

# 2. 하나의 마케팅 목적을 독립 실행으로 생성
supermarketer new \
  "한국 시장용 출시 포스터와 15초 세로 제품 영상을 만든다" \
  --project ./my-project

# 3. 반환된 vault에서 brief, 근거, 주장, 채널 규격,
#    납품물, 자산 manifest, 독립 검수, QA를 완성

# 4. 실제 생성·렌더 파일 연결
supermarketer ingest <vault> --asset ASSET-001 --file poster.png --as rendered
supermarketer ingest <vault> --asset ASSET-002 --file video.mp4 --as rendered

# 5. 검증, 출시 준비 인증, 인증 재검사, 패키징
supermarketer check <vault>
supermarketer ready <vault>
supermarketer verify-ready <vault>
supermarketer package <vault> --out launch-delivery.zip
```

출시 전 정상 상태는 다음과 같습니다.

```text
Readiness: LAUNCH_READY
Performance: NOT_MEASURED
External action: NOT AUTHORIZED
```

## 출시 준비와 성과 분리

```text
Readiness: DRAFT | REVIEW_READY | LAUNCH_READY | BLOCKED
Performance: NOT_MEASURED | MEASURING | PERFORMANCE_VALIDATED
```

`LAUNCH_READY`는 해당 범위의 제품 사실, 주장, 채널, 자산, 권리, 검수, QA가 출시 전 기준을 통과했다는 뜻입니다. CTR, 전환, 매출, 브랜드 리프트를 증명하지 않습니다.

`PERFORMANCE_VALIDATED`는 다음을 추가로 요구합니다.

- 실제 post-launch 원본 파일과 SHA-256
- 측정 기간, 시간대, 지표 정의
- 측정 시작 전에 선언된 규칙 파일·해시·시각
- 수치 기준과 관측값
- 계산 방식과 해시된 계산 근거 파일
- 불확실성, 한계, 통과한 guardrail
- 서로 다른 분석자와 검수자
- 독립 측정 검수 통과
- 인과 표현을 사용할 경우 무작위 배정 근거

```bash
supermarketer validate-results <vault>
supermarketer verify-results <vault>
supermarketer status <vault>
```

핵심 엔진은 선언된 규칙과 입력의 무결성·추적성을 검증합니다. 모든 분석 공급자의 모든 KPI를 원본 export에서 자동 재계산하는 범용 분석기는 아닙니다. 계산 근거 파일과 독립 검수는 의도적으로 성과 증명 계약에 남아 있습니다.

## readiness 무결성 모델

`ready`는 비변경 preflight 후 최종 상태를 트랜잭션으로 동기화하고, 12개 게이트를 실행하여 `reports/gate-report.json`을 만든 뒤 SHA-256을 `Z-READY.md`에 기록합니다.

게이트 보고서에는 인증 당시 governed 파일 집합의 canonical integrity manifest도 포함됩니다. `verify-ready`, 패키징, 게시 permit, 성과 측정은 다음을 거부합니다.

- 게이트 보고서 변경·누락
- marker/report/run ID 불일치
- 인증된 파일 변경·삭제
- 승인된 post-launch 경로가 아닌 새 파일 추가
- 심볼릭 링크 교체와 realpath 탈출

post-launch 측정은 `MEASUREMENT.yaml`에 적힌 원본, 사전 규칙, 계산 근거 파일만 추가할 수 있습니다. 각 파일의 현재 해시가 측정 기록과 `Z-VALIDATED.md`에 계속 일치해야 합니다.

SHA-256은 로컬 파일 간 무결성 연결을 제공하지만 서명자 신원은 증명하지 않습니다. 공격자가 vault 전체를 수정할 수 있으면 해시도 다시 계산할 수 있습니다. 적대적 환경의 진위성·부인 방지가 필요하면 서명된 릴리스, 불변 저장소, 버전 관리 또는 외부 서명 서비스를 사용해야 합니다.

## 이미지·영상 도구와 어댑터

핵심 패키지는 특정 공급자에 종속되지 않습니다. 호스트의 이미지·디자인·영상 도구가 실제 파일을 만들고, SuperMarketer가 ingest, manifest, 생성 이력, 권리, 독립 검수, 메타데이터 게이트로 검증합니다.

- `STATIC`은 실제 렌더 파일 필수.
- `IMAGE`는 책임자가 명시적으로 수락한 `ART_DIRECTION_ONLY` 패키지만 fallback 허용.
- `VIDEO`는 완전한 `PRODUCTION_PACK_ONLY` 패키지를 명시적으로 수락한 경우만 fallback 허용.
- 도구 부재는 빈 파일, 가짜 경로, 거짓 렌더 상태를 허용하지 않음.
- 공급자 API key, 게시 credential, 고객 리스트는 포함하지 않음.

`adapters/README.md`와 `reference/tool-adapters.md`를 확인하십시오.

## 게시·발송·광고비 경계

CLI에는 실제 게시, 발송, 예약, 배포, 입찰 변경, 예산 집행 명령이 없습니다. `publish-check`는 특정 자산과 행동 범위를 정확히 포함하는 명시적·미만료 인간 승인만 검증합니다.

```bash
supermarketer publish-check <vault> --approval AP-001
```

성공하면 `reports/`에 로컬 permit 기록을 만들지만 플랫폼 호출은 하지 않습니다. 실제 publisher는 자체 인증, 권한, 재확인, rate limit, audit trail을 구현해야 합니다.

## 배포본 테스트

```bash
npm test
bash tests/run-all.sh
npm run check:skill
npm pack --dry-run --ignore-scripts
```

테스트 범위에는 정상 readiness, 근거 연결 실패, 오래된 채널 규격, 경로 탈출·심볼릭 링크 공격, 자기 검수, 가짜 미디어 fallback, 메타데이터 검사, readiness 보고서·인증 파일 변조, 인증 후 파일 주입, 반복 패키징, 명시적 게시 승인, CLI 동작, 실제 성과 검증, 성과 원본·규칙·계산 근거 변조가 포함됩니다.

## 주요 구조

```text
SKILL.md        얇은 라우터와 실행 계약
bin/, lib/      CLI, 라우팅, vault, 게이트, 미디어 검사, workflow
scripts/        개별 실행형 게이트 wrapper
agents/         전략·제작·독립 검수 역할
reference/      모드별·운영별 플레이북
adapters/       공급자 중립 미디어 handoff 계약
templates/      실행 vault와 제작 패키지 템플릿
schemas/        상호운용용 JSON Schema 문서
docs/           설치·CLI·구현·보안·스키마 문서
examples/       완성 실행 및 fallback 예제
tests/          실행 가능한 계약·공격 테스트
SPEC.md         전체 제품·운영 명세
```

MIT License. `LICENSE`와 `NOTICE.md`를 확인하십시오.
