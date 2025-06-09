import React from 'react';
import MiniMap from '../components/MiniMap';
import useMiniMapData from '../hooks/useMiniMapData';

const About: React.FC = () => {
  // Simulate some users in this room for demo
  const mockUsers = [
    { id: 'about-user-1', name: 'Visitor1', status: 'reading' },
    { id: 'about-user-2', name: 'Visitor2', status: 'reading' }
  ];
  
  const { rooms, users: miniMapUsers } = useMiniMapData(mockUsers, 'about');

  const handleRoomNavigation = (roomId: string) => {
    switch (roomId) {
      case 'home':
        window.location.href = '/';
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
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">About</h1>
        <p className="text-lg text-gray-700 mb-8">
          Learn more about the developer behind Realtime Stories.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">About Me</h2>
            <p className="text-gray-700 mb-4">
              I'm a passionate developer who loves creating interactive and engaging web experiences. 
              This blog showcases my journey in web development, featuring real-time collaboration 
              and innovative user interfaces.
            </p>
            <p className="text-gray-700">
              The Realtime Stories platform demonstrates cutting-edge technologies like WebSockets, 
              real-time collaboration, and interactive visualizations.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <MiniMap
              rooms={rooms}
              users={miniMapUsers}
              currentRoomId="about"
              onRoomClick={handleRoomNavigation}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;