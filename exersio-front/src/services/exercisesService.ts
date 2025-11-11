import { api, paginatedRequest, type PaginatedResponse } from './api';
import type { Exercise } from '../types';

export interface CreateExerciseData {
  name: string;
  description: string;
  duration: number;
  category: string;
  ageCategory: string;
  sport: string;
  instructions: string[];
  fieldData?: any;
  createdById: string;
  isPublic?: boolean;
  level?: string;
  intensity?: string;
  playersMin?: number;
  playersMax?: number;
  notes?: string;
  tags?: string[];
  clubId?: string;
}

export interface UpdateExerciseData extends Partial<CreateExerciseData> {}

export interface ExerciseFilters {
  search?: string;

  // Nouveaux filtres par ID de catégorie
  categoryId?: string;
  ageCategoryId?: string;
  sportId?: string;
  categoryIds?: string[]; // Multiples catégories
  ageCategoryIds?: string[]; // Multiples catégories d'âge

  // Anciens filtres pour rétrocompatibilité
  category?: string;
  ageCategory?: string;

  sport?: string;
  level?: string;
  intensity?: string;
  isPublic?: boolean;
  clubId?: string;
  createdById?: string;
  scope?: 'personal' | 'club' | 'all';

  // Pagination
  page?: number;
  limit?: number;
}

export class ExercisesService {
  
  /**
   * Récupérer tous les exercices (sans pagination)
   */
  async getAll(filters: ExerciseFilters = {}): Promise<Exercise[]> {
    try {
      // Récupérer une grande page pour avoir tous les exercices
      const response = await this.list(1, 1000, filters);
      return response.data;
    } catch (error) {
      console.error('Get all exercises error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les exercices avec filtres et pagination (interface simplifiée pour la modal)
   */
  async getExercises(params: ExerciseFilters): Promise<{ exercises: Exercise[]; total: number }> {
    try {
      const { page = 1, limit = 10, ...filters } = params;
      const response = await this.list(page, limit, filters);
      return {
        exercises: response.data,
        total: response.pagination.total
      };
    } catch (error) {
      console.error('Get exercises error:', error);
      return { exercises: [], total: 0 };
    }
  }

  /**
   * Lister les exercices avec pagination et filtres
   */
  async list(
    page: number = 1,
    limit: number = 10,
    filters: ExerciseFilters = {}
  ): Promise<PaginatedResponse<Exercise>> {
    try {
      return await paginatedRequest<Exercise>('/exercises', page, limit, filters);
    } catch (error) {
      console.error('List exercises error:', error);
      throw error;
    }
  }

  /**
   * Récupérer un exercice par ID
   */
  async getById(id: string): Promise<Exercise> {
    try {
      return await api.get<Exercise>(`/exercises/${id}`);
    } catch (error) {
      console.error('Get exercise error:', error);
      throw error;
    }
  }

  /**
   * Créer un nouvel exercice
   */
  async create(data: CreateExerciseData): Promise<Exercise> {
    try {
      return await api.post<Exercise>('/exercises', data);
    } catch (error) {
      console.error('Create exercise error:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un exercice
   */
  async update(id: string, data: UpdateExerciseData): Promise<Exercise> {
    try {
      return await api.put<Exercise>(`/exercises/${id}`, data);
    } catch (error) {
      console.error('Update exercise error:', error);
      throw error;
    }
  }

  /**
   * Supprimer un exercice
   */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/exercises/${id}`);
    } catch (error) {
      console.error('Delete exercise error:', error);
      throw error;
    }
  }

  /**
   * Rechercher des exercices
   */
  async search(
    query: string,
    filters: Omit<ExerciseFilters, 'search'> = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Exercise>> {
    try {
      return await this.list(page, limit, { ...filters, search: query });
    } catch (error) {
      console.error('Search exercises error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les exercices d'un club
   */
  async getByClub(
    clubId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Exercise>> {
    try {
      return await this.list(page, limit, { clubId });
    } catch (error) {
      console.error('Get club exercises error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les exercices créés par un utilisateur
   */
  async getByCreator(
    createdById: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Exercise>> {
    try {
      return await this.list(page, limit, { createdById });
    } catch (error) {
      console.error('Get creator exercises error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les exercices publics
   */
  async getPublic(
    page: number = 1,
    limit: number = 10,
    filters: Omit<ExerciseFilters, 'isPublic'> = {}
  ): Promise<PaginatedResponse<Exercise>> {
    try {
      return await this.list(page, limit, { ...filters, isPublic: true });
    } catch (error) {
      console.error('Get public exercises error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les exercices par catégorie
   */
  async getByCategory(
    category: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Exercise>> {
    try {
      return await this.list(page, limit, { category });
    } catch (error) {
      console.error('Get exercises by category error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les exercices par sport
   */
  async getBySport(
    sport: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Exercise>> {
    try {
      return await this.list(page, limit, { sport });
    } catch (error) {
      console.error('Get exercises by sport error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les exercices par niveau
   */
  async getByLevel(
    level: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Exercise>> {
    try {
      return await this.list(page, limit, { level });
    } catch (error) {
      console.error('Get exercises by level error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les exercices par intensité
   */
  async getByIntensity(
    intensity: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Exercise>> {
    try {
      return await this.list(page, limit, { intensity });
    } catch (error) {
      console.error('Get exercises by intensity error:', error);
      throw error;
    }
  }


  /**
   * Partager un exercice avec le club
   */
  async shareWithClub(id: string): Promise<Exercise> {
    try {
      return await api.post<Exercise>(`/exercises/${id}/share`);
    } catch (error) {
      console.error('Share exercise with club error:', error);
      throw error;
    }
  }

  /**
   * Obtenir les permissions de l'utilisateur pour un exercice
   */
  async getPermissions(id: string): Promise<{ canEdit: boolean; canDelete: boolean }> {
    try {
      return await api.get<{ canEdit: boolean; canDelete: boolean }>(`/exercises/${id}/permissions`);
    } catch (error) {
      console.error('Get exercise permissions error:', error);
      throw error;
    }
  }

  /**
   * Vérifier si l'utilisateur peut éditer l'exercice
   */
  async canEdit(id: string): Promise<boolean> {
    try {
      const permissions = await this.getPermissions(id);
      return permissions.canEdit;
    } catch (error) {
      console.error('Check edit permissions error:', error);
      return false;
    }
  }

  /**
   * Vérifier si l'utilisateur peut supprimer l'exercice
   */
  async canDelete(id: string): Promise<boolean> {
    try {
      const permissions = await this.getPermissions(id);
      return permissions.canDelete;
    } catch (error) {
      console.error('Check delete permissions error:', error);
      return false;
    }
  }
}

// Instance singleton
export const exercisesService = new ExercisesService();
export const exercisesApi = exercisesService; // Alias pour compatibilité
export default exercisesService;