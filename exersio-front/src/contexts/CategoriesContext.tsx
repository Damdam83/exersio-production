import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { categoriesService, type ExerciseCategory, type AgeCategory, type Level } from '../services/categoriesService';
import type { AsyncState, ApiError } from '../types/api';

interface CategoriesState {
  exerciseCategories: AsyncState<ExerciseCategory[]>;
  ageCategories: AsyncState<AgeCategory[]>;
  levels: AsyncState<Level[]>;
}

type CategoriesAction = 
  | { type: 'LOAD_EXERCISE_CATEGORIES_START' }
  | { type: 'LOAD_EXERCISE_CATEGORIES_SUCCESS'; payload: ExerciseCategory[] }
  | { type: 'LOAD_EXERCISE_CATEGORIES_ERROR'; payload: ApiError }
  | { type: 'LOAD_AGE_CATEGORIES_START' }
  | { type: 'LOAD_AGE_CATEGORIES_SUCCESS'; payload: AgeCategory[] }
  | { type: 'LOAD_AGE_CATEGORIES_ERROR'; payload: ApiError }
  | { type: 'LOAD_LEVELS_START' }
  | { type: 'LOAD_LEVELS_SUCCESS'; payload: Level[] }
  | { type: 'LOAD_LEVELS_ERROR'; payload: ApiError };

const initialState: CategoriesState = {
  exerciseCategories: {
    data: [],
    isLoading: false,
    error: null
  },
  ageCategories: {
    data: [],
    isLoading: false,
    error: null
  },
  levels: {
    data: [],
    isLoading: false,
    error: null
  }
};

function categoriesReducer(state: CategoriesState, action: CategoriesAction): CategoriesState {
  switch (action.type) {
    case 'LOAD_EXERCISE_CATEGORIES_START':
      return {
        ...state,
        exerciseCategories: { ...state.exerciseCategories, isLoading: true, error: null }
      };
    case 'LOAD_EXERCISE_CATEGORIES_SUCCESS':
      return {
        ...state,
        exerciseCategories: { data: action.payload, isLoading: false, error: null }
      };
    case 'LOAD_EXERCISE_CATEGORIES_ERROR':
      return {
        ...state,
        exerciseCategories: { ...state.exerciseCategories, isLoading: false, error: action.payload }
      };

    case 'LOAD_AGE_CATEGORIES_START':
      return {
        ...state,
        ageCategories: { ...state.ageCategories, isLoading: true, error: null }
      };
    case 'LOAD_AGE_CATEGORIES_SUCCESS':
      return {
        ...state,
        ageCategories: { data: action.payload, isLoading: false, error: null }
      };
    case 'LOAD_AGE_CATEGORIES_ERROR':
      return {
        ...state,
        ageCategories: { ...state.ageCategories, isLoading: false, error: action.payload }
      };

    case 'LOAD_LEVELS_START':
      return {
        ...state,
        levels: { ...state.levels, isLoading: true, error: null }
      };
    case 'LOAD_LEVELS_SUCCESS':
      return {
        ...state,
        levels: { data: action.payload, isLoading: false, error: null }
      };
    case 'LOAD_LEVELS_ERROR':
      return {
        ...state,
        levels: { ...state.levels, isLoading: false, error: action.payload }
      };

    default:
      return state;
  }
}

interface CategoriesContextType {
  state: CategoriesState;
  actions: {
    loadExerciseCategories: () => Promise<void>;
    loadAgeCategories: () => Promise<void>;
    loadLevels: () => Promise<void>;
    loadAllCategories: () => Promise<void>;
  };
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

interface CategoriesProviderProps {
  children: React.ReactNode;
}

export function CategoriesProvider({ children }: CategoriesProviderProps) {
  const [state, dispatch] = useReducer(categoriesReducer, initialState);

  const loadExerciseCategories = useCallback(async () => {
    dispatch({ type: 'LOAD_EXERCISE_CATEGORIES_START' });
    
    try {
      const categories = await categoriesService.getExerciseCategories();
      dispatch({ type: 'LOAD_EXERCISE_CATEGORIES_SUCCESS', payload: categories });
    } catch (error) {
      console.error('Error loading exercise categories:', error);
      dispatch({ type: 'LOAD_EXERCISE_CATEGORIES_ERROR', payload: error as ApiError });
    }
  }, []);

  const loadAgeCategories = useCallback(async () => {
    dispatch({ type: 'LOAD_AGE_CATEGORIES_START' });
    
    try {
      const categories = await categoriesService.getAgeCategories();
      dispatch({ type: 'LOAD_AGE_CATEGORIES_SUCCESS', payload: categories });
    } catch (error) {
      console.error('Error loading age categories:', error);
      dispatch({ type: 'LOAD_AGE_CATEGORIES_ERROR', payload: error as ApiError });
    }
  }, []);

  const loadLevels = useCallback(async () => {
    dispatch({ type: 'LOAD_LEVELS_START' });
    
    try {
      const levels = await categoriesService.getLevels();
      dispatch({ type: 'LOAD_LEVELS_SUCCESS', payload: levels });
    } catch (error) {
      console.error('Error loading levels:', error);
      dispatch({ type: 'LOAD_LEVELS_ERROR', payload: error as ApiError });
    }
  }, []);

  const loadAllCategories = useCallback(async () => {
    await Promise.all([
      loadExerciseCategories(),
      loadAgeCategories(),
      loadLevels()
    ]);
  }, [loadExerciseCategories, loadAgeCategories, loadLevels]);

  // Charger les catégories au montage
  useEffect(() => {
    loadAllCategories();
  }, [loadAllCategories]);

  const actions = useMemo(() => ({
    loadExerciseCategories,
    loadAgeCategories,
    loadLevels,
    loadAllCategories
  }), [loadExerciseCategories, loadAgeCategories, loadLevels, loadAllCategories]);

  return (
    <CategoriesContext.Provider value={{ state, actions }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}