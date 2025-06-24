# Realtime Stories 개발 로그

## 프로젝트 개요
Colyseus를 사용한 실시간 협업 블로그 플랫폼 개발

## 주요 구현 내용

### 1. 실시간 서버 연결 문제 해결

#### 문제점
- "refId" not found: 6 오류 발생
- 사용자가 로비에 2번씩 중복 연결
- React StrictMode로 인한 useEffect 중복 실행

#### 해결 방법
1. **Colyseus 버전 불일치 해결**
   - 서버: colyseus@0.15 → 0.16.4
   - 클라이언트: colyseus.js@0.16.19
   - @colyseus/schema: 2.0 → 3.0.39

2. **React StrictMode 제거**
   - src/index.tsx에서 `<React.StrictMode>` 제거
   - 개발 환경에서의 중복 실행 방지

3. **중복 연결 방지 로직 추가**
   ```typescript
   // ColyseusContext.tsx
   if (isJoiningLobby || lobbyRoom) {
     if (lobbyRoom) return lobbyRoom;
     throw new Error('Already joining lobby');
   }
   ```

4. **스키마 TypeScript 설정**
   - `!` 연산자 사용으로 strict mode 오류 해결
   ```typescript
   export class User extends Schema {
     @type('string') id!: string;
     @type('string') name!: string;
     // ...
   }
   ```

### 2. 실시간 미니맵 기능 구현

#### 구현된 기능
1. **SVG 기반 건물/방 시각화**
   - 블로그를 건물로, 포스트를 방으로 표현
   - 방별 사용자 수 실시간 표시

2. **사용자 위치 시각화**
   - 각 방에 있는 사용자를 원형으로 배치
   - 상태별 색상 구분 (active/reading/idle)

3. **인터랙티브 기능**
   - 줌/팬 컨트롤 (마우스 휠, 드래그)
   - 방 클릭 시 해당 페이지로 네비게이션
   - 호버 시 툴팁으로 방 정보 표시

4. **히트맵 시각화**
   - 사용자 활동 밀도를 히트맵으로 표시
   - 토글 버튼으로 on/off 가능

#### 컴포넌트 구조
```
src/
├── components/
│   ├── MiniMap.tsx          # 메인 미니맵 컴포넌트
│   └── HeatMapOverlay.tsx   # 히트맵 오버레이
├── hooks/
│   ├── useMiniMapData.ts    # 미니맵 데이터 처리
│   └── useMouseTracking.ts  # 마우스 추적 (현재 미사용)
```

### 3. 실제 사용자 데이터 연동

#### 문제점
- MapSchema를 일반 객체로 변환 시 오류
- Object.values()가 예상과 다른 결과 반환

#### 해결 방법
```typescript
// useRoomState.ts
const handleStateChange = (newState: any) => {
  const userArray: User[] = [];
  if (newState.users) {
    newState.users.forEach((user: User) => {
      userArray.push(user);
    });
  }
  setState(newState);
  setUsers(userArray);
};
```

### 4. 페이지별 독립적인 방 시스템

#### 구현 내용
1. **PageRoom 서버 구현**
   - 각 페이지별 독립적인 방 생성
   - 사용자 입/퇴장 관리

2. **클라이언트 연결 로직**
   ```typescript
   // 페이지별 방 연결
   async joinPage(pageId: string, options: RoomOptions = {}): Promise<Room>
   ```

3. **페이지 이동 시 방 전환**
   - Home → Posts 이동 시 로비 나가고 posts 방 입장
   - 각 페이지에서 실제 사용자 수 표시

#### 남은 이슈
- "Already joining page" 오류 처리
- 페이지 전환 시 cleanup 로직 개선 필요

## 서버 빌드 및 실행

```bash
# 서버 빌드
cd server
npm run build

# 서버 실행
npm start

# 클라이언트 실행
cd ..
npm start
```

## 기술 스택
- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Colyseus, Node.js, Express
- **실시간 통신**: WebSocket (Colyseus)
- **상태 관리**: Colyseus Schema

### 5. 크로스 룸 사용자 수 표시 시스템

#### 문제점
- 사용자가 다른 페이지에 있을 때 다른 방의 사용자 수를 볼 수 없음
- 각 페이지가 독립적인 방에 연결되어 다른 방 정보 부족

#### 해결 방법
1. **로비에서 전체 방 정보 관리**
   ```typescript
   // LobbyState.ts
   export class RoomInfo extends Schema {
     @type('string') roomId!: string;
     @type('string') roomName!: string;
     @type('number') userCount!: number;
   }
   
   export class LobbyState extends Schema {
     @type({ map: RoomInfo }) rooms = new MapSchema<RoomInfo>();
   }
   ```

2. **서버에서 5초마다 방 정보 업데이트**
   ```typescript
   // LobbyRoom.ts
   this.setSimulationInterval(async () => {
     const rooms = await matchMaker.query({});
     // 방별 사용자 수 집계 및 업데이트
   }, 5000);
   ```

3. **클라이언트에서 로비 연결 유지**
   - 모든 페이지에서 로비에 항상 연결
   - 페이지 방은 추가 연결로 관리
   - 미니맵에서 로비 상태의 rooms 정보 활용

4. **페이지별 방 등록 개선**
   ```typescript
   // index.ts
   const pages = ['about', 'portfolio', 'experience', 'categories', 'posts'];
   pages.forEach(pageId => {
     gameServer.define(`page_${pageId}`, PageRoom, { pageId });
   });
   ```

#### 현재 구현 상태
- ✅ 서버 방 정보 수집 시스템
- ✅ 로비 상태에 rooms 정보 추가
- ✅ 클라이언트 로비 연결 유지 로직
- 🔄 테스트 및 디버깅 진행 중

## 다음 작업 예정
1. 크로스 룸 사용자 수 표시 완성 및 테스트
2. 실시간 커서 공유 기능
3. 댓글 시스템 구현
4. 사용자 프로필 기능
5. 방별 채팅 기능