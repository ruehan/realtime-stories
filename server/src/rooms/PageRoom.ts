import { Room, Client } from 'colyseus';
import { PageState } from '../schemas/PageState';
import { User } from '../schemas/User';
import { Cursor } from '../schemas/Cursor';
import { Comment } from '../schemas/Comment';

interface JoinOptions {
  name?: string;
  avatar?: string;
  pageId: string;
}

// Color palette for cursors
const CURSOR_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
];

export class PageRoom extends Room<PageState> {
  maxClients = 50;
  pageId: string = '';

  onCreate(options: any) {
    const state = new PageState();
    state.totalUsers = 0;
    state.pageId = options.pageId || 'page';
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

    // Handle cursor movement
    this.onMessage('cursor', (client, data) => {
      const cursor = this.state.cursors.get(client.sessionId);
      if (cursor) {
        cursor.x = data.x; // 퍼센트 값 (0~100, 가로 반응형)
        cursor.y = data.y; // 절대 픽셀 값 (세로 스크롤)
        cursor.currentPage = data.currentPage || this.pageId; // 현재 페이지 설정
        cursor.lastUpdate = Date.now();
        cursor.isActive = true;
        console.log(`[PageRoom ${this.pageId}] Cursor update from ${cursor.userName}: (${data.x.toFixed(1)}%, ${data.y}px) page: ${cursor.currentPage}`);
      } else {
        console.log(`[PageRoom ${this.pageId}] Cursor not found for client: ${client.sessionId}`);
      }
    });

    // Handle cursor hide (when mouse leaves the window)
    this.onMessage('cursor-hide', (client) => {
      const cursor = this.state.cursors.get(client.sessionId);
      if (cursor) {
        cursor.isActive = false;
        console.log(`[PageRoom ${this.pageId}] Cursor hidden for ${cursor.userName}`);
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

    // Handle comment creation
    this.onMessage('add-comment', (client, data) => {
      const user = this.state.users.get(client.sessionId);
      if (user && data.content && data.content.trim()) {
        const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const comment = new Comment();
        
        comment.id = commentId;
        comment.postId = data.postId || this.pageId;
        comment.authorId = client.sessionId;
        comment.authorName = user.name;
        comment.content = data.content.trim();
        comment.createdAt = Date.now();
        comment.updatedAt = Date.now();
        comment.isEdited = false;
        comment.authorColor = this.state.cursors.get(client.sessionId)?.color || '#3B82F6';
        
        this.state.comments.set(commentId, comment);
        console.log(`[PageRoom ${this.pageId}] Comment added by ${user.name}: ${data.content.substring(0, 50)}...`);
      }
    });

    // Handle comment deletion
    this.onMessage('delete-comment', (client, data) => {
      const comment = this.state.comments.get(data.commentId);
      if (comment && comment.authorId === client.sessionId) {
        this.state.comments.delete(data.commentId);
        console.log(`[PageRoom ${this.pageId}] Comment deleted: ${data.commentId}`);
      }
    });

    // Handle comment editing
    this.onMessage('edit-comment', (client, data) => {
      const comment = this.state.comments.get(data.commentId);
      if (comment && comment.authorId === client.sessionId && data.content && data.content.trim()) {
        comment.content = data.content.trim();
        comment.updatedAt = Date.now();
        comment.isEdited = true;
        console.log(`[PageRoom ${this.pageId}] Comment edited: ${data.commentId}`);
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
    
    // Create cursor for the user
    const cursor = new Cursor();
    cursor.userId = client.sessionId;
    cursor.userName = user.name;
    cursor.x = 0;
    cursor.y = 0;
    cursor.color = CURSOR_COLORS[this.state.cursors.size % CURSOR_COLORS.length];
    cursor.lastUpdate = Date.now();
    cursor.isActive = false;
    cursor.currentPage = this.pageId; // 초기값을 룸의 pageId로 설정
    
    this.state.cursors.set(client.sessionId, cursor);
    this.state.totalUsers = this.state.users.size;
    
    console.log(`[PageRoom ${this.pageId}] Cursor created for ${user.name} with color ${cursor.color}`);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(`${client.sessionId} left PageRoom: ${this.pageId} (consented: ${consented})`);
    
    // Always remove user and cursor when they leave
    const cursor = this.state.cursors.get(client.sessionId);
    if (cursor) {
      console.log(`[PageRoom ${this.pageId}] Removing cursor for ${cursor.userName}`);
    }
    
    this.state.users.delete(client.sessionId);
    this.state.cursors.delete(client.sessionId);
    this.state.totalUsers = this.state.users.size;
    
    console.log(`Users remaining in ${this.pageId}: ${this.state.totalUsers}`);
  }

  onDispose() {
    console.log(`PageRoom ${this.pageId} disposed`);
  }
}