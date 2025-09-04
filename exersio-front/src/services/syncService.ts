/**
 * Service de synchronisation avancé pour gérer les conflits
 * et la synchronisation bidirectionnelle
 */

import { offlineStorage, OfflineExercise, OfflineSession } from './offlineStorage';
import { api } from './api';
import { Exercise, Session } from '../types';

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  conflicts: number;
  errors: string[];
}

export interface SyncConflict {
  type: 'exercise' | 'session';
  id: string;
  localData: any;
  serverData: any;
  localModified: number;
  serverModified: number;
}

class SyncService {
  private isSyncing = false;

  async syncAll(): Promise<SyncResult> {
    if (this.isSyncing) {
      throw new Error('Synchronisation déjà en cours');
    }

    if (!navigator.onLine) {
      throw new Error('Impossible de synchroniser hors ligne');
    }

    this.isSyncing = true;

    try {
      const result: SyncResult = {
        success: true,
        synced: 0,
        failed: 0,
        conflicts: 0,
        errors: []
      };

      // Synchroniser les exercices en attente
      const exerciseResult = await this.syncPendingExercises();
      result.synced += exerciseResult.synced;
      result.failed += exerciseResult.failed;
      result.conflicts += exerciseResult.conflicts;
      result.errors.push(...exerciseResult.errors);

      // Synchroniser les sessions en attente
      const sessionResult = await this.syncPendingSessions();
      result.synced += sessionResult.synced;
      result.failed += sessionResult.failed;
      result.conflicts += sessionResult.conflicts;
      result.errors.push(...sessionResult.errors);

      result.success = result.failed === 0;

      // Mettre à jour l'heure de synchronisation
      if (result.synced > 0) {
        await offlineStorage.setLastSyncTime(Date.now());
      }

      return result;

    } finally {
      this.isSyncing = false;
    }
  }

  private async syncPendingExercises(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      conflicts: 0,
      errors: []
    };

    try {
      const pendingExercises = await offlineStorage.getPendingExercises();
      
      for (const offlineExercise of pendingExercises) {
        try {
          const syncItemResult = await this.syncExercise(offlineExercise);
          if (syncItemResult.success) {
            result.synced++;
          } else if (syncItemResult.conflicts > 0) {
            result.conflicts++;
          } else {
            result.failed++;
          }
          result.errors.push(...syncItemResult.errors);
        } catch (error) {
          result.failed++;
          result.errors.push(`Exercise ${offlineExercise.id}: ${error.message}`);
        }
      }

    } catch (error) {
      result.errors.push(`Error getting pending exercises: ${error.message}`);
      result.success = false;
    }

