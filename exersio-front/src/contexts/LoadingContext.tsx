import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingRequest {
  id: string;
  message?: string;
  progress?: number;
  type?: 'default' | 'upload' | 'sync' | 'processing';
}

interface LoadingContextType {
  isLoading: boolean;
  loadingRequests: LoadingRequest[];
  startLoading: (id: string, message?: string, type?: LoadingRequest['type']) => void;
  updateLoading: (id: string, progress?: number, message?: string) => void;
  stopLoading: (id: string) => void;
  stopAllLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loadingRequests, setLoadingRequests] = useState<LoadingRequest[]>([]);

  const startLoading = (id: string, message?: string, type: LoadingRequest['type'] = 'default') => {
    setLoadingRequests(prev => {
      // Éviter les doublons
      const existing = prev.find(req => req.id === id);
      if (existing) {
        return prev.map(req => 
          req.id === id 
            ? { ...req, message, type, progress: 0 }
            : req
        );
      }
      return [...prev, { id, message, type, progress: 0 }];
    });
  };

  const updateLoading = (id: string, progress?: number, message?: string) => {
    setLoadingRequests(prev =>
      prev.map(req =>
        req.id === id
          ? { ...req, ...(progress !== undefined && { progress }), ...(message && { message }) }
          : req
      )
    );
  };

  const stopLoading = (id: string) => {
    setLoadingRequests(prev => prev.filter(req => req.id !== id));
  };

  const stopAllLoading = () => {
    setLoadingRequests([]);
  };

  return (
    <LoadingContext.Provider
      value={{
        isLoading: loadingRequests.length > 0,
        loadingRequests,
        startLoading,
        updateLoading,
        stopLoading,
        stopAllLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};