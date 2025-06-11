import { Room, Client } from 'colyseus';
import { LobbyState } from '../schemas/LobbyState';
import { User } from '../schemas/User';

interface JoinOptions {
  name?: string;
  avatar?: string;
  pageId: string;
}

export class PageRoom extends Room<LobbyState> {
  maxClients = 50;
  pageId: string = '';

  onCreate(options: any) {
    const state = new LobbyState();
    state.totalUsers = 0;
    state.currentCategory = options.pageId || 'page';
    state.lastActivity = Date.now();
    this.setState(state);
    
    this.pageId = options.pageId || '';
    console.log(`PageRoom created for: ${this.pageId}`);

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

    // Clean up inactive users every 30 seconds
    this.setSimulationInterval(() => {
      const now = Date.now();
      const timeout = 60000; // 1 minute

      this.state.users.forEach((user, key) => {
        if (now - user.lastActive > timeout || user.status === 'disconnected') {
          this.state.users.delete(key);
        }
      });

      this.state.totalUsers = this.state.users.size;
      this.state.lastActivity = now;
    }, 30000);
  }

  onJoin(client: Client, options: JoinOptions) {
    console.log(`${client.sessionId} joined PageRoom: ${this.pageId}`);
    
    const user = new User();
    user.id = client.sessionId;
    user.name = options.name || `User${Math.floor(Math.random() * 1000)}`;
    user.x = Math.floor(Math.random() * 800);
    user.y = Math.floor(Math.random() * 600);
    user.status = 'browsing';
    user.message = '';
    user.lastActive = Date.now();

    this.state.users.set(client.sessionId, user);
    this.state.totalUsers = this.state.users.size;
  }

  onLeave(client: Client, consented: boolean) {
    console.log(`${client.sessionId} left PageRoom: ${this.pageId} (consented: ${consented})`);
    
    // Always remove user when they leave
    this.state.users.delete(client.sessionId);
    this.state.totalUsers = this.state.users.size;
    
    console.log(`Users remaining in ${this.pageId}: ${this.state.totalUsers}`);
  }

  onDispose() {
    console.log(`PageRoom ${this.pageId} disposed`);
  }
}