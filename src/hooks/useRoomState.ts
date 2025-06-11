import { useState, useEffect } from 'react';
import { Room } from 'colyseus.js';

export interface User {
  id: string;
  name: string;
  x: number;
  y: number;
  avatar: string;
  status: string;
  message: string;
  lastActive: number;
}

export interface LobbyState {
  users: { [key: string]: User };
  totalUsers: number;
  currentCategory: string;
  lastActivity: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
  isTyping: boolean;
}

export interface PostState {
  users: { [key: string]: User };
  postId: string;
  postTitle: string;
  viewCount: number;
  comments: Comment[];
  lastActivity: number;
}

export const useLobbyState = (room: Room | null) => {
  const [state, setState] = useState<LobbyState | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!room) {
      setState(null);
      setUsers([]);
      return;
    }

    const handleStateChange = (newState: any) => {
      // Handle MapSchema properly
      const userArray: User[] = [];
      if (newState.users) {
        newState.users.forEach((user: User) => {
          userArray.push(user);
        });
      }
      
      setState(newState);
      setUsers(userArray);
    };

    room.onStateChange(handleStateChange);
    
    // Get initial state
    if (room.state) {
      handleStateChange(room.state);
    }
    
    // Handle user changes - these might not be needed if onStateChange handles everything

    return () => {
      room.removeAllListeners();
    };
  }, [room]);

  return { state, users };
};

export const usePostState = (room: Room | null) => {
  const [state, setState] = useState<PostState | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (!room) {
      setState(null);
      setUsers([]);
      setComments([]);
      return;
    }

    const handleStateChange = (newState: PostState) => {
      setState(newState);
      setUsers(Object.values(newState.users || {}));
      setComments(newState.comments || []);
    };

    room.onStateChange(handleStateChange);

    // Handle user changes
    room.state?.users?.onAdd((user: User, key: string) => {
      setUsers(prev => [...prev.filter(u => u.id !== key), user]);
    });

    room.state?.users?.onRemove((user: User, key: string) => {
      setUsers(prev => prev.filter(u => u.id !== key));
    });

    room.state?.users?.onChange((user: User, key: string) => {
      setUsers(prev => prev.map(u => u.id === key ? user : u));
    });

    // Handle comment changes
    room.state?.comments?.onAdd((comment: Comment, index: number) => {
      setComments(prev => [...prev, comment]);
    });

    room.state?.comments?.onRemove((comment: Comment, index: number) => {
      setComments(prev => prev.filter((_, i) => i !== index));
    });

    return () => {
      room.removeAllListeners();
    };
  }, [room]);

  return { state, users, comments };
};