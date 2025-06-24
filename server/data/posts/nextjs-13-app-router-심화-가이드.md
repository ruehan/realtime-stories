---
title: Next.js 13 App Router 심화 가이드
slug: nextjs-13-app-router-심화-가이드
excerpt: Next.js 13의 새로운 App Router를 활용한 고성능 웹 애플리케이션 개발법을 배워보세요.
keywords:
  - Next.js
  - App Router
  - React
  - SSR
  - Server Components
category: Frontend
tags:
  - Next.js
  - React
  - App Router
  - SSR
authorId: author_3
authorName: Next.js Expert
status: published
featured: true
allowComments: true
createdAt: '2025-06-12T15:43:07.181Z'
updatedAt: '2025-06-12T15:43:07.181Z'
readingTime: 2
thumbnail: /images/nextjs-app-router.jpg
metaDescription: Next.js 13 App Router를 활용한 풀스택 개발 가이드
difficulty: intermediate
primaryLanguage: javascript
publishedAt: '2025-06-12T15:43:07.181Z'
---
# Next.js 13 App Router 심화 가이드

Next.js 13에서 도입된 App Router는 React Server Components를 기반으로 한 새로운 라우팅 시스템입니다.

## App Router vs Pages Router

### 기존 Pages Router
```javascript
// pages/blog/[slug].js
export default function BlogPost({ post }) {
  return <article>{post.content}</article>;
}

export async function getStaticProps({ params }) {
  const post = await fetchPost(params.slug);
  return { props: { post } };
}
```

### 새로운 App Router
```javascript
// app/blog/[slug]/page.js
export default async function BlogPost({ params }) {
  const post = await fetchPost(params.slug);
  return <article>{post.content}</article>;
}
```

## Server Components의 장점

1. **Zero Bundle Size**: 서버에서만 실행되어 클라이언트 번들 크기 감소
2. **Direct Database Access**: 서버에서 직접 데이터베이스 접근 가능
3. **Improved Performance**: 초기 로딩 성능 향상

## Streaming과 Suspense

```javascript
import { Suspense } from 'react';

export default function Layout({ children }) {
  return (
    <div>
      <Header />
      <Suspense fallback={<Loading />}>
        {children}
      </Suspense>
      <Footer />
    </div>
  );
}
```

## 새로운 파일 규칙

- `page.js`: 페이지 컴포넌트
- `layout.js`: 레이아웃 컴포넌트
- `loading.js`: 로딩 UI
- `error.js`: 에러 UI
- `not-found.js`: 404 페이지

## 메타데이터 API

```javascript
export const metadata = {
  title: 'My Blog Post',
  description: 'An amazing blog post',
  openGraph: {
    images: ['/og-image.jpg'],
  },
};
```

## 마이그레이션 가이드

기존 Pages Router에서 App Router로 점진적으로 마이그레이션하는 방법을 소개합니다.
