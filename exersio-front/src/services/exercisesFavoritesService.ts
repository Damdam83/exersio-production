import { api } from './api';

export interface UserExerciseFavorite {
  id: string;
  userId: string;
  exerciseId: string;
  createdAt: Date | string;
}

export class ExercisesFavoritesService {
  
  /**
   * Récupérer les favoris de l'utilisateur actuel
   */
  async getFavorites(): Promise<string[]> {
    try {
      const favorites = await api.get<UserExerciseFavorite[]>('/user/favorites/exercises');
      return favorites.map(fav => fav.exerciseId);
    } catch (error) {
      console.error('Get favorites error:', error);
      throw error;
    }
  }

  /**
   * Ajouter un exercice aux favoris
   */
  async addFavorite(exerciseId: string): Promise<void> {
    try {
      await api.post('/user/favorites/exercises', { exerciseId });
    } catch (error) {
      console.error('Add favorite error:', error);
      throw error;
    }
  }

  /**
   * Retirer un exercice des favoris
   */
  async removeFavorite(exerciseId: string): Promise<void> {
    try {
      await api.delete(`/user/favorites/exercises/${exerciseId}`);
    } catch (error) {
      console.error('Remove favorite error:', error);
      throw error;
    }
  }

  /**
   * Basculer le statut favori d'un exercice
   */
  async toggleFavorite(exerciseId: string, currentlyFavorite: boolean): Promise<void> {
    try {
      if (currentlyFavorite) {
        await this.removeFavorite(exerciseId);
      } else {
        await this.addFavorite(exerciseId);
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
      throw error;
    }
  }
}

export const exercisesFavoritesService = new ExercisesFavoritesService();