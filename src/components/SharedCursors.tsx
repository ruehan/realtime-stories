import React, { useEffect, useRef, useState } from 'react';
import { Room } from 'colyseus.js';

interface Cursor {
  userId: string;
  userName: string;
  x: number; // 0~100 퍼센트 값 (가로 반응형)
  y: number; // 절대 픽셀 값 (세로 스크롤)
  color: string;
  isActive: boolean;
  lastUpdate: number;
}

interface ViewportInfo {
  scrollX: number;
  scrollY: number;
  width: number;
  height: number;
}

interface CursorState {
  cursor: Cursor;
  isVisible: boolean;
  screenX: number;
  screenY: number;
}

interface SharedCursorsProps {
  room: Room | null;
  containerRef?: React.RefObject<HTMLElement | null>;
}

const SharedCursors: React.FC<SharedCursorsProps> = ({ room, containerRef }) => {
  const [cursors, setCursors] = useState<Map<string, Cursor>>(new Map());
  const [cursorStates, setCursorStates] = useState<Map<string, CursorState>>(new Map());
  const [viewport, setViewport] = useState<ViewportInfo>({
    scrollX: 0,
    scrollY: 0,
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [showDebugCursor, setShowDebugCursor] = useState(false);
  const [debugCursorPos, setDebugCursorPos] = useState({ x: 0, y: 0 });
  
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const documentPositionRef = useRef({ x: 0, y: 0 });
  const lastSentRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const viewportUpdateRef = useRef<number | null>(null);

  // Convert document coordinates to screen coordinates
  const documentToScreen = (docX: number, docY: number) => {
    const screenX = docX - viewport.scrollX;
    const screenY = docY - viewport.scrollY;
    return { screenX, screenY };
  };

  // Convert screen coordinates to document coordinates  
  const screenToDocument = (screenX: number, screenY: number) => {
    // Get the actual document element to account for any body margins/padding
    const docElement = document.documentElement;
    const bodyElement = document.body;
    
    // Calculate total scroll including body offset
    const totalScrollX = window.pageXOffset || docElement.scrollLeft || bodyElement.scrollLeft || 0;
    const totalScrollY = window.pageYOffset || docElement.scrollTop || bodyElement.scrollTop || 0;
    
    const docX = screenX + totalScrollX;
    const docY = screenY + totalScrollY;
    
    return { docX, docY };
  };

  // Check if cursor is visible in current viewport
  const isCursorInViewport = (screenX: number, screenY: number) => {
    return screenX >= -50 && screenX <= viewport.width + 50 && 
           screenY >= -50 && screenY <= viewport.height + 50;
  };

  // Update viewport info
  const updateViewport = () => {
    const docElement = document.documentElement;
    const bodyElement = document.body;
    
    const newViewport = {
      scrollX: window.pageXOffset || docElement.scrollLeft || bodyElement.scrollLeft || 0,
      scrollY: window.pageYOffset || docElement.scrollTop || bodyElement.scrollTop || 0,
      width: window.innerWidth,
      height: window.innerHeight
    };
    setViewport(newViewport);
    
    // Update cursor screen positions when viewport changes
    const newCursorStates = new Map<string, CursorState>();
    cursors.forEach((cursor, userId) => {
      const { screenX, screenY } = documentToScreen(cursor.x, cursor.y);
      const isVisible = cursor.isActive && isCursorInViewport(screenX, screenY);
      
      newCursorStates.set(userId, {
        cursor,
        isVisible,
        screenX,
        screenY
      });
    });
    setCursorStates(newCursorStates);
  };

  useEffect(() => {
    if (!room) return;

    // Handle cursor state changes
    const handleCursorUpdate = () => {
      const cursorMap = new Map<string, Cursor>();
      
      if (room.state?.cursors) {
        console.log(`[SharedCursors] Total cursors in room:`, room.state.cursors.size);
        
        room.state.cursors.forEach((cursor: Cursor, key: string) => {
          // Don't show own cursor
          if (key !== room.sessionId) {
            cursorMap.set(key, {
              userId: cursor.userId,
              userName: cursor.userName,
              x: cursor.x,
              y: cursor.y,
              color: cursor.color,
              isActive: cursor.isActive,
              lastUpdate: cursor.lastUpdate
            });
            // 커서 추가 로그 (간소화)
            console.log(`[SharedCursors] ${cursor.userName} cursor active: ${cursor.isActive}`);
          }
        });
      }
      
      console.log(`[SharedCursors] Displaying ${cursorMap.size} cursors`);
      setCursors(cursorMap);
    };

    room.onStateChange(handleCursorUpdate);

    // Send cursor position with throttling
    const sendCursorPosition = () => {
      const now = Date.now();
      if (now - lastSentRef.current < 50) return; // Throttle to 20fps

      // 하이브리드 좌표계: 가로는 퍼센트(반응형), 세로는 픽셀(스크롤)
      const percentX = (mousePositionRef.current.x / window.innerWidth) * 100;
      const absoluteY = mousePositionRef.current.y + window.pageYOffset;
      
      room.send('cursor', {
        x: percentX, // 0~100 범위의 퍼센트 (반응형)
        y: absoluteY // 문서 절대 픽셀 위치 (스크롤 고려)
      });
      
      // 로그 줄이기 (너무 많은 로그 방지)
      if (Math.random() < 0.05) { // 5%만 로그 출력
        console.log(`[SharedCursors] Sent: ${percentX.toFixed(1)}%, ${absoluteY}px`);
      }
      lastSentRef.current = now;
    };

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(sendCursorPosition);
    };

    // Scroll and resize handlers
    const handleViewportChange = () => {
      if (viewportUpdateRef.current) {
        cancelAnimationFrame(viewportUpdateRef.current);
      }
      viewportUpdateRef.current = requestAnimationFrame(updateViewport);
    };

    // Mouse leave handler
    const handleMouseLeave = () => {
      console.log(`[SharedCursors] Mouse left window, hiding cursor`);
      room.send('cursor-hide');
    };

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleViewportChange);
    window.addEventListener('resize', handleViewportChange);

    // Initial viewport update
    updateViewport();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleViewportChange);
      window.removeEventListener('resize', handleViewportChange);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (viewportUpdateRef.current) {
        cancelAnimationFrame(viewportUpdateRef.current);
      }
    };
  }, [room, containerRef]);

  // Update cursor states when cursors change
  useEffect(() => {
    updateViewport();
  }, [cursors]);

  return (
    <>
      {Array.from(cursors.entries()).map(([userId, cursor]) => {
        if (!cursor.isActive) return null;
        
        // Hide cursor if it hasn't been updated in 5 seconds (stale check)
        const isStale = Date.now() - cursor.lastUpdate > 5000;
        if (isStale) return null;
        
        // 하이브리드 변환: 가로는 퍼센트, 세로는 스크롤 고려한 절대 위치
        const displayX = (cursor.x / 100) * window.innerWidth;
        const displayY = cursor.y - window.pageYOffset;
        
        // Only show if in viewport (넉넉한 여유 공간)
        if (displayX < -100 || displayX > window.innerWidth + 100 || 
            displayY < -100 || displayY > window.innerHeight + 100) {
          return null;
        }
        
        return (
          <div
            key={userId}
            className="fixed transition-all duration-200 ease-out pointer-events-none z-50"
            style={{
              left: `${displayX}px`,
              top: `${displayY}px`,
              transform: 'translate(-2px, -2px)',
              opacity: 0.9 // 약간 투명하게 해서 방해되지 않도록
            }}
          >
            {/* Cursor pointer */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              style={{ filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.2))` }}
            >
              <path
                d="M5.5 7.5L5.5 20L10.5 16.5L14 20L16 12.5L20 12.5L5.5 7.5Z"
                fill={cursor.color}
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            
            {/* User name label */}
            <div
              className="absolute left-6 top-0 px-2 py-1 rounded-md text-xs font-medium text-white whitespace-nowrap"
              style={{
                backgroundColor: cursor.color,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                fontSize: '11px'
              }}
            >
              {cursor.userName}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default SharedCursors;