    return result;
  }

  private async syncPendingSessions(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      conflicts: 0,
      errors: []
    };

    try {
      const pendingSessions = await offlineStorage.getPendingSessions();
      
      for (const offlineSession of pendingSessions) {
        try {
          const syncItemResult = await this.syncSession(offlineSession);
          if (syncItemResult.success) {
            result.synced++;
          } else if (syncItemResult.conflicts > 0) {
            result.conflicts++;
          } else {
            result.failed++;
          }
          result.errors.push(...syncItemResult.errors);
        } catch (error) {
          result.failed++;
          result.errors.push(`Session ${offlineSession.id}: ${error.message}`);
        }
      }

    } catch (error) {
      result.errors.push(`Error getting pending sessions: ${error.message}`);
      result.success = false;
    }

    return result;
  }

  private async syncExercise(offlineExercise: OfflineExercise): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      synced: 0,
      failed: 0,
      conflicts: 0,
      errors: []
    };

    try {
      if (offlineExercise.syncStatus === 'local-only') {
        // Nouvel exercice à créer
        const newExercise = await api.post<Exercise>('/exercises', offlineExercise.data);
        
        // Supprimer l'ancien et sauvegarder le nouveau avec l'ID du serveur
        await offlineStorage.deleteExercise(offlineExercise.id);
        await offlineStorage.saveExercise(newExercise, 'synced');
        
        result.success = true;
        result.synced = 1;
      } else if (offlineExercise.syncStatus === 'pending') {
        // Mise à jour d'un exercice existant
        try {
          // Récupérer la version serveur pour détecter les conflits
          let serverExercise: Exercise;
          try {
            serverExercise = await api.get<Exercise>(`/exercises/${offlineExercise.id}`);
          } catch (error) {
            if (error.message.includes('404')) {
              // L'exercice n'existe plus sur le serveur - créer nouveau
              const newExercise = await api.post<Exercise>('/exercises', offlineExercise.data);
              await offlineStorage.saveExercise(newExercise, 'synced');
              result.success = true;
              result.synced = 1;
              return result;
            }
            throw error;
          }

          const serverModified = new Date(serverExercise.updatedAt).getTime();
          const localSynced = offlineExercise.lastSynced || 0;

          if (serverModified > localSynced) {
            // Conflit détecté
            await offlineStorage.saveExercise(offlineExercise.data, 'conflict');
            result.conflicts = 1;
            result.errors.push(`Conflict detected for exercise ${offlineExercise.id}`);
          } else {
            // Pas de conflit, mettre à jour
            await api.put(`/exercises/${offlineExercise.id}`, offlineExercise.data);
            await offlineStorage.markAsSynced('exercise', offlineExercise.id);
            result.success = true;
            result.synced = 1;
          }
        } catch (error) {
          throw error;
        }
      }

    } catch (error) {
      result.failed = 1;
      result.errors.push(error.message);
    }

    return result;
  }

  private async syncSession(offlineSession: OfflineSession): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      synced: 0,
      failed: 0,
      conflicts: 0,
      errors: []
    };

    try {
      if (offlineSession.syncStatus === 'local-only') {
        // Nouvelle session à créer
        const newSession = await api.post<Session>('/sessions', offlineSession.data);
        
        // Supprimer l'ancien et sauvegarder le nouveau avec l'ID du serveur
        await offlineStorage.deleteSession(offlineSession.id);
        await offlineStorage.saveSession(newSession, 'synced');
        
        result.success = true;
        result.synced = 1;
      } else if (offlineSession.syncStatus === 'pending') {
        // Mise à jour d'une session existante
        try {
          // Récupérer la version serveur pour détecter les conflits
          let serverSession: Session;
          try {
            serverSession = await api.get<Session>(`/sessions/${offlineSession.id}`);
          } catch (error) {
            if (error.message.includes('404')) {
              // La session n'existe plus sur le serveur - créer nouveau
              const newSession = await api.post<Session>('/sessions', offlineSession.data);
              await offlineStorage.saveSession(newSession, 'synced');
              result.success = true;
              result.synced = 1;
              return result;
            }
            throw error;
          }

          const serverModified = new Date(serverSession.updatedAt).getTime();
          const localSynced = offlineSession.lastSynced || 0;

          if (serverModified > localSynced) {
            // Conflit détecté
            await offlineStorage.saveSession(offlineSession.data, 'conflict');
            result.conflicts = 1;
            result.errors.push(`Conflict detected for session ${offlineSession.id}`);
          } else {
            // Pas de conflit, mettre à jour
            await api.put(`/sessions/${offlineSession.id}`, offlineSession.data);
            await offlineStorage.markAsSynced('session', offlineSession.id);
            result.success = true;
            result.synced = 1;
          }
        } catch (error) {
          throw error;
        }
      }

    } catch (error) {
      result.failed = 1;
      result.errors.push(error.message);
    }

    return result;
  }

  async downloadAllData(): Promise<SyncResult> {
    if (!navigator.onLine) {
      throw new Error('Impossible de télécharger hors ligne');
    }

    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      conflicts: 0,
      errors: []
    };

    try {
      // Télécharger tous les exercices
      const exercises = await api.get<Exercise[]>('/exercises');
      if (Array.isArray(exercises)) {
        for (const exercise of exercises) {
          await offlineStorage.saveExercise(exercise, 'synced');
          result.synced++;
        }
      }

      // Télécharger toutes les sessions
      const sessions = await api.get<Session[]>('/sessions');
      if (Array.isArray(sessions)) {
        for (const session of sessions) {
          await offlineStorage.saveSession(session, 'synced');
          result.synced++;
        }
      }

      // Mettre à jour l'heure de synchronisation
      await offlineStorage.setLastSyncTime(Date.now());

    } catch (error) {
      result.success = false;
      result.failed = 1;
      result.errors.push(`Download failed: ${error.message}`);
    }

    return result;
  }

  async getConflicts(): Promise<SyncConflict[]> {
    const conflicts: SyncConflict[] = [];

    try {
      // Exercices en conflit
      const allExercises = await offlineStorage.getAllExercises();
      const conflictingExercises = allExercises.filter(ex => ex.syncStatus === 'conflict');
      
      for (const exercise of conflictingExercises) {
        try {
          const serverExercise = await api.get<Exercise>(`/exercises/${exercise.id}`);
          conflicts.push({
            type: 'exercise',
            id: exercise.id,
            localData: exercise.data,
            serverData: serverExercise,
            localModified: exercise.lastModified,
            serverModified: new Date(serverExercise.updatedAt).getTime()
          });
        } catch (error) {
          console.warn(`Could not fetch server exercise ${exercise.id}:`, error);
        }
      }

      // Sessions en conflit
      const allSessions = await offlineStorage.getAllSessions();
      const conflictingSessions = allSessions.filter(s => s.syncStatus === 'conflict');
      
      for (const session of conflictingSessions) {
        try {
          const serverSession = await api.get<Session>(`/sessions/${session.id}`);
          conflicts.push({
            type: 'session',
            id: session.id,
            localData: session.data,
            serverData: serverSession,
            localModified: session.lastModified,
            serverModified: new Date(serverSession.updatedAt).getTime()
          });
        } catch (error) {
          console.warn(`Could not fetch server session ${session.id}:`, error);
        }
      }

    } catch (error) {
      console.error('Error getting conflicts:', error);
    }

    return conflicts;
  }

  async resolveConflict(type: 'exercise' | 'session', id: string, resolution: 'local' | 'server'): Promise<void> {
    if (resolution === 'local') {
      // Garder la version locale et la synchroniser
      if (type === 'exercise') {
        const exercise = await offlineStorage.getExercise(id);
        if (exercise) {
          await api.put(`/exercises/${id}`, exercise.data);
          await offlineStorage.markAsSynced('exercise', id);
        }
      } else {
        const session = await offlineStorage.getSession(id);
        if (session) {
          await api.put(`/sessions/${id}`, session.data);
          await offlineStorage.markAsSynced('session', id);
        }
      }
    } else {
      // Garder la version serveur
      if (type === 'exercise') {
        const serverExercise = await api.get<Exercise>(`/exercises/${id}`);
        await offlineStorage.saveExercise(serverExercise, 'synced');
      } else {
        const serverSession = await api.get<Session>(`/sessions/${id}`);
        await offlineStorage.saveSession(serverSession, 'synced');
      }
    }
  }
}

// Instance singleton
export const syncService = new SyncService();