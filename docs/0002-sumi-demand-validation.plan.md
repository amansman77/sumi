# sumi-demand-validation.plan.md
> 숨이(Sumi) 랜딩에 “유료 의사 확인” 창구를 추가하여 수요를 검증한다.

## 0. 목표 / 성공 기준

### 목표
- 종아리/발 마사지에 대해 **돈을 낼 의사가 있는 사용자**가 존재하는지 빠르게 확인한다.
- “예약/결제”가 아니라 **의사 확인(interest capture)** 단계로 설계한다.

### 성공 기준 (초기 가설)
- 14일 동안
  - 랜딩 방문 100+
  - 의사 남김(Submit) 5+
  - 그 중 “유료 의사 있음” 3+  
- (추후 조정 가능) 유입이 작으면 기준은 비율로 평가: Submit/Visit 3~5% 이상이면 긍정 신호

## 1. 핵심 사용자 흐름 (User Flow)

1) 사용자가 랜딩(`/`)에 진입한다  
2) “이 마사지, 받아보고 싶으신가요?” CTA를 본다  
3) CTA 클릭 → `/interest` (또는 모달)  
4) 간단 폼 제출
   - (선택) 연락처
   - 마사지 관심(종아리/발)
   - “유료로 받아볼 의사” 체크
5) 제출 완료 후 감사 메시지 + 기록 보기 링크 제공

## 2. 변경 범위 (최소 변경 원칙)

### 랜딩(/) 변경
- 기존 메시지의 결을 유지하면서 **주체(마사지 제공)**를 1줄 추가
- CTA 버튼 1개 추가 (기존 “기록 보기” 유지)

### 신규 페이지 추가
- `/interest` : 유료 의사 확인 폼 페이지 (SSG/CSR 혼합 가능)
- 제출 완료 상태 UI 포함

## 3. 카피/문구 (UI Copy Spec)

### Hero (기존 문구에 1줄 추가)
- Title: `잘 쉬는 몸을 만드는 시간`
- Subtitle (제안):
  - `숨이는 일상 속 이완과 쉼을 기록합니다.`
  - `종아리와 발 마사지를 통해, 몸이 풀리는 순간도 만들어보고 있습니다.`

### CTA 버튼
- Primary CTA: `이 마사지, 받아보고 싶으신가요?`
- Helper text (버튼 아래 작은 문구):
  - `예약/결제가 아닙니다. 유료로 받아볼 의사가 있는지만 남겨주세요.`

### Interest Page
- Title: `유료로 받아볼 의사가 있으신가요?`
- Description:
  - `지금은 수요를 확인하는 단계입니다. 부담 없이 선택해 주세요.`

### Submit 완료 메시지
- `남겨주셔서 감사합니다. 확인 후 필요할 때만 연락드릴게요.`
- Link: `기록 보기`

## 4. 폼 스펙 (Form Spec)

### 필드 (최소)
- `name` (optional) : string (max 50)
- `contact` (optional) : string (max 100)  
  - 안내 문구: `연락처는 선택입니다. 남기면 필요할 때만 연락드릴게요.`
- `interest_parts` (required) : multi-select enum
  - `CALF` (종아리)
  - `FOOT` (발바닥/발)
- `willing_to_pay` (required) : boolean
  - label: `유료로 받아볼 의사가 있다`
- `message` (optional) : string (max 500)
  - placeholder: `지금 몸 상태나 원하는 느낌을 간단히 적어주세요. (선택)`

### 제출 제약
- `interest_parts`는 최소 1개 선택
- `willing_to_pay`는 true/false 명시 선택(라디오 추천)

## 5. 데이터 모델 (Storage)

> 프로젝트가 Astro SSG 기반이므로, 저장 방식은 2가지 중 하나를 선택할 수 있다.  
> 본 계획서는 “서버리스 + KV/DB” 또는 “Google Form 대체” 모두 지원한다.

