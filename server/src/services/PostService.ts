import fs from 'fs/promises';
import path from 'path';
import { Post, PostMetadata, PostContent, PostClassification, PostStats, IPost, ICreatePostInput, IUpdatePostInput } from '../schemas/Post';
import { MarkdownService } from './MarkdownService';

export class PostService {
  private static instance: PostService;
  private dataPath = path.join(__dirname, '../../data/posts.json');
  private posts: Map<string, IPost> = new Map();
  private initialized = false;
  private markdownService = MarkdownService.getInstance();

  private constructor() {}

  static getInstance(): PostService {
    if (!PostService.instance) {
      PostService.instance = new PostService();
    }
    return PostService.instance;
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private generateId(): string {
    return `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateReadingTime(markdown: string): number {
    // 평균 읽기 속도: 분당 200단어
    const wordsPerMinute = 200;
    const words = markdown.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.initialized = true; // 먼저 플래그를 설정하여 중복 초기화 방지

    try {
      await fs.access(this.dataPath);
      const data = await fs.readFile(this.dataPath, 'utf8');
      const postsData: IPost[] = JSON.parse(data);
      
      this.posts.clear();
      postsData.forEach(post => {
        this.posts.set(post.id, post);
      });

      console.log(`✅ Loaded ${this.posts.size} posts from storage`);
    } catch (error) {
      console.log('📝 No existing posts file found, creating sample posts...');
      // 초기 샘플 포스트 생성
      await this.createSamplePosts();
      console.log(`✅ Created ${this.posts.size} sample posts`);
    }
  }

  private async createSamplePosts(): Promise<void> {
    const samplePosts: ICreatePostInput[] = [
      {
        metadata: {
          title: 'React와 TypeScript로 실시간 블로그 만들기',
          excerpt: 'Colyseus를 활용한 실시간 기능을 가진 블로그 플랫폼 개발 경험을 공유합니다.',
          thumbnail: '/images/react-typescript-blog.jpg',
          metaDescription: 'React, TypeScript, Colyseus를 사용한 실시간 블로그 개발 가이드',
          keywords: ['React', 'TypeScript', 'Colyseus', '실시간', '블로그']
        },
        content: {
          markdown: `# React와 TypeScript로 실시간 블로그 만들기

이 포스트에서는 React와 TypeScript를 활용하여 실시간 기능을 가진 블로그를 만드는 과정을 설명합니다.

## 기술 스택
- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Colyseus, Node.js
- **실시간 통신**: WebSocket

## 주요 기능

### 1. 실시간 사용자 추적
\`\`\`typescript
const { users } = useLobbyState(lobbyRoom);
\`\`\`

### 2. 미니맵 시각화
SVG를 활용한 인터랙티브 미니맵으로 사용자들의 위치를 실시간으로 표시합니다.

## 결론
실시간 기능을 통해 더 인터랙티브한 블로그 경험을 제공할 수 있습니다.`
        },
        classification: {
          category: 'Frontend',
          tags: ['React', 'TypeScript', 'Colyseus', 'WebSocket'],
          difficulty: 'intermediate',
          primaryLanguage: 'typescript'
        },
        authorId: 'author_1',
        authorName: 'Developer',
        status: 'published',
        featured: true
      },
      {
        metadata: {
          title: 'Node.js 성능 최적화 가이드',
          excerpt: 'Node.js 애플리케이션의 성능을 향상시키는 다양한 기법들을 알아봅니다.',
          metaDescription: 'Node.js 성능 최적화를 위한 실무 가이드',
          keywords: ['Node.js', '성능최적화', 'Backend', 'JavaScript']
        },
        content: {
          markdown: `# Node.js 성능 최적화 가이드

Node.js 애플리케이션의 성능을 최적화하는 방법에 대해 알아보겠습니다.

## 1. 이벤트 루프 최적화

\`\`\`javascript
// 비효율적인 코드
function heavyComputation() {
  for (let i = 0; i < 1000000; i++) {
    // 무거운 연산
  }
}

// 최적화된 코드
function optimizedComputation() {
  return new Promise((resolve) => {
    setImmediate(() => {
      // 무거운 연산을 분할
      resolve();
    });
  });
}
\`\`\`

## 2. 메모리 관리
- 메모리 누수 방지
- 가비지 컬렉션 최적화

## 3. 캐싱 전략
Redis나 메모리 캐시를 활용한 성능 향상 방법을 설명합니다.`
        },
        classification: {
          category: 'Backend',
          tags: ['Node.js', '성능최적화', 'JavaScript'],
          difficulty: 'advanced',
          primaryLanguage: 'javascript'
        },
        authorId: 'author_1',
        authorName: 'Developer',
        status: 'published'
      },
      {
        metadata: {
          title: 'CSS Grid와 Flexbox 완벽 가이드',
          excerpt: '현대 웹 레이아웃의 핵심인 CSS Grid와 Flexbox를 실무 예제와 함께 마스터해보세요.',
          thumbnail: '/images/css-grid-flexbox.jpg',
          metaDescription: 'CSS Grid와 Flexbox를 활용한 반응형 웹 레이아웃 가이드',
          keywords: ['CSS', 'Grid', 'Flexbox', '레이아웃', '반응형']
        },
        content: {
          markdown: `# CSS Grid와 Flexbox 완벽 가이드

현대 웹 개발에서 레이아웃을 구성하는 두 가지 핵심 기술을 깊이 있게 살펴보겠습니다.

## Flexbox 기초

### 1. 컨테이너 속성
\`\`\`css
.flex-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}
\`\`\`

### 2. 아이템 속성
\`\`\`css
.flex-item {
  flex: 1 1 auto;
  align-self: stretch;
}
\`\`\`

## CSS Grid 마스터하기

### 그리드 템플릿 정의
\`\`\`css
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-template-rows: auto 1fr auto;
  gap: 2rem;
}
\`\`\`

### 그리드 영역 배치
\`\`\`css
.header { grid-area: 1 / 1 / 2 / -1; }
.sidebar { grid-area: 2 / 1 / 3 / 2; }
.main { grid-area: 2 / 2 / 3 / -1; }
.footer { grid-area: 3 / 1 / 4 / -1; }
\`\`\`

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

모든 모던 브라우저에서 완벽하게 지원되며, IE11에서도 부분적으로 사용 가능합니다.`
        },
        classification: {
          category: 'Frontend',
          tags: ['CSS', 'Grid', 'Flexbox', '레이아웃'],
          difficulty: 'beginner',
          primaryLanguage: 'css'
        },
        authorId: 'author_2',
        authorName: 'CSS Master',
        status: 'published',
        featured: false
      },
      {
        metadata: {
          title: 'Next.js 13 App Router 심화 가이드',
          excerpt: 'Next.js 13의 새로운 App Router를 활용한 고성능 웹 애플리케이션 개발법을 배워보세요.',
          thumbnail: '/images/nextjs-app-router.jpg',
          metaDescription: 'Next.js 13 App Router를 활용한 풀스택 개발 가이드',
          keywords: ['Next.js', 'App Router', 'React', 'SSR', 'Server Components']
        },
        content: {
          markdown: `# Next.js 13 App Router 심화 가이드

Next.js 13에서 도입된 App Router는 React Server Components를 기반으로 한 새로운 라우팅 시스템입니다.

## App Router vs Pages Router

### 기존 Pages Router
\`\`\`javascript
// pages/blog/[slug].js
export default function BlogPost({ post }) {
  return <article>{post.content}</article>;
}

export async function getStaticProps({ params }) {
  const post = await fetchPost(params.slug);
  return { props: { post } };
}
\`\`\`

### 새로운 App Router
\`\`\`javascript
// app/blog/[slug]/page.js
export default async function BlogPost({ params }) {
  const post = await fetchPost(params.slug);
  return <article>{post.content}</article>;
}
\`\`\`

## Server Components의 장점

1. **Zero Bundle Size**: 서버에서만 실행되어 클라이언트 번들 크기 감소
2. **Direct Database Access**: 서버에서 직접 데이터베이스 접근 가능
3. **Improved Performance**: 초기 로딩 성능 향상

## Streaming과 Suspense

\`\`\`javascript
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
\`\`\`

## 새로운 파일 규칙

- \`page.js\`: 페이지 컴포넌트
- \`layout.js\`: 레이아웃 컴포넌트
- \`loading.js\`: 로딩 UI
- \`error.js\`: 에러 UI
- \`not-found.js\`: 404 페이지

## 메타데이터 API

\`\`\`javascript
export const metadata = {
  title: 'My Blog Post',
  description: 'An amazing blog post',
  openGraph: {
    images: ['/og-image.jpg'],
  },
};
\`\`\`

## 마이그레이션 가이드

기존 Pages Router에서 App Router로 점진적으로 마이그레이션하는 방법을 소개합니다.`
        },
        classification: {
          category: 'Frontend',
          tags: ['Next.js', 'React', 'App Router', 'SSR'],
          difficulty: 'intermediate',
          primaryLanguage: 'javascript'
        },
        authorId: 'author_3',
        authorName: 'Next.js Expert',
        status: 'published',
        featured: true
      },
      {
        metadata: {
          title: 'Docker를 활용한 개발환경 구축',
          excerpt: 'Docker와 Docker Compose를 사용하여 일관된 개발환경을 구축하는 방법을 알아봅시다.',
          thumbnail: '/images/docker-dev-env.jpg',
          metaDescription: 'Docker로 구축하는 현대적 개발환경 가이드',
          keywords: ['Docker', 'DevOps', '컨테이너', '개발환경']
        },
        content: {
          markdown: `# Docker를 활용한 개발환경 구축

Docker를 사용하면 "내 컴퓨터에서는 잘 되는데"라는 문제를 해결할 수 있습니다.

## Docker 기초 개념

### 이미지와 컨테이너
- **이미지**: 애플리케이션과 의존성이 패키징된 템플릿
- **컨테이너**: 이미지의 실행 인스턴스

## Dockerfile 작성하기

\`\`\`dockerfile
# Node.js 애플리케이션 예제
FROM node:18-alpine

WORKDIR /app

# 의존성 복사 및 설치
COPY package*.json ./
RUN npm ci --only=production

# 소스 코드 복사
COPY . .

# 포트 노출
EXPOSE 3000

# 실행 명령
CMD ["npm", "start"]
\`\`\`

## Docker Compose로 멀티 서비스 구성

\`\`\`yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - db

  db:
    image: postgres:14
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
\`\`\`

## 최적화 팁

### 1. 멀티 스테이지 빌드
\`\`\`dockerfile
# 빌드 스테이지
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 실행 스테이지
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --only=production
CMD ["npm", "start"]
\`\`\`

### 2. .dockerignore 활용
\`\`\`
node_modules
.git
.gitignore
README.md
.env
.nyc_output
coverage
.cache
\`\`\`

## 개발 워크플로우

1. **로컬 개발**: \`docker-compose up -d\`
2. **테스트**: \`docker-compose exec app npm test\`
3. **프로덕션 빌드**: \`docker build -t myapp:prod .\`

Docker를 활용하면 팀원 모두가 동일한 환경에서 개발할 수 있습니다.`
        },
        classification: {
          category: 'DevOps',
          tags: ['Docker', 'DevOps', '컨테이너', '개발환경'],
          difficulty: 'intermediate',
          primaryLanguage: 'dockerfile'
        },
        authorId: 'author_4',
        authorName: 'DevOps Engineer',
        status: 'published',
        featured: false
      },
      {
        metadata: {
          title: 'JavaScript 비동기 프로그래밍 마스터하기',
          excerpt: 'Promise, async/await, 그리고 최신 비동기 패턴까지 JavaScript 비동기 프로그래밍의 모든 것.',
          thumbnail: '/images/js-async.jpg',
          metaDescription: 'JavaScript 비동기 프로그래밍 완벽 가이드',
          keywords: ['JavaScript', 'Promise', 'async', 'await', '비동기']
        },
        content: {
          markdown: `# JavaScript 비동기 프로그래밍 마스터하기

JavaScript의 싱글 스레드 특성과 비동기 처리의 핵심을 깊이 있게 알아보겠습니다.

## 콜백에서 Promise까지

### 콜백 헬의 문제
\`\`\`javascript
// 콜백 헬 예제
getData(function(a) {
  getMoreData(a, function(b) {
    getEvenMoreData(b, function(c) {
      // 지옥의 시작...
    });
  });
});
\`\`\`

### Promise로 해결
\`\`\`javascript
getData()
  .then(a => getMoreData(a))
  .then(b => getEvenMoreData(b))
  .then(c => {
    // 깔끔한 체이닝
  })
  .catch(error => console.error(error));
\`\`\`

## Async/Await의 우아함

\`\`\`javascript
async function fetchUserData(userId) {
  try {
    const user = await fetch(\`/api/users/\${userId}\`);
    const userData = await user.json();
    const posts = await fetch(\`/api/users/\${userId}/posts\`);
    const postsData = await posts.json();
    
    return { user: userData, posts: postsData };
  } catch (error) {
    console.error('데이터 페치 실패:', error);
    throw error;
  }
}
\`\`\`

## 병렬 처리 최적화

### Promise.all 활용
\`\`\`javascript
async function fetchAllData() {
  const [users, posts, comments] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/comments').then(r => r.json())
  ]);
  
  return { users, posts, comments };
}
\`\`\`

### Promise.allSettled로 에러 핸들링
\`\`\`javascript
async function fetchWithErrorHandling() {
  const results = await Promise.allSettled([
    fetch('/api/critical-data'),
    fetch('/api/optional-data'),
    fetch('/api/experimental-data')
  ]);
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(\`요청 \${index} 성공:, result.value\`);
    } else {
      console.log(\`요청 \${index} 실패:, result.reason\`);
    }
  });
}
\`\`\`

## 고급 패턴들

### 커스텀 Promise 생성
\`\`\`javascript
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function timeoutPromise(promise, ms) {
  return Promise.race([
    promise,
    delay(ms).then(() => Promise.reject(new Error('Timeout')))
  ]);
}
\`\`\`

### 재시도 로직
\`\`\`javascript
async function retryOperation(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(1000 * Math.pow(2, i)); // 지수 백오프
    }
  }
}
\`\`\`

## 이벤트 루프 이해하기

JavaScript 엔진의 이벤트 루프 동작 방식을 이해하면 비동기 코드의 실행 순서를 예측할 수 있습니다.

비동기 프로그래밍을 마스터하면 더 나은 사용자 경험을 제공할 수 있습니다.`
        },
        classification: {
          category: 'Frontend',
          tags: ['JavaScript', 'Promise', 'async', 'await'],
          difficulty: 'intermediate',
          primaryLanguage: 'javascript'
        },
        authorId: 'author_1',
        authorName: 'Developer',
        status: 'published',
        featured: false
      },
      {
        metadata: {
          title: '웹 성능 최적화 체크리스트',
          excerpt: '실제 프로젝트에서 적용할 수 있는 웹 성능 최적화 기법들을 단계별로 정리했습니다.',
          thumbnail: '/images/web-performance.jpg',
          metaDescription: '웹 성능 최적화를 위한 실무 체크리스트',
          keywords: ['성능최적화', '웹성능', 'Core Web Vitals', 'SEO']
        },
        content: {
          markdown: `# 웹 성능 최적화 체크리스트

사용자 경험과 SEO에 직결되는 웹 성능 최적화 기법들을 실무 관점에서 정리했습니다.

## Core Web Vitals 이해하기

Google이 정의한 핵심 웹 성능 지표들입니다:

### 1. LCP (Largest Contentful Paint)
- **목표**: 2.5초 이내
- **최적화 방법**:
  - 이미지 최적화
  - 서버 응답 시간 개선
  - 리소스 로딩 우선순위 조정

### 2. FID (First Input Delay)  
- **목표**: 100ms 이내
- **최적화 방법**:
  - JavaScript 실행 시간 단축
  - 메인 스레드 블로킹 최소화
  - 코드 분할

### 3. CLS (Cumulative Layout Shift)
- **목표**: 0.1 이내  
- **최적화 방법**:
  - 이미지/비디오 크기 명시
  - 동적 콘텐츠 삽입 최소화

## 이미지 최적화 전략

### 최신 포맷 사용
\`\`\`html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="설명" loading="lazy">
</picture>
\`\`\`

### 적응형 이미지
\`\`\`html
<img
  srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 480px) 100vw, (max-width: 800px) 50vw, 25vw"
  src="medium.jpg"
  alt="반응형 이미지"
>
\`\`\`

## JavaScript 최적화

### 코드 분할
\`\`\`javascript
// 동적 import를 사용한 코드 분할
const LazyComponent = lazy(() => import('./LazyComponent'));

// 라우트 기반 분할
const HomePage = lazy(() => import('./pages/Home'));
const AboutPage = lazy(() => import('./pages/About'));
\`\`\`

### Tree Shaking
\`\`\`javascript
// ❌ 전체 라이브러리 import
import _ from 'lodash';

// ✅ 필요한 함수만 import
import { debounce } from 'lodash';
\`\`\`

## CSS 최적화

### Critical CSS 인라인화
\`\`\`html
<style>
  /* Above-the-fold 스타일만 인라인 */
  .header { /* critical styles */ }
  .hero { /* critical styles */ }
</style>

<link rel="preload" href="non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
\`\`\`

### CSS 압축 및 정리
\`\`\`javascript
// PostCSS 설정
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('cssnano')({
      preset: 'default',
    }),
  ],
};
\`\`\`

## 리소스 힌트 활용

\`\`\`html
<!-- DNS 사전 해석 -->
<link rel="dns-prefetch" href="//fonts.googleapis.com">

<!-- 연결 사전 설정 -->
<link rel="preconnect" href="https://api.example.com">

<!-- 리소스 사전 로딩 -->
<link rel="preload" href="hero-image.jpg" as="image">

<!-- 다음 페이지 사전 페치 -->
<link rel="prefetch" href="/next-page.html">
\`\`\`

## 캐싱 전략

### 서비스 워커 활용
\`\`\`javascript
// sw.js
const CACHE_NAME = 'my-app-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});
\`\`\`

## 성능 측정 도구

1. **Lighthouse**: Chrome 내장 도구
2. **WebPageTest**: 상세한 성능 분석
3. **GTmetrix**: 종합적인 성능 리포트
4. **Chrome DevTools**: 실시간 성능 모니터링

## 모니터링 설정

\`\`\`javascript
// 성능 메트릭 수집
function measurePerformance() {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      // 분석 서비스로 전송
      analytics.track('performance', {
        name: entry.name,
        value: entry.value,
        rating: entry.rating
      });
    });
  });
  
  observer.observe({ entryTypes: ['web-vitals'] });
}
\`\`\`

성능 최적화는 지속적인 과정입니다. 정기적인 모니터링과 개선이 중요합니다.`
        },
        classification: {
          category: 'Frontend',
          tags: ['성능최적화', '웹성능', 'Core Web Vitals'],
          difficulty: 'advanced',
          primaryLanguage: 'javascript'
        },
        authorId: 'author_2',
        authorName: 'CSS Master',
        status: 'published',
        featured: true
      }
    ];

    for (const postInput of samplePosts) {
      await this.createPost(postInput);
    }
  }

  private async savePosts(): Promise<void> {
    try {
      const postsArray = Array.from(this.posts.values());
      await fs.writeFile(this.dataPath, JSON.stringify(postsArray, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to save posts:', error);
      throw error;
    }
  }

  async createPost(input: ICreatePostInput): Promise<IPost> {
    await this.initialize();

    const id = this.generateId();
    const slug = this.generateSlug(input.metadata.title);
    const now = Date.now();

    // 마크다운을 HTML로 렌더링
    const markdownResult = this.markdownService.render(input.content.markdown, {
      enableCodeHighlighting: true,
      sanitize: true,
      generateTOC: true
    });

    const post: IPost = {
      id,
      metadata: {
        ...input.metadata,
        slug
      },
      content: {
        markdown: input.content.markdown,
        html: markdownResult.html,
        readingTime: markdownResult.readingTime
      },
      classification: input.classification,
      stats: {
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        shareCount: 0
      },
      authorId: input.authorId,
      authorName: input.authorName,
      status: input.status,
      createdAt: now,
      updatedAt: now,
      publishedAt: input.status === 'published' ? now : undefined,
      featured: input.featured || false,
      allowComments: input.allowComments !== false,
      sortOrder: input.sortOrder
    };

    this.posts.set(id, post);
    await this.savePosts();

    return post;
  }

  async updatePost(id: string, input: IUpdatePostInput): Promise<IPost | null> {
    await this.initialize();

    const existingPost = this.posts.get(id);
    if (!existingPost) return null;

    const updatedPost: IPost = {
      ...existingPost,
      updatedAt: Date.now()
    };

    if (input.metadata) {
      updatedPost.metadata = { ...existingPost.metadata, ...input.metadata };
      if (input.metadata.title) {
        updatedPost.metadata.slug = this.generateSlug(input.metadata.title);
      }
    }

    if (input.content) {
      updatedPost.content = { ...existingPost.content, ...input.content };
      if (input.content.markdown) {
        // 마크다운이 변경되면 HTML도 다시 렌더링
        const markdownResult = this.markdownService.render(input.content.markdown, {
          enableCodeHighlighting: true,
          sanitize: true,
          generateTOC: true
        });
        updatedPost.content.html = markdownResult.html;
        updatedPost.content.readingTime = markdownResult.readingTime;
      }
    }

    if (input.classification) {
      updatedPost.classification = { ...existingPost.classification, ...input.classification };
    }

    if (input.status !== undefined) {
      updatedPost.status = input.status;
      if (input.status === 'published' && !existingPost.publishedAt) {
        updatedPost.publishedAt = Date.now();
      }
    }

    if (input.featured !== undefined) updatedPost.featured = input.featured;
    if (input.allowComments !== undefined) updatedPost.allowComments = input.allowComments;
    if (input.sortOrder !== undefined) updatedPost.sortOrder = input.sortOrder;

    this.posts.set(id, updatedPost);
    await this.savePosts();

    return updatedPost;
  }

  async getPost(id: string): Promise<IPost | null> {
    await this.initialize();
    return this.posts.get(id) || null;
  }

  async getPostBySlug(slug: string): Promise<IPost | null> {
    await this.initialize();
    for (const post of this.posts.values()) {
      if (post.metadata.slug === slug) {
        return post;
      }
    }
    return null;
  }

  async deletePost(id: string): Promise<boolean> {
    await this.initialize();
    const deleted = this.posts.delete(id);
    if (deleted) {
      await this.savePosts();
    }
    return deleted;
  }

  async getAllPosts(filters?: {
    status?: string;
    category?: string;
    tag?: string;
    featured?: boolean;
    authorId?: string;
  }): Promise<IPost[]> {
    await this.initialize();
    
    let posts = Array.from(this.posts.values());

    if (filters) {
      if (filters.status) {
        posts = posts.filter(post => post.status === filters.status);
      }
      if (filters.category) {
        posts = posts.filter(post => post.classification.category === filters.category);
      }
      if (filters.tag) {
        posts = posts.filter(post => post.classification.tags.includes(filters.tag!));
      }
      if (filters.featured !== undefined) {
        posts = posts.filter(post => post.featured === filters.featured);
      }
      if (filters.authorId) {
        posts = posts.filter(post => post.authorId === filters.authorId);
      }
    }

    // 기본적으로 최신순으로 정렬
    return posts.sort((a, b) => {
      if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
        return a.sortOrder - b.sortOrder;
      }
      return b.createdAt - a.createdAt;
    });
  }

  async getPublishedPosts(): Promise<IPost[]> {
    return this.getAllPosts({ status: 'published' });
  }

  async getFeaturedPosts(): Promise<IPost[]> {
    return this.getAllPosts({ status: 'published', featured: true });
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.initialize();
    const post = this.posts.get(id);
    if (post) {
      post.stats.viewCount++;
      await this.savePosts();
    }
  }

  async getCategories(): Promise<string[]> {
    await this.initialize();
    const categories = new Set<string>();
    for (const post of this.posts.values()) {
      if (post.status === 'published') {
        categories.add(post.classification.category);
      }
    }
    return Array.from(categories).sort();
  }

  async getTags(): Promise<string[]> {
    await this.initialize();
    const tags = new Set<string>();
    for (const post of this.posts.values()) {
      if (post.status === 'published') {
        post.classification.tags.forEach(tag => tags.add(tag));
      }
    }
    return Array.from(tags).sort();
  }

  // 포스트 검색 기능
  async searchPosts(query: string, filters?: {
    status?: string;
    category?: string;
    tag?: string;
  }): Promise<IPost[]> {
    await this.initialize();
    
    let posts = await this.getAllPosts(filters);
    
    if (!query.trim()) {
      return posts;
    }

    const searchTerm = query.toLowerCase();
    
    return posts.filter(post => {
      // 제목에서 검색
      const titleMatch = post.metadata.title.toLowerCase().includes(searchTerm);
      
      // 요약에서 검색
      const excerptMatch = post.metadata.excerpt.toLowerCase().includes(searchTerm);
      
      // 태그에서 검색
      const tagMatch = post.classification.tags.some(tag => 
        tag.toLowerCase().includes(searchTerm)
      );
      
      // 카테고리에서 검색
      const categoryMatch = post.classification.category.toLowerCase().includes(searchTerm);
      
      // 마크다운 내용에서 검색 (코드 블록 제외)
      const contentWithoutCode = post.content.markdown.replace(/```[\s\S]*?```/g, '');
      const contentMatch = contentWithoutCode.toLowerCase().includes(searchTerm);
      
      return titleMatch || excerptMatch || tagMatch || categoryMatch || contentMatch;
    });
  }

  // 포스트의 목차 생성
  async getPostTOC(id: string): Promise<Array<{ id: string; title: string; level: number; anchor: string }> | null> {
    await this.initialize();
    const post = this.posts.get(id);
    if (!post) return null;

    const result = this.markdownService.render(post.content.markdown, {
      generateTOC: true,
      enableCodeHighlighting: false,
      sanitize: false
    });

    return result.toc || [];
  }

  // 포스트의 코드 블록 추출
  async getPostCodeBlocks(id: string): Promise<Array<{ language: string; code: string; line: number }> | null> {
    await this.initialize();
    const post = this.posts.get(id);
    if (!post) return null;

    return this.markdownService.extractCodeBlocks(post.content.markdown);
  }

  // 관련 포스트 추천 (태그 기반)
  async getRelatedPosts(id: string, limit: number = 5): Promise<IPost[]> {
    await this.initialize();
    const post = this.posts.get(id);
    if (!post) return [];

    const publishedPosts = await this.getPublishedPosts();
    const relatedPosts = publishedPosts
      .filter(p => p.id !== id)
      .map(p => {
        // 공통 태그 수 계산
        const commonTags = p.classification.tags.filter(tag => 
          post.classification.tags.includes(tag)
        ).length;
        
        // 같은 카테고리인지 확인
        const sameCategory = p.classification.category === post.classification.category;
        
        // 점수 계산
        const score = commonTags * 2 + (sameCategory ? 1 : 0);
        
        return { post: p, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.post);

    return relatedPosts;
  }

  // 인기 포스트 (조회수 기준)
  async getPopularPosts(limit: number = 10): Promise<IPost[]> {
    const publishedPosts = await this.getPublishedPosts();
    return publishedPosts
      .sort((a, b) => b.stats.viewCount - a.stats.viewCount)
      .slice(0, limit);
  }

  // 최근 포스트
  async getRecentPosts(limit: number = 10): Promise<IPost[]> {
    const publishedPosts = await this.getPublishedPosts();
    return publishedPosts
      .sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0))
      .slice(0, limit);
  }

  // 통계 정보
  async getStatistics(): Promise<{
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalViews: number;
    totalLikes: number;
    categoriesCount: number;
    tagsCount: number;
  }> {
    await this.initialize();
    
    const allPosts = Array.from(this.posts.values());
    const publishedPosts = allPosts.filter(p => p.status === 'published');
    const draftPosts = allPosts.filter(p => p.status === 'draft');
    
    const totalViews = allPosts.reduce((sum, post) => sum + post.stats.viewCount, 0);
    const totalLikes = allPosts.reduce((sum, post) => sum + post.stats.likeCount, 0);
    
    const categories = await this.getCategories();
    const tags = await this.getTags();

    return {
      totalPosts: allPosts.length,
      publishedPosts: publishedPosts.length,
      draftPosts: draftPosts.length,
      totalViews,
      totalLikes,
      categoriesCount: categories.length,
      tagsCount: tags.length
    };
  }
}