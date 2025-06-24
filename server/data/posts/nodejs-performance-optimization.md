---
title: "Node.js 성능 최적화 가이드"
slug: "nodejs-성능-최적화-가이드"
excerpt: "Node.js 애플리케이션의 성능을 향상시키는 다양한 기법들을 알아봅니다."
metaDescription: "Node.js 성능 최적화를 위한 실무 가이드"
keywords: ["Node.js", "성능최적화", "Backend", "JavaScript"]
category: "Backend"
tags: ["Node.js", "성능최적화", "JavaScript"]
difficulty: "advanced"
primaryLanguage: "javascript"
authorId: "author_1"
authorName: "Developer"
status: "published"
featured: false
allowComments: true
createdAt: "2024-01-10T10:00:00Z"
updatedAt: "2024-01-10T10:00:00Z"
publishedAt: "2024-01-10T10:00:00Z"
readingTime: 8
---

# Node.js 성능 최적화 가이드

Node.js 애플리케이션의 성능을 최적화하는 방법에 대해 알아보겠습니다.

## 1. 이벤트 루프 최적화

### 이벤트 루프 이해하기
Node.js는 단일 스레드 이벤트 루프를 사용하여 비동기 작업을 처리합니다. 이벤트 루프가 블로킹되면 전체 애플리케이션 성능이 저하됩니다.

```javascript
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
```

### CPU 집약적 작업 처리
```javascript
// Worker Threads 사용
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  // 메인 스레드
  const worker = new Worker(__filename, {
    workerData: { numbers: [1, 2, 3, 4, 5] }
  });
  
  worker.on('message', (result) => {
    console.log('계산 결과:', result);
  });
} else {
  // 워커 스레드
  const { numbers } = workerData;
  const result = numbers.reduce((sum, num) => sum + num * num, 0);
  parentPort.postMessage(result);
}
```

## 2. 메모리 관리

### 메모리 누수 방지
```javascript
// 메모리 누수를 일으키는 코드
const cache = {};
function addToCache(key, value) {
  cache[key] = value; // 계속 누적됨
}

// 개선된 코드 - LRU 캐시 사용
const LRU = require('lru-cache');
const cache = new LRU({
  max: 500,
  ttl: 1000 * 60 * 10 // 10분
});

function addToCache(key, value) {
  cache.set(key, value);
}
```

### 가비지 컬렉션 최적화
```javascript
// V8 플래그를 통한 GC 튜닝
// --max-old-space-size=4096
// --optimize-for-size

// 메모리 사용량 모니터링
function logMemoryUsage() {
  const used = process.memoryUsage();
  console.log('Memory Usage:');
  for (let key in used) {
    console.log(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }
}

setInterval(logMemoryUsage, 30000); // 30초마다 로깅
```

## 3. 캐싱 전략

### 메모리 캐싱
```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10분 TTL

function getCachedData(key, fetchFunction) {
  let data = cache.get(key);
  
  if (data === undefined) {
    data = fetchFunction();
    cache.set(key, data);
  }
  
  return data;
}
```

### Redis 캐싱
```javascript
const redis = require('redis');
const client = redis.createClient();

async function getCachedUser(userId) {
  try {
    const cached = await client.get(`user:${userId}`);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const user = await database.findUser(userId);
    await client.setex(`user:${userId}`, 3600, JSON.stringify(user)); // 1시간 캐시
    
    return user;
  } catch (error) {
    console.error('Cache error:', error);
    return await database.findUser(userId); // 캐시 실패 시 DB에서 직접 조회
  }
}
```

## 4. 데이터베이스 최적화

### 연결 풀 관리
```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'user',
  password: 'password',
  database: 'mydb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000
});

async function executeQuery(sql, params) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(sql, params);
    return rows;
  } finally {
    connection.release();
  }
}
```

