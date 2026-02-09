# 숨이 (Sumi)

> 잘 쉬는 몸을 만드는 시간

**숨이**는 치료나 교정을 목표로 하지 않습니다.  
일상 속에서 몸이 먼저 편해지는 순간,  
**이완과 쉼이 일어났던 시간들을 기록하는 공간**입니다.

이 저장소는  
숨이의 기록(Growth Artifact)을  
**검색 가능한 웹 자산**으로 축적하기 위한 정적 사이트 프로젝트입니다.

## 숨이는 무엇을 하는 서비스인가

- 숨이는 문제를 고치지 않습니다.
- 결과를 약속하지 않습니다.
- 대신, **몸이 스스로 쉬어가던 순간**을 남깁니다.

이 기록들은 다음과 같은 사람들에게 닿기를 의도합니다.

- 하루가 끝나도 다리가 쉬지 않는 **여성**
- 긴장된 몸으로 잠들기 어려운 **성장기 아이**
- 조심스러운 손이 필요한 **부모 세대**

숨이는  
설명보다 **상태**,  
정보보다 **기억**을 남깁니다.

## 이 프로젝트의 목적

이 프로젝트는 숨이의 기록을 다음과 같이 활용하기 위해 만들어졌습니다.

- 정적 페이지로 배포하여 **Google 검색에 인덱싱**
- 광고가 아닌 **기록 기반 유입(Growth Artifact)** 축적
- 장기적으로 신뢰가 쌓이는 **브랜드 자산** 형성

이를 위해 다음 기술적 선택을 합니다.

- **Astro SSG**: 콘텐츠 중심, 빠른 로딩, SEO 친화
- **Cloudflare Pages**: 비용 없이 안정적인 정적 배포
- **Markdown 기반 기록**: 설명보다 기록에 집중

## 요구사항

- Node.js 18+
- npm 또는 pnpm

## 로컬 실행

```bash
npm install
npm run dev
````

* 랜딩: [http://localhost:4321/](http://localhost:4321/)
* 기록 목록: [http://localhost:4321/journal](http://localhost:4321/journal)
* 기록 상세: [http://localhost:4321/journal/](http://localhost:4321/journal/)<slug>
* 소개: [http://localhost:4321/about](http://localhost:4321/about)

## 빌드

```bash
npm run build
```

출력 디렉터리: `dist/`

* CI/샌드박스에서 `EPERM` 등 권한 오류가 발생하면
  `ASTRO_TELEMETRY_DISABLED=1 npm run build` 로 실행할 수 있습니다.

## 환경 변수

| 변수         | 설명                                                   | 예시                         |
| ---------- | ---------------------------------------------------- | -------------------------- |
| `SITE_URL` | 배포된 사이트의 절대 URL (canonical, sitemap, robots.txt에 사용) | `https://sumi.example.com` |

로컬에서는 미설정 시 `https://sumi.example.com`이 사용됩니다.
Cloudflare Pages 배포 시 **Environment variables**에서 `SITE_URL`을 설정하세요.

## Cloudflare Pages 배포

1. **GitHub 연결**
   저장소를 Cloudflare Pages 프로젝트에 연결합니다.

2. **빌드 설정**

   * Build command: `npm run build`
   * Build output directory: `dist`
   * Root directory: (프로젝트 루트면 비워 둠)

3. **환경 변수**

   * `SITE_URL`: 실제 도메인 (예: `https://sumi.yourdomain.com`)

4. **커스텀 도메인**

   * Cloudflare DNS에서 도메인을 연결하고 HTTPS 사용

5. **404 / 리다이렉트**

   * 필요 시 Cloudflare Pages의 Redirects에서 설정

배포 후 퍼블릭 URL로 접속해 동작을 확인합니다.

## Google Search Console (GSC)

1. **도메인 속성**으로 등록 (권장)
2. **DNS TXT 검증**으로 소유권 확인
3. **Sitemap 제출**
   `https://<your-domain>/sitemap-index.xml`
4. **URL 검사**

   * `/`
   * `/journal`
   * `/journal/<slug>`

각 URL이 “인덱싱 가능” 상태인지 확인합니다.

자세한 체크리스트는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참고하세요.

## 프로젝트 구조

```
sumi/
├── src/
│   ├── content/
│   │   └── journal/        # 숨이 기록 (Growth Artifact)
│   ├── layouts/
│   │   └── Layout.astro   # 공통 레이아웃 + 네비 + SEO meta
│   └── pages/
│       ├── index.astro        # 랜딩
│       ├── about.astro        # 숨이 소개
│       ├── journal/
│       │   ├── index.astro    # 기록 목록
│       │   └── [slug].astro   # 기록 상세
│       └── robots.txt.ts      # 동적 robots.txt
├── public/
├── astro.config.mjs
├── sumi.plan.md              # 개발 계획서 (AI Agent용)
└── DEPLOYMENT.md
```

## 기록 추가 방법

`src/content/journal/` 아래에 마크다운 파일을 추가합니다.

```yaml
---
title: "글 제목"
description: "한 줄 설명"
date: "2026-02-10"
category: "women"   # women | kids | parents
tags: ["태그1", "태그2"]
slug: "url-slug"
draft: false
---
```

* `draft: true`인 글은 목록, 상세, sitemap에 포함되지 않습니다.
* slug는 kebab-case 권장
  (예: `well-rest-needs-no-explanation`)

## 라이선스

MIT License.
자세한 내용은 [LICENSE](./LICENSE)를 참고하세요.
