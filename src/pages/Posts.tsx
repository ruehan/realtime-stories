import React, { useEffect } from 'react';
import { useColyseus } from '../contexts/ColyseusContext';
import { useLobbyState } from '../hooks/useRoomState';
import MiniMap from '../components/MiniMap';
import useMiniMapData from '../hooks/useMiniMapData';
import useRoomStats from '../hooks/useRoomStats';

const Posts: React.FC = () => {
  const { joinPage, pageRoom } = useColyseus();
  const { state, users } = useLobbyState(pageRoom);
  
  // Get global room stats from API
  const { roomStats } = useRoomStats();
  
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Blog Posts</h1>
        <p className="text-lg text-gray-700 mb-8">
          Technical articles and development insights will appear here.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Latest Posts</h2>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium">Building Real-time Applications</h3>
                <p className="text-gray-600">Learn how to create interactive real-time features...</p>
              </div>
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium">WebSocket Best Practices</h3>
                <p className="text-gray-600">Essential tips for WebSocket implementation...</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <MiniMap
              rooms={rooms}
              users={miniMapUsers}
              currentRoomId="posts"
              onRoomClick={handleRoomNavigation}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Posts;