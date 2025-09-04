import { api } from './api';
import type { User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  club?: any;
}

export class AuthService {
  
  /**
   * Connexion utilisateur
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      // Stocker le token dans localStorage
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_id', response.user.id);
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Inscription utilisateur
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      
      // Stocker le token dans localStorage
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_id', response.user.id);
      }
      
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  /**
   * Déconnexion utilisateur
   */
  async logout(): Promise<void> {
    try {
      // Appeler l'endpoint de logout (stateless mais peut être utile pour des logs côté serveur)
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Supprimer les données locales même si l'API échoue
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
    }
  }

  /**
   * Rafraîchir le token JWT
   */
  async refreshToken(): Promise<{ token: string }> {
    try {
      const response = await api.post<{ token: string }>('/auth/refresh');
      
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
      }
      
      return response;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Si le refresh échoue, déconnecter l'utilisateur
      await this.logout();
      throw error;
    }
  }

  /**
   * Récupérer le profil utilisateur
   */
  async getProfile(): Promise<User> {
    try {
      const response = await api.get<{ user: User; club?: any }>('/auth/profile');
      // Le backend retourne { user: {...}, club: {...} }, on extrait juste user
      return response.user;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  /**
   * Récupérer le token d'authentification
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Récupérer l'ID de l'utilisateur connecté
   */
  getCurrentUserId(): string | null {
    return localStorage.getItem('user_id');
  }

  /**
   * Vérifier si le token est expiré (basique, sans décodage JWT)
   * Note: Pour une vérification plus précise, il faudrait décoder le JWT
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      // Décoder le payload JWT (partie centrale) sans vérification de signature
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.exp < currentTime;
    } catch {
      // Si on ne peut pas décoder le token, on considère qu'il est expiré
      return true;
    }
  }

  /**
   * Auto-refresh du token si nécessaire
   */
  async ensureValidToken(): Promise<string | null> {
    const token = this.getToken();
    
    if (!token) {
      return null;
    }

    if (this.isTokenExpired()) {
      try {
        const response = await this.refreshToken();
        return response.token;
      } catch {
        return null;
      }
    }

    return token;
  }
}

// Instance singleton
export const authService = new AuthService();
export default authService;