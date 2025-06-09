import React from 'react';
import { User } from '../hooks/useRoomState';
import { formatUserName, getUserStatus, generateUserColor, filterActiveUsers } from '../utils/roomUtils';

interface OnlineUsersProps {
  users: User[];
  currentUserId?: string;
}

const OnlineUsers: React.FC<OnlineUsersProps> = ({ users, currentUserId }) => {
  const activeUsers = filterActiveUsers(users);

  if (activeUsers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-3">Online Users</h3>
        <p className="text-gray-500">No users currently online</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-3">
        Online Users ({activeUsers.length})
      </h3>
      <div className="space-y-2">
        {activeUsers.map((user) => {
          const isCurrentUser = user.id === currentUserId;
          const userColor = generateUserColor(user.id);
          const status = getUserStatus(user);
          
          return (
            <div
              key={user.id}
              className={`flex items-center space-x-3 p-2 rounded-lg ${
                isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: userColor }}
              >
                {user.avatar || formatUserName(user).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {formatUserName(user)}
                    {isCurrentUser && (
                      <span className="text-xs text-blue-600 ml-1">(You)</span>
                    )}
                  </p>
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'active' ? 'bg-green-400' : 
                    status === 'typing' ? 'bg-yellow-400' : 'bg-gray-400'
                  }`} />
                </div>
                {user.status && user.status !== 'idle' && (
                  <p className="text-xs text-gray-500 capitalize">
                    {user.status}
                  </p>
                )}
                {user.message && (
                  <p className="text-xs text-gray-600 truncate">
                    "{user.message}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnlineUsers;