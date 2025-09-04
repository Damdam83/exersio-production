// contexts/AppProvider.tsx
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AuthProvider } from './AuthContext';
import { ExercisesProvider } from './ExercisesContext';
import { SessionsProvider } from './SessionsContext';
import { NavigationProvider } from './NavigationContext';
import { UserProvider } from './UserContext';
import { CategoriesProvider } from './CategoriesContext';
import { ErrorProvider } from './ErrorContext';
import { LoadingProvider } from './LoadingContext';
import { FavoritesProvider } from './FavoritesContext';
import type { NavigationPage } from '../types';

interface AppState {
  currentPage: NavigationPage;
  previousPage?: NavigationPage;
  selectedSessionId?: string;
  selectedExerciseId?: string;
  isMobile: boolean;
  isOnline: boolean;
  notifications: AppNotification[];
}

interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: { label: string; action: () => void }[];
}

type AppAction = 
  | { type: 'NAVIGATE'; payload: { page: NavigationPage; sessionId?: string; exerciseId?: string } }
  | { type: 'SET_MOBILE'; payload: boolean }
  | { type: 'SET_ONLINE'; payload: boolean }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<AppNotification, 'id' | 'timestamp' | 'read'> }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' };

const initialState: AppState = {
  currentPage: 'home', // <- aligne avec NavigationContext
  isMobile: false,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  notifications: []
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'NAVIGATE':
      return {
        ...state,
        previousPage: state.currentPage,
        currentPage: action.payload.page,
        selectedSessionId: action.payload.sessionId ?? state.selectedSessionId,
        selectedExerciseId: action.payload.exerciseId ?? state.selectedExerciseId,
      };
    case 'SET_MOBILE':
      return { ...state, isMobile: action.payload };
    case 'SET_ONLINE':
      return { ...state, isOnline: action.payload };
    case 'ADD_NOTIFICATION': {
      const newNotification: AppNotification = {
        ...action.payload,
        id: `notification_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        timestamp: new Date(),
        read: false
      };
      return { ...state, notifications: [newNotification, ...state.notifications] };
    }
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n)
      };
    case 'REMOVE_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  actions: {
    navigateToPage: (page: NavigationPage, sessionId?: string, exerciseId?: string) => void;
    addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
    markNotificationRead: (id: string) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function AppContextProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const checkMobile = () => {
      dispatch({ type: 'SET_MOBILE', payload: window.innerWidth < 768 });
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const online = () => dispatch({ type: 'SET_ONLINE', payload: true });
    const offline = () => dispatch({ type: 'SET_ONLINE', payload: false });
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (state.notifications.some(n => n.timestamp < oneWeekAgo)) {
        dispatch({ type: 'CLEAR_NOTIFICATIONS' });
      }
    }, 24 * 60 * 60 * 1000);
    return () => clearInterval(id);
  }, [state.notifications]);

  const actions = {
    navigateToPage: (page: NavigationPage, sessionId?: string, exerciseId?: string) =>
      dispatch({ type: 'NAVIGATE', payload: { page, sessionId, exerciseId } }),
    addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) =>
      dispatch({ type: 'ADD_NOTIFICATION', payload: n }),
    markNotificationRead: (id: string) =>
      dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id }),
    removeNotification: (id: string) =>
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: id }),
    clearNotifications: () => dispatch({ type: 'CLEAR_NOTIFICATIONS' }),
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AppContextProvider>
      <ErrorProvider>
        <LoadingProvider>
          <AuthProvider>
            <UserProvider>
              <CategoriesProvider>
                <FavoritesProvider>
                  <NavigationProvider>
                    <SessionsProvider>
                      <ExercisesProvider>
                        {children}
                      </ExercisesProvider>
                    </SessionsProvider>
                  </NavigationProvider>
                </FavoritesProvider>
              </CategoriesProvider>
            </UserProvider>
          </AuthProvider>
        </LoadingProvider>
      </ErrorProvider>
    </AppContextProvider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}

// (optionnel) compat ancien code
export function useAppData() {
  const app = useApp();
  return {
    appState: app.state,
    navigateToPage: app.actions.navigateToPage,
  };
}
