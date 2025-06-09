import { Room, Client } from 'colyseus';
import { PostState, Comment } from '../schemas/PostState';
import { User } from '../schemas/User';

interface JoinOptions {
  postId: string;
  postTitle?: string;
  name?: string;
  avatar?: string;
}

export class PostRoom extends Room<PostState> {
  maxClients = 50;

  onCreate(options: any) {
    this.setState(new PostState());
    
    if (options.postId) {
      this.state.postId = options.postId;
      this.state.postTitle = options.postTitle || 'Untitled Post';
    }

    // Handle cursor position updates
    this.onMessage('cursor', (client, data) => {
      const user = this.state.users.get(client.sessionId);
      if (user) {
        user.x = data.x;
        user.y = data.y;
        user.lastActive = Date.now();
      }
    });

    // Handle user status updates
    this.onMessage('status', (client, data) => {
      const user = this.state.users.get(client.sessionId);
      if (user) {
        user.status = data.status;
        user.lastActive = Date.now();
      }
    });

    // Handle comment typing indicator
    this.onMessage('typing', (client, data) => {
      this.broadcast('typing', {
        userId: client.sessionId,
        isTyping: data.isTyping
      }, { except: client });
    });

    // Handle new comments
    this.onMessage('comment', (client, data) => {
      const user = this.state.users.get(client.sessionId);
      if (user && data.content) {
        const comment = new Comment();
        comment.id = `${Date.now()}-${Math.random()}`;
        comment.userId = client.sessionId;
        comment.userName = user.name;
        comment.content = data.content;
        comment.timestamp = Date.now();
        
        this.state.comments.push(comment);
        
        // Broadcast to all clients
        this.broadcast('newComment', {
          comment: comment.toJSON()
        });
      }
    });

    // Handle reactions
    this.onMessage('reaction', (client, data) => {
      this.broadcast('reaction', {
        userId: client.sessionId,
        userName: this.state.users.get(client.sessionId)?.name || 'Anonymous',
        reaction: data.reaction,
        x: data.x,
        y: data.y
      });
    });

    // Update view count periodically
    this.setSimulationInterval(() => {
      this.state.viewCount = this.state.users.size;
      this.state.lastActivity = Date.now();
    }, 5000);
  }

  onJoin(client: Client, options: JoinOptions) {
    console.log(`${client.sessionId} joined PostRoom ${this.roomId}`);
    
    const user = new User(
      client.sessionId,
      options.name || `Reader${Math.floor(Math.random() * 1000)}`
    );
    
    if (options.avatar) {
      user.avatar = options.avatar;
    }

    // Set initial position
    user.x = Math.floor(Math.random() * 800);
    user.y = Math.floor(Math.random() * 600);
    user.status = 'reading';

    this.state.users.set(client.sessionId, user);
    this.state.viewCount = this.state.users.size;

    // Send existing comments to new user
    client.send('existingComments', {
      comments: this.state.comments.map(c => c.toJSON())
    });

    // Notify others of new user
    this.broadcast('userJoined', {
      userId: client.sessionId,
      userName: user.name
    }, { except: client });
  }

  onLeave(client: Client, consented: boolean) {
    console.log(`${client.sessionId} left PostRoom ${this.roomId}`);
    
    const user = this.state.users.get(client.sessionId);
    const userName = user?.name || 'Anonymous';
    
    this.state.users.delete(client.sessionId);
    this.state.viewCount = this.state.users.size;

    // Notify others of user leaving
    this.broadcast('userLeft', {
      userId: client.sessionId,
      userName
    });
  }

  onDispose() {
    console.log(`PostRoom ${this.roomId} disposed`);
  }
}