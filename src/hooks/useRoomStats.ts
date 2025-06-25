import { useState, useEffect } from 'react';

export interface RoomStats {
  roomType: string;
  userCount: number;
  lastUpdated: number;
}

export interface RoomStatsMap {
  [key: string]: RoomStats;
}

export const useRoomStats = (serverUrl: string = 'http://192.168.219.105:2567') => {
  const [roomStats, setRoomStats] = useState<RoomStatsMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchRoomStats = async () => {
      try {
        const response = await fetch(`${serverUrl}/api/room-stats`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Room stats from API:', data);
        setRoomStats(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch room stats:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch immediately
    fetchRoomStats();

    // Then fetch every 3 seconds
    intervalId = setInterval(fetchRoomStats, 3000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [serverUrl]);

  const getRoomUserCount = (roomType: string): number => {
    return roomStats[roomType]?.userCount || 0;
  };

  return {
    roomStats,
    isLoading,
    error,
    getRoomUserCount
  };
};

export default useRoomStats;