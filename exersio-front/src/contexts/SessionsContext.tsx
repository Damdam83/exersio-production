import React, { createContext, useContext, useReducer, useCallback, useMemo, ReactNode } from 'react';
import type { Session } from '../types';
import type { AsyncState, MutationState, ApiError } from '../types/api';
import { sessionsService } from '../services/sessionsService';

interface SessionsState {
  sessions: AsyncState<Session[]>;
  selectedSession: Session | null;
  sessionDraft: Session | null; // Draft temporaire pour les modifications
  createState: MutationState;
  updateState: MutationState;
  deleteState: MutationState;
  duplicateState: MutationState;
  filters: {
    status?: 'planned' | 'completed' | 'cancelled';
    dateRange?: { start: Date; end: Date };
    search?: string;
    ageCategory?: string;
    level?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

type SessionsAction = 
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: Session[] }
  | { type: 'LOAD_ERROR'; payload: ApiError }
  | { type: 'CREATE_START' }
  | { type: 'CREATE_SUCCESS'; payload: Session }
  | { type: 'CREATE_ERROR'; payload: ApiError }
  | { type: 'UPDATE_START' }
  | { type: 'UPDATE_SUCCESS'; payload: { id: string; updates: Partial<Session> } }
  | { type: 'UPDATE_ERROR'; payload: ApiError }
  | { type: 'DELETE_START' }
  | { type: 'DELETE_SUCCESS'; payload: string }
  | { type: 'DELETE_ERROR'; payload: ApiError }
  | { type: 'DUPLICATE_START' }
  | { type: 'DUPLICATE_SUCCESS'; payload: Session }
  | { type: 'DUPLICATE_ERROR'; payload: ApiError }
  | { type: 'SELECT_SESSION'; payload: Session | null }
  | { type: 'SET_FILTERS'; payload: Partial<SessionsState['filters']> }
  | { type: 'SET_PAGINATION'; payload: Partial<SessionsState['pagination']> }
  | { type: 'SET_SESSION_DRAFT'; payload: Session | null }
  | { type: 'CLEAR_SESSION_DRAFT' }
  | { type: 'CLEAR_STATES' };

const initialState: SessionsState = {
  sessions: {
    data: [],
    isLoading: false,
    error: null
  },
  selectedSession: null,
  sessionDraft: null,
  createState: {
    isLoading: false,
    isSubmitting: false,
    error: null
  },
  updateState: {
    isLoading: false,
    isSubmitting: false,
    error: null
  },
  deleteState: {
    isLoading: false,
    isSubmitting: false,
    error: null
  },
  duplicateState: {
    isLoading: false,
    isSubmitting: false,
    error: null
  },
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0
  }
};

function sessionsReducer(state: SessionsState, action: SessionsAction): SessionsState {
  switch (action.type) {
    case 'LOAD_START':
      return {
        ...state,
        sessions: { ...state.sessions, isLoading: true, error: null }
      };

    case 'LOAD_SUCCESS':
      return {
        ...state,
        sessions: {
          data: action.payload || [],
          isLoading: false,
          error: null
        },
        pagination: {
          ...state.pagination,
          total: action.payload?.length || 0
        }
      };

    case 'LOAD_ERROR':
      return {
        ...state,
        sessions: { ...state.sessions, isLoading: false, error: action.payload }
      };

    case 'CREATE_START':
      return {
        ...state,
        createState: { isLoading: true, isSubmitting: true, error: null }
      };

    case 'CREATE_SUCCESS':
      return {
        ...state,
        sessions: {
          ...state.sessions,
          data: [...(state.sessions.data || []), action.payload]
        },
        createState: { isLoading: false, isSubmitting: false, error: null }
      };

    case 'CREATE_ERROR':
      return {
        ...state,
        createState: { isLoading: false, isSubmitting: false, error: action.payload }
      };

    case 'UPDATE_START':
      return {
        ...state,
        updateState: { isLoading: true, isSubmitting: true, error: null }
      };

    case 'UPDATE_SUCCESS':
      return {
        ...state,
        sessions: {
          ...state.sessions,
          data: (state.sessions.data || []).map(session =>
            session.id === action.payload.id
              ? { ...session, ...action.payload.updates }
              : session
          )
        },
        selectedSession: state.selectedSession?.id === action.payload.id
          ? { ...state.selectedSession, ...action.payload.updates }
          : state.selectedSession,
        updateState: { isLoading: false, isSubmitting: false, error: null }
      };

    case 'UPDATE_ERROR':
      return {
        ...state,
        updateState: { isLoading: false, isSubmitting: false, error: action.payload }
      };

    case 'DELETE_START':
      return {
        ...state,
        deleteState: { isLoading: true, isSubmitting: true, error: null }
      };

    case 'DELETE_SUCCESS':
      return {
        ...state,
        sessions: {
          ...state.sessions,
          data: (state.sessions.data || []).filter(session => session.id !== action.payload)
        },
        selectedSession: state.selectedSession?.id === action.payload ? null : state.selectedSession,
        deleteState: { isLoading: false, isSubmitting: false, error: null }
      };

    case 'DELETE_ERROR':
      return {
        ...state,
        deleteState: { isLoading: false, isSubmitting: false, error: action.payload }
      };

    case 'DUPLICATE_START':
      return {
        ...state,
        duplicateState: { isLoading: true, isSubmitting: true, error: null }
      };

    case 'DUPLICATE_SUCCESS':
      return {
        ...state,
        sessions: {
          ...state.sessions,
          data: [...(state.sessions.data || []), action.payload]
        },
        duplicateState: { isLoading: false, isSubmitting: false, error: null }
      };

    case 'DUPLICATE_ERROR':
      return {
        ...state,
        duplicateState: { isLoading: false, isSubmitting: false, error: action.payload }
      };

    case 'SELECT_SESSION':
      return {
        ...state,
        selectedSession: action.payload
      };

    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 }
      };

    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload }
      };

    case 'SET_SESSION_DRAFT':
      return {
        ...state,
        sessionDraft: action.payload
      };

    case 'CLEAR_SESSION_DRAFT':
      return {
        ...state,
        sessionDraft: null
      };

    case 'CLEAR_STATES':
      return {
        ...state,
        sessionDraft: null,
        createState: initialState.createState,
        updateState: initialState.updateState,
        deleteState: initialState.deleteState,
        duplicateState: initialState.duplicateState
      };

    default:
      return state;
  }
}

