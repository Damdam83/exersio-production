import React, { createContext, useContext, useReducer, useCallback, useMemo, ReactNode } from 'react';
import type { Exercise } from '../types';
import type { AsyncState, MutationState, ApiError } from '../types/api';
import { exercisesService } from '../services/exercisesService';
import { offlineStorage } from '../services/offlineStorage';

interface ExercisesState {
  exercises: AsyncState<Exercise[]>;
  selectedExercise: Exercise | null;
  draftExercise: Exercise | null; // Nouveau : exercice en cours d'édition (copie)
  createState: MutationState;
  updateState: MutationState;
  deleteState: MutationState;
  filters: {
    category?: string;
    level?: string;
    ageCategory?: string;
    search?: string;
    scope?: 'personal' | 'club' | 'all';
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

type ExercisesAction = 
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: Exercise[] }
  | { type: 'LOAD_ERROR'; payload: ApiError }
  | { type: 'CREATE_START' }
  | { type: 'CREATE_SUCCESS'; payload: Exercise }
  | { type: 'CREATE_ERROR'; payload: ApiError }
  | { type: 'UPDATE_START' }
  | { type: 'UPDATE_SUCCESS'; payload: { id: string; updates: Partial<Exercise> } }
  | { type: 'UPDATE_ERROR'; payload: ApiError }
  | { type: 'DELETE_START' }
  | { type: 'DELETE_SUCCESS'; payload: string }
  | { type: 'DELETE_ERROR'; payload: ApiError }
  | { type: 'SELECT_EXERCISE'; payload: Exercise | null }
  | { type: 'SET_DRAFT_EXERCISE'; payload: Exercise | null } // Nouveau
  | { type: 'UPDATE_DRAFT_EXERCISE'; payload: Partial<Exercise> } // Nouveau  
  | { type: 'SET_FILTERS'; payload: Partial<ExercisesState['filters']> }
  | { type: 'SET_PAGINATION'; payload: Partial<ExercisesState['pagination']> }
  | { type: 'CLEAR_STATES' };

const initialState: ExercisesState = {
  exercises: {
    data: [],
    isLoading: false,
    error: null
  },
  selectedExercise: null,
  draftExercise: null,
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
  filters: {
    scope: 'personal'
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0
  }
};

function exercisesReducer(state: ExercisesState, action: ExercisesAction): ExercisesState {
  switch (action.type) {
    case 'LOAD_START':
      return {
        ...state,
        exercises: { ...state.exercises, isLoading: true, error: null }
      };

    case 'LOAD_SUCCESS':
      return {
        ...state,
        exercises: {
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
        exercises: { ...state.exercises, isLoading: false, error: action.payload }
      };

    case 'CREATE_START':
      return {
        ...state,
        createState: { isLoading: true, isSubmitting: true, error: null }
      };

    case 'CREATE_SUCCESS':
      return {
        ...state,
        exercises: {
          ...state.exercises,
          data: [...(state.exercises.data || []), action.payload]
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
        exercises: {
          ...state.exercises,
          data: (state.exercises.data || []).map(exercise =>
            exercise.id === action.payload.id
              ? { ...exercise, ...action.payload.updates }
              : exercise
          )
        },
        selectedExercise: state.selectedExercise?.id === action.payload.id
          ? { ...state.selectedExercise, ...action.payload.updates }
          : state.selectedExercise,
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
        exercises: {
          ...state.exercises,
          data: (state.exercises.data || []).filter(exercise => exercise.id !== action.payload)
        },
        selectedExercise: state.selectedExercise?.id === action.payload ? null : state.selectedExercise,
        deleteState: { isLoading: false, isSubmitting: false, error: null }
      };

    case 'DELETE_ERROR':
      return {
        ...state,
        deleteState: { isLoading: false, isSubmitting: false, error: action.payload }
      };

    case 'SELECT_EXERCISE':
      return {
        ...state,
        selectedExercise: action.payload
      };

    case 'SET_DRAFT_EXERCISE':
      return {
        ...state,
        draftExercise: action.payload
      };

    case 'UPDATE_DRAFT_EXERCISE':
      return {
        ...state,
        draftExercise: state.draftExercise ? { ...state.draftExercise, ...action.payload } : null
      };

    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 } // Reset page when filtering
      };

    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload }
      };

    case 'CLEAR_STATES':
      return {
        ...state,
        createState: initialState.createState,
        updateState: initialState.updateState,
        deleteState: initialState.deleteState
      };

    default:
      return state;
  }
}

