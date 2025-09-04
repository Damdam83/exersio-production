import { api, paginatedRequest, type PaginatedResponse } from './api';
import type { Club } from '../types';

export interface CreateClubData {
  name: string;
  description?: string;
  logo?: string;
}

export interface UpdateClubData extends Partial<CreateClubData> {}

export interface ClubFilters {
  search?: string;
  ownerId?: string;
}

export class ClubsService {
  
  /**
   * Lister les clubs avec pagination et filtres
   */
  async list(
    page: number = 1,
    limit: number = 10,
    filters: ClubFilters = {}
  ): Promise<PaginatedResponse<Club>> {
    try {
      return await paginatedRequest<Club>('/clubs', page, limit, filters);
    } catch (error) {
      console.error('List clubs error:', error);
      throw error;
    }
  }

  /**
   * Récupérer un club par ID
   */
  async getById(id: string): Promise<Club> {
    try {
      return await api.get<Club>(`/clubs/${id}`);
    } catch (error) {
      console.error('Get club error:', error);
      throw error;
    }
  }

  /**
   * Créer un nouveau club
   */
  async create(data: CreateClubData): Promise<Club> {
    try {
      return await api.post<Club>('/clubs', data);
    } catch (error) {
      console.error('Create club error:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un club
   */
  async update(id: string, data: UpdateClubData): Promise<Club> {
    try {
      return await api.put<Club>(`/clubs/${id}`, data);
    } catch (error) {
      console.error('Update club error:', error);
      throw error;
    }
  }

  /**
   * Supprimer un club
   */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/clubs/${id}`);
    } catch (error) {
      console.error('Delete club error:', error);
      throw error;
    }
  }

  /**
   * Rechercher des clubs
   */
  async search(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Club>> {
    try {
      return await this.list(page, limit, { search: query });
    } catch (error) {
      console.error('Search clubs error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les clubs créés par un utilisateur
   */
  async getByOwner(
    ownerId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Club>> {
    try {
      return await this.list(page, limit, { ownerId });
    } catch (error) {
      console.error('Get clubs by owner error:', error);
      throw error;
    }
  }

  /**
   * Rejoindre un club avec un code d'invitation
   */
  async joinByCode(inviteCode: string): Promise<Club> {
    try {
      return await api.post<Club>(`/clubs/join/${inviteCode}`);
    } catch (error) {
      console.error('Join club error:', error);
      throw error;
    }
  }
}

// Instance singleton
export const clubsService = new ClubsService();
export default clubsService;