export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, any>;
}

export interface LoadingState {
  isLoading: boolean;
  error: ApiError | null;
  lastFetch?: Date;
}

export interface AsyncState<T> extends LoadingState {
  data: T;
}

export interface MutationState extends LoadingState {
  isSubmitting: boolean;
}

// Types pour les différentes opérations CRUD
export interface CrudOperations<T> {
  create: (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<T>;
  read: (id: string) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
  list: (params?: Record<string, any>) => Promise<T[]>;
}

// Configuration des endpoints
export interface ApiEndpoints {
  auth: {
    login: string;
    logout: string;
    register: string;
    refresh: string;
    profile: string;
  };
  users: string;
  clubs: string;
  exercises: string;
  sessions: string;
  invitations: string;
}

// Configuration API
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  endpoints: ApiEndpoints;
}