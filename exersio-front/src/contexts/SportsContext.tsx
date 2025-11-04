import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { getSports, Sport } from '../services/sportsApi';

interface SportsState {
  sports: {
    data: Sport[] | null;
    loading: boolean;
    error: string | null;
  };
}

type SportsAction =
  | { type: 'LOAD_SPORTS_REQUEST' }
  | { type: 'LOAD_SPORTS_SUCCESS'; payload: Sport[] }
  | { type: 'LOAD_SPORTS_FAILURE'; payload: string };

const initialState: SportsState = {
  sports: {
    data: null,
    loading: false,
    error: null
  }
};

const sportsReducer = (state: SportsState, action: SportsAction): SportsState => {
  switch (action.type) {
    case 'LOAD_SPORTS_REQUEST':
      return {
        ...state,
        sports: { ...state.sports, loading: true, error: null }
      };
    case 'LOAD_SPORTS_SUCCESS':
      return {
        ...state,
        sports: { data: action.payload, loading: false, error: null }
      };
    case 'LOAD_SPORTS_FAILURE':
      return {
        ...state,
        sports: { ...state.sports, loading: false, error: action.payload }
      };
    default:
      return state;
  }
};

interface SportsContextType {
  state: SportsState;
  loadSports: () => Promise<void>;
}

const SportsContext = createContext<SportsContextType | undefined>(undefined);

export const SportsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(sportsReducer, initialState);

  const loadSports = async () => {
    // Ne pas recharger si déjà chargé
    if (state.sports.data && state.sports.data.length > 0) {
      return;
    }

    dispatch({ type: 'LOAD_SPORTS_REQUEST' });
    try {
      const sports = await getSports();
      dispatch({ type: 'LOAD_SPORTS_SUCCESS', payload: sports });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load sports';
      dispatch({ type: 'LOAD_SPORTS_FAILURE', payload: message });
    }
  };

  // Ne pas charger automatiquement au montage
  // Les sports seront chargés à la demande par les composants qui en ont besoin

  return (
    <SportsContext.Provider value={{ state, loadSports }}>
      {children}
    </SportsContext.Provider>
  );
};

export const useSports = (): SportsContextType => {
  const context = useContext(SportsContext);
  if (!context) {
    throw new Error('useSports must be used within a SportsProvider');
  }
  return context;
};
