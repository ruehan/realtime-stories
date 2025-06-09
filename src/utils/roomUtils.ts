import { User, Comment } from '../hooks/useRoomState';

export const formatUserName = (user: User): string => {
  return user.name || 'Anonymous';
};

export const getUserStatus = (user: User): string => {
  const now = Date.now();
  const timeDiff = now - user.lastActive;
  
  if (timeDiff > 60000) { // 1 minute
    return 'inactive';
  }
  
  return user.status || 'active';
};

export const getUserPosition = (user: User): { x: number; y: number } => {
  return { x: user.x || 0, y: user.y || 0 };
};

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  
  if (diffInMinutes < 1) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) { // 24 hours
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export const sortCommentsByTimestamp = (comments: Comment[]): Comment[] => {
  return [...comments].sort((a, b) => a.timestamp - b.timestamp);
};

export const filterActiveUsers = (users: User[]): User[] => {
  const now = Date.now();
  return users.filter(user => {
    const timeDiff = now - user.lastActive;
    return timeDiff < 300000; // 5 minutes
  });
};

export const getUserById = (users: User[], userId: string): User | undefined => {
  return users.find(user => user.id === userId);
};

export const getUsersCount = (users: User[]): number => {
  return filterActiveUsers(users).length;
};

export const generateUserColor = (userId: string): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'
  ];
  
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

export const isUserTyping = (user: User): boolean => {
  return user.status === 'typing';
};

export const getTypingUsers = (users: User[]): User[] => {
  return users.filter(isUserTyping);
};

export const formatTypingMessage = (typingUsers: User[]): string => {
  const count = typingUsers.length;
  
  if (count === 0) return '';
  if (count === 1) return `${formatUserName(typingUsers[0])} is typing...`;
  if (count === 2) return `${formatUserName(typingUsers[0])} and ${formatUserName(typingUsers[1])} are typing...`;
  
  return `${count} people are typing...`;
};

export const validateMessage = (message: string): boolean => {
  return message.trim().length > 0 && message.length <= 500;
};

export const sanitizeMessage = (message: string): string => {
  return message.trim().replace(/\s+/g, ' ');
};