### Option A) 자체 저장 (추천)
- Table: `interest_leads`
  - `id` (uuid / nanoid)
  - `created_at` (timestamp)
  - `name` (nullable)
  - `contact` (nullable)
  - `interest_parts` (json array or csv string)
  - `willing_to_pay` (boolean)
  - `message` (nullable)
  - `utm_source` (nullable)
  - `utm_medium` (nullable)
  - `utm_campaign` (nullable)
  - `referrer` (nullable)
  - `page_path` (nullable)
  - `user_agent` (nullable)
  - `ip_hash` (nullable, 개인정보 최소화)
  - `consent_contact` (boolean, default false)  // “연락 받아도 괜찮아요”

### Option B) 외부 폼 (초초MVP)
- Google Form / Tally / Typeform 등 링크로 연결
- 단, 랜딩에서 이탈이 커질 수 있으니 A가 더 좋음

## 6. API 설계 (Option A 기준)

### POST `/api/interest`
- Request JSON:
  - `name?`
  - `contact?`
  - `interest_parts` (array)
  - `willing_to_pay` (boolean)
  - `message?`
  - `consent_contact` (boolean)
  - `utm_*?`, `referrer?`, `page_path?`
- Response:
  - `201 { id }`

### 보안/스팸
- rate limit: IP 기준 분당 5회
- honeypot field: `company` (폼에 숨김, 값 있으면 discard)
- 서버에서 length validation / enum validation 필수

## 7. Analytics / 이벤트 (PostHog/GA4 등)

### 이벤트 정의 (PostHog 권장)
- `sumi_landing_view` (자동 pageview로 대체 가능)
- `sumi_interest_cta_click`
  - props: `from_section` (hero/footer)
- `sumi_interest_submit`
  - props:
    - `willing_to_pay` (true/false)
    - `interest_parts` (array)
- `sumi_interest_submit_success`
- `sumi_interest_submit_error` (validation/network)

### 핵심 퍼널
- Landing View → CTA Click → Submit → Success
- Success 기준 전환율:
  - CTA 클릭률(CTR): 2~5% 이상이면 신호
  - Submit 성공률: 60%+ 목표 (폼이 너무 길면 낮아짐)

## 8. UI 구현 상세 (Astro 기준)

### 라우트
- `/` : 랜딩
- `/interest` : 폼 페이지

### 컴포넌트
- `components/InterestCTA.astro`
- `components/InterestForm.(astro|tsx)`
- `components/ToastOrInlineNotice`

### 구현 방식
- `/interest` 페이지는 SSR이 아니어도 됨
  - CSR로 `fetch('/api/interest')`
- 제출 후 상태:
  - 성공: 성공 패널 렌더 + 기록 링크
  - 실패: 에러 메시지 + 재시도

## 9. 개인정보/법적 주의 (간단 가드레일)

- 연락처는 **선택 입력**으로 둔다.
- “예약/의료/치료”로 오해될 표현은 피한다.
- 개인정보 안내 문구(짧게):
  - `남긴 정보는 연락 목적 외에는 사용하지 않습니다.`

## 10. 배포 / 롤아웃

1) 기능 브랜치 생성: `feat/interest-capture`
2) 로컬 테스트
3) 스팸/Validation 테스트 (빈값, 과다 길이, honeypot)
4) 프로덕션 배포
5) 14일 측정
6) 결과에 따라 다음 단계 결정:
   - 유료 의사 충분 → 가격/세션 구조/장소(또는 출장) 실험
   - 미미 → 카피/CTA 위치/A-B 테스트 또는 타겟 세그먼트 수정

## 11. A/B 테스트 후보 (옵션)

- CTA 문구 2안:
  - A: `이 마사지, 받아보고 싶으신가요?`
  - B: `종아리·발 마사지, 유료로 받아볼 의사만 알려주세요`
- CTA 위치:
  - hero 아래 vs 페이지 하단(“저널에서 모두 보기” 근처)

## 12. TODO 체크리스트 (Agent 실행용)

- [ ] 랜딩 카피 1줄 추가
- [ ] CTA 버튼 + helper text 추가
- [ ] `/interest` 페이지 생성
- [ ] 폼 UI 구현 + validation
- [ ] `/api/interest` 구현(저장소 포함)
- [ ] rate limit + honeypot 적용
- [ ] PostHog 이벤트 삽입
- [ ] 성공/실패 UI 처리
- [ ] 배포 후 퍼널 대시보드 생성
