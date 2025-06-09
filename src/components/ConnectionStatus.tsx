import React from 'react';
import { useColyseus } from '../contexts/ColyseusContext';
import { ConnectionStatus as ConnectionStatusType } from '../services/ColyseusService';

const ConnectionStatus: React.FC = () => {
  const { connectionStatus, currentRoom } = useColyseus();

  const getStatusColor = (status: ConnectionStatusType): string => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
      case 'reconnecting':
        return 'bg-yellow-500';
      case 'disconnected':
        return 'bg-gray-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: ConnectionStatusType): string => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'reconnecting':
        return 'Reconnecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Connection Error';
      default:
        return 'Unknown';
    }
  };

  const isConnected = connectionStatus === 'connected' && currentRoom;

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div
        className={`w-3 h-3 rounded-full ${getStatusColor(connectionStatus)} ${
          connectionStatus === 'connecting' || connectionStatus === 'reconnecting'
            ? 'animate-pulse'
            : ''
        }`}
      />
      <span className="text-gray-700">
        {getStatusText(connectionStatus)}
        {isConnected && currentRoom && (
          <span className="text-gray-500 ml-1">
            • Room: {(currentRoom as any).name || 'Unknown'}
          </span>
        )}
      </span>
    </div>
  );
};

export default ConnectionStatus;