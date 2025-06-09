import { Room, Client } from 'colyseus';
import { LobbyState } from '../schemas/LobbyState';
import { User } from '../schemas/User';

interface JoinOptions {
  name?: string;
  avatar?: string;
}

export class LobbyRoom extends Room<LobbyState> {
  maxClients = 100;

  onCreate(options: any) {
    this.setState(new LobbyState());

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
    
    const user = new User(
      client.sessionId,
      options.name || `User${Math.floor(Math.random() * 1000)}`
    );
    
    if (options.avatar) {
      user.avatar = options.avatar;
    }

    // Set random initial position
    user.x = Math.floor(Math.random() * 800);
    user.y = Math.floor(Math.random() * 600);

    this.state.users.set(client.sessionId, user);
    this.state.totalUsers = this.state.users.size;

    // Send welcome message
    client.send('welcome', {
      userId: client.sessionId,
      message: 'Welcome to Realtime Stories!'
    });
  }

  onLeave(client: Client, consented: boolean) {
    console.log(`${client.sessionId} left LobbyRoom`);
    
    if (consented) {
      this.state.users.delete(client.sessionId);
    } else {
      // Mark user as disconnected, will be removed after timeout
      const user = this.state.users.get(client.sessionId);
      if (user) {
        user.status = 'disconnected';
      }
    }
    
    this.state.totalUsers = this.state.users.size;
  }

  onDispose() {
    console.log('LobbyRoom disposed');
  }
}