import { useState, useCallback } from 'react';

export interface ErrorInfo {
  message: string;
  code?: number;
  timestamp: number;
  type: 'connection' | 'room' | 'message' | 'general';
}

export const useErrorHandler = () => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [lastError, setLastError] = useState<ErrorInfo | null>(null);

  const addError = useCallback((
    message: string, 
    type: ErrorInfo['type'] = 'general', 
    code?: number
  ) => {
    const error: ErrorInfo = {
      message,
      type,
      code,
      timestamp: Date.now()
    };

    setLastError(error);
    setErrors(prev => [...prev, error].slice(-10)); // Keep only last 10 errors
    
    // Auto-clear error after 5 seconds
    setTimeout(() => {
      setLastError(null);
    }, 5000);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
    setLastError(null);
  }, []);

  const clearLastError = useCallback(() => {
    setLastError(null);
  }, []);

  const handleConnectionError = useCallback((code: number, message?: string) => {
    const errorMessage = message || `Connection error (Code: ${code})`;
    addError(errorMessage, 'connection', code);
  }, [addError]);

  const handleRoomError = useCallback((code: number, message?: string) => {
    const errorMessage = message || `Room error (Code: ${code})`;
    addError(errorMessage, 'room', code);
  }, [addError]);

  const handleMessageError = useCallback((error: any) => {
    const errorMessage = error.message || 'Failed to send message';
    addError(errorMessage, 'message');
  }, [addError]);

  return {
    errors,
    lastError,
    addError,
    clearErrors,
    clearLastError,
    handleConnectionError,
    handleRoomError,
    handleMessageError
  };
};