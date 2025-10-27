import { api, paginatedRequest, type PaginatedResponse } from './api';
import type { User, Role } from '../types';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: Role;
  avatar?: string;
  clubId?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  avatar?: string;
  role?: Role;
  clubId?: string;
}

export interface UserFilters {
  search?: string;
  role?: Role;
  clubId?: string;
}

export class UsersService {
  
  /**
   * Lister les utilisateurs avec pagination et filtres (admin uniquement)
   */
  async list(
    page: number = 1,
    limit: number = 10,
    filters: UserFilters = {}
  ): Promise<PaginatedResponse<User>> {
    try {
      return await paginatedRequest<User>('/users', page, limit, filters);
    } catch (error) {
      console.error('List users error:', error);
      throw error;
    }
  }

  /**
   * Récupérer un utilisateur par ID
   */
  async getById(id: string): Promise<User> {
    try {
      return await api.get<User>(`/users/${id}`);
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  /**
   * Créer un nouvel utilisateur (admin uniquement)
   */
  async create(data: CreateUserData): Promise<User> {
    try {
      return await api.post<User>('/users', data);
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un utilisateur (soi-même ou admin)
   */
  async update(id: string, data: UpdateUserData): Promise<User> {
    try {
      return await api.put<User>(`/users/${id}`, data);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  /**
   * Supprimer un utilisateur (admin uniquement)
   */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  /**
   * Rechercher des utilisateurs
   */
  async search(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<User>> {
    try {
      return await this.list(page, limit, { search: query });
    } catch (error) {
      console.error('Search users error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les utilisateurs d'un club
   */
  async getByClub(
    clubId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<User>> {
    try {
      return await this.list(page, limit, { clubId });
    } catch (error) {
      console.error('Get users by club error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les utilisateurs par rôle
   */
  async getByRole(
    role: Role,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<User>> {
    try {
      return await this.list(page, limit, { role });
    } catch (error) {
      console.error('Get users by role error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les admins
   */
  async getAdmins(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<User>> {
    try {
      return await this.getByRole('admin', page, limit);
    } catch (error) {
      console.error('Get admins error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les coachs
   */
  async getCoaches(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<User>> {
    try {
      return await this.getByRole('coach', page, limit);
    } catch (error) {
      console.error('Get coaches error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les assistants
   */
  async getAssistants(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<User>> {
    try {
      return await this.getByRole('assistant', page, limit);
    } catch (error) {
      console.error('Get assistants error:', error);
      throw error;
    }
  }

  /**
   * Changer le rôle d'un utilisateur (admin uniquement)
   */
  async changeRole(id: string, role: Role): Promise<User> {
    try {
      return await this.update(id, { role });
    } catch (error) {
      console.error('Change user role error:', error);
      throw error;
    }
  }

  /**
   * Ajouter un utilisateur à un club
   */
  async addToClub(id: string, clubId: string): Promise<User> {
    try {
      return await this.update(id, { clubId });
    } catch (error) {
      console.error('Add user to club error:', error);
      throw error;
    }
  }

  /**
   * Retirer un utilisateur d'un club
   */
  async removeFromClub(id: string): Promise<User> {
    try {
      return await this.update(id, { clubId: undefined });
    } catch (error) {
      console.error('Remove user from club error:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour son propre profil
   */
  async updateProfile(data: Omit<UpdateUserData, 'role' | 'clubId'>): Promise<User> {
    try {
      // On récupère l'ID utilisateur depuis le localStorage ou le context
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        throw new Error('User not authenticated');
      }

      return await this.update(userId, data);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Changer son mot de passe
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.put('/users/change-password', {
        currentPassword,
        newPassword
      });
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Demande de réinitialisation de mot de passe
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await api.post('/users/request-password-reset', { email });
    } catch (error) {
      console.error('Request password reset error:', error);
      throw error;
    }
  }

  /**
   * Réinitialiser le mot de passe avec un token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await api.post('/users/reset-password', {
        token,
        newPassword
      });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour l'avatar d'un utilisateur
   */
  async updateAvatar(id: string, avatar: string): Promise<User> {
    try {
      return await this.update(id, { avatar });
    } catch (error) {
      console.error('Update avatar error:', error);
      throw error;
    }
  }

  /**
   * Supprimer l'avatar d'un utilisateur
   */
  async removeAvatar(id: string): Promise<User> {
    try {
      return await this.update(id, { avatar: undefined });
    } catch (error) {
      console.error('Remove avatar error:', error);
      throw error;
    }
  }

  /**
   * Supprimer son propre compte (RGPD - Droit à l'oubli)
   * Supprime l'utilisateur connecté et toutes ses données associées
   */
  async deleteOwnAccount(): Promise<{ success: boolean; message: string; deletedAt: string }> {
    try {
      return await api.delete('/users/account');
    } catch (error) {
      console.error('Delete own account error:', error);
      throw error;
    }
  }
}

// Instance singleton
export const usersService = new UsersService();
export default usersService;