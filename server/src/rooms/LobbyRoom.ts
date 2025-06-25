import { Room, Client, matchMaker } from 'colyseus';
import { LobbyState } from '../schemas/LobbyState';
import { User } from '../schemas/User';
import { RoomInfo } from '../schemas/RoomInfo';

interface JoinOptions {
  name?: string;
  avatar?: string;
}

export class LobbyRoom extends Room<LobbyState> {
  maxClients = 100;

  onCreate(options: any) {
    const state = new LobbyState();
    state.totalUsers = 0;
    state.currentCategory = 'all';
    state.lastActivity = Date.now();
    this.setState(state);

    // Handle messages from clients
    this.onMessage('move', (client, data) => {
      const user = this.state.users.get(client.sessionId);
      if (user) {
        user.x = data.x;
        user.y = data.y;
        user.lastActive = Date.now();
      }
    });

    this.onMessage('status', (client, data) => {
      const user = this.state.users.get(client.sessionId);
      if (user) {
        user.status = data.status;
        user.message = data.message || '';
        user.lastActive = Date.now();
      }
    });

    this.onMessage('chat', (client, message) => {
      this.broadcast('chat', {
        userId: client.sessionId,
        userName: this.state.users.get(client.sessionId)?.name || 'Anonymous',
        message,
        timestamp: Date.now()
      });
    });


    // Update room statistics every 5 seconds
    this.setSimulationInterval(async () => {
      try {
        const allRooms = await matchMaker.query({});
        
        // Reset all room counts
        this.state.rooms.clear();
        
        // Define room names mapping
        const roomNames: { [key: string]: string } = {
          'lobby': 'Home',
          'page_about': 'About',
          'page_portfolio': 'Portfolio',
          'page_experience': 'Experience',
          'page_categories': 'Categories',
          'page_posts': 'Posts'
        };
        
        // Count users per room type
        const roomCounts: { [key: string]: number } = {};
        
        allRooms.forEach((room) => {
          const roomType = room.name;
          if (!roomCounts[roomType]) {
            roomCounts[roomType] = 0;
          }
          roomCounts[roomType] += room.clients;
        });
        
        // Update room info
        Object.entries(roomCounts).forEach(([roomType, count]) => {
          const roomInfo = new RoomInfo();
          roomInfo.roomId = roomType;
          roomInfo.roomName = roomNames[roomType] || roomType;
          roomInfo.userCount = count;
          roomInfo.lastUpdated = Date.now();
          
          this.state.rooms.set(roomType, roomInfo);
        });
        
        // Also add any defined rooms with 0 users if not present
        Object.entries(roomNames).forEach(([roomId, roomName]) => {
          if (!this.state.rooms.has(roomId)) {
            const roomInfo = new RoomInfo();
            roomInfo.roomId = roomId;
            roomInfo.roomName = roomName;
            roomInfo.userCount = 0;
            roomInfo.lastUpdated = Date.now();
            
            this.state.rooms.set(roomId, roomInfo);
          }
        });
        
      } catch (error) {
        console.error('Error querying rooms:', error);
      }
    }, 5000);

    // Clean up inactive users every 30 seconds
    this.setSimulationInterval(() => {
      const now = Date.now();
      const timeout = 60000; // 1 minute

      this.state.users.forEach((user, key) => {
        if (now - user.lastActive > timeout) {
          this.state.users.delete(key);
        }
      });

      this.state.totalUsers = this.state.users.size;
      this.state.lastActivity = now;
    }, 30000);
  }

  onJoin(client: Client, options: JoinOptions) {
    console.log(`${client.sessionId} joined LobbyRoom`);
    
    const user = new User();
    user.id = client.sessionId;
    user.name = options.name || `User${Math.floor(Math.random() * 1000)}`;
    user.x = Math.floor(Math.random() * 800);
    user.y = Math.floor(Math.random() * 600);
    user.status = 'idle';
    user.message = '';
    user.lastActive = Date.now();

    this.state.users.set(client.sessionId, user);
    this.state.totalUsers = this.state.users.size;

    // Send welcome message
    client.send('welcome', {
      userId: client.sessionId,
      message: 'Welcome to Realtime Stories!'
    });
  }

  onLeave(client: Client, consented: boolean) {
    console.log(`${client.sessionId} left LobbyRoom (consented: ${consented})`);
    
    // Always remove user when they leave
    this.state.users.delete(client.sessionId);
    this.state.totalUsers = this.state.users.size;
    
    console.log(`Users remaining: ${this.state.totalUsers}`);
  }

  onDispose() {
    console.log('LobbyRoom disposed');
  }
}