import { matchMaker } from 'colyseus';

export interface RoomStats {
  roomId: string;
  roomType: string;
  userCount: number;
  lastUpdated: number;
}

export class RoomStatsService {
  private static instance: RoomStatsService;
  private roomStats: Map<string, RoomStats> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(stats: Map<string, RoomStats>) => void> = new Set();

  private constructor() {}

  static getInstance(): RoomStatsService {
    if (!RoomStatsService.instance) {
      RoomStatsService.instance = new RoomStatsService();
    }
    return RoomStatsService.instance;
  }

  start() {
    if (this.updateInterval) return;

    // Update room stats every 3 seconds
    this.updateInterval = setInterval(async () => {
      try {
        await this.updateRoomStats();
      } catch (error) {
        console.error('Failed to update room stats:', error);
      }
    }, 3000);
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private async updateRoomStats() {
    const rooms = await matchMaker.query({});
    const newStats = new Map<string, RoomStats>();

    console.log('=== Room Stats Update ===');
    console.log('Total rooms found:', rooms.length);

    // Process each room
    rooms.forEach(room => {
      console.log(`Room ID: ${room.roomId}, Clients: ${room.clients}, Name: ${room.name}`);
      
      let roomType = 'other';
      
      if (room.name === 'lobby' || room.roomId.includes('lobby')) {
        roomType = 'home';
      } else if (room.name && room.name.startsWith('page_')) {
        roomType = room.name.split('_')[1];
      } else if (room.roomId.includes('page_')) {
        roomType = room.roomId.split('_')[1];
      } else if (room.name === 'post' || room.roomId.includes('post_')) {
        roomType = 'post';
      }

      console.log(`  -> Classified as: ${roomType}`);

      // Aggregate by room type
      const existing = newStats.get(roomType);
      const userCount = existing ? existing.userCount + room.clients : room.clients;

      newStats.set(roomType, {
        roomId: roomType,
        roomType,
        userCount,
        lastUpdated: Date.now()
      });
    });

    // Add pages with 0 users
    const allPages = ['home', 'about', 'portfolio', 'experience', 'categories', 'posts'];
    allPages.forEach(page => {
      if (!newStats.has(page)) {
        newStats.set(page, {
          roomId: page,
          roomType: page,
          userCount: 0,
          lastUpdated: Date.now()
        });
      }
    });

    console.log('Final stats:', Array.from(newStats.entries()));
    console.log('=========================');

    this.roomStats = newStats;
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      listener(this.roomStats);
    });
  }

  addListener(listener: (stats: Map<string, RoomStats>) => void) {
    this.listeners.add(listener);
    // Send current stats immediately
    listener(this.roomStats);
  }

  removeListener(listener: (stats: Map<string, RoomStats>) => void) {
    this.listeners.delete(listener);
  }

  getRoomStats(): Map<string, RoomStats> {
    return new Map(this.roomStats);
  }

  getRoomUserCount(roomType: string): number {
    const stats = this.roomStats.get(roomType);
    return stats ? stats.userCount : 0;
  }
}

export default RoomStatsService;