---
title: Docker를 활용한 개발환경 구축
slug: docker를-활용한-개발환경-구축
excerpt: Docker와 Docker Compose를 사용하여 일관된 개발환경을 구축하는 방법을 알아봅시다.
keywords:
  - Docker
  - DevOps
  - 컨테이너
  - 개발환경
category: DevOps
tags:
  - Docker
  - DevOps
  - 컨테이너
  - 개발환경
authorId: author_4
authorName: DevOps Engineer
status: published
featured: false
allowComments: true
createdAt: '2025-06-12T15:43:07.187Z'
updatedAt: '2025-06-12T15:43:07.187Z'
readingTime: 2
thumbnail: /images/docker-dev-env.jpg
metaDescription: Docker로 구축하는 현대적 개발환경 가이드
difficulty: intermediate
primaryLanguage: dockerfile
publishedAt: '2025-06-12T15:43:07.187Z'
---
# Docker를 활용한 개발환경 구축

Docker를 사용하면 "내 컴퓨터에서는 잘 되는데"라는 문제를 해결할 수 있습니다.

## Docker 기초 개념

### 이미지와 컨테이너
- **이미지**: 애플리케이션과 의존성이 패키징된 템플릿
- **컨테이너**: 이미지의 실행 인스턴스

## Dockerfile 작성하기

```dockerfile
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
```

## Docker Compose로 멀티 서비스 구성

```yaml
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
```

## 최적화 팁

### 1. 멀티 스테이지 빌드
```dockerfile
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
```

### 2. .dockerignore 활용
```
node_modules
.git
.gitignore
README.md
.env
.nyc_output
coverage
.cache
```

## 개발 워크플로우

1. **로컬 개발**: `docker-compose up -d`
2. **테스트**: `docker-compose exec app npm test`
3. **프로덕션 빌드**: `docker build -t myapp:prod .`

Docker를 활용하면 팀원 모두가 동일한 환경에서 개발할 수 있습니다.
