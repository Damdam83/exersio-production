import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { User, Club } from '../types';
import { authService } from '../services/authService';
import { usersService } from '../services/usersService';
import { clubsService } from '../services/clubsService';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

interface MutationState extends LoadingState {
  isSubmitting: boolean;
}

interface AuthState {
  user: User | null;
  club: Club | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  loginState: MutationState;
  logoutState: MutationState;
}

type AuthAction = 
  | { type: 'INIT_START' }
  | { type: 'INIT_SUCCESS'; payload: { user: User; club?: Club | null } }
  | { type: 'INIT_ERROR'; payload: string }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; club?: Club | null } }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT_START' }
  | { type: 'LOGOUT_SUCCESS' }
  | { type: 'LOGOUT_ERROR'; payload: string }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'UPDATE_CLUB'; payload: Club | null }
  | { type: 'CLEAR_LOGIN_ERROR' }
  | { type: 'CLEAR_AUTH' };

const initialState: AuthState = {
  user: null,
  club: null,
  isAuthenticated: false,
  isInitialized: false,
  loginState: {
    isLoading: false,
    isSubmitting: false,
    error: null
  },
  logoutState: {
    isLoading: false,
    isSubmitting: false,
    error: null
  }
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'INIT_START':
      return {
        ...state,
        isInitialized: false
      };

    case 'INIT_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        club: action.payload.club || null,
        isAuthenticated: true,
        isInitialized: true
      };

    case 'INIT_ERROR':
      return {
        ...state,
        user: null,
        club: null,
        isAuthenticated: false,
        isInitialized: true
      };

    case 'LOGIN_START':
      return {
        ...state,
        loginState: {
          isLoading: true,
          isSubmitting: true,
          error: null
        }
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        club: action.payload.club || null,
        isAuthenticated: true,
        loginState: {
          isLoading: false,
          isSubmitting: false,
          error: null
        }
      };

    case 'LOGIN_ERROR':
      return {
        ...state,
        loginState: {
          isLoading: false,
          isSubmitting: false,
          error: action.payload
        }
      };

    case 'LOGOUT_START':
      return {
        ...state,
        logoutState: {
          isLoading: true,
          isSubmitting: true,
          error: null
        }
      };

    case 'LOGOUT_SUCCESS':
      return {
        ...initialState,
        isInitialized: true,
        logoutState: {
          isLoading: false,
          isSubmitting: false,
          error: null
        }
      };

    case 'LOGOUT_ERROR':
      return {
        ...state,
        logoutState: {
          isLoading: false,
          isSubmitting: false,
          error: action.payload
        }
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };

    case 'UPDATE_CLUB':
      return {
        ...state,
        club: action.payload
      };

    case 'CLEAR_LOGIN_ERROR':
      return {
        ...state,
        loginState: {
          ...state.loginState,
          error: null
        }
      };

    case 'CLEAR_AUTH':
      return {
        ...initialState,
        isInitialized: true
      };

    default:
      return state;
  }
}

interface AuthContextType {
  state: AuthState;
  actions: {
    login: (credentials: { email: string; password: string }) => Promise<void>;
    register: (data: { name: string; email: string; password: string }) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (updates: Partial<User>) => void;
    updateClub: (club: Club | null) => void;
    clearLoginError: () => void;
    initialize: () => Promise<void>;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const initialize = async () => {
    dispatch({ type: 'INIT_START' });
    
    try {
      const token = authService.getToken();
      if (!token || authService.isTokenExpired()) {
        dispatch({ type: 'INIT_ERROR', payload: 'No valid token' });
        return;
      }

      // Récupérer le profil utilisateur
      const user = await authService.getProfile();
      
      // Récupérer le club si l'utilisateur en fait partie
      let club: Club | null = null;
      if (user.clubId) {
        try {
          club = await clubsService.getById(user.clubId);
        } catch (error) {
          console.warn('Could not fetch user club:', error);
        }
      }

      dispatch({ 
        type: 'INIT_SUCCESS', 
        payload: { user, club } 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Initialization failed';
      dispatch({ 
        type: 'INIT_ERROR', 
        payload: errorMessage
      });
      // Nettoyer les tokens invalides
      authService.logout();
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authService.login(credentials);
      
      // Récupérer le club si l'utilisateur en fait partie
      let club: Club | null = null;
      if (response.user.clubId) {
        try {
          club = await clubsService.getById(response.user.clubId);
        } catch (error) {
          console.warn('Could not fetch user club:', error);
        }
      }
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user: response.user, club } 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ 
        type: 'LOGIN_ERROR', 
        payload: errorMessage
      });
      throw error;
    }
  };

  const register = async (data: { name: string; email: string; password: string }) => {
    dispatch({ type: 'LOGIN_START' }); // Réutiliser le même state pour l'inscription
    
    try {
      const response = await authService.register(data);
      
      // Pour l'inscription, on ne connecte PAS l'utilisateur automatiquement
      // Il doit d'abord confirmer son email
      dispatch({ type: 'LOGIN_ERROR', payload: null }); // Reset l'état
      
      // Le message de succès sera affiché par AuthForm
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ 
        type: 'LOGIN_ERROR', 
        payload: errorMessage
      });
      throw error;
    }
  };

  const logout = async () => {
    dispatch({ type: 'LOGOUT_START' });
    
    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT_SUCCESS' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      dispatch({ 
        type: 'LOGOUT_ERROR', 
        payload: errorMessage
      });
      // Même en cas d'erreur, on déconnecte localement
      dispatch({ type: 'LOGOUT_SUCCESS' });
    }
  };

  const updateUser = (updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  };

  const updateClub = (club: Club | null) => {
    dispatch({ type: 'UPDATE_CLUB', payload: club });
  };

  const clearLoginError = () => {
    dispatch({ type: 'CLEAR_LOGIN_ERROR' });
  };

  // Initialiser l'authentification au démarrage
  useEffect(() => {
    initialize();
  }, []);

  const actions = {
    login,
    register,
    logout,
    updateUser,
    updateClub,
    clearLoginError,
    initialize
  };

  return (
    <AuthContext.Provider value={{ state, actions }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}