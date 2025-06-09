import React, { useState, useRef } from 'react';
import HeatMapOverlay from './HeatMapOverlay';

interface Room {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  userCount: number;
  isActive?: boolean;
}

interface User {
  id: string;
  name: string;
  x: number;
  y: number;
  roomId?: string;
  status: string;
}

interface MiniMapProps {
  rooms: Room[];
  users: User[];
  currentRoomId?: string;
  onRoomClick?: (roomId: string) => void;
  className?: string;
  showHeatMap?: boolean;
}

const MiniMap: React.FC<MiniMapProps> = ({
  rooms,
  users,
  currentRoomId,
  onRoomClick,
  className = '',
  showHeatMap = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [heatMapEnabled, setHeatMapEnabled] = useState(showHeatMap);

  // Handle zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(0.5, scale + delta), 3);
    setScale(newScale);
  };

  // Handle pan start
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastPanPoint({ x: e.clientX, y: e.clientY });
  };

  // Handle pan
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const dx = e.clientX - lastPanPoint.x;
    const dy = e.clientY - lastPanPoint.y;
    
    setViewBox(prev => ({
      ...prev,
      x: prev.x - dx / scale,
      y: prev.y - dy / scale
    }));
    
    setLastPanPoint({ x: e.clientX, y: e.clientY });
  };

  // Handle pan end
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Get room color based on user count and activity
  const getRoomColor = (room: Room) => {
    if (room.id === currentRoomId) return '#3b82f6'; // Blue for current room
    if (room.userCount === 0) return '#e5e7eb'; // Gray for empty rooms
    if (room.userCount > 10) return '#ef4444'; // Red for crowded rooms
    if (room.userCount > 5) return '#f59e0b'; // Orange for busy rooms
    return '#10b981'; // Green for normal activity
  };

  // Get user color based on status
  const getUserColor = (user: User) => {
    switch (user.status) {
      case 'reading': return '#3b82f6';
      case 'writing': return '#8b5cf6';
      case 'idle': return '#6b7280';
      default: return '#10b981';
    }
  };

  return (
    <div className={`minimap-container ${className}`}>
      <div className="minimap-header flex justify-between items-center p-2 bg-gray-100 border-b">
        <h3 className="text-sm font-semibold">Building Map</h3>
        <div className="minimap-controls flex gap-2">
          <button
            onClick={() => setScale(Math.min(scale * 1.2, 3))}
            className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-50"
          >
            +
          </button>
          <span className="px-2 py-1 text-xs">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale(Math.max(scale / 1.2, 0.5))}
            className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-50"
          >
            -
          </button>
          <button
            onClick={() => setHeatMapEnabled(!heatMapEnabled)}
            className={`px-2 py-1 text-xs border rounded ${
              heatMapEnabled 
                ? 'bg-blue-500 text-white border-blue-500' 
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            Heat
          </button>
        </div>
      </div>
      
      <div className="minimap-viewport relative overflow-hidden bg-gray-50" style={{ height: '400px' }}>
        <svg
          ref={svgRef}
          className="w-full h-full cursor-move"
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width / scale} ${viewBox.height / scale}`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid background */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#d1d5db" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Building outline */}
          <rect
            x="50"
            y="50"
            width="700"
            height="500"
            fill="none"
            stroke="#374151"
            strokeWidth="3"
            rx="10"
          />
          
          {/* Rooms */}
          {rooms.map((room) => (
            <g key={room.id}>
              <rect
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.height}
                fill={getRoomColor(room)}
                stroke="#374151"
                strokeWidth="2"
                rx="5"
                className="cursor-pointer transition-opacity duration-200"
                style={{ opacity: hoveredRoom === room.id ? 0.8 : 1 }}
                onMouseEnter={() => setHoveredRoom(room.id)}
                onMouseLeave={() => setHoveredRoom(null)}
                onClick={() => onRoomClick?.(room.id)}
              />
              
              {/* Room label */}
              <text
                x={room.x + room.width / 2}
                y={room.y + room.height / 2 - 5}
                textAnchor="middle"
                className="text-xs font-medium fill-white"
                style={{ pointerEvents: 'none' }}
              >
                {room.title.length > 20 ? `${room.title.substring(0, 20)}...` : room.title}
              </text>
              
              {/* User count */}
              <text
                x={room.x + room.width / 2}
                y={room.y + room.height / 2 + 10}
                textAnchor="middle"
                className="text-xs fill-white"
                style={{ pointerEvents: 'none' }}
              >
                {room.userCount} users
              </text>
            </g>
          ))}
          
          {/* Heat Map Overlay */}
          {heatMapEnabled && (
            <HeatMapOverlay
              users={users}
              width={800}
              height={600}
              gridSize={60}
              opacity={0.4}
            />
          )}

          {/* User avatars */}
          {users.map((user) => (
            <g key={user.id}>
              <circle
                cx={user.x}
                cy={user.y}
                r="6"
                fill={getUserColor(user)}
                stroke="#fff"
                strokeWidth="2"
                className="transition-all duration-300"
              />
              
              {/* User name on hover */}
              <text
                x={user.x}
                y={user.y - 10}
                textAnchor="middle"
                className="text-xs fill-gray-800 opacity-0 hover:opacity-100 transition-opacity"
                style={{ pointerEvents: 'none' }}
              >
                {user.name}
              </text>
            </g>
          ))}
        </svg>
        
        {/* Tooltip */}
        {hoveredRoom && (
          <div className="absolute top-2 left-2 bg-black text-white text-xs rounded px-2 py-1 pointer-events-none">
            {rooms.find(r => r.id === hoveredRoom)?.title}
            <br />
            {rooms.find(r => r.id === hoveredRoom)?.userCount} users online
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="minimap-legend p-2 bg-gray-100 border-t">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Active</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>Busy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Crowded</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            <span>Empty</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniMap;