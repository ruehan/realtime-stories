import { useEffect, useState, useCallback } from 'react';
import { Room } from 'colyseus.js';
import { useColyseus } from '../contexts/ColyseusContext';

interface UseRoomOptions {
  onStateChange?: (state: any) => void;
  onMessage?: (type: string, message: any) => void;
  onError?: (code: number, message?: string) => void;
  onLeave?: (code: number) => void;
}

export const useRoom = (room: Room | null, options: UseRoomOptions = {}) => {
  const [state, setState] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!room) {
      setState(null);
      setIsConnected(false);
      return;
    }

    setIsConnected(true);
    setState(room.state);

    const handleStateChange = (newState: any) => {
      setState(newState);
      options.onStateChange?.(newState);
    };

    const handleMessage = (type: string | number, message: any) => {
      options.onMessage?.(String(type), message);
    };

    const handleError = (code: number, message?: string) => {
      setIsConnected(false);
      options.onError?.(code, message);
    };

    const handleLeave = (code: number) => {
      setIsConnected(false);
      options.onLeave?.(code);
    };

    room.onStateChange(handleStateChange);
    room.onMessage('*', handleMessage);
    room.onError(handleError);
    room.onLeave(handleLeave);

    return () => {
      room.removeAllListeners();
    };
  }, [room, options]);

  const sendMessage = useCallback((type: string, data: any) => {
    if (room && isConnected) {
      room.send(type, data);
    }
  }, [room, isConnected]);

  return {
    state,
    isConnected,
    sendMessage,
    room
  };
};

export const useLobbyRoom = (options: UseRoomOptions = {}) => {
  const { lobbyRoom } = useColyseus();
  return useRoom(lobbyRoom, options);
};

export const usePostRoom = (options: UseRoomOptions = {}) => {
  const { postRoom } = useColyseus();
  return useRoom(postRoom, options);
};