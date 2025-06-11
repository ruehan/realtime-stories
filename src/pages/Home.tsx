import React, { useEffect, useState } from 'react';
import { useColyseus } from '../contexts/ColyseusContext';
import { useLobbyState } from '../hooks/useRoomState';
import { useErrorHandler } from '../hooks/useErrorHandler';
import OnlineUsers from '../components/OnlineUsers';
import MiniMap from '../components/MiniMap';
import useMiniMapData from '../hooks/useMiniMapData';
import useRoomStats from '../hooks/useRoomStats';

const Home: React.FC = () => {
  const { joinLobby, lobbyRoom, connectionStatus, service } = useColyseus();
  const { state, users } = useLobbyState(lobbyRoom);
  const { handleConnectionError } = useErrorHandler();
  const [isJoining, setIsJoining] = useState(false);
  const [userName, setUserName] = useState(`User${Math.floor(Math.random() * 1000)}`);
  
  // Get global room stats from API
  const { roomStats } = useRoomStats();
  
  // MiniMap data - use API room stats for global room counts
  const { rooms, users: miniMapUsers } = useMiniMapData(users, 'home', roomStats);
  
  

  // Handle room navigation from minimap
  const handleRoomNavigation = async (roomId: string) => {
    if (roomId === 'home') return; // Already in home
    
    try {
      // Leave lobby before navigating to other pages
      if (lobbyRoom) {
        await service.leaveRoom(lobbyRoom);
      }
      
      // Navigate to the target page
      switch (roomId) {
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
        case 'posts':
          window.location.href = '/posts';
          break;
        default:
          console.log(`Navigating to room: ${roomId}`);
      }
    } catch (error) {
      console.error('Failed to leave lobby before navigation:', error);
      // Navigate anyway
      window.location.href = `/${roomId}`;
    }
  };

  const handleJoinLobby = async () => {
    setIsJoining(true);
    try {
      await joinLobby({ name: userName });
    } catch (error) {
      handleConnectionError(500, 'Failed to join lobby');
    } finally {
      setIsJoining(false);
    }
  };

  // Auto-join lobby on mount
  useEffect(() => {
    if (connectionStatus === 'disconnected' && !lobbyRoom && !isJoining) {
      handleJoinLobby();
    }
    
    // Leave lobby when unmounting (navigating away)
    return () => {
      if (lobbyRoom) {
        console.log('Leaving lobby...');
      }
    };
  }, [connectionStatus, lobbyRoom]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to Realtime Stories</h1>
          <p className="text-lg text-gray-700 mb-6">
            A modern development blog sharing insights, experiences, and projects.
          </p>
          
          {/* Connection Test Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Real-time Connection Test</h2>
            
            <div className="flex items-center space-x-4 mb-4">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your name"
                className="border border-gray-300 rounded px-3 py-2"
                disabled={connectionStatus === 'connected'}
              />
              {!lobbyRoom ? (
                <button
                  onClick={handleJoinLobby}
                  disabled={isJoining}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isJoining ? 'Joining...' : 'Join Lobby'}
                </button>
              ) : (
                <span className="text-green-600 font-medium">Connected to Lobby!</span>
              )}
            </div>

            {state && (
              <div className="text-sm text-gray-600">
                <p>Current Category: {state.currentCategory}</p>
                <p>Last Activity: {new Date(state.lastActivity).toLocaleTimeString()}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">Latest Features</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-medium">Real-time User Presence</h3>
                  <p className="text-gray-600">See who's online and what they're doing in real-time</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-medium">Live Comments</h3>
                  <p className="text-gray-600">Interactive commenting system with real-time updates</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-medium">Collaborative Reading</h3>
                  <p className="text-gray-600">Share your reading experience with others</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <h3 className="font-medium">Interactive Building Map</h3>
                  <p className="text-gray-600">Navigate through the blog like exploring a building</p>
                </div>
              </div>
            </div>

            {/* MiniMap Component */}
            <div className="bg-white rounded-lg shadow">
              <MiniMap
                rooms={rooms}
                users={miniMapUsers}
                currentRoomId="home"
                onRoomClick={handleRoomNavigation}
                className="w-full"
              />
            </div>
          </div>

          <div className="xl:col-span-1">
            <OnlineUsers users={users} currentUserId={lobbyRoom?.sessionId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;