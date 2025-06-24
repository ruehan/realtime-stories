import { useState, useEffect, useCallback, useRef } from 'react';
import { Post, postService } from '../services/PostService';

interface UseInfiniteScrollOptions {
  limit?: number;
  threshold?: number; // How close to bottom to trigger loading (in pixels)
  category?: string;
  tag?: string;
  search?: string;
}

interface UseInfiniteScrollReturn {
  posts: Post[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  refresh: () => void;
}

export const useInfiniteScroll = (options: UseInfiniteScrollOptions = {}): UseInfiniteScrollReturn => {
  const {
    limit = 10,
    threshold = 100,
    category,
    tag,
    search
  } = options;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const loadingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching posts with params:', {
        status: 'published',
        category,
        tag,
        search,
        limit,
        offset
      });
      
      const response = await postService.getPosts({
        status: 'published',
        category,
        tag,
        search,
        limit,
        offset
      });

      console.log('📥 Response received:', response);
      const newPosts = response.posts;
      console.log('📋 New posts:', newPosts);

      if (newPosts.length === 0) {
        console.log('⚠️ No new posts found');
        setHasMore(false);
      } else {
        setPosts(prev => {
          // Avoid duplicates
          const existingIds = new Set(prev.map(post => post.id));
          const uniqueNewPosts = newPosts.filter((post: Post) => !existingIds.has(post.id));
          console.log(`✅ Adding ${uniqueNewPosts.length} unique posts (filtered ${newPosts.length - uniqueNewPosts.length} duplicates)`);
          return [...prev, ...uniqueNewPosts];
        });
        setOffset(prev => prev + newPosts.length);
        
        // Check if we've loaded all available posts
        if (newPosts.length < limit) {
          console.log('📭 Reached end of posts');
          setHasMore(false);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load posts';
      console.error('❌ Failed to load posts:', err);
      console.error('Error details:', {
        message: errorMessage,
        stack: err instanceof Error ? err.stack : undefined
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [hasMore, offset, limit, category, tag, search]);

  const refresh = useCallback(() => {
    setPosts([]);
    setOffset(0);
    setHasMore(true);
    setError(null);
    loadingRef.current = false;
  }, []);

  // Load initial posts
  useEffect(() => {
    refresh();
  }, [category, tag, search, refresh]);

  // Load posts when offset changes (including initial load)
  useEffect(() => {
    if (posts.length === 0 && offset === 0) {
      loadMore();
    }
  }, [offset, posts.length, loadMore]);

  // Set up intersection observer for automatic loading
  useEffect(() => {
    if (!sentinelRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0.1
      }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, loadMore, threshold]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    posts,
    loading,
    hasMore,
    error,
    loadMore,
    refresh,
    // Expose sentinel ref for the component to use
    sentinelRef: sentinelRef as React.RefObject<HTMLDivElement>
  } as UseInfiniteScrollReturn & { sentinelRef: React.RefObject<HTMLDivElement> };
};