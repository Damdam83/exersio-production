/**
 * Helpers pour les tests unitaires
 * Facilite les tests des composants avec contextes
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AppProvider } from '../contexts/AppProvider';

// Type pour les options de rendu avec wrapper
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialAuthState?: {
    isAuthenticated?: boolean;
    user?: any;
  };
  initialExercisesState?: {
    exercises?: any[];
    isLoading?: boolean;
  };
  initialSessionsState?: {
    sessions?: any[];
    isLoading?: boolean;
  };
}

// Composant wrapper avec tous les contextes
function AllTheProviders({ 
  children,
  initialAuthState,
  initialExercisesState,
  initialSessionsState
}: {
  children: React.ReactNode;
  initialAuthState?: any;
  initialExercisesState?: any;
  initialSessionsState?: any;
}) {
  // Mock location pour éviter les erreurs de window.location
  Object.defineProperty(window, 'location', {
    value: {
      pathname: '/',
      search: '',
      hostname: 'localhost',
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000'
    },
    writable: true
  });

  return (
    <AppProvider>
      {children}
    </AppProvider>
  );
}

// Fonction de rendu personnalisée avec contextes
export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    initialAuthState,
    initialExercisesState,
    initialSessionsState,
    ...renderOptions
  } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders
      initialAuthState={initialAuthState}
      initialExercisesState={initialExercisesState}
      initialSessionsState={initialSessionsState}
    >
      {children}
    </AllTheProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock data pour les tests
export const mockExercise = {
  id: '1',
  name: 'Exercice Test',
  description: 'Description test',
  category: 'technique',
  ageCategory: 'senior',
  duration: 15,
  playerCount: 6,
  intensity: 'moderate',
  material: 'ballons',
  instructions: 'Instructions test',
  steps: ['Étape 1', 'Étape 2'],
  successCriteria: ['Critère 1', 'Critère 2'],
  tags: ['tag1', 'tag2'],
  isShared: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: 'user1'
};

export const mockSession = {
  id: '1',
  name: 'Séance Test',
  date: new Date().toISOString(),
  duration: 90,
  exercises: [mockExercise],
  notes: 'Notes test',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: 'user1'
};

export const mockUser = {
  id: 'user1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'coach'
};

// Mock des APIs
export const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

// Helper pour attendre les mises à jour asynchrones
export const waitForAsyncUpdates = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

// Helper pour simuler les interactions utilisateur
export const createMockEvent = (value: string) => ({
  target: { value },
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
});

// Helper pour les tests de hooks  
export const createMockHookResult = <T,>(initialValue: T) => {
  let value = initialValue;
  const setValue = (newValue: T) => {
    value = newValue;
  };
  return [() => value, setValue] as const;
};

// Re-export de testing-library pour simplifier les imports
export * from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';
export { vi } from 'vitest';