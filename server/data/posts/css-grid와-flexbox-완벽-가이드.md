---
title: CSS Grid와 Flexbox 완벽 가이드
slug: css-grid와-flexbox-완벽-가이드
excerpt: 현대 웹 레이아웃의 핵심인 CSS Grid와 Flexbox를 실무 예제와 함께 마스터해보세요.
keywords:
  - CSS
  - Grid
  - Flexbox
  - 레이아웃
  - 반응형
category: Frontend
tags:
  - CSS
  - Grid
  - Flexbox
  - 레이아웃
authorId: author_2
authorName: CSS Master
status: published
featured: false
allowComments: true
createdAt: '2025-06-12T15:43:07.173Z'
updatedAt: '2025-06-12T15:43:07.173Z'
readingTime: 1
thumbnail: /images/css-grid-flexbox.jpg
metaDescription: CSS Grid와 Flexbox를 활용한 반응형 웹 레이아웃 가이드
difficulty: beginner
primaryLanguage: css
publishedAt: '2025-06-12T15:43:07.173Z'
---
# CSS Grid와 Flexbox 완벽 가이드

현대 웹 개발에서 레이아웃을 구성하는 두 가지 핵심 기술을 깊이 있게 살펴보겠습니다.

## Flexbox 기초

### 1. 컨테이너 속성
```css
.flex-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}
```

### 2. 아이템 속성
```css
.flex-item {
  flex: 1 1 auto;
  align-self: stretch;
}
```

## CSS Grid 마스터하기

### 그리드 템플릿 정의
```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-template-rows: auto 1fr auto;
  gap: 2rem;
}
```

### 그리드 영역 배치
```css
.header { grid-area: 1 / 1 / 2 / -1; }
.sidebar { grid-area: 2 / 1 / 3 / 2; }
.main { grid-area: 2 / 2 / 3 / -1; }
.footer { grid-area: 3 / 1 / 4 / -1; }
```

## 실무 팁

1. **언제 Flexbox를 사용할까?**
   - 1차원 레이아웃 (행 또는 열)
   - 컴포넌트 내부 정렬
   - 동적 크기 조절

2. **언제 Grid를 사용할까?**
   - 2차원 레이아웃 (행과 열)
   - 페이지 전체 구조
   - 복잡한 레이아웃 패턴

## 브라우저 호환성

모든 모던 브라우저에서 완벽하게 지원되며, IE11에서도 부분적으로 사용 가능합니다.
