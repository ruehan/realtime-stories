export interface RoomStats {
    roomId: string;
    roomType: string;
    userCount: number;
    lastUpdated: number;
}
export declare class RoomStatsService {
    private static instance;
    private roomStats;
    private updateInterval;
    private listeners;
    private constructor();
    static getInstance(): RoomStatsService;
    start(): void;
    stop(): void;
    private updateRoomStats;
    private notifyListeners;
    addListener(listener: (stats: Map<string, RoomStats>) => void): void;
    removeListener(listener: (stats: Map<string, RoomStats>) => void): void;
    getRoomStats(): Map<string, RoomStats>;
    getRoomUserCount(roomType: string): number;
}
export default RoomStatsService;
