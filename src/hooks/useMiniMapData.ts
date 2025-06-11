import { useMemo } from 'react';
import { RoomStatsMap } from './useRoomStats';

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

// Mock data for demonstration - in real app this would come from your state/API
const mockPosts = [
  { id: 'home', title: 'Home Lobby', category: 'general' },
  { id: 'about', title: 'About Me', category: 'personal' },
  { id: 'portfolio', title: 'Portfolio', category: 'work' },
  { id: 'experience', title: 'Work Experience', category: 'work' },
  { id: 'categories', title: 'Categories', category: 'navigation' },
  { id: 'posts', title: 'Blog Posts', category: 'content' },
];

export const useMiniMapData = (currentUsers?: any[], currentRoomId?: string, roomStats?: RoomStatsMap) => {
  const rooms: Room[] = useMemo(() => {
    // Create a building layout with rooms positioned like floors and sections
    const roomsPerFloor = 3;
    const roomWidth = 120;
    const roomHeight = 80;
    const floorSpacing = 100;
    const roomSpacing = 140;
    const buildingPadding = 70;

    return mockPosts.map((post, index) => {
      const floor = Math.floor(index / roomsPerFloor);
      const roomInFloor = index % roomsPerFloor;
      
      const x = buildingPadding + roomInFloor * roomSpacing;
      const y = buildingPadding + floor * floorSpacing;
      
      // Get user count from room stats API, fallback to current users for current room
      let userCount = 0;
      if (roomStats && roomStats[post.id]) {
        userCount = roomStats[post.id].userCount || 0;
      } else if (post.id === currentRoomId && currentUsers && currentUsers.length > 0) {
        userCount = currentUsers.length;
      }
      
      return {
        id: post.id,
        title: post.title,
        x,
        y,
        width: roomWidth,
        height: roomHeight,
        userCount,
        isActive: post.id === currentRoomId
      };
    });
  }, [currentRoomId, currentUsers, roomStats]);

  // Generate user representations only for current room with actual users
  const users: User[] = useMemo(() => {
    if (!currentUsers || !currentRoomId || currentUsers.length === 0) return [];
    
    const currentRoom = rooms.find(r => r.id === currentRoomId);
    if (!currentRoom) return [];
    
    return currentUsers.map((user, index) => {
      // Position users in a circle within the current room
      const userCount = currentUsers.length;
      const angle = userCount > 1 ? (index / userCount) * 2 * Math.PI : 0;
      const radius = userCount > 1 ? Math.min(currentRoom.width, currentRoom.height) * 0.25 : 0;
      const centerX = currentRoom.x + currentRoom.width / 2;
      const centerY = currentRoom.y + currentRoom.height / 2;
      
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      return {
        id: user.id,
        name: user.name,
        x,
        y,
        roomId: currentRoomId,
        status: user.status || 'active'
      };
    });
  }, [rooms, currentUsers, currentRoomId]);

  return { rooms, users };
};

export default useMiniMapData;