interface ExercisesContextType {
  state: ExercisesState;
  actions: {
    loadExercises: () => Promise<void>;
    createExercise: (exercise: Omit<Exercise, 'id' | 'createdAt'>) => Promise<Exercise>;
    updateExercise: (id: string, updates: Partial<Exercise>) => Promise<void>;
    deleteExercise: (id: string) => Promise<void>;
    shareWithClub: (id: string) => Promise<Exercise>;
    getPermissions: (id: string) => Promise<{ canEdit: boolean; canDelete: boolean }>;
    selectExercise: (exercise: Exercise | null) => void;
    createLocalCopy: (exercise: Exercise) => void;
    setDraftExercise: (exercise: Exercise | null) => void;
    updateDraftExercise: (updates: Partial<Exercise>) => void;
    saveDraftExercise: () => Promise<Exercise>;
    clearDraft: () => void;
    setFilters: (filters: Partial<ExercisesState['filters']>) => void;
    setPagination: (pagination: Partial<ExercisesState['pagination']>) => void;
    clearStates: () => void;
    getFilteredExercises: () => Exercise[];
  };
}

const ExercisesContext = createContext<ExercisesContextType | undefined>(undefined);

interface ExercisesProviderProps {
  children: ReactNode;
}

export function ExercisesProvider({ children }: ExercisesProviderProps) {
  const [state, dispatch] = useReducer(exercisesReducer, initialState);

  const loadExercises = useCallback(async () => {
    dispatch({ type: 'LOAD_START' });
    
    try {
      const exercises = await exercisesService.getAll(state.filters);
      dispatch({ type: 'LOAD_SUCCESS', payload: exercises });
    } catch (error) {
      console.error('Error loading exercises:', error);
      dispatch({ type: 'LOAD_ERROR', payload: error as ApiError });
    }
  }, [state.filters]);

  const createExercise = async (exerciseData: Omit<Exercise, 'id' | 'createdAt'>): Promise<Exercise> => {
    console.log('📝 createExercise called with:', exerciseData.name);
    console.trace('📍 createExercise call stack');
    dispatch({ type: 'CREATE_START' });
    
    try {
      const newExercise = await exercisesService.create(exerciseData);
      
      // Sauvegarder en offline si en ligne (marqué comme 'synced')
      if (navigator.onLine) {
        await offlineStorage.saveExercise(newExercise, 'synced');
      }
      
      dispatch({ type: 'CREATE_SUCCESS', payload: newExercise });
      return newExercise;
    } catch (error) {
      console.error('Error creating exercise online:', error);
      
      // Si erreur et qu'on est hors ligne, sauver localement
      if (!navigator.onLine) {
        const exerciseId = 'local_' + Date.now();
        const localExercise: Exercise = {
          ...exerciseData,
          id: exerciseId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await offlineStorage.saveExercise(localExercise, 'local-only');
        dispatch({ type: 'CREATE_SUCCESS', payload: localExercise });
        return localExercise;
      }
      
      dispatch({ type: 'CREATE_ERROR', payload: error as ApiError });
      throw error;
    }
  };

  const updateExercise = async (id: string, updates: Partial<Exercise>) => {
    dispatch({ type: 'UPDATE_START' });
    
    try {
      await exercisesService.update(id, updates);
      
      // Mettre à jour le cache local
      const currentExercise = state.exercises.data.find(ex => ex.id === id);
      if (currentExercise) {
        const updatedExercise = { ...currentExercise, ...updates, updatedAt: new Date().toISOString() };
        if (navigator.onLine) {
          await offlineStorage.saveExercise(updatedExercise, 'synced');
        }
      }
      
      dispatch({ type: 'UPDATE_SUCCESS', payload: { id, updates } });
    } catch (error) {
      console.error('Error updating exercise online:', error);
      
      // Si erreur et qu'on est hors ligne, sauver localement
      if (!navigator.onLine) {
        const currentExercise = state.exercises.data.find(ex => ex.id === id);
        if (currentExercise) {
          const updatedExercise = { ...currentExercise, ...updates, updatedAt: new Date().toISOString() };
          await offlineStorage.saveExercise(updatedExercise, 'pending');
          dispatch({ type: 'UPDATE_SUCCESS', payload: { id, updates } });
          return;
        }
      }
      
      dispatch({ type: 'UPDATE_ERROR', payload: error as ApiError });
      throw error;
    }
  };

  const deleteExercise = async (id: string) => {
    dispatch({ type: 'DELETE_START' });
    
    try {
      await exercisesService.delete(id);
      dispatch({ type: 'DELETE_SUCCESS', payload: id });
    } catch (error) {
      dispatch({ type: 'DELETE_ERROR', payload: error as ApiError });
      throw error;
    }
  };

  const selectExercise = (exercise: Exercise | null) => {
    dispatch({ type: 'SELECT_EXERCISE', payload: exercise });
  };

  const setFilters = (filters: Partial<ExercisesState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setPagination = (pagination: Partial<ExercisesState['pagination']>) => {
    dispatch({ type: 'SET_PAGINATION', payload: pagination });
  };

  const clearStates = () => {
    dispatch({ type: 'CLEAR_STATES' });
  };


  const shareWithClub = async (id: string): Promise<Exercise> => {
    try {
      const updatedExercise = await exercisesService.shareWithClub(id);
      dispatch({ type: 'UPDATE_SUCCESS', payload: { id, updates: updatedExercise } });
      return updatedExercise;
    } catch (error) {
      console.error('Error sharing exercise with club:', error);
      throw error;
    }
  };

  const getPermissions = async (id: string): Promise<{ canEdit: boolean; canDelete: boolean }> => {
    try {
      return await exercisesService.getPermissions(id);
    } catch (error) {
      console.error('Error getting exercise permissions:', error);
      return { canEdit: false, canDelete: false };
    }
  };

  const createLocalCopy = (exercise: Exercise) => {
    // Créer une copie locale avec un nouvel ID temporaire et un nom modifié
    const copyId = `draft-${Date.now()}`;
    const localCopy: Exercise = {
      ...exercise,
      id: copyId,
      name: `${exercise.name} (Copie)`,
      clubId: null, // Les copies sont personnelles par défaut
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user', // À remplacer par l'ID utilisateur réel
      createdById: 'current-user'
    };
    
    dispatch({ type: 'SET_DRAFT_EXERCISE', payload: localCopy });
  };

  const setDraftExercise = (exercise: Exercise | null) => {
    dispatch({ type: 'SET_DRAFT_EXERCISE', payload: exercise });
  };

  const updateDraftExercise = (updates: Partial<Exercise>) => {
    dispatch({ type: 'UPDATE_DRAFT_EXERCISE', payload: updates });
  };

  const saveDraftExercise = async (): Promise<Exercise> => {
    if (!state.draftExercise) {
      throw new Error('Aucun brouillon à sauvegarder');
    }

    dispatch({ type: 'CREATE_START' });
    
    try {
      // Préparer les données pour la création (enlever les champs générés)
      const { id, createdAt, updatedAt, createdBy, ...exerciseData } = state.draftExercise;
      const newExercise = await exercisesService.create(exerciseData);
      
      dispatch({ type: 'CREATE_SUCCESS', payload: newExercise });
      // Nettoyer le brouillon après sauvegarde
      dispatch({ type: 'SET_DRAFT_EXERCISE', payload: null });
      
      return newExercise;
    } catch (error) {
      dispatch({ type: 'CREATE_ERROR', payload: error as ApiError });
      throw error;
    }
  };

  const clearDraft = () => {
    dispatch({ type: 'SET_DRAFT_EXERCISE', payload: null });
  };

  const getFilteredExercises = (): Exercise[] => {
    let filtered = state.exercises.data || [];
    
    if (state.filters.search) {
      const search = state.filters.search.toLowerCase();
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(search) ||
        exercise.description.toLowerCase().includes(search) ||
        exercise.category.toLowerCase().includes(search)
      );
    }

    if (state.filters.category) {
      filtered = filtered.filter(exercise => exercise.category === state.filters.category);
    }

    if (state.filters.level) {
      filtered = filtered.filter(exercise => exercise.level === state.filters.level);
    }

    if (state.filters.ageCategory) {
      filtered = filtered.filter(exercise => exercise.ageCategory === state.filters.ageCategory);
    }

    return filtered;
  };

  const actions = useMemo(() => ({
    loadExercises,
    createExercise,
    updateExercise,
    deleteExercise,
    shareWithClub,
    getPermissions,
    selectExercise,
    createLocalCopy,
    setDraftExercise,
    updateDraftExercise,
    saveDraftExercise,
    clearDraft,
    setFilters,
    setPagination,
    clearStates,
    getFilteredExercises
  }), [loadExercises, createExercise, updateExercise, deleteExercise, shareWithClub, getPermissions, selectExercise, createLocalCopy, setDraftExercise, updateDraftExercise, saveDraftExercise, clearDraft, setFilters, setPagination, clearStates, getFilteredExercises]);

  return (
    <ExercisesContext.Provider value={{ state, actions }}>
      {children}
    </ExercisesContext.Provider>
  );
}

export function useExercises() {
  const context = useContext(ExercisesContext);
  if (context === undefined) {
    throw new Error('useExercises must be used within an ExercisesProvider');
  }

  // On retourne aussi exercises directement pour simplifier l'accès
  return {
    ...context,
    exercises: context.state.exercises.data,
  };
}

