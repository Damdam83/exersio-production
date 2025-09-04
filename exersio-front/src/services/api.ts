// Configuration de base pour l'API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Types de réponse de l'API (basés sur WrapResponseInterceptor du backend)
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  statusCode: number;
  timestamp: string;
}

// Types d'erreur de l'API
export interface ApiError {
  message: string;
  error?: string;
  statusCode: number;
  timestamp: string;
}

// Types pour la pagination (basés sur le backend NestJS)
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Configuration des headers par défaut
export const defaultHeaders = {
  'Content-Type': 'application/json',
};

// Helper pour récupérer le token d'authentification
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Helper pour définir le token d'authentification
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Helper pour supprimer le token d'authentification
export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

// Helper pour créer les headers avec authentification
export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    ...defaultHeaders,
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper pour faire une requête avec gestion d'erreur automatique
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: getAuthHeaders(),
    ...options,
  };

  // Ajout d'un timeout de 30 secondes
  const timeoutId = setTimeout(() => {
    console.error(`API Request timeout for ${url} after 30 seconds`);
  }, 30000);

  try {
    console.log(`🚀 Making API request to: ${url}`);
    console.log(`📤 Request config:`, config);
    console.log(`🌐 API_BASE_URL:`, API_BASE_URL);
    
    const response = await fetch(url, config);
    clearTimeout(timeoutId);
    
    console.log(`📥 Response status: ${response.status}`);
    console.log(`📥 Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const responseText = await response.text();
        console.error(`❌ API Error response text:`, responseText);
        
        // Essayer de parser en JSON
        try {
          const errorData: ApiError = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // Si ce n'est pas du JSON, utiliser le texte brut
          errorMessage = responseText.includes('<!DOCTYPE') 
            ? `Received HTML instead of JSON (${response.status})` 
            : responseText.substring(0, 200);
        }
      } catch (textError) {
        console.error(`❌ Failed to read error response:`, textError);
      }
      
      throw new Error(errorMessage);
    }

    const result: ApiResponse<T> = await response.json();
    console.log(`✅ API Success response:`, result);
    return result.data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`💥 API Error [${endpoint}]:`, error);
    throw error;
  }
};

// Méthodes HTTP helpers
export const api = {
  get: <T = any>(endpoint: string, params?: Record<string, any>): Promise<T> => {
    const searchParams = params ? `?${new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    )}` : '';
    return apiRequest<T>(`${endpoint}${searchParams}`, { method: 'GET' });
  },

  post: <T = any>(endpoint: string, data?: any): Promise<T> => {
    return apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  put: <T = any>(endpoint: string, data?: any): Promise<T> => {
    return apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  patch: <T = any>(endpoint: string, data?: any): Promise<T> => {
    return apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  delete: <T = any>(endpoint: string): Promise<T> => {
    return apiRequest<T>(endpoint, { method: 'DELETE' });
  },
};

// Helper pour les requêtes paginées
export const paginatedRequest = async <T = any>(
  endpoint: string,
  page: number = 1,
  limit: number = 10,
  filters?: Record<string, any>
): Promise<PaginatedResponse<T>> => {
  const params = {
    page: page.toString(),
    limit: limit.toString(),
    ...filters,
  };
  
  const url = `${API_BASE_URL}${endpoint}`;
  const searchParams = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  );

  const config: RequestInit = {
    headers: getAuthHeaders(),
    method: 'GET',
  };

  try {
    const response = await fetch(`${url}?${searchParams}`, config);
    
    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    
    // L'API retourne directement la structure PaginatedResponse, pas dans un wrapper ApiResponse
    if (result.data && Array.isArray(result.data)) {
      return result as PaginatedResponse<T>;
    } else if (result.data && result.data.data && Array.isArray(result.data.data)) {
      // Si c'est dans un wrapper ApiResponse
      return result.data as PaginatedResponse<T>;
    } else {
      throw new Error('Unexpected API response structure');
    }
  } catch (error) {
    console.error(`Paginated API Error [${endpoint}]:`, error);
    throw error;
  }
};

