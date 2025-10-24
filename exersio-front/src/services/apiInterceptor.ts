import { authService } from './authService';

// Variables globales pour les gestionnaires
let globalErrorHandler: ((message: string, details?: string) => void) | null = null;
let globalLoadingHandler: {
  start: (id: string, message?: string, type?: string) => void;
  stop: (id: string) => void;
} | null = null;

// Fonction pour définir le gestionnaire d'erreur global
export const setGlobalErrorHandler = (handler: (message: string, details?: string) => void) => {
  globalErrorHandler = handler;
};

// Fonction pour définir le gestionnaire de loading global
export const setGlobalLoadingHandler = (handler: {
  start: (id: string, message?: string, type?: string) => void;
  stop: (id: string) => void;
}) => {
  globalLoadingHandler = handler;
};

// Helper pour afficher les erreurs utilisateur
const showUserError = (message: string, details?: string) => {
  if (globalErrorHandler) {
    globalErrorHandler(message, details);
  } else {
    console.error('Error:', message, details);
  }
};

// Helpers pour le loading
const startLoading = (url: string) => {
  if (!globalLoadingHandler) return null;
  
  const requestId = `request_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const endpoint = url.split('/api/')[1] || url;
  
  let message = 'Chargement...';
  let type = 'default';
  
  // Messages spécifiques selon l'endpoint
  if (endpoint.includes('auth')) {
    message = 'Connexion en cours...';
    type = 'sync';
  } else if (endpoint.includes('sessions')) {
    message = 'Chargement des séances...';
  } else if (endpoint.includes('exercises')) {
    message = 'Chargement des exercices...';
  } else if (endpoint.includes('upload')) {
    message = 'Téléchargement...';
    type = 'upload';
  } else if (endpoint.includes('categories')) {
    message = 'Chargement des catégories...';
  }
  
  globalLoadingHandler.start(requestId, message, type);
  return requestId;
};

const stopLoading = (requestId: string | null) => {
  if (requestId && globalLoadingHandler) {
    globalLoadingHandler.stop(requestId);
  }
};

// Types pour le retry mechanism
interface RetryableRequest {
  url: string;
  options: RequestInit;
  retryCount: number;
}

// Configuration du retry
const MAX_RETRY_ATTEMPTS = 3; // Réactivé après déploiement
const RETRY_DELAY_BASE = 1000; // 1 seconde

// Queue des requêtes en attente pendant le refresh du token
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;
const pendingRequests: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

/**
 * Intercepteur principal pour toutes les requêtes fetch
 * Gère automatiquement :
 * - Le refresh des tokens JWT expirés
 * - Les tentatives de réessai en cas d'erreur réseau
 * - La gestion globale des erreurs d'authentification
 */
export const createApiInterceptor = () => {
  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = input.toString();
    
    // Ignorer les requêtes qui ne sont pas vers notre API
    if (!url.includes('/api/')) {
      return originalFetch(input, init);
    }

    // Démarrer le loading
    const loadingId = startLoading(url);

    // Configuration par défaut avec headers d'authentification
    const config = await prepareRequest(init, url);
    
    try {
      const response = await originalFetch(input, config);
      
      // Arrêter le loading avant de traiter la réponse
      stopLoading(loadingId);
      
      // Si la requête réussit, retourner la réponse
      if (response.ok) {
        return response;
      }

      // Gestion des erreurs d'authentification (401)
      if (response.status === 401) {
        return await handleUnauthorizedError(input, config);
      }

      // Gestion des autres erreurs HTTP
      if (response.status >= 400) {
        await handleHttpError(response, url);
      }

      // Pour les autres erreurs, retourner la réponse pour que l'appelant la traite
      return response;
    } catch (error) {
      // Arrêter le loading en cas d'erreur
      stopLoading(loadingId);
      
      console.warn('Network error, attempting retry:', error);
      showUserError(
        'Problème de connexion réseau. Tentative de reconnexion...',
        error instanceof Error ? error.message : String(error)
      );
      // En cas d'erreur réseau, essayer de refaire la requête
      return await retryRequest(input, config);
    }
  };
};

/**
 * Gérer les erreurs HTTP avec messages utilisateur appropriés
 */
async function handleHttpError(response: Response, url: string) {
  try {
    const errorData = await response.json();
    const endpoint = url.split('/api/')[1] || url;
    
    let userMessage = 'Une erreur s\'est produite';
    let details = `Status: ${response.status}`;
    
    // Messages spécifiques selon le type d'erreur
    switch (response.status) {
      case 400:
        userMessage = 'Données invalides ou manquantes';
        if (errorData.message) {
          details = `${details} - ${errorData.message}`;
        }
        break;
      case 403:
        userMessage = 'Accès refusé - permissions insuffisantes';
        break;
      case 404:
        userMessage = 'Ressource non trouvée';
        break;
      case 409:
        userMessage = 'Conflit - cette ressource existe déjà';
        break;
      case 422:
        userMessage = 'Données invalides';
        if (errorData.errors) {
          details = `${details} - ${JSON.stringify(errorData.errors)}`;
        }
        break;
      case 429:
        userMessage = 'Trop de requêtes - veuillez patienter';
        break;
      case 500:
        userMessage = 'Erreur interne du serveur';
        break;
      case 502:
        userMessage = 'Service temporairement indisponible';
        break;
      case 503:
        userMessage = 'Service en maintenance';
        break;
      default:
        userMessage = `Erreur ${response.status}`;
    }
    
    // Ajouter le contexte de l'endpoint
    if (endpoint) {
      details = `${details} - Endpoint: ${endpoint}`;
    }
    
    showUserError(userMessage, details);
  } catch (parseError) {
    // Si on ne peut pas parser la réponse, utiliser un message générique
    showUserError(
      `Erreur ${response.status} - ${response.statusText}`,
      `URL: ${url}`
    );
  }
}

/**
 * Préparer la requête avec les headers d'authentification
 */
async function prepareRequest(init?: RequestInit, url?: string): Promise<RequestInit> {
  // Éviter l'auto-refresh pour les endpoints d'authentification
  const isAuthEndpoint = url && (
    url.includes('/auth/login') || 
    url.includes('/auth/register') || 
    url.includes('/auth/refresh')
  );
  
  const token = isAuthEndpoint ? authService.getToken() : await authService.ensureValidToken();
  
  return {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...init?.headers,
    },
  };
}

/**
 * Gérer les erreurs 401 (non autorisé)
 */
async function handleUnauthorizedError(
  input: RequestInfo | URL,
  config: RequestInit
): Promise<Response> {
  const url = input.toString();

  // Ne pas essayer de refresh sur les endpoints d'authentification
  if (url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/profile') || url.includes('/auth/refresh')) {
    // Pour les erreurs d'auth, juste retourner la réponse 401
    // Éviter la redirection ici pour laisser le composant gérer l'état
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Essayer de rafraîchir le token UNE SEULE FOIS
    const newToken = await refreshTokenIfNeeded();

    // Si pas de nouveau token, déconnecter sans boucle
    if (!newToken) {
      await authService.logout();
      window.location.href = '/login';
      return new Response('Unauthorized', { status: 401 });
    }

    // Refaire la requête avec le nouveau token
    const newConfig = {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${newToken}`,
      },
    };

    const response = await fetch(input, newConfig);

    // Si la requête échoue encore avec 401, déconnecter l'utilisateur
    if (response.status === 401) {
      await authService.logout();
      window.location.href = '/login';
      return new Response('Session expired', { status: 401 });
    }

    return response;
  } catch (error) {
    // Si le refresh échoue, déconnecter l'utilisateur SANS relancer de requête
    console.error('Unauthorized error handled, logging out:', error);
    await authService.logout();
    window.location.href = '/login';
    return new Response('Unauthorized', { status: 401 });
  }
}

/**
 * Gérer le refresh des tokens avec queue des requêtes en attente
 */
async function refreshTokenIfNeeded(): Promise<string> {
  if (isRefreshing) {
    // Si un refresh est déjà en cours, attendre son résultat
    return new Promise((resolve, reject) => {
      pendingRequests.push({ resolve, reject });
    });
  }

  if (!refreshPromise) {
    isRefreshing = true;
    refreshPromise = authService.refreshToken();
  }

  try {
    const response = await refreshPromise;
    const newToken = response.token;

    // Résoudre toutes les requêtes en attente
    pendingRequests.forEach(({ resolve }) => resolve(newToken));
    pendingRequests.length = 0;

    return newToken;
  } catch (error) {
    // Rejeter toutes les requêtes en attente
    pendingRequests.forEach(({ reject }) => reject(error as Error));
    pendingRequests.length = 0;
    
    throw error;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

/**
 * Réessayer une requête en cas d'erreur réseau
 */
async function retryRequest(
  input: RequestInfo | URL,
  config: RequestInit,
  retryCount: number = 0
): Promise<Response> {
  if (retryCount >= MAX_RETRY_ATTEMPTS) {
    throw new Error('Max retry attempts reached');
  }

  // Délai exponentiel entre les tentatives
  const delay = RETRY_DELAY_BASE * Math.pow(2, retryCount);
  await new Promise(resolve => setTimeout(resolve, delay));

  try {
    const response = await fetch(input, config);
    
    // Si la requête réussit, retourner la réponse
    if (response.ok) {
      return response;
    }

    // Si c'est une erreur serveur (5xx), essayer de nouveau
    if (response.status >= 500) {
      return await retryRequest(input, config, retryCount + 1);
    }

    // Pour les autres erreurs, retourner la réponse
    return response;
  } catch (error) {
    // En cas d'erreur réseau, essayer de nouveau
    return await retryRequest(input, config, retryCount + 1);
  }
}

/**
 * Nettoyer l'intercepteur (utile pour les tests ou le cleanup)
 */
export const cleanupApiInterceptor = () => {
  // Restaurer le fetch original si nécessaire
  // Cette fonction peut être utilisée dans les tests ou lors du démontage de l'app
};

/**
 * Configurer les gestionnaires d'erreurs globaux
 */
export const setupGlobalErrorHandlers = () => {
  // Gestionnaire pour les erreurs non capturées
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Si c'est une erreur d'authentification, on peut la traiter ici
    if (event.reason?.message?.includes('unauthorized') || 
        event.reason?.message?.includes('401')) {
      authService.logout();
      window.location.href = '/login';
    }
  });

  // Gestionnaire pour les erreurs JavaScript non capturées
  window.addEventListener('error', (event) => {
    console.error('Unhandled JavaScript error:', event.error);
  });
};

/**
 * Initialiser tous les intercepteurs et gestionnaires d'erreurs
 */
export const initializeApiInterceptors = () => {
  createApiInterceptor();
  setupGlobalErrorHandlers();
};