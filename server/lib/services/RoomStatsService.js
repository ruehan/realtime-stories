"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomStatsService = void 0;
const colyseus_1 = require("colyseus");
class RoomStatsService {
    constructor() {
        this.roomStats = new Map();
        this.updateInterval = null;
        this.listeners = new Set();
    }
    static getInstance() {
        if (!RoomStatsService.instance) {
            RoomStatsService.instance = new RoomStatsService();
        }
        return RoomStatsService.instance;
    }
    start() {
        if (this.updateInterval)
            return;
        this.updateInterval = setInterval(async () => {
            try {
                await this.updateRoomStats();
            }
            catch (error) {
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
    async updateRoomStats() {
        const rooms = await colyseus_1.matchMaker.query({});
        const newStats = new Map();
        console.log('=== Room Stats Update ===');
        console.log('Total rooms found:', rooms.length);
        rooms.forEach(room => {
            console.log(`Room ID: ${room.roomId}, Clients: ${room.clients}, Name: ${room.name}`);
            let roomType = 'other';
            if (room.name === 'lobby' || room.roomId.includes('lobby')) {
                roomType = 'home';
            }
            else if (room.name && room.name.startsWith('page_')) {
                roomType = room.name.split('_')[1];
            }
            else if (room.roomId.includes('page_')) {
                roomType = room.roomId.split('_')[1];
            }
            else if (room.name === 'post' || room.roomId.includes('post_')) {
                roomType = 'post';
            }
            console.log(`  -> Classified as: ${roomType}`);
            const existing = newStats.get(roomType);
            const userCount = existing ? existing.userCount + room.clients : room.clients;
            newStats.set(roomType, {
                roomId: roomType,
                roomType,
                userCount,
                lastUpdated: Date.now()
            });
        });
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
    notifyListeners() {
        this.listeners.forEach(listener => {
            listener(this.roomStats);
        });
    }
    addListener(listener) {
        this.listeners.add(listener);
        listener(this.roomStats);
    }
    removeListener(listener) {
        this.listeners.delete(listener);
    }
    getRoomStats() {
        return new Map(this.roomStats);
    }
    getRoomUserCount(roomType) {
        const stats = this.roomStats.get(roomType);
        return stats ? stats.userCount : 0;
    }
}
exports.RoomStatsService = RoomStatsService;
exports.default = RoomStatsService;
//# sourceMappingURL=RoomStatsService.js.map