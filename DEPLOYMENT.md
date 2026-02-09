# 숨이(Sumi) 배포 및 GSC 체크리스트

## 성공 기준 (Definition of Done)

- [ ] `https://<domain>/` 랜딩 페이지 배포 후 접속 가능
- [ ] `https://<domain>/journal` 목록, `https://<domain>/journal/<slug>` 상세 동작
- [ ] `sitemap.xml` / `sitemap-index.xml` 자동 생성 및 제공, GSC 제출 가능
- [ ] `robots.txt` 제공
- [ ] 각 상세 페이지에 `title`, `description`, `canonical`, `og:*` 포함
- [ ] Google Search Console URL 검사 시 “인덱싱 가능” 확인
- [ ] 최소 10개 Growth Artifact 글이 게시되고 내부 링크(관련 글 3개) 연결
- [ ] (선택) GA4 또는 PostHog 중 1개 이상으로 페이지뷰/유입 추적

---

## Cloudflare Pages 배포

### 1. 저장소 연결

- Cloudflare Dashboard → Pages → Create project → Connect to Git
- 저장소 선택 후 권한 허용

### 2. 빌드 설정

| 항목 | 값 |
|------|-----|
| Build command | `npm run build` **만** 사용 |
| Build output directory | `dist` |
| Root directory | (비워 둠) |

**Deploy command가 필수인 경우:** `npx wrangler deploy` 사용.  
`wrangler.toml`에 `main = "worker/index.ts"` 와 `assets.directory = "./dist"` 가 있으면, 빌드된 정적 사이트 + `/api/interest` Worker가 함께 배포됩니다. **유료 의사 확인 API를 쓰려면 아래 D1 설정을 먼저 완료하세요.**

### 3. 유료 의사 확인 API (D1) — 선택

`/interest` 폼 제출을 저장하려면 **shared-db**에 테이블을 만들고 `wrangler.toml`에 DB ID를 넣습니다. (테이블명은 서비스 약자 prefix `su` → `su_interest_leads`)

1. **D1: shared-db 사용**
   - 계정의 D1 목록에서 shared-db의 **UUID** 확인: `npx wrangler d1 list`
   - `wrangler.toml`의 `database_id`를 위 UUID로 설정합니다. (placeholder 그대로 두면 `Invalid uuid` 오류 발생)
   - 새 DB를 만들 필요 없음.

2. **D1 마이그레이션 (su_interest_leads 테이블 생성)**
   ```bash
   npx wrangler d1 execute shared-db --remote --file=./migrations/0001_interest_leads.sql
   ```
   (로컬 개발 시 `--remote` 대신 `--local` 사용)

3. **배포**
   ```bash
   npm run build && npx wrangler deploy
   ```

4. **Discord 알림 (선택)**  
   신청이 올 때마다 Discord로 알림을 받으려면 웹훅 URL을 시크릿으로 등록합니다.  
   Discord: 채널 설정 → 연동 → 웹후크 → 새 웹후크 만들기 → URL 복사 후:
   ```bash
   npx wrangler secret put DISCORD_WEBHOOK_URL
   ```
   입력 프롬프트에 웹훅 URL 붙여넣기. 미설정 시 알림만 안 가고 제출·저장은 그대로 동작합니다.

D1을 설정하지 않으면 `/api/interest` 호출 시 500 등 오류가 날 수 있습니다. 정적 사이트만 배포하려면 `wrangler.toml`에서 `main`과 `[[d1_databases]]`를 주석 처리한 뒤 배포하면 됩니다.  
**테이블 규칙:** shared-db에는 서비스명 약자 2글자 prefix를 붙입니다. 숨이(Sumi) → `su_interest_leads`.

### 4. 환경 변수

| 이름 | 값 | 비고 |
|------|-----|------|
| `SITE_URL` | `https://<실제 도메인>` | canonical, sitemap, robots.txt에 사용 |
| (선택) `NODE_VERSION` | `20` | 필요 시 |

### 5. 배포 후 확인

- 퍼블릭 URL로 `/`, `/interest`, `/journal`, `/journal/<slug>`, `/about` 접속
- `https://<domain>/robots.txt` → Sitemap URL이 `SITE_URL` 기준으로 나오는지 확인
- `https://<domain>/sitemap-index.xml` 접근 가능 여부 확인

### 6. 커스텀 도메인

- Pages 프로젝트 → Custom domains → Add
- Cloudflare DNS에서 CNAME 또는 A/AAAA 설정
- HTTPS 자동 적용 확인

---

## Google Search Console (GSC)

### 1. 속성 등록

- **도메인 속성** 권장: `https://<domain>` 전체 소유권
- **URL 접두어**만 사용할 경우: `https://<domain>` 입력 후 소유권 검증

### 2. 소유권 검증

- **DNS TXT:** GSC가 제시한 TXT 레코드를 Cloudflare DNS에 추가
- 전파 후 GSC에서 “확인” 클릭

### 3. Sitemap 제출

- GSC → Sitemaps
- 새 sitemap 추가: `https://<domain>/sitemap-index.xml` (또는 `sitemap-0.xml` 등 실제 사용 URL)
- 처리 상태 “성공” 확인

### 4. URL 검사

- URL 검사 도구에서 아래 주소 검사 후 “인덱싱 요청”:
  - `https://<domain>/`
  - `https://<domain>/journal`
  - `https://<domain>/journal/well-rest-needs-no-explanation` (샘플 1개)
- “URL이 Google에 등록됨” / “인덱싱 가능” 상태 확인

### 5. 메타/SEO 점검

- 각 상세 페이지에서:
  - `<title>… | 숨이</title>`
  - `<meta name="description" …>`
  - `<link rel="canonical" …>`
  - `og:title`, `og:description`, `og:url`, `og:type`, `og:image`
- Lighthouse 또는 브라우저 개발자 도구로 확인

---

## 분석 (선택)

- **GA4:** Cloudflare Pages 환경 변수에 Measurement ID 주입 후 레이아웃에 스크립트 추가
- **PostHog:** minimal snippet + `page_view` 이벤트
- 최소 이벤트: `page_view`, `cta_click` (about, journal_list, contact 등)

---

## 리스크/주의사항 (sumi.plan.md 반영)

- “키 커짐/통증 치료/교정” 등 **결과 보장 문구 사용 금지** (법/신뢰 리스크)
- 개인정보 수집(문의 폼) 시 **privacy 페이지 필수**
- 이미지 사용 시 **저작권/라이선스** 준수