### 쿼리 최적화
```javascript
// 비효율적인 N+1 쿼리 문제
async function getBadUserPosts(userIds) {
  const users = await db.query('SELECT * FROM users WHERE id IN (?)', [userIds]);
  
  for (const user of users) {
    user.posts = await db.query('SELECT * FROM posts WHERE user_id = ?', [user.id]);
  }
  
  return users;
}

// 최적화된 JOIN 쿼리
async function getOptimizedUserPosts(userIds) {
  const query = `
    SELECT 
      u.id as user_id, u.name, u.email,
      p.id as post_id, p.title, p.content
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    WHERE u.id IN (?)
  `;
  
  const rows = await db.query(query, [userIds]);
  
  // 결과를 구조화
  const users = {};
  rows.forEach(row => {
    if (!users[row.user_id]) {
      users[row.user_id] = {
        id: row.user_id,
        name: row.name,
        email: row.email,
        posts: []
      };
    }
    
    if (row.post_id) {
      users[row.user_id].posts.push({
        id: row.post_id,
        title: row.title,
        content: row.content
      });
    }
  });
  
  return Object.values(users);
}
```

## 5. HTTP 최적화

### Keep-Alive 연결
```javascript
const http = require('http');

const agent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 50
});

// HTTP 클라이언트에서 사용
const options = {
  agent: agent,
  // ... 기타 옵션
};
```

### 응답 압축
```javascript
const express = require('express');
const compression = require('compression');

const app = express();

// Gzip 압축 활성화
app.use(compression({
  level: 6,
  threshold: 1024, // 1KB 이상만 압축
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

## 6. 스트리밍 처리

### 파일 스트리밍
```javascript
const fs = require('fs');
const { pipeline } = require('stream');
const { promisify } = require('util');

const pipelineAsync = promisify(pipeline);

// 대용량 파일 처리
async function processLargeFile(inputPath, outputPath) {
  try {
    await pipelineAsync(
      fs.createReadStream(inputPath),
      new Transform({
        transform(chunk, encoding, callback) {
          // 청크 단위로 데이터 처리
          const processed = chunk.toString().toUpperCase();
          callback(null, processed);
        }
      }),
      fs.createWriteStream(outputPath)
    );
    
    console.log('파일 처리 완료');
  } catch (error) {
    console.error('스트림 처리 오류:', error);
  }
}
```

### JSON 스트리밍
```javascript
const JSONStream = require('JSONStream');

function streamLargeJSON(res) {
  const stream = database.createQueryStream('SELECT * FROM large_table');
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  
  pipeline(
    stream,
    JSONStream.stringify('[\n', ',\n', '\n]'),
    res,
    (error) => {
      if (error) {
        console.error('스트리밍 오류:', error);
      }
    }
  );
}
```

## 7. 클러스터링

### 멀티코어 활용
```javascript
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`마스터 프로세스 ${process.pid} 시작`);
  
  // 워커 프로세스 생성
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`워커 ${worker.process.pid} 종료`);
    cluster.fork(); // 재시작
  });
} else {
  // 워커 프로세스에서 Express 앱 실행
  const app = require('./app');
  const port = process.env.PORT || 3000;
  
  app.listen(port, () => {
    console.log(`워커 ${process.pid}가 포트 ${port}에서 실행 중`);
  });
}
```

## 8. 성능 모니터링

### APM 도구 설정
```javascript
// New Relic 설정
require('newrelic');

// 또는 자체 모니터링
const performanceMonitor = {
  startTime: Date.now(),
  
  logPerformance(label) {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    console.log(`${label}: ${duration}ms`);
    this.startTime = endTime;
  },
  
  trackMemory() {
    const memUsage = process.memoryUsage();
    console.log('Memory:', {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
    });
  }
};
```

### 프로파일링
```javascript
// CPU 프로파일링 활성화
// node --prof app.js
// node --prof-process isolate-*.log > profile.txt

// 메모리 프로파일링
// node --inspect app.js
// Chrome DevTools에서 메모리 탭 사용
```

## 결론

Node.js 성능 최적화는 다음 영역들을 체계적으로 접근해야 합니다:

1. **이벤트 루프 최적화**: 블로킹 작업 제거 및 비동기 처리
2. **메모리 관리**: 누수 방지 및 GC 최적화
3. **캐싱 전략**: 적절한 캐싱 레이어 구성
4. **데이터베이스 최적화**: 연결 풀 및 쿼리 최적화
5. **네트워크 최적화**: Keep-Alive, 압축 등
6. **스트리밍**: 대용량 데이터 처리
7. **클러스터링**: 멀티코어 활용
8. **모니터링**: 지속적인 성능 추적

성능 최적화는 측정, 분석, 개선의 반복 과정입니다. 정기적인 프로파일링과 모니터링을 통해 병목점을 찾아 해결하는 것이 중요합니다.