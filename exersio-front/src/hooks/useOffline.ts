/**
 * Hook pour gérer le mode hors connexion
 */

import { useCallback, useEffect, useState } from 'react';
import { offlineStorage, OfflineExercise, OfflineSession } from '../services/offlineStorage';
import { syncService, SyncResult } from '../services/syncService';

export interface OfflineState {
  isOnline: boolean;
  pendingCount: {
    exercises: number;
    sessions: number;
  };
  lastSyncTime: number | null;
  isSyncing: boolean;
}

export interface OfflineActions {
  syncAll: () => Promise<SyncResult>;
  syncItem: (type: 'exercise' | 'session', id: string) => Promise<boolean>;
  saveForLater: (type: 'exercise' | 'session', data: any) => Promise<void>;
  downloadAll: () => Promise<void>;
  getPendingItems: () => Promise<{ exercises: OfflineExercise[], sessions: OfflineSession[] }>;
  clearOfflineData: () => Promise<void>;
}

export function useOffline() {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    pendingCount: { exercises: 0, sessions: 0 },
    lastSyncTime: null,
    isSyncing: false
  });

  // Initialiser IndexedDB au premier rendu
  useEffect(() => {
    offlineStorage.init().then(() => {
      updatePendingCount();
      loadLastSyncTime();
    });
  }, []);

  // Écouter les changements de connexion
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updatePendingCount = useCallback(async () => {
    try {
      const pendingCount = await offlineStorage.getPendingItemsCount();
      setState(prev => ({ ...prev, pendingCount }));
    } catch (error) {
      console.error('Failed to update pending count:', error);
    }
  }, []);

  const loadLastSyncTime = useCallback(async () => {
    try {
      const lastSyncTime = await offlineStorage.getLastSyncTime();
      setState(prev => ({ ...prev, lastSyncTime }));
    } catch (error) {
      console.error('Failed to load last sync time:', error);
    }
  }, []);

  const syncAll = useCallback(async (): Promise<SyncResult> => {
    if (!state.isOnline) {
      throw new Error('Impossible de synchroniser hors ligne');
    }

    setState(prev => ({ ...prev, isSyncing: true }));

    try {
      // Utiliser le service de synchronisation avancé
      const result = await syncService.syncAll();

      // Mettre à jour l'état local
      await loadLastSyncTime();
      await updatePendingCount();

      return result;

    } finally {
      setState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [state.isOnline, loadLastSyncTime, updatePendingCount]);

  const syncItem = useCallback(async (type: 'exercise' | 'session', id: string): Promise<boolean> => {
    if (!state.isOnline) {
      return false;
    }

    try {
      // Récupérer l'item local
      const offlineItem = type === 'exercise' 
        ? await offlineStorage.getExercise(id)
        : await offlineStorage.getSession(id);

      if (!offlineItem || offlineItem.syncStatus === 'synced') {
        return true; // Déjà synchronisé
      }

      // Envoyer à l'API
      const { api } = await import('../services/api');
      const endpoint = type === 'exercise' ? '/exercises' : '/sessions';

      if (offlineItem.syncStatus === 'local-only') {
        // Créer un nouvel élément
        await api.post(endpoint, offlineItem.data);
      } else {
        // Mettre à jour l'élément existant
        await api.put(`${endpoint}/${id}`, offlineItem.data);
      }

      // Marquer comme synchronisé
      await offlineStorage.markAsSynced(type, id);
      await updatePendingCount();

      return true;
    } catch (error) {
      console.error(`Failed to sync ${type} ${id}:`, error);
      return false;
    }
  }, [state.isOnline, updatePendingCount]);

  const saveForLater = useCallback(async (type: 'exercise' | 'session', data: any) => {
    try {
      if (type === 'exercise') {
        await offlineStorage.saveExercise(data, state.isOnline ? 'pending' : 'local-only');
      } else {
        await offlineStorage.saveSession(data, state.isOnline ? 'pending' : 'local-only');
      }
      await updatePendingCount();
    } catch (error) {
      console.error(`Failed to save ${type} for later:`, error);
      throw error;
    }
  }, [state.isOnline, updatePendingCount]);

  const downloadAll = useCallback(async () => {
    if (!state.isOnline) {
      throw new Error('Impossible de télécharger hors ligne');
    }

    try {
      setState(prev => ({ ...prev, isSyncing: true }));

      // Utiliser le service de synchronisation pour télécharger
      await syncService.downloadAllData();

      // Mettre à jour l'état local
      await loadLastSyncTime();
      await updatePendingCount();

    } finally {
      setState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [state.isOnline, loadLastSyncTime, updatePendingCount]);

  const getPendingItems = useCallback(async (): Promise<{ exercises: OfflineExercise[], sessions: OfflineSession[] }> => {
    try {
      const [exercises, sessions] = await Promise.all([
        offlineStorage.getPendingExercises(),
        offlineStorage.getPendingSessions()
      ]);
      return { exercises, sessions };
    } catch (error) {
      console.error('Failed to get pending items:', error);
      return { exercises: [], sessions: [] };
    }
  }, []);

  const clearOfflineData = useCallback(async () => {
    try {
      await offlineStorage.clearAll();
      await updatePendingCount();
      setState(prev => ({ ...prev, lastSyncTime: null }));
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      throw error;
    }
  }, [updatePendingCount]);

  const actions: OfflineActions = {
    syncAll,
    syncItem,
    saveForLater,
    downloadAll,
    getPendingItems,
    clearOfflineData
  };

  return { state, actions };
}