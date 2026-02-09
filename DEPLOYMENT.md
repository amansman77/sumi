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

**Deploy command가 필수인 경우:** `npx wrangler deploy` 로 두고, 프로젝트 루트의 `wrangler.toml`에서 `assets.directory = "./dist"` 가 설정되어 있는지 확인하세요. (이 설정이 있으면 빌드된 `dist`만 정적 에셋으로 배포됩니다.)

### 3. 환경 변수

| 이름 | 값 | 비고 |
|------|-----|------|
| `SITE_URL` | `https://<실제 도메인>` | canonical, sitemap, robots.txt에 사용 |
| (선택) `NODE_VERSION` | `20` | 필요 시 |

### 4. 배포 후 확인

- 퍼블릭 URL로 `/`, `/journal`, `/journal/<slug>`, `/about` 접속
- `https://<domain>/robots.txt` → Sitemap URL이 `SITE_URL` 기준으로 나오는지 확인
- `https://<domain>/sitemap-index.xml` 접근 가능 여부 확인

### 5. 커스텀 도메인

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
