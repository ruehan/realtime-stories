import { useEffect, useCallback } from 'react';
import { Room } from 'colyseus.js';

interface UseMouseTrackingProps {
  room: Room | null;
  isEnabled?: boolean;
  throttleMs?: number;
}

export const useMouseTracking = ({ 
  room, 
  isEnabled = true, 
  throttleMs = 100 
}: UseMouseTrackingProps) => {
  const sendPosition = useCallback((x: number, y: number) => {
    if (room && isEnabled) {
      room.send('move', { x, y });
    }
  }, [room, isEnabled]);

  // Throttle function to limit position updates
  const throttle = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastExecTime = 0;
    
    return (...args: any[]) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }, []);

  const throttledSendPosition = useCallback(
    throttle(sendPosition, throttleMs),
    [sendPosition, throttleMs, throttle]
  );

  useEffect(() => {
    if (!isEnabled || !room) return;

    const handleMouseMove = (event: MouseEvent) => {
      // Convert screen coordinates to minimap coordinates
      const x = (event.clientX / window.innerWidth) * 800;
      const y = (event.clientY / window.innerHeight) * 600;
      
      throttledSendPosition(x, y);
    };

    // Send status updates
    const handleFocus = () => {
      room.send('status', { status: 'active' });
    };

    const handleBlur = () => {
      room.send('status', { status: 'idle' });
    };

    const handleBeforeUnload = () => {
      room.send('status', { status: 'leaving' });
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Send initial active status
    room.send('status', { status: 'active' });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [room, isEnabled, throttledSendPosition]);

  return { sendPosition };
};

export default useMouseTracking;