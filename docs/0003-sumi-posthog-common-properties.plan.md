# sumi-posthog-common-properties.plan.md
> 숨이(Sumi) 프로젝트에 PostHog 공통 속성(`service_id`, `environment`)을 도입한다.

## 0. 목적 (Why)

숨이(Sumi)에서 발생하는 PostHog 이벤트에 **공통 메타데이터**를 추가하여:

- 단단이(Dandani) 등 다른 서비스와 **이벤트를 명확히 구분**하고
- 운영 환경(local/staging/production)을 기준으로 **데이터를 안전하게 분리**하며
- 향후 UTM, 수요 검증, 채널 분석을 **일관된 기준**으로 확장 가능하게 한다.

> 본 계획은 **기능 확장 목적이 아니라 운영/분석 안정성 확보 목적**이다.

## 1. 범위 (Scope)

### In-scope
- PostHog 이벤트에 공통 속성 추가
- `service_id = "sumi"` 고정값 사용
- `environment` 속성 추가
- 기존 이벤트 스키마/의미 변경 없음

### Out-of-scope
- 이벤트 추가/삭제
- PostHog 프로젝트 분리
- GA4 / GSC 설정 변경
- first_utm_* 저장 로직 (별도 plan에서 다룸)

## 2. 공통 속성 정의 (Spec)

### 공통 속성 스키마
```ts
{
  service_id: 'sumi',
  environment: 'local' | 'staging' | 'production'
}
````

### 설계 원칙

1. **모든 sumi_* 이벤트에 항상 포함**
2. **이벤트 의미에는 영향 없음**
3. 분석 시 필터/분해 기준으로만 사용
4. 단단이와 **철학은 동일, 값만 다름**

## 3. 구현 구조 (권장)

### 3.1 공통 속성 헬퍼 함수

```ts
// src/lib/posthog/common.ts

import { getEnvironment } from './env';

export const getPostHogCommonProperties = () => {
  return {
    service_id: 'sumi',
    environment: getEnvironment(),
  };
};
```

> `getEnvironment()`는 기존 환경 구분 로직을 그대로 사용
> (예: `process.env.NODE_ENV` 기반)

## 4. 이벤트별 적용 계획

### 대상 이벤트 목록

* `sumi_interest_cta_click`
* `sumi_interest_submit`
* `sumi_interest_submit_success`
* `sumi_interest_submit_error`

### 적용 방식 (예시)

#### CTA 클릭 이벤트

```ts
posthog.capture('sumi_interest_cta_click', {
  ...getPostHogCommonProperties(),
  from_section: 'intro',
});
```

#### Submit 이벤트

```ts
posthog.capture('sumi_interest_submit', {
  ...getPostHogCommonProperties(),
  willing_to_pay,
  interest_parts,
});
```

#### Submit 성공

```ts
posthog.capture('sumi_interest_submit_success', {
  ...getPostHogCommonProperties(),
});
```

#### Submit 실패

```ts
posthog.capture('sumi_interest_submit_error', {
  ...getPostHogCommonProperties(),
});
```

## 5. 주의사항 (Guardrails)

1. **공통 속성은 덮어쓰기 대상이 아님**

   * 이벤트마다 새로 생성해서 spread
2. **event name 변경 금지**
3. **기존 props 제거 금지**
4. **분기/조건부 적용 금지**

   * 모든 이벤트에 항상 포함

## 6. 검증 시나리오 (PostHog UI)

### 6.1 Live Events 검증

1. 로컬/프로덕션에서 CTA 클릭
2. PostHog → Live Events 확인
3. 이벤트 속성에 아래 값 존재 확인:

   * `service_id = "sumi"`
   * `environment = production | local`

### 6.2 이벤트 필터 검증

* Insights → Events
* Filter:

  * `service_id = sumi`
* 기대 결과:

  * 숨이 이벤트만 노출됨

### 6.3 환경 분리 검증

* 동일 이벤트를 local / production에서 발생
* `environment` 값이 다르게 기록되어야 함

## 7. 완료 조건 (Definition of Done)

* [ ] 모든 `sumi_*` 이벤트에 `service_id: "sumi"` 포함
* [ ] 모든 이벤트에 `environment` 포함
* [ ] 기존 이벤트 분석/퍼널이 깨지지 않음
* [ ] Live Events / Insights에서 정상 확인
* [ ] 추가 이벤트/속성 없이 최소 변경으로 완료

## 8. 이후 확장 (본 plan에서는 미포함)

* `first_utm_*` Person 속성 저장
* Discord 알림 payload에 `service_id`, `environment` 포함
* 단단이/숨이 통합 대시보드 구성

> 위 항목은 별도 plan으로 관리한다.
