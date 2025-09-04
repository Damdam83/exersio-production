import React, { createContext, useContext, useReducer, useCallback, useMemo, ReactNode, useEffect } from 'react';
import type { ApiError } from '../types/api';
import { exercisesFavoritesService } from '../services/exercisesFavoritesService';

interface FavoritesState {
  favorites: string[];
  isLoading: boolean;
  error: ApiError | null;
}

type FavoritesAction = 
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: string[] }
  | { type: 'LOAD_ERROR'; payload: ApiError }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'SET_FAVORITES'; payload: string[] };

const initialState: FavoritesState = {
  favorites: [],
  isLoading: false,
  error: null
};

function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case 'LOAD_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case 'LOAD_SUCCESS':
      return {
        ...state,
        favorites: action.payload,
        isLoading: false,
        error: null
      };

    case 'LOAD_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };

    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.includes(action.payload)
          ? state.favorites.filter(id => id !== action.payload)
          : [...state.favorites, action.payload]
      };

    case 'SET_FAVORITES':
      return {
        ...state,
        favorites: action.payload
      };

    default:
      return state;
  }
}

interface FavoritesContextType {
  state: FavoritesState;
  actions: {
    loadFavorites: () => Promise<void>;
    toggleFavorite: (exerciseId: string) => Promise<void>;
    isFavorite: (exerciseId: string) => boolean;
  };
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);

  // Charger les favoris depuis le localStorage au démarrage (pas d'API call)
  useEffect(() => {
    const localFavorites = localStorage.getItem('exersio_favorites');
    if (localFavorites) {
      try {
        const parsed = JSON.parse(localFavorites);
        dispatch({ type: 'SET_FAVORITES', payload: parsed });
      } catch (error) {
        console.error('Error parsing local favorites:', error);
      }
    }
    // L'API sera appelée seulement quand l'utilisateur navigue vers la page exercices
  }, []);

  const loadFavorites = useCallback(async () => {
    dispatch({ type: 'LOAD_START' });
    
    try {
      const serverFavorites = await exercisesFavoritesService.getFavorites();
      dispatch({ type: 'LOAD_SUCCESS', payload: serverFavorites });
      
      // Synchroniser avec localStorage
      localStorage.setItem('exersio_favorites', JSON.stringify(serverFavorites));
    } catch (error) {
      dispatch({ type: 'LOAD_ERROR', payload: error as ApiError });
      console.error('Failed to load favorites from server, using local cache');
    }
  }, []);

  const toggleFavorite = useCallback(async (exerciseId: string) => {
    const currentlyFavorite = state.favorites.includes(exerciseId);
    
    // Mise à jour optimiste de l'UI
    dispatch({ type: 'TOGGLE_FAVORITE', payload: exerciseId });
    
    // Mise à jour du localStorage immédiatement
    const newFavorites = currentlyFavorite
      ? state.favorites.filter(id => id !== exerciseId)
      : [...state.favorites, exerciseId];
    localStorage.setItem('exersio_favorites', JSON.stringify(newFavorites));

    try {
      // Synchroniser avec le serveur
      await exercisesFavoritesService.toggleFavorite(exerciseId, currentlyFavorite);
    } catch (error) {
      console.error('Failed to sync favorite with server:', error);
      
      // Réversion en cas d'erreur serveur
      dispatch({ type: 'TOGGLE_FAVORITE', payload: exerciseId });
      localStorage.setItem('exersio_favorites', JSON.stringify(state.favorites));
      
      // Optionnel: afficher une notification d'erreur ici
      throw error;
    }
  }, [state.favorites]);

  const isFavorite = useCallback((exerciseId: string) => {
    return state.favorites.includes(exerciseId);
  }, [state.favorites]);

  const actions = useMemo(() => ({
    loadFavorites,
    toggleFavorite,
    isFavorite
  }), [loadFavorites, toggleFavorite, isFavorite]);

  return (
    <FavoritesContext.Provider value={{ state, actions }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}