import { api, paginatedRequest, type PaginatedResponse } from './api';
import type { Session, SessionStatus } from '../types';

export interface CreateSessionData {
  name: string;
  description?: string;
  date: string; // ISO date string
  duration: number;
  exercises: string[]; // Array of exercise IDs
  objectives?: string[];
  clubId?: string;
  sport?: string;
  ageCategory?: string;
  level?: string;
  status?: SessionStatus;
  notes?: string;
  createdById: string; // Required field for session creation
}

export interface UpdateSessionData extends Partial<CreateSessionData> {}

export interface SessionFilters {
  search?: string;
  status?: SessionStatus;
  sport?: string;
  ageCategory?: string;
  clubId?: string;
  createdById?: string;
  dateFrom?: string; // ISO date string
  dateTo?: string; // ISO date string
}

export class SessionsService {
  
  /**
   * Récupérer toutes les sessions (sans pagination)
   */
  async getAll(filters: SessionFilters = {}): Promise<Session[]> {
    try {
      // Récupérer une grande page pour avoir toutes les sessions
      const response = await this.list(1, 1000, filters);
      return response.data;
    } catch (error) {
      console.error('Get all sessions error:', error);
      throw error;
    }
  }

  /**
   * Lister les sessions avec pagination et filtres
   */
  async list(
    page: number = 1,
    limit: number = 10,
    filters: SessionFilters = {}
  ): Promise<PaginatedResponse<Session>> {
    try {
      return await paginatedRequest<Session>('/sessions', page, limit, filters);
    } catch (error) {
      console.error('List sessions error:', error);
      throw error;
    }
  }

  /**
   * Récupérer une session par ID
   */
  async getById(id: string): Promise<Session> {
    try {
      return await api.get<Session>(`/sessions/${id}`);
    } catch (error) {
      console.error('Get session error:', error);
      throw error;
    }
  }

