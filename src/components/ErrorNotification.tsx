import React from 'react';
import { ErrorInfo } from '../hooks/useErrorHandler';

interface ErrorNotificationProps {
  error: ErrorInfo | null;
  onClose: () => void;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ error, onClose }) => {
  if (!error) return null;

  const getErrorIcon = (type: ErrorInfo['type']): string => {
    switch (type) {
      case 'connection':
        return '🔌';
      case 'room':
        return '🏠';
      case 'message':
        return '💬';
      default:
        return '⚠️';
    }
  };

  const getErrorColor = (type: ErrorInfo['type']): string => {
    switch (type) {
      case 'connection':
        return 'bg-red-100 border-red-500 text-red-700';
      case 'room':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'message':
        return 'bg-blue-100 border-blue-500 text-blue-700';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-700';
    }
  };

  return (
    <div className={`fixed top-4 right-4 max-w-md p-4 border-l-4 rounded-lg shadow-lg z-50 ${getErrorColor(error.type)}`}>
      <div className="flex items-start space-x-3">
        <span className="text-lg">{getErrorIcon(error.type)}</span>
        <div className="flex-1">
          <h4 className="font-medium capitalize">
            {error.type} Error
            {error.code && <span className="text-sm ml-1">({error.code})</span>}
          </h4>
          <p className="text-sm mt-1">{error.message}</p>
          <p className="text-xs mt-2 opacity-75">
            {new Date(error.timestamp).toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-lg leading-none hover:opacity-75"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ErrorNotification;