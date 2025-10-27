// contexts/NavigationContext.tsx
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { NavigationPage } from '../types';

// Pages additionnelles non listées dans le menu principal
type ExtraPages = 'exercise-create' | 'exercise-edit' | 'exercise-detail' | 'session-create' | 'session-detail';
type Page = NavigationPage | ExtraPages;

type RouteParams = {
  exerciseId?: string;
  sessionId?: string;
  returnTo?: string; // Page de retour
  returnParams?: RouteParams; // Paramètres de retour
  from?: string; // Contexte de navigation pour la breadcrumb
  fromId?: string; // ID du contexte (ex: sessionId quand on vient d'une session)
  [key: string]: string | number | boolean | undefined;
};

interface MenuEntry {
  key: NavigationPage;
  label: string;
  icon?: string;
}

interface NavigationContextType {
  // état de "route"
  currentPage: Page;
  params: RouteParams | null;

  // compat historique
  setCurrentPage: (page: Page) => void;

  // nouvelle API pratique
  navigate: (page: Page, params?: RouteParams | null) => void;
  
  // Navigation avec retour contextualisé
  navigateWithReturn: (page: Page, params?: RouteParams | null) => void;
  goBack: () => void;

  // menu affiché dans la nav
  menuEntries: MenuEntry[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

const defaultMenuEntries: MenuEntry[] = [
  { key: 'home',      label: 'Dashboard' },
  { key: 'sessions',  label: 'Séances' },
  { key: 'exercises', label: 'Exercices' },
  { key: 'history',   label: 'Historique' },
  { key: 'profile',   label: 'Profil' },
];

// Helpers pour le routing
const buildPath = (page: Page, params?: RouteParams | null): string => {
  let basePath: string;
  
  switch (page) {
    case 'home':
      basePath = '/';
      break;
    case 'sessions':
      basePath = '/sessions';
      break;
    case 'session-detail':
      basePath = params?.sessionId ? `/sessions/${params.sessionId}` : '/sessions';
      break;
    case 'session-create':
      basePath = params?.sessionId ? `/sessions/${params.sessionId}/edit` : '/sessions/new';
      break;
    case 'exercises':
      basePath = '/exercises';
      break;
    case 'exercise-detail':
      basePath = params?.exerciseId ? `/exercises/${params.exerciseId}` : '/exercises';
      break;
    case 'exercise-create':
    case 'exercise-edit':
      basePath = params?.exerciseId ? `/exercises/${params.exerciseId}/edit` : '/exercises/new';
      break;
    case 'history':
      basePath = '/history';
      break;
    case 'profile':
      basePath = '/profile';
      break;
    default:
      basePath = '/';
  }
  
  // Ajouter les paramètres de contexte comme query params
  if (params) {
    const queryParams = new URLSearchParams();
    
    if (params.from) queryParams.set('from', params.from);
    if (params.fromId) queryParams.set('fromId', params.fromId);
    if (params.returnTo) queryParams.set('returnTo', params.returnTo);
    if (params.returnParams && typeof params.returnParams === 'object') {
      queryParams.set('returnParams', JSON.stringify(params.returnParams));
    }
    
    const queryString = queryParams.toString();
    if (queryString) {
      basePath += '?' + queryString;
    }
  }
  
  return basePath;
};

const parseCurrentPath = (): { page: Page; params: RouteParams | null } => {
  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  
  // Parser les query params communs
  const baseParams: RouteParams = {};
  if (searchParams.has('from')) baseParams.from = searchParams.get('from') || undefined;
  if (searchParams.has('fromId')) baseParams.fromId = searchParams.get('fromId') || undefined;
  if (searchParams.has('returnTo')) baseParams.returnTo = searchParams.get('returnTo') || undefined;
  if (searchParams.has('returnParams')) {
    try {
      baseParams.returnParams = JSON.parse(searchParams.get('returnParams') || '{}');
    } catch (e) {
      // Ignore parsing errors
    }
  }
  
  // Parse les différentes routes
  if (path === '/' || path === '/home') {
    return { page: 'home', params: Object.keys(baseParams).length ? baseParams : null };
  }
  
  if (path === '/sessions') {
    return { page: 'sessions', params: Object.keys(baseParams).length ? baseParams : null };
  }
  
  if (path === '/exercises') {
    return { page: 'exercises', params: Object.keys(baseParams).length ? baseParams : null };
  }
  
  if (path === '/history') {
    return { page: 'history', params: Object.keys(baseParams).length ? baseParams : null };
  }
  
  if (path === '/profile') {
    return { page: 'profile', params: Object.keys(baseParams).length ? baseParams : null };
  }
  
  // Routes avec paramètres
  const sessionDetailMatch = path.match(/^\/sessions\/([^\/]+)$/);
  if (sessionDetailMatch) {
    return { 
      page: 'session-detail', 
      params: { ...baseParams, sessionId: sessionDetailMatch[1] } 
    };
  }
  
  const sessionEditMatch = path.match(/^\/sessions\/([^\/]+)\/edit$/);
  if (sessionEditMatch) {
    return { 
      page: 'session-create', 
      params: { ...baseParams, sessionId: sessionEditMatch[1] } 
    };
  }
  
  const sessionNewMatch = path.match(/^\/sessions\/new$/);
  if (sessionNewMatch) {
    return { page: 'session-create', params: Object.keys(baseParams).length ? baseParams : null };
  }
  
  const exerciseDetailMatch = path.match(/^\/exercises\/([^\/]+)$/);
  if (exerciseDetailMatch) {
    return { 
      page: 'exercise-detail', 
      params: { ...baseParams, exerciseId: exerciseDetailMatch[1] } 
    };
  }
  
  const exerciseEditMatch = path.match(/^\/exercises\/([^\/]+)\/edit$/);
  if (exerciseEditMatch) {
    return { 
      page: 'exercise-edit', 
      params: { ...baseParams, exerciseId: exerciseEditMatch[1] } 
    };
  }
  
  const exerciseNewMatch = path.match(/^\/exercises\/new$/);
  if (exerciseNewMatch) {
    return { page: 'exercise-create', params: Object.keys(baseParams).length ? baseParams : null };
  }
  
  // Fallback
  return { page: 'home', params: Object.keys(baseParams).length ? baseParams : null };
};

export function NavigationProvider({ children }: { children: ReactNode }) {
  // Initialiser depuis l'URL actuelle
  const initialRoute = parseCurrentPath();
  const [currentPage, setCurrentPage] = useState<Page>(initialRoute.page);
  const [params, setParams] = useState<RouteParams | null>(initialRoute.params);

  // Synchroniser avec les changements d'URL (bouton back/forward du navigateur)
  useEffect(() => {
    const handlePopState = () => {
      const { page, params: urlParams } = parseCurrentPath();
      setCurrentPage(page);
      setParams(urlParams);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (page: Page, nextParams: RouteParams | null = null) => {
    const newPath = buildPath(page, nextParams);
    
    // Utiliser pushState pour changer l'URL sans recharger la page
    window.history.pushState({ page, params: nextParams }, '', newPath);
    
    setCurrentPage(page);
    setParams(nextParams ?? null);
  };

  // Navigation avec retour automatique
  const navigateWithReturn = (page: Page, nextParams: RouteParams | null = null) => {
    const paramsWithReturn = {
      ...nextParams,
      returnTo: currentPage,
      returnParams: params
    };
    
    const newPath = buildPath(page, paramsWithReturn);
    window.history.pushState({ page, params: paramsWithReturn }, '', newPath);
    
    setCurrentPage(page);
    setParams(paramsWithReturn);
  };

  const goBack = () => {
    if (params?.returnTo) {
      const returnPage = params.returnTo as Page;
      const returnParams = params.returnParams as RouteParams | null;
      navigate(returnPage, returnParams);
    } else {
      // Utiliser l'historique du navigateur
      window.history.back();
    }
  };

  return (
    <NavigationContext.Provider
      value={{
        currentPage,
        params,
        setCurrentPage: (p: Page) => navigate(p), // garde la compat
        navigate,
        navigateWithReturn,
        goBack,
        menuEntries: defaultMenuEntries, // on n'affiche pas les pages extra ici
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigation must be used within a NavigationProvider');
  return context;
}
