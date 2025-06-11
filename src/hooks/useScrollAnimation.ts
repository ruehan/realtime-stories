import React, { useState, useEffect, useCallback, useRef } from 'react';

interface AnimationConfig {
  threshold?: number; // 0-1, how much of element should be visible to trigger
  rootMargin?: string;
  triggerOnce?: boolean; // whether animation should happen only once
  delay?: number; // delay in ms before animation starts
}

interface UseScrollAnimationReturn {
  ref: React.RefObject<HTMLElement | null>;
  isVisible: boolean;
  hasTriggered: boolean;
  progress: number; // 0-1, how much element is in view
}

export const useScrollAnimation = (config: AnimationConfig = {}): UseScrollAnimationReturn => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
    delay = 0
  } = config;

  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [progress, setProgress] = useState(0);

  const elementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const entry = entries[0];
    const { isIntersecting, intersectionRatio, boundingClientRect, rootBounds } = entry;

    if (isIntersecting) {
      // Calculate progress based on how much of the element is visible
      const elementHeight = boundingClientRect.height;
      const viewportHeight = rootBounds?.height || window.innerHeight;
      
      // Calculate how much of the element is in the viewport
      const visibleTop = Math.max(0, -boundingClientRect.top);
      const visibleBottom = Math.min(elementHeight, viewportHeight - boundingClientRect.top);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const progressValue = elementHeight > 0 ? visibleHeight / elementHeight : 0;
      
      setProgress(Math.min(1, progressValue));

      if (!hasTriggered || !triggerOnce) {
        if (delay > 0) {
          timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
            setHasTriggered(true);
          }, delay);
        } else {
          setIsVisible(true);
          setHasTriggered(true);
        }
      }
    } else {
      setProgress(0);
      if (!triggerOnce) {
        setIsVisible(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    }
  }, [hasTriggered, triggerOnce, delay]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: Array.from({ length: 101 }, (_, i) => i / 100), // Multiple thresholds for smooth progress
      rootMargin
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleIntersection, rootMargin]);

  return {
    ref: elementRef,
    isVisible,
    hasTriggered,
    progress
  };
};

// Hook for multiple elements with staggered animations
interface UseStaggeredAnimationOptions extends AnimationConfig {
  staggerDelay?: number; // delay between each element animation
}

export const useStaggeredAnimation = (
  count: number,
  options: UseStaggeredAnimationOptions = {}
) => {
  const { staggerDelay = 100, ...animationConfig } = options;
  
  const refs = useRef<Array<React.RefObject<HTMLElement | null>>>(
    Array.from({ length: count }, () => React.createRef<HTMLElement>())
  );
  
  const [visibilityStates, setVisibilityStates] = useState<boolean[]>(
    new Array(count).fill(false)
  );

  const containerRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const handleContainerIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const entry = entries[0];
    
    if (entry.isIntersecting) {
      // Clear existing timeouts
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current = [];

      // Start staggered animations
      visibilityStates.forEach((_, index) => {
        const timeout = setTimeout(() => {
          setVisibilityStates(prev => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
        }, index * staggerDelay + (animationConfig.delay || 0));
        
        timeoutsRef.current.push(timeout);
      });
    } else if (!animationConfig.triggerOnce) {
      // Reset animations if not trigger once
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current = [];
      setVisibilityStates(new Array(count).fill(false));
    }
  }, [count, staggerDelay, animationConfig.delay, animationConfig.triggerOnce, visibilityStates]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    observerRef.current = new IntersectionObserver(handleContainerIntersection, {
      threshold: animationConfig.threshold || 0.1,
      rootMargin: animationConfig.rootMargin || '0px'
    });

    observerRef.current.observe(container);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, [handleContainerIntersection, animationConfig.threshold, animationConfig.rootMargin]);

  return {
    containerRef,
    refs: refs.current,
    visibilityStates
  };
};

// Hook for parallax effects
interface UseParallaxOptions {
  speed?: number; // -1 to 1, negative for reverse direction
  offset?: number; // initial offset
}

export const useParallax = (options: UseParallaxOptions = {}) => {
  const { speed = 0.5, offset = 0 } = options;
  const [transform, setTransform] = useState(`translateY(${offset}px)`);
  const elementRef = useRef<HTMLElement | null>(null);

  const handleScroll = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const elementTop = rect.top;
    const elementHeight = rect.height;
    const windowHeight = window.innerHeight;

    // Calculate if element is in viewport
    if (elementTop < windowHeight && elementTop + elementHeight > 0) {
      // Calculate parallax offset
      const scrolled = windowHeight - elementTop;
      const rate = scrolled * speed;
      const yPos = offset + rate;
      
      setTransform(`translateY(${yPos}px)`);
    }
  }, [speed, offset]);

  useEffect(() => {
    const throttledHandleScroll = throttle(handleScroll, 16); // ~60fps
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    // Initial calculation
    handleScroll();

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [handleScroll]);

  return {
    ref: elementRef,
    transform
  };
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