import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Room } from 'colyseus.js';
import { ColyseusService, ConnectionStatus, RoomOptions } from '../services/ColyseusService';

interface ColyseusContextType {
  service: ColyseusService;
  connectionStatus: ConnectionStatus;
  currentRoom: Room | null;
  lobbyRoom: Room | null;
  postRoom: Room | null;
  joinLobby: (options?: RoomOptions) => Promise<Room>;
  joinPost: (postId: string, options?: RoomOptions) => Promise<Room>;
  leaveCurrentRoom: () => Promise<void>;
  sendMessage: (type: string, data: any) => void;
}

const ColyseusContext = createContext<ColyseusContextType | null>(null);

interface ColyseusProviderProps {
  children: ReactNode;
  serverUrl?: string;
}

export const ColyseusProvider: React.FC<ColyseusProviderProps> = ({ 
  children, 
  serverUrl = 'ws://localhost:2567' 
}) => {
  const [service] = useState(() => new ColyseusService({
    url: serverUrl,
    reconnectAttempts: 5,
    reconnectDelay: 1000
  }));
  
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [lobbyRoom, setLobbyRoom] = useState<Room | null>(null);
  const [postRoom, setPostRoom] = useState<Room | null>(null);
  const [isJoiningLobby, setIsJoiningLobby] = useState(false);
  const [isJoiningPost, setIsJoiningPost] = useState(false);

  useEffect(() => {
    const removeListener = service.addConnectionListener(setConnectionStatus);
    return removeListener;
  }, [service]);

  const joinLobby = async (options: RoomOptions = {}): Promise<Room> => {
    // Prevent duplicate connections
    if (isJoiningLobby || lobbyRoom) {
      if (lobbyRoom) return lobbyRoom;
      throw new Error('Already joining lobby');
    }

    setIsJoiningLobby(true);
    try {
      const room = await service.joinLobby(options);
      setLobbyRoom(room);
      setCurrentRoom(room);
      
      // Clean up previous post room if exists
      if (postRoom) {
        await service.leaveRoom(postRoom);
        setPostRoom(null);
      }
      
      return room;
    } catch (error) {
      console.error('Failed to join lobby:', error);
      throw error;
    } finally {
      setIsJoiningLobby(false);
    }
  };

  const joinPost = async (postId: string, options: RoomOptions = {}): Promise<Room> => {
    // Prevent duplicate connections
    if (isJoiningPost || (postRoom && postRoom.roomId === postId)) {
      if (postRoom && postRoom.roomId === postId) return postRoom;
      throw new Error('Already joining post');
    }

    setIsJoiningPost(true);
    try {
      const room = await service.joinPost(postId, options);
      setPostRoom(room);
      setCurrentRoom(room);
      
      // Keep lobby room open but set post room as current
      return room;
    } catch (error) {
      console.error('Failed to join post:', error);
      throw error;
    } finally {
      setIsJoiningPost(false);
    }
  };

  const leaveCurrentRoom = async (): Promise<void> => {
    if (currentRoom) {
      await service.leaveRoom(currentRoom);
      
      if (currentRoom === lobbyRoom) {
        setLobbyRoom(null);
        setIsJoiningLobby(false);
      } else if (currentRoom === postRoom) {
        setPostRoom(null);
        setIsJoiningPost(false);
        // Switch back to lobby if it exists
        if (lobbyRoom) {
          setCurrentRoom(lobbyRoom);
        }
      }
      
      if (!lobbyRoom && !postRoom) {
        setCurrentRoom(null);
      }
    }
  };

  const sendMessage = (type: string, data: any): void => {
    if (currentRoom) {
      currentRoom.send(type, data);
    } else {
      console.warn('No active room to send message to');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      service.disconnect();
    };
  }, [service]);

  const contextValue: ColyseusContextType = {
    service,
    connectionStatus,
    currentRoom,
    lobbyRoom,
    postRoom,
    joinLobby,
    joinPost,
    leaveCurrentRoom,
    sendMessage
  };

  return (
    <ColyseusContext.Provider value={contextValue}>
      {children}
    </ColyseusContext.Provider>
  );
};

export const useColyseus = (): ColyseusContextType => {
  const context = useContext(ColyseusContext);
  if (!context) {
    throw new Error('useColyseus must be used within a ColyseusProvider');
  }
  return context;
};