interface SessionsContextType {
  state: SessionsState;
  actions: {
    loadSessions: () => Promise<void>;
    createSession: (session: Omit<Session, 'id' | 'createdAt'>) => Promise<Session>;
    updateSession: (id: string, updates: Partial<Session>) => Promise<void>;
    deleteSession: (id: string) => Promise<void>;
    duplicateSession: (session: Session) => Promise<Session>;
    selectSession: (session: Session | null) => void;
    setFilters: (filters: Partial<SessionsState['filters']>) => void;
    setPagination: (pagination: Partial<SessionsState['pagination']>) => void;
    clearStates: () => void;
    getFilteredSessions: () => Session[];
    getUpcomingSessions: () => Session[];
    getCompletedSessions: () => Session[];
    createSessionDraft: (session: Session, originalId?: string) => void;
    clearSessionDraft: () => void;
  };
}

const SessionsContext = createContext<SessionsContextType | undefined>(undefined);

interface SessionsProviderProps {
  children: ReactNode;
}

export function SessionsProvider({ children }: SessionsProviderProps) {
  const [state, dispatch] = useReducer(sessionsReducer, initialState);

  const loadSessions = useCallback(async () => {
    dispatch({ type: 'LOAD_START' });
    
    try {
      const sessions = await sessionsService.getAll(state.filters);
      dispatch({ type: 'LOAD_SUCCESS', payload: sessions });
    } catch (error) {
      console.error('Error loading sessions:', error);
      dispatch({ type: 'LOAD_ERROR', payload: error as ApiError });
    }
  }, [state.filters]);

  const createSession = async (sessionData: Omit<Session, 'id' | 'createdAt'>): Promise<Session> => {
    dispatch({ type: 'CREATE_START' });
    
    try {
      const newSession = await sessionsService.create(sessionData);
      dispatch({ type: 'CREATE_SUCCESS', payload: newSession });
      return newSession;
    } catch (error) {
      dispatch({ type: 'CREATE_ERROR', payload: error as ApiError });
      throw error;
    }
  };

  const updateSession = async (id: string, updates: Partial<Session>) => {
    dispatch({ type: 'UPDATE_START' });
    
    try {
      // Préparer les données pour l'API en suivant le format UpdateSessionData
      const updateData: any = {};
      
      // Mapping des champs avec transformation si nécessaire
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.date !== undefined) {
        // S'assurer que la date est au bon format ISO
        const dateValue = typeof updates.date === 'string' ? updates.date : updates.date?.toISOString();
        updateData.date = dateValue;
      }
      if (updates.duration !== undefined) updateData.duration = updates.duration;
      if (updates.exercises !== undefined) updateData.exercises = updates.exercises;
      if (updates.objectives !== undefined) updateData.objectives = updates.objectives;
      if (updates.clubId !== undefined) updateData.clubId = updates.clubId;
      if (updates.sport !== undefined) updateData.sport = updates.sport;
      if (updates.ageCategory !== undefined) updateData.ageCategory = updates.ageCategory;
      if (updates.level !== undefined) updateData.level = updates.level;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      console.log('Updating session with data:', updateData);
      
      await sessionsService.update(id, updateData);
      dispatch({ type: 'UPDATE_SUCCESS', payload: { id, updates } });
    } catch (error) {
      console.error('Update session error:', error);
      dispatch({ type: 'UPDATE_ERROR', payload: error as ApiError });
      throw error;
    }
  };

  const deleteSession = async (id: string) => {
    dispatch({ type: 'DELETE_START' });
    
    try {
      await sessionsService.delete(id);
      dispatch({ type: 'DELETE_SUCCESS', payload: id });
    } catch (error) {
      dispatch({ type: 'DELETE_ERROR', payload: error as ApiError });
      throw error;
    }
  };

  const duplicateSession = async (session: Session): Promise<Session> => {
    dispatch({ type: 'DUPLICATE_START' });
    
    try {
      const duplicatedSession = await sessionsService.duplicate(session.id);
      dispatch({ type: 'DUPLICATE_SUCCESS', payload: duplicatedSession });
      return duplicatedSession;
    } catch (error) {
      dispatch({ type: 'DUPLICATE_ERROR', payload: error as ApiError });
      throw error;
    }
  };

  const selectSession = (session: Session | null) => {
    dispatch({ type: 'SELECT_SESSION', payload: session });
  };

  const setFilters = (filters: Partial<SessionsState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setPagination = (pagination: Partial<SessionsState['pagination']>) => {
    dispatch({ type: 'SET_PAGINATION', payload: pagination });
  };

  const clearStates = () => {
    dispatch({ type: 'CLEAR_STATES' });
  };

  const getFilteredSessions = (): Session[] => {
    let filtered = state.sessions.data || [];
    
    if (state.filters.search) {
      const search = state.filters.search.toLowerCase();
      filtered = filtered.filter(session =>
        session.name.toLowerCase().includes(search) ||
        session.description?.toLowerCase().includes(search) ||
        session.objectives?.some(obj => obj.toLowerCase().includes(search))
      );
    }

    if (state.filters.status) {
      filtered = filtered.filter(session => session.status === state.filters.status);
    }

    if (state.filters.dateRange) {
      const { start, end } = state.filters.dateRange;
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= start && sessionDate <= end;
      });
    }

    if (state.filters.ageCategory) {
      filtered = filtered.filter(session => session.ageCategory === state.filters.ageCategory);
    }

    if (state.filters.level) {
      filtered = filtered.filter(session => session.level === state.filters.level);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getUpcomingSessions = (): Session[] => {
    const now = new Date();
    return (state.sessions.data || [])
      .filter(session => 
        session.status === 'planned' && 
        new Date(session.date) > now
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  };

  const getCompletedSessions = (): Session[] => {
    return (state.sessions.data || [])
      .filter(session => session.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const createSessionDraft = useCallback((session: Session, originalId?: string) => {
    // Créer un draft avec un ID temporaire si c'est une nouvelle session
    const draftSession = {
      ...session,
      id: originalId || `draft_${Date.now()}`,
      originalId: originalId, // Référence à la session originale si c'est une modification
    };
    
    dispatch({ type: 'SET_SESSION_DRAFT', payload: draftSession });
  }, []);

  const clearSessionDraft = useCallback(() => {
    dispatch({ type: 'CLEAR_SESSION_DRAFT' });
  }, []);

  const actions = useMemo(() => ({
    loadSessions,
    createSession,
    updateSession,
    deleteSession,
    duplicateSession,
    selectSession,
    setFilters,
    setPagination,
    clearStates,
    getFilteredSessions,
    getUpcomingSessions,
    getCompletedSessions,
    createSessionDraft,
    clearSessionDraft
  }), [loadSessions, createSession, updateSession, deleteSession, duplicateSession, selectSession, setFilters, setPagination, clearStates, getFilteredSessions, getUpcomingSessions, getCompletedSessions, createSessionDraft, clearSessionDraft]);

  return (
    <SessionsContext.Provider value={{ state, actions }}>
      {children}
    </SessionsContext.Provider>
  );
}

export function useSessions() {
  const context = useContext(SessionsContext);
  if (context === undefined) {
    throw new Error('useSessions must be used within a SessionsProvider');
  }

  const { state, actions } = context;
  return {
    ...context,
    sessions: state.sessions.data || [], // Ajout du raccourci
    sessionDraft: state.sessionDraft,
  };
}
