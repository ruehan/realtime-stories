import { useState, useEffect, useCallback, useRef } from 'react';

interface MousePosition {
  x: number;
  y: number;
  elementX: number; // Position relative to element
  elementY: number; // Position relative to element
}

interface UseMouseInteractionOptions {
  enableHover?: boolean;
  enableMove?: boolean;
  enableClick?: boolean;
  throttleMs?: number;
  sensitivity?: number; // 0-1, how sensitive to mouse movement
  magnetism?: number; // 0-1, how much elements are attracted to mouse
}

interface InteractionState {
  isHovering: boolean;
  mousePosition: MousePosition;
  isClicking: boolean;
  velocity: { x: number; y: number };
  lastMoveTime: number;
}

export const useMouseInteraction = (options: UseMouseInteractionOptions = {}) => {
  const {
    enableHover = true,
    enableMove = true,
    enableClick = true,
    throttleMs = 16, // ~60fps
    sensitivity = 1,
    magnetism = 0.5
  } = options;

  const [state, setState] = useState<InteractionState>({
    isHovering: false,
    mousePosition: { x: 0, y: 0, elementX: 0, elementY: 0 },
    isClicking: false,
    velocity: { x: 0, y: 0 },
    lastMoveTime: 0
  });

  const elementRef = useRef<HTMLElement | null>(null);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const lastUpdateRef = useRef(Date.now());

  // Calculate velocity
  const calculateVelocity = useCallback((newX: number, newY: number) => {
    const now = Date.now();
    const deltaTime = now - lastUpdateRef.current;
    const deltaX = newX - lastPositionRef.current.x;
    const deltaY = newY - lastPositionRef.current.y;

    if (deltaTime > 0) {
      const velocityX = (deltaX / deltaTime) * 1000; // pixels per second
      const velocityY = (deltaY / deltaTime) * 1000;
      
      lastPositionRef.current = { x: newX, y: newY };
      lastUpdateRef.current = now;
      
      return { x: velocityX, y: velocityY };
    }
    
    return state.velocity;
  }, [state.velocity]);

  // Throttled mouse move handler
  const handleMouseMove = useCallback(
    throttle((event: MouseEvent) => {
      if (!enableMove || !elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const x = event.clientX;
      const y = event.clientY;
      const elementX = event.clientX - rect.left;
      const elementY = event.clientY - rect.top;

      const velocity = calculateVelocity(x, y);

      setState(prev => ({
        ...prev,
        mousePosition: { x, y, elementX, elementY },
        velocity,
        lastMoveTime: Date.now()
      }));
    }, throttleMs),
    [enableMove, throttleMs, calculateVelocity]
  );

  // Mouse enter handler
  const handleMouseEnter = useCallback((event: MouseEvent) => {
    if (!enableHover) return;

    setState(prev => ({ ...prev, isHovering: true }));
  }, [enableHover]);

  // Mouse leave handler
  const handleMouseLeave = useCallback((event: MouseEvent) => {
    if (!enableHover) return;

    setState(prev => ({ 
      ...prev, 
      isHovering: false,
      velocity: { x: 0, y: 0 }
    }));
  }, [enableHover]);

  // Mouse down handler
  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (!enableClick) return;

    setState(prev => ({ ...prev, isClicking: true }));
  }, [enableClick]);

  // Mouse up handler
  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (!enableClick) return;

    setState(prev => ({ ...prev, isClicking: false }));
  }, [enableClick]);

  // Set up event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (enableMove) {
      element.addEventListener('mousemove', handleMouseMove);
    }
    if (enableHover) {
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
    }
    if (enableClick) {
      element.addEventListener('mousedown', handleMouseDown);
      element.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      if (enableMove) {
        element.removeEventListener('mousemove', handleMouseMove);
      }
      if (enableHover) {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (enableClick) {
        element.removeEventListener('mousedown', handleMouseDown);
        element.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [
    enableMove, enableHover, enableClick,
    handleMouseMove, handleMouseEnter, handleMouseLeave,
    handleMouseDown, handleMouseUp
  ]);

  // Calculate magnetic effect
  const getMagneticOffset = useCallback((targetX: number, targetY: number, strength: number = magnetism) => {
    if (!state.isHovering || !elementRef.current) {
      return { x: 0, y: 0 };
    }

    const { elementX, elementY } = state.mousePosition;
    const rect = elementRef.current.getBoundingClientRect();
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const deltaX = (elementX - centerX) * strength * sensitivity;
    const deltaY = (elementY - centerY) * strength * sensitivity;
    
    return { x: deltaX, y: deltaY };
  }, [state.isHovering, state.mousePosition, magnetism, sensitivity]);

  // Calculate tilt effect based on mouse position
  const getTiltEffect = useCallback((maxTilt: number = 15) => {
    if (!state.isHovering || !elementRef.current) {
      return { rotateX: 0, rotateY: 0 };
    }

    const { elementX, elementY } = state.mousePosition;
    const rect = elementRef.current.getBoundingClientRect();
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateY = ((elementX - centerX) / centerX) * maxTilt * sensitivity;
    const rotateX = ((centerY - elementY) / centerY) * maxTilt * sensitivity;
    
    return { rotateX, rotateY };
  }, [state.isHovering, state.mousePosition, sensitivity]);

  // Get transform string for CSS
  const getTransform = useCallback((options: {
    enableMagnetic?: boolean;
    enableTilt?: boolean;
    magneticStrength?: number;
    tiltStrength?: number;
  } = {}) => {
    const {
      enableMagnetic = true,
      enableTilt = true,
      magneticStrength = magnetism,
      tiltStrength = 15
    } = options;

    let transforms: string[] = [];

    if (enableMagnetic) {
      const magnetic = getMagneticOffset(0, 0, magneticStrength);
      transforms.push(`translate3d(${magnetic.x}px, ${magnetic.y}px, 0)`);
    }

    if (enableTilt) {
      const tilt = getTiltEffect(tiltStrength);
      transforms.push(`rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`);
    }

    return transforms.join(' ');
  }, [getMagneticOffset, getTiltEffect, magnetism]);

  return {
    ref: elementRef,
    ...state,
    getMagneticOffset,
    getTiltEffect,
    getTransform,
    // Utility methods
    isMoving: Date.now() - state.lastMoveTime < 100,
    movementSpeed: Math.sqrt(state.velocity.x ** 2 + state.velocity.y ** 2),
    // Helper for CSS vars
    getCSSVariables: () => ({
      '--mouse-x': `${state.mousePosition.elementX}px`,
      '--mouse-y': `${state.mousePosition.elementY}px`,
      '--mouse-velocity-x': `${state.velocity.x}`,
      '--mouse-velocity-y': `${state.velocity.y}`,
      '--is-hovering': state.isHovering ? '1' : '0',
      '--is-clicking': state.isClicking ? '1' : '0'
    })
  };
};

// Hook for multiple interactive elements with shared mouse context
export const useSharedMouseContext = () => {
  const [globalMouseState, setGlobalMouseState] = useState({
    x: 0,
    y: 0,
    isMoving: false,
    velocity: { x: 0, y: 0 }
  });

  const lastPositionRef = useRef({ x: 0, y: 0 });
  const lastUpdateRef = useRef(Date.now());

  const handleGlobalMouseMove = useCallback(
    throttle((event: MouseEvent) => {
      const now = Date.now();
      const deltaTime = now - lastUpdateRef.current;
      const deltaX = event.clientX - lastPositionRef.current.x;
      const deltaY = event.clientY - lastPositionRef.current.y;

      let velocity = { x: 0, y: 0 };
      if (deltaTime > 0) {
        velocity = {
          x: (deltaX / deltaTime) * 1000,
          y: (deltaY / deltaTime) * 1000
        };
      }

      setGlobalMouseState({
        x: event.clientX,
        y: event.clientY,
        isMoving: true,
        velocity
      });

      lastPositionRef.current = { x: event.clientX, y: event.clientY };
      lastUpdateRef.current = now;
    }, 16),
    []
  );

  useEffect(() => {
    document.addEventListener('mousemove', handleGlobalMouseMove);
    
    const stopMovingTimer = setInterval(() => {
      const now = Date.now();
      if (now - lastUpdateRef.current > 100) {
        setGlobalMouseState(prev => ({ ...prev, isMoving: false }));
      }
    }, 100);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      clearInterval(stopMovingTimer);
    };
  }, [handleGlobalMouseMove]);

  return globalMouseState;
};

// Throttle utility function
function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
  let inThrottle: boolean;
  return (function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
}