  /**
   * Créer une nouvelle session
   */
  async create(data: CreateSessionData): Promise<Session> {
    try {
      return await api.post<Session>('/sessions', data);
    } catch (error) {
      console.error('Create session error:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour une session
   */
  async update(id: string, data: UpdateSessionData): Promise<Session> {
    try {
      return await api.put<Session>(`/sessions/${id}`, data);
    } catch (error) {
      console.error('Update session error:', error);
      throw error;
    }
  }

  /**
   * Supprimer une session
   */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/sessions/${id}`);
    } catch (error) {
      console.error('Delete session error:', error);
      throw error;
    }
  }

  /**
   * Dupliquer une session
   */
  async duplicate(id: string): Promise<Session> {
    try {
      return await api.post<Session>(`/sessions/${id}/duplicate`);
    } catch (error) {
      console.error('Duplicate session error:', error);
      throw error;
    }
  }

  /**
   * Rechercher des sessions
   */
  async search(
    query: string,
    filters: Omit<SessionFilters, 'search'> = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Session>> {
    try {
      return await this.list(page, limit, { ...filters, search: query });
    } catch (error) {
      console.error('Search sessions error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les sessions d'un club
   */
  async getByClub(
    clubId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Session>> {
    try {
      return await this.list(page, limit, { clubId });
    } catch (error) {
      console.error('Get club sessions error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les sessions créées par un utilisateur
   */
  async getByCreator(
    createdById: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Session>> {
    try {
      return await this.list(page, limit, { createdById });
    } catch (error) {
      console.error('Get creator sessions error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les sessions par statut
   */
  async getByStatus(
    status: SessionStatus,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Session>> {
    try {
      return await this.list(page, limit, { status });
    } catch (error) {
      console.error('Get sessions by status error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les sessions planifiées
   */
  async getPlanned(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Session>> {
    try {
      return await this.getByStatus('planned', page, limit);
    } catch (error) {
      console.error('Get planned sessions error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les sessions en cours
   */
  async getInProgress(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Session>> {
    try {
      return await this.getByStatus('in-progress', page, limit);
    } catch (error) {
      console.error('Get in-progress sessions error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les sessions terminées
   */
  async getCompleted(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Session>> {
    try {
      return await this.getByStatus('completed', page, limit);
    } catch (error) {
      console.error('Get completed sessions error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les sessions annulées
   */
  async getCancelled(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Session>> {
    try {
      return await this.getByStatus('cancelled', page, limit);
    } catch (error) {
      console.error('Get cancelled sessions error:', error);
      throw error;
    }
  }

  /**
   * Récupérer l'historique des sessions (terminées + annulées)
   */
  async getHistory(
    page: number = 1,
    limit: number = 10,
    filters: Omit<SessionFilters, 'status'> = {}
  ): Promise<PaginatedResponse<Session>> {
    try {
      // On récupère les deux statuts séparément puis on les combine
      const [completed, cancelled] = await Promise.all([
        this.list(page, Math.ceil(limit / 2), { ...filters, status: 'completed' }),
        this.list(page, Math.ceil(limit / 2), { ...filters, status: 'cancelled' })
      ]);

      // Combiner et trier par date (plus récent en premier)
      const allSessions = [...completed.data, ...cancelled.data]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);

      return {
        data: allSessions,
        meta: {
          page,
          limit,
          total: completed.meta.total + cancelled.meta.total,
          totalPages: Math.ceil((completed.meta.total + cancelled.meta.total) / limit)
        }
      };
    } catch (error) {
      console.error('Get session history error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les sessions par plage de dates
   */
  async getByDateRange(
    dateFrom: string,
    dateTo: string,
    page: number = 1,
    limit: number = 10,
    filters: Omit<SessionFilters, 'dateFrom' | 'dateTo'> = {}
  ): Promise<PaginatedResponse<Session>> {
    try {
      return await this.list(page, limit, { ...filters, dateFrom, dateTo });
    } catch (error) {
      console.error('Get sessions by date range error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les sessions d'aujourd'hui
   */
  async getToday(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Session>> {
    try {
      const today = new Date();
      const dateFrom = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const dateTo = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
      
      return await this.getByDateRange(dateFrom, dateTo, page, limit);
    } catch (error) {
      console.error('Get today sessions error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les sessions de cette semaine
   */
  async getThisWeek(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Session>> {
    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      
      return await this.getByDateRange(
        startOfWeek.toISOString(),
        endOfWeek.toISOString(),
        page,
        limit
      );
    } catch (error) {
      console.error('Get this week sessions error:', error);
      throw error;
    }
  }

  /**
   * Changer le statut d'une session
   */
  async updateStatus(id: string, status: SessionStatus): Promise<Session> {
    try {
      return await this.update(id, { status });
    } catch (error) {
      console.error('Update session status error:', error);
      throw error;
    }
  }

  /**
   * Démarrer une session (passer en "in-progress")
   */
  async start(id: string): Promise<Session> {
    try {
      return await this.updateStatus(id, 'in-progress');
    } catch (error) {
      console.error('Start session error:', error);
      throw error;
    }
  }

  /**
   * Terminer une session (passer en "completed")
   */
  async complete(id: string, notes?: string): Promise<Session> {
    try {
      const updateData: UpdateSessionData = { status: 'completed' };
      if (notes) {
        updateData.notes = notes;
      }
      return await this.update(id, updateData);
    } catch (error) {
      console.error('Complete session error:', error);
      throw error;
    }
  }

  /**
   * Annuler une session (passer en "cancelled")
   */
  async cancel(id: string, reason?: string): Promise<Session> {
    try {
      const updateData: UpdateSessionData = { status: 'cancelled' };
      if (reason) {
        updateData.notes = reason;
      }
      return await this.update(id, updateData);
    } catch (error) {
      console.error('Cancel session error:', error);
      throw error;
    }
  }

  /**
   * Ajouter un exercice à une session
   */
  async addExercise(sessionId: string, exerciseId: string): Promise<Session> {
    try {
      const session = await this.getById(sessionId);
      const updatedExercises = [...session.exercises, exerciseId];
      return await this.update(sessionId, { exercises: updatedExercises });
    } catch (error) {
      console.error('Add exercise to session error:', error);
      throw error;
    }
  }

  /**
   * Retirer un exercice d'une session
   */
  async removeExercise(sessionId: string, exerciseId: string): Promise<Session> {
    try {
      const session = await this.getById(sessionId);
      const updatedExercises = session.exercises.filter(id => id !== exerciseId);
      return await this.update(sessionId, { exercises: updatedExercises });
    } catch (error) {
      console.error('Remove exercise from session error:', error);
      throw error;
    }
  }
}

// Instance singleton
export const sessionsService = new SessionsService();
export default sessionsService;