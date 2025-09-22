import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ErrorInfo {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
  details?: string;
}

interface ErrorContextType {
  errors: ErrorInfo[];
  showError: (message: string, details?: string) => void;
  showWarning: (message: string, details?: string) => void;
  showInfo: (message: string, details?: string) => void;
  dismissError: (id: string) => void;
  clearAllErrors: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  const addError = (message: string, type: ErrorInfo['type'], details?: string) => {
    const error: ErrorInfo = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date(),
      details,
    };

    setErrors(prev => [...prev, error]);

    // Auto-dismiss messages based on type
    let duration = 0;
    switch (type) {
      case 'error':
        duration = 8000; // 8 seconds for errors
        break;
      case 'warning':
        duration = 6000; // 6 seconds for warnings
        break;
      case 'info':
        duration = 4000; // 4 seconds for info
        break;
    }

    if (duration > 0) {
      setTimeout(() => {
        dismissError(error.id);
      }, duration);
    }
  };

  const showError = (message: string, details?: string) => {
    addError(message, 'error', details);
  };

  const showWarning = (message: string, details?: string) => {
    addError(message, 'warning', details);
  };

  const showInfo = (message: string, details?: string) => {
    addError(message, 'info', details);
  };

  const dismissError = (id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  };

  const clearAllErrors = () => {
    setErrors([]);
  };

  return (
    <ErrorContext.Provider
      value={{
        errors,
        showError,
        showWarning,
        showInfo,
        dismissError,
        clearAllErrors,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
};