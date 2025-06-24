import React, { useEffect, useState } from 'react';
import { useColyseus } from '../contexts/ColyseusContext';
import { useLobbyState } from '../hooks/useRoomState';
import MiniMap from '../components/MiniMap';
import useMiniMapData from '../hooks/useMiniMapData';
import useRoomStats from '../hooks/useRoomStats';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Post } from '../services/PostService';
import PostCard, { PostCardSkeleton } from '../components/PostCard';

const Posts: React.FC = () => {
  const { joinPage, pageRoom } = useColyseus();
  const { state, users } = useLobbyState(pageRoom);
  
  // Get global room stats from API
  const { roomStats } = useRoomStats();
  
  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Infinite scroll for posts
  const {
    posts,
    loading,
    hasMore,
    error,
    refresh,
    sentinelRef
  } = useInfiniteScroll({
    limit: 6,
    category: selectedCategory || undefined,
    tag: selectedTag || undefined,
    search: searchQuery || undefined
  }) as any;
  
  
  // Auto-join posts room on mount
  useEffect(() => {
    let mounted = true;
    
    const joinRoom = async () => {
      if (!pageRoom && mounted) {
        try {
          await joinPage('posts');
        } catch (error) {
          if (error instanceof Error && error.message !== 'Already joining page') {
            console.error('Failed to join posts room:', error);
          }
        }
      }
    };
    
    joinRoom();
    
    return () => {
      mounted = false;
    };
  }, []); // 빈 의존성 배열로 한 번만 실행
  
  // MiniMap data - use API room stats for global room counts
  const { rooms, users: miniMapUsers } = useMiniMapData(users, 'posts', roomStats);

  const handleRoomNavigation = (roomId: string) => {
    switch (roomId) {
      case 'home':
        window.location.href = '/';
        break;
      case 'about':
        window.location.href = '/about';
        break;
      case 'portfolio':
        window.location.href = '/portfolio';
        break;
      case 'experience':
        window.location.href = '/work-experience';
        break;
      case 'categories':
        window.location.href = '/categories';
        break;
      default:
        console.log(`Navigating to room: ${roomId}`);
    }
  };

  const handlePostClick = (post: Post) => {
    // Navigate to post detail page
    window.location.href = `/posts/${post.metadata.slug}`;
  };

  const handleFilterChange = (type: 'category' | 'tag' | 'search', value: string) => {
    switch (type) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'tag':
        setSelectedTag(value);
        break;
      case 'search':
        setSearchQuery(value);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4" style={{ color: '#111827' }}>
              Development Blog
            </h1>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#4B5563' }}>
              Technical articles, insights, and tutorials on modern web development
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Tutorial">Tutorial</option>
                </select>
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedTag('');
                    setSearchQuery('');
                    refresh();
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Posts Grid */}
            <div className="xl:col-span-3">
              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                  <h3 className="text-red-800 font-semibold mb-2">Error Loading Posts</h3>
                  <p className="text-red-600">{error}</p>
                  <button
                    onClick={refresh}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    Try Again
                  </button>
                </div>
              )}


              {/* Posts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {posts?.map((post: Post, index: number) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    animationDelay={index * 100}
                    onClick={() => handlePostClick(post)}
                  />
                ))}
                
                {/* Loading Skeletons */}
                {loading && (
                  <>
                    {Array.from({ length: 4 }, (_, i) => (
                      <PostCardSkeleton key={`skeleton-${i}`} />
                    ))}
                  </>
                )}
              </div>

              {/* Infinite Scroll Sentinel */}
              <div ref={sentinelRef} className="h-4" />

              {/* No More Posts */}
              {!hasMore && posts.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">You've reached the end! 🎉</p>
                </div>
              )}

              {/* No Posts Found */}
              {!loading && posts.length === 0 && !error && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1 space-y-6">
              {/* MiniMap */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <MiniMap
                  rooms={rooms}
                  users={miniMapUsers}
                  currentRoomId="posts"
                  onRoomClick={handleRoomNavigation}
                  className="w-full"
                />
              </div>

              {/* Popular Tags */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {['React', 'TypeScript', 'Node.js', 'WebSocket', 'Colyseus', 'CSS'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleFilterChange('tag', tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                        selectedTag === tag
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time Stats */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Readers</span>
                    <span className="font-semibold text-blue-600">{users?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Posts</span>
                    <span className="font-semibold">{posts.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Posts;