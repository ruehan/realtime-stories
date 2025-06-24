---
title: "React와 TypeScript로 실시간 블로그 만들기"
slug: "react와-typescript로-실시간-블로그-만들기"
excerpt: "Colyseus를 활용한 실시간 기능을 가진 블로그 플랫폼 개발 경험을 공유합니다."
thumbnail: "/images/react-typescript-blog.jpg"
metaDescription: "React, TypeScript, Colyseus를 사용한 실시간 블로그 개발 가이드"
keywords: ["React", "TypeScript", "Colyseus", "실시간", "블로그"]
category: "Frontend"
tags: ["React", "TypeScript", "Colyseus", "WebSocket"]
difficulty: "intermediate"
primaryLanguage: "typescript"
authorId: "author_1"
authorName: "Developer"
status: "published"
featured: true
allowComments: true
createdAt: "2024-01-15T10:00:00Z"
updatedAt: "2024-01-15T10:00:00Z"
publishedAt: "2024-01-15T10:00:00Z"
readingTime: 5
---

# React와 TypeScript로 실시간 블로그 만들기

이 포스트에서는 React와 TypeScript를 활용하여 실시간 기능을 가진 블로그를 만드는 과정을 설명합니다.

## 기술 스택
- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Colyseus, Node.js
- **실시간 통신**: WebSocket

## 주요 기능

### 1. 실시간 사용자 추적
```typescript
const { users } = useLobbyState(lobbyRoom);
```

### 2. 미니맵 시각화
SVG를 활용한 인터랙티브 미니맵으로 사용자들의 위치를 실시간으로 표시합니다.

## 프로젝트 구조

```
realtime-stories/
├── src/
│   ├── components/
│   │   ├── ConnectionStatus.tsx
│   │   ├── Navigation.tsx
│   │   └── OnlineUsers.tsx
│   ├── contexts/
│   │   └── ColyseusContext.tsx
│   ├── hooks/
│   │   ├── useRoom.ts
│   │   └── useRoomState.ts
│   └── pages/
│       ├── Home.tsx
│       └── Posts.tsx
└── server/
    ├── src/
    │   ├── rooms/
    │   │   ├── LobbyRoom.ts
    │   │   └── PostRoom.ts
    │   └── schemas/
    │       ├── LobbyState.ts
    │       └── User.ts
    └── package.json
```

## 실시간 기능 구현

### Colyseus 룸 설정
```typescript
// LobbyRoom.ts
import { Room, Client } from 'colyseus';
import { LobbyState } from '../schemas/LobbyState';

export class LobbyRoom extends Room<LobbyState> {
  onCreate() {
    this.setState(new LobbyState());
    
    this.onMessage('user_action', (client, data) => {
      // 사용자 액션 처리
      this.broadcast('action_performed', {
        userId: client.sessionId,
        action: data.action
      });
    });
  }
}
```

### React에서 실시간 연결
```typescript
// useRoom.ts
import { useEffect, useState } from 'react';
import { Room } from 'colyseus.js';

export const useRoom = (roomName: string) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const connectToRoom = async () => {
      try {
        const client = new Client('ws://localhost:2567');
        const room = await client.joinOrCreate(roomName);
        
        setRoom(room);
        setConnected(true);

        room.onLeave(() => {
          setConnected(false);
        });
      } catch (error) {
        console.error('Room connection failed:', error);
      }
    };

    connectToRoom();
  }, [roomName]);

  return { room, connected };
};
```

### 실시간 상태 관리
```typescript
// ColyseusContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { Client } from 'colyseus.js';

interface ColyseusContextType {
  client: Client | null;
  connect: (url: string) => Promise<void>;
  disconnect: () => void;
}

const ColyseusContext = createContext<ColyseusContextType | undefined>(undefined);

export const ColyseusProvider: React.FC<{ children: ReactNode; serverUrl: string }> = ({ 
  children, 
  serverUrl 
}) => {
  const [client, setClient] = useState<Client | null>(null);

  const connect = useCallback(async (url: string) => {
    const newClient = new Client(url);
    setClient(newClient);
  }, []);

  const disconnect = useCallback(() => {
    if (client) {
      client.close();
      setClient(null);
    }
  }, [client]);

  return (
    <ColyseusContext.Provider value={{ client, connect, disconnect }}>
      {children}
    </ColyseusContext.Provider>
  );
};
```

## 성능 최적화

### 1. 메모화를 통한 리렌더링 방지
```typescript
const MemoizedUserList = React.memo(({ users }: { users: User[] }) => {
  return (
    <div className="user-list">
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
});
```

### 2. 이벤트 디바운싱
```typescript
const debouncedSendAction = useCallback(
  debounce((action: string) => {
    room?.send('user_action', { action });
  }, 100),
  [room]
);
```

## 배포 및 확장성

### Docker를 활용한 배포
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# 서버 의존성 설치
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# 클라이언트 빌드
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 서버 실행
EXPOSE 2567
CMD ["node", "server/lib/index.js"]
```

### 로드 밸런싱 고려사항
- WebSocket 연결의 sticky session 처리
- Redis를 활용한 룸 상태 공유
- 수평 확장을 위한 Colyseus 클러스터링

## 결론

실시간 기능을 통해 더 인터랙티브한 블로그 경험을 제공할 수 있습니다. Colyseus와 React의 조합은 복잡한 실시간 로직을 간단하게 구현할 수 있게 해주며, TypeScript를 통해 타입 안전성도 확보할 수 있습니다.

다음 단계로는 다음과 같은 기능들을 고려해볼 수 있습니다:

1. **실시간 협업 편집**: 여러 사용자가 동시에 포스트를 편집
2. **라이브 댓글**: 실시간으로 업데이트되는 댓글 시스템
3. **사용자 현재 위치 추적**: 어떤 섹션을 읽고 있는지 표시
4. **실시간 반응**: 좋아요, 공유 등의 실시간 피드백

이러한 기능들을 통해 단순한 블로그를 넘어 살아있는 커뮤니티 플랫폼으로 발전시킬 수 있습니다.