# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # 개발 서버 시작 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 실행
```

## Firebase 설정 (처음 시작 시)

1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트 생성
2. Authentication → Google 로그인 활성화
3. Firestore Database 생성 (production mode)
4. 프로젝트 설정 → 웹 앱 추가 → SDK 구성값을 `.env.local`에 입력

## Architecture

**Tech stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Firebase (Auth + Firestore)

### Firebase 초기화 패턴

`lib/firebase.ts`는 `firebaseAuth()` / `firebaseDb()` getter 함수를 내보낸다. 직접 인스턴스를 내보내지 않는 이유: SSR 시 빈 API 키로 초기화가 실패하기 때문. 모든 Firebase 사용 코드는 클라이언트 컴포넌트(`'use client'`) 또는 서버사이드 API Route 내에서만 이 getter를 호출해야 한다.

### 데이터 흐름

```
AuthContext (contexts/AuthContext.tsx)
  └─ useAuth() hook으로 전역 소비
       └─ AuthGuard → 비로그인 시 / 리다이렉트

Firestore 구조:
  users/{uid}/notes/{noteId}
  users/{uid}/categories/{catId}

실시간 구독: subscribeNotes / subscribeCategories (onSnapshot)
자동저장: NoteEditor에서 debounce 1초
```

### OG 링크 미리보기

- 클라이언트: `LinkPreviewButton` → `/api/og?url=...` 호출
- 서버: `app/api/og/route.ts`에서 `open-graph-scraper`로 메타데이터 fetch (CORS 우회 목적)
- 결과는 `note.ogCards[]` 배열에 저장

### 페이지 구조

| 경로 | 역할 |
|------|------|
| `/` | 로그인 (비로그인) / `/notes` 리다이렉트 (로그인) |
| `/notes` | 카테고리 사이드바 + 메모 목록 |
| `/notes/[id]` | 마크다운 에디터 + OG 카드 |
| `/api/og` | OG 메타데이터 fetch API |

## 배포 (Vercel)

1. GitHub에 푸시
2. Vercel에서 레포 연결
3. Project Settings → Environment Variables에 `.env.local`의 모든 값 추가
