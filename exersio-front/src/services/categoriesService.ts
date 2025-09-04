import { api } from './api';

export interface ExerciseCategory {
  id: string;
  name: string;
  slug: string;
  color?: string;
  icon?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgeCategory {
  id: string;
  name: string;
  slug: string;
  minAge?: number | null;
  maxAge?: number | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Level {
  id: string;
  name: string;
  description: string;
  order: number;
}

export class CategoriesService {
  
  /**
   * Récupérer toutes les catégories d'exercice
   */
  async getExerciseCategories(): Promise<ExerciseCategory[]> {
    try {
      return await api.get<ExerciseCategory[]>('/categories/exercise-categories');
    } catch (error) {
      console.error('Get exercise categories error:', error);
      throw error;
    }
  }

  /**
   * Récupérer toutes les catégories d'âge
   */
  async getAgeCategories(): Promise<AgeCategory[]> {
    try {
      return await api.get<AgeCategory[]>('/categories/age-categories');
    } catch (error) {
      console.error('Get age categories error:', error);
      throw error;
    }
  }

  /**
   * Récupérer tous les niveaux
   */
  async getLevels(): Promise<Level[]> {
    try {
      return await api.get<Level[]>('/categories/levels');
    } catch (error) {
      console.error('Get levels error:', error);
      throw error;
    }
  }
}

// Instance singleton
export const categoriesService = new CategoriesService();