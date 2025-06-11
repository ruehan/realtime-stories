import { Client, Room } from 'colyseus.js';

export interface ConnectionConfig {
  url: string;
  reconnectAttempts: number;
  reconnectDelay: number;
}

export interface RoomOptions {
  name?: string;
  avatar?: string;
  postId?: string;
  postTitle?: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export class ColyseusService {
  private client: Client;
  private config: ConnectionConfig;
  private reconnectAttempts = 0;
  private reconnectTimer?: NodeJS.Timeout;
  private connectionListeners: Array<(status: ConnectionStatus) => void> = [];

  constructor(config: ConnectionConfig) {
    this.config = config;
    this.client = new Client(config.url);
  }

  addConnectionListener(listener: (status: ConnectionStatus) => void): () => void {
    this.connectionListeners.push(listener);
    return () => {
      const index = this.connectionListeners.indexOf(listener);
      if (index > -1) {
        this.connectionListeners.splice(index, 1);
      }
    };
  }

  private notifyConnectionStatus(status: ConnectionStatus): void {
    this.connectionListeners.forEach(listener => listener(status));
  }

  async joinLobby(options: RoomOptions = {}): Promise<Room> {
    try {
      this.notifyConnectionStatus('connecting');
      const room = await this.client.joinOrCreate('lobby', options);
      this.setupRoomHandlers(room);
      this.notifyConnectionStatus('connected');
      this.reconnectAttempts = 0;
      return room;
    } catch (error) {
      console.error('Failed to join lobby:', error);
      this.notifyConnectionStatus('error');
      throw error;
    }
  }

  async joinPage(pageId: string, options: RoomOptions = {}): Promise<Room> {
    try {
      this.notifyConnectionStatus('connecting');
      const room = await this.client.joinOrCreate('page', { 
        ...options, 
        pageId 
      });
      this.setupRoomHandlers(room);
      this.notifyConnectionStatus('connected');
      this.reconnectAttempts = 0;
      return room;
    } catch (error) {
      console.error('Failed to join page room:', error);
      this.notifyConnectionStatus('error');
      throw error;
    }
  }

  async joinPost(postId: string, options: RoomOptions = {}): Promise<Room> {
    try {
      this.notifyConnectionStatus('connecting');
      const room = await this.client.joinOrCreate('post', { 
        ...options, 
        postId,
        postTitle: options.postTitle 
      });
      this.setupRoomHandlers(room);
      this.notifyConnectionStatus('connected');
      this.reconnectAttempts = 0;
      return room;
    } catch (error) {
      console.error('Failed to join post room:', error);
      this.notifyConnectionStatus('error');
      throw error;
    }
  }

  private setupRoomHandlers(room: Room): void {
    room.onError((code, message) => {
      console.error('Room error:', code, message);
      this.notifyConnectionStatus('error');
    });

    room.onLeave((code) => {
      console.log('Left room with code:', code);
      this.notifyConnectionStatus('disconnected');
      
      if (code !== 1000) { // Not a normal closure
        this.attemptReconnect(room);
      }
    });

    room.onStateChange((state) => {
      // State changes are handled by components using the room
    });
  }

  private async attemptReconnect(originalRoom: Room): Promise<void> {
    if (this.reconnectAttempts >= this.config.reconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.notifyConnectionStatus('error');
      return;
    }

    this.reconnectAttempts++;
    this.notifyConnectionStatus('reconnecting');

    this.reconnectTimer = setTimeout(async () => {
      try {
        // Try to rejoin the same room type
        // This is a simplified approach - in a real app you'd want to store room info
        console.log(`Reconnection attempt ${this.reconnectAttempts}`);
        // The actual reconnection would be handled by the component using the service
      } catch (error) {
        console.error('Reconnection failed:', error);
        this.attemptReconnect(originalRoom);
      }
    }, this.config.reconnectDelay * this.reconnectAttempts);
  }

  async leaveRoom(room: Room): Promise<void> {
    try {
      await room.leave();
      this.clearReconnectTimer();
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }

  disconnect(): void {
    this.clearReconnectTimer();
    this.reconnectAttempts = 0;
    this.notifyConnectionStatus('disconnected');
  }

  getClient(): Client {
    return this.client;
  }
}