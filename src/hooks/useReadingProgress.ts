import { useState, useEffect, useCallback, useRef } from 'react';

interface ReadingAnalytics {
  progress: number; // 0-100
  timeSpent: number; // seconds
  scrollDirection: 'up' | 'down' | 'none';
  readingSpeed: number; // words per minute
  currentSection: string | null;
  estimatedReadingTime: number; // total estimated time in minutes
}

interface UseReadingProgressOptions {
  contentSelector?: string;
  sectionSelector?: string;
  trackingThreshold?: number; // minimum time spent in section to count as "read"
  wordsPerMinute?: number; // average reading speed for estimation
}

export const useReadingProgress = (options: UseReadingProgressOptions = {}) => {
  const {
    contentSelector = '.reading-content',
    sectionSelector = 'h1, h2, h3, h4, h5, h6',
    trackingThreshold = 2000, // 2 seconds
    wordsPerMinute = 200
  } = options;

  const [analytics, setAnalytics] = useState<ReadingAnalytics>({
    progress: 0,
    timeSpent: 0,
    scrollDirection: 'none',
    readingSpeed: wordsPerMinute,
    currentSection: null,
    estimatedReadingTime: 0
  });

  const [isReading, setIsReading] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const lastScrollRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(Date.now());
  const sectionStartTimeRef = useRef<number>(Date.now());
  const currentSectionRef = useRef<string | null>(null);
  const totalWordsRef = useRef<number>(0);
  const wordsReadRef = useRef<number>(0);

  // Calculate total words and estimated reading time
  const calculateContentMetrics = useCallback(() => {
    const contentElement = document.querySelector(contentSelector);
    if (!contentElement) return;

    const text = contentElement.textContent || '';
    const words = text.split(/\s+/).filter(word => word.length > 0).length;
    totalWordsRef.current = words;

    setAnalytics(prev => ({
      ...prev,
      estimatedReadingTime: Math.ceil(words / wordsPerMinute)
    }));
  }, [contentSelector, wordsPerMinute]);

  // Get current section based on scroll position
  const getCurrentSection = useCallback(() => {
    const sections = document.querySelectorAll(sectionSelector);
    const scrollY = window.scrollY + 100; // offset for better accuracy

    let currentSection = null;
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      
      if (scrollY >= sectionTop) {
        currentSection = section.textContent?.trim() || null;
      }
    });

    return currentSection;
  }, [sectionSelector]);

  // Calculate how many words have been read based on scroll position
  const calculateWordsRead = useCallback(() => {
    const contentElement = document.querySelector(contentSelector);
    if (!contentElement) return 0;

    const contentRect = contentElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Calculate what portion of content is above the current viewport
    const scrolledPast = Math.max(0, -contentRect.top);
    const contentHeight = contentRect.height;
    const readRatio = Math.min(1, scrolledPast / contentHeight);
    
    return Math.floor(totalWordsRef.current * readRatio);
  }, [contentSelector]);

  // Calculate reading speed based on time spent and words read
  const calculateReadingSpeed = useCallback(() => {
    const timeSpentMinutes = analytics.timeSpent / 60;
    if (timeSpentMinutes < 0.1) return wordsPerMinute; // fallback for very short reads
    
    return Math.round(wordsReadRef.current / timeSpentMinutes);
  }, [analytics.timeSpent, wordsPerMinute]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    const now = Date.now();
    const contentElement = document.querySelector(contentSelector);
    
    if (!contentElement) return;

    const contentRect = contentElement.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate reading progress (0-100)
    const contentTop = contentRect.top;
    const contentHeight = contentRect.height;
    const viewportProgress = Math.max(0, -contentTop);
    const totalScrollable = contentHeight - windowHeight;
    const progress = totalScrollable > 0 ? Math.min(100, (viewportProgress / totalScrollable) * 100) : 0;

    // Determine scroll direction
    const currentScroll = window.scrollY;
    const scrollDirection = currentScroll > lastScrollRef.current ? 'down' : 
                          currentScroll < lastScrollRef.current ? 'up' : 'none';
    lastScrollRef.current = currentScroll;

    // Get current section
    const currentSection = getCurrentSection();
    
    // Track section changes
    if (currentSection !== currentSectionRef.current) {
      if (currentSectionRef.current && now - sectionStartTimeRef.current > trackingThreshold) {
        // User spent enough time in previous section - count as read
        console.log(`Section read: ${currentSectionRef.current}`);
      }
      currentSectionRef.current = currentSection;
      sectionStartTimeRef.current = now;
    }

    // Update words read
    wordsReadRef.current = calculateWordsRead();

    // Update analytics
    setAnalytics(prev => ({
      ...prev,
      progress,
      scrollDirection,
      currentSection,
      readingSpeed: calculateReadingSpeed()
    }));

    // Update reading state
    setIsReading(contentRect.top < windowHeight && contentRect.bottom > 0);
    
    lastUpdateRef.current = now;
  }, [contentSelector, getCurrentSection, trackingThreshold, calculateWordsRead, calculateReadingSpeed]);

  // Update time spent
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isReading) {
      interval = setInterval(() => {
        const now = Date.now();
        const timeSpent = Math.floor((now - startTimeRef.current) / 1000);
        
        setAnalytics(prev => ({
          ...prev,
          timeSpent,
          readingSpeed: calculateReadingSpeed()
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isReading, calculateReadingSpeed]);

  // Set up scroll listener
  useEffect(() => {
    calculateContentMetrics();
    
    const throttledHandleScroll = throttle(handleScroll, 100);
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    // Initial calculation
    handleScroll();

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [handleScroll, calculateContentMetrics]);

  // Reset timer when component mounts
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  return {
    ...analytics,
    isReading,
    resetProgress: () => {
      startTimeRef.current = Date.now();
      setAnalytics(prev => ({
        ...prev,
        timeSpent: 0,
        progress: 0
      }));
    }
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