import { useState, useEffect, useCallback, useRef } from 'react';
import { useReadingProgress } from './useReadingProgress';

interface AdaptiveLoadingConfig {
  fastReaderThreshold?: number; // wpm threshold for fast readers
  slowReaderThreshold?: number; // wpm threshold for slow readers
  preloadDistance?: number; // how far ahead to preload content (in percentage)
  lazyLoadDistance?: number; // how close to trigger lazy loading
  enableImageOptimization?: boolean;
  enablePrefetch?: boolean;
}

interface ContentChunk {
  id: string;
  type: 'text' | 'image' | 'code' | 'interactive';
  content: any;
  priority: 'high' | 'medium' | 'low';
  loaded: boolean;
  loading: boolean;
  visible: boolean;
}

export const useAdaptiveLoading = (
  contentChunks: ContentChunk[],
  config: AdaptiveLoadingConfig = {}
) => {
  const {
    fastReaderThreshold = 250,
    slowReaderThreshold = 150,
    preloadDistance = 20, // 20% ahead
    lazyLoadDistance = 10, // 10% ahead
    enableImageOptimization = true,
    enablePrefetch = true
  } = config;

  const { progress, readingSpeed, isReading } = useReadingProgress();
  const [loadedChunks, setLoadedChunks] = useState<Set<string>>(new Set());
  const [loadingChunks, setLoadingChunks] = useState<Set<string>>(new Set());
  const [visibleChunks, setVisibleChunks] = useState<Set<string>>(new Set());

  const loadingQueueRef = useRef<string[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Determine reader type based on reading speed
  const getReaderType = useCallback(() => {
    if (readingSpeed >= fastReaderThreshold) return 'fast';
    if (readingSpeed <= slowReaderThreshold) return 'slow';
    return 'average';
  }, [readingSpeed, fastReaderThreshold, slowReaderThreshold]);

  // Calculate how far ahead to load content based on reading speed
  const getPreloadDistance = useCallback(() => {
    const readerType = getReaderType();
    switch (readerType) {
      case 'fast':
        return preloadDistance * 2; // Load more content ahead for fast readers
      case 'slow':
        return preloadDistance * 0.5; // Load less content ahead for slow readers
      default:
        return preloadDistance;
    }
  }, [getReaderType, preloadDistance]);

  // Load content chunk
  const loadChunk = useCallback(async (chunkId: string) => {
    const chunk = contentChunks.find(c => c.id === chunkId);
    if (!chunk || loadedChunks.has(chunkId) || loadingChunks.has(chunkId)) {
      return;
    }

    setLoadingChunks(prev => new Set(Array.from(prev).concat(chunkId)));

    try {
      // Simulate different loading strategies based on content type
      switch (chunk.type) {
        case 'image':
          await loadImage(chunk);
          break;
        case 'code':
          await loadCodeBlock(chunk);
          break;
        case 'interactive':
          await loadInteractiveContent(chunk);
          break;
        default:
          await loadTextContent(chunk);
      }

      setLoadedChunks(prev => new Set(Array.from(prev).concat(chunkId)));
    } catch (error) {
      console.error(`Failed to load chunk ${chunkId}:`, error);
    } finally {
      setLoadingChunks(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(chunkId);
        return newSet;
      });
    }
  }, [contentChunks, loadedChunks, loadingChunks]);

  // Load image with optimization
  const loadImage = useCallback(async (chunk: ContentChunk) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        // Store optimized image data
        if (enableImageOptimization) {
          // Create canvas for image optimization
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            // Optimize image based on reader type and device
            const readerType = getReaderType();
            const scale = readerType === 'fast' ? 1 : 0.8; // Lower quality for slower readers
            
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Store optimized image
            chunk.content = {
              ...chunk.content,
              optimizedSrc: canvas.toDataURL('image/jpeg', 0.8),
              originalSrc: chunk.content.src
            };
          }
        }
        
        resolve();
      };
      
      img.onerror = reject;
      img.src = chunk.content.src;
    });
  }, [enableImageOptimization, getReaderType]);

  // Load code block with syntax highlighting
  const loadCodeBlock = useCallback(async (chunk: ContentChunk) => {
    // Simulate code highlighting loading
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        chunk.content = {
          ...chunk.content,
          highlighted: true,
          loadedAt: Date.now()
        };
        resolve();
      }, 100);
    });
  }, []);

  // Load interactive content
  const loadInteractiveContent = useCallback(async (chunk: ContentChunk) => {
    // Simulate loading interactive elements
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        chunk.content = {
          ...chunk.content,
          interactive: true,
          loadedAt: Date.now()
        };
        resolve();
      }, 200);
    });
  }, []);

  // Load text content
  const loadTextContent = useCallback(async (chunk: ContentChunk) => {
    // Simulate text processing
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        chunk.content = {
          ...chunk.content,
          processed: true,
          loadedAt: Date.now()
        };
        resolve();
      }, 50);
    });
  }, []);

  // Determine which chunks to load based on current progress and reading speed
  const getChunksToLoad = useCallback(() => {
    const currentPreloadDistance = getPreloadDistance();
    const targetProgress = progress + currentPreloadDistance;
    
    return contentChunks
      .filter(chunk => {
        // Calculate chunk position (simplified - assumes equal distribution)
        const chunkIndex = contentChunks.indexOf(chunk);
        const chunkProgress = (chunkIndex / contentChunks.length) * 100;
        
        return chunkProgress <= targetProgress && !loadedChunks.has(chunk.id);
      })
      .sort((a, b) => {
        // Prioritize by content priority and position
        if (a.priority !== b.priority) {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return contentChunks.indexOf(a) - contentChunks.indexOf(b);
      });
  }, [progress, getPreloadDistance, contentChunks, loadedChunks]);

  // Process loading queue
  const processLoadingQueue = useCallback(async () => {
    const readerType = getReaderType();
    const maxConcurrentLoads = readerType === 'fast' ? 5 : 2;
    
    const chunksToLoad = getChunksToLoad();
    const currentlyLoading = loadingChunks.size;
    
    // Only start new loads if we're not at capacity
    if (currentlyLoading < maxConcurrentLoads) {
      const availableSlots = maxConcurrentLoads - currentlyLoading;
      const chunksToStartLoading = chunksToLoad.slice(0, availableSlots);
      
      await Promise.all(
        chunksToStartLoading.map(chunk => loadChunk(chunk.id))
      );
    }
  }, [getReaderType, getChunksToLoad, loadingChunks.size, loadChunk]);

  // Set up intersection observer for visibility tracking
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const chunkId = entry.target.getAttribute('data-chunk-id');
          if (chunkId) {
            setVisibleChunks(prev => {
              const newSet = new Set(Array.from(prev));
              if (entry.isIntersecting) {
                newSet.add(chunkId);
              } else {
                newSet.delete(chunkId);
              }
              return newSet;
            });
          }
        });
      },
      {
        rootMargin: `${lazyLoadDistance}% 0px`,
        threshold: 0.1
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazyLoadDistance]);

  // Process loading queue when reading state changes
  useEffect(() => {
    if (isReading) {
      processLoadingQueue();
    }
  }, [isReading, progress, readingSpeed, processLoadingQueue]);

  // Prefetch related content
  useEffect(() => {
    if (enablePrefetch && readingSpeed > 0) {
      const prefetchDelay = getReaderType() === 'fast' ? 1000 : 3000;
      
      const timer = setTimeout(() => {
        // Prefetch next likely content
        processLoadingQueue();
      }, prefetchDelay);

      return () => clearTimeout(timer);
    }
  }, [enablePrefetch, readingSpeed, getReaderType, processLoadingQueue]);

  // Register element for observation
  const registerElement = useCallback((element: HTMLElement, chunkId: string) => {
    if (observerRef.current && element) {
      element.setAttribute('data-chunk-id', chunkId);
      observerRef.current.observe(element);
    }
  }, []);

  // Unregister element from observation
  const unregisterElement = useCallback((element: HTMLElement) => {
    if (observerRef.current && element) {
      observerRef.current.unobserve(element);
    }
  }, []);

  return {
    loadedChunks,
    loadingChunks,
    visibleChunks,
    readerType: getReaderType(),
    registerElement,
    unregisterElement,
    loadChunk,
    isChunkLoaded: (chunkId: string) => loadedChunks.has(chunkId),
    isChunkLoading: (chunkId: string) => loadingChunks.has(chunkId),
    isChunkVisible: (chunkId: string) => visibleChunks.has(chunkId),
    preloadDistance: getPreloadDistance(),
    // Statistics
    stats: {
      totalChunks: contentChunks.length,
      loadedCount: loadedChunks.size,
      loadingCount: loadingChunks.size,
      visibleCount: visibleChunks.size,
      loadingProgress: (loadedChunks.size / contentChunks.length) * 100
    }
  };
};