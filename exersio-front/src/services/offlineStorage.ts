/**
 * Service de stockage local pour le mode hors connexion
 * Utilise IndexedDB pour stocker exercices et sessions localement
 */

import { Exercise, Session } from '../types';

export interface OfflineItem<T> {
  id: string;
  data: T;
  syncStatus: 'synced' | 'pending' | 'conflict' | 'local-only';
  lastModified: number;
  lastSynced?: number;
}

export type OfflineExercise = OfflineItem<Exercise>;
export type OfflineSession = OfflineItem<Session>;

class OfflineStorageService {
  private dbName = 'ExersioOfflineDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Store pour les exercices
        if (!db.objectStoreNames.contains('exercises')) {
          const exerciseStore = db.createObjectStore('exercises', { keyPath: 'id' });
          exerciseStore.createIndex('syncStatus', 'syncStatus', { unique: false });
          exerciseStore.createIndex('lastModified', 'lastModified', { unique: false });
        }
        
        // Store pour les sessions
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('syncStatus', 'syncStatus', { unique: false });
          sessionStore.createIndex('lastModified', 'lastModified', { unique: false });
        }
        
        // Store pour les métadonnées
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
    });
  }

  private ensureDB(): IDBDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  // === EXERCISES ===
  
  async saveExercise(exercise: Exercise, syncStatus: OfflineExercise['syncStatus'] = 'pending'): Promise<void> {
    const db = this.ensureDB();
    const transaction = db.transaction(['exercises'], 'readwrite');
    const store = transaction.objectStore('exercises');
    
    const offlineExercise: OfflineExercise = {
      id: exercise.id,
      data: exercise,
      syncStatus,
      lastModified: Date.now(),
      lastSynced: syncStatus === 'synced' ? Date.now() : undefined
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(offlineExercise);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
  
  async getExercise(id: string): Promise<OfflineExercise | null> {
    const db = this.ensureDB();
    const transaction = db.transaction(['exercises'], 'readonly');
    const store = transaction.objectStore('exercises');
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }
  
  async getAllExercises(): Promise<OfflineExercise[]> {
    const db = this.ensureDB();
    const transaction = db.transaction(['exercises'], 'readonly');
    const store = transaction.objectStore('exercises');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }
  
  async getPendingExercises(): Promise<OfflineExercise[]> {
    const db = this.ensureDB();
    const transaction = db.transaction(['exercises'], 'readonly');
    const store = transaction.objectStore('exercises');
    const index = store.index('syncStatus');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll('pending');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async deleteExercise(id: string): Promise<void> {
    const db = this.ensureDB();
    const transaction = db.transaction(['exercises'], 'readwrite');
    const store = transaction.objectStore('exercises');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // === SESSIONS ===
  
  async saveSession(session: Session, syncStatus: OfflineSession['syncStatus'] = 'pending'): Promise<void> {
    const db = this.ensureDB();
    const transaction = db.transaction(['sessions'], 'readwrite');
    const store = transaction.objectStore('sessions');
    
    const offlineSession: OfflineSession = {
      id: session.id,
      data: session,
      syncStatus,
      lastModified: Date.now(),
      lastSynced: syncStatus === 'synced' ? Date.now() : undefined
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(offlineSession);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
  
  async getSession(id: string): Promise<OfflineSession | null> {
    const db = this.ensureDB();
    const transaction = db.transaction(['sessions'], 'readonly');
    const store = transaction.objectStore('sessions');
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }
  
  async getAllSessions(): Promise<OfflineSession[]> {
    const db = this.ensureDB();
    const transaction = db.transaction(['sessions'], 'readonly');
    const store = transaction.objectStore('sessions');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }
  
  async getPendingSessions(): Promise<OfflineSession[]> {
    const db = this.ensureDB();
    const transaction = db.transaction(['sessions'], 'readonly');
    const store = transaction.objectStore('sessions');
    const index = store.index('syncStatus');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll('pending');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async deleteSession(id: string): Promise<void> {
    const db = this.ensureDB();
    const transaction = db.transaction(['sessions'], 'readwrite');
    const store = transaction.objectStore('sessions');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // === METADATA ===
  
  async setLastSyncTime(timestamp: number): Promise<void> {
    const db = this.ensureDB();
    const transaction = db.transaction(['metadata'], 'readwrite');
    const store = transaction.objectStore('metadata');
    
    return new Promise((resolve, reject) => {
      const request = store.put({ key: 'lastSyncTime', value: timestamp });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
  
  async getLastSyncTime(): Promise<number | null> {
    const db = this.ensureDB();
    const transaction = db.transaction(['metadata'], 'readonly');
    const store = transaction.objectStore('metadata');
    
    return new Promise((resolve, reject) => {
      const request = store.get('lastSyncTime');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.value || null);
    });
  }

  // === UTILITIES ===
  
  async getPendingItemsCount(): Promise<{ exercises: number; sessions: number }> {
    const [exercises, sessions] = await Promise.all([
      this.getPendingExercises(),
      this.getPendingSessions()
    ]);
    
    return {
      exercises: exercises.length,
      sessions: sessions.length
    };
  }
  
  async clearAll(): Promise<void> {
    const db = this.ensureDB();
    const transaction = db.transaction(['exercises', 'sessions', 'metadata'], 'readwrite');
    
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore('exercises').clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      }),
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore('sessions').clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      }),
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore('metadata').clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      })
    ]);
  }

  // Marquer un élément comme synchronisé
  async markAsSynced(type: 'exercise' | 'session', id: string): Promise<void> {
    const storeName = type === 'exercise' ? 'exercises' : 'sessions';
    const db = this.ensureDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onerror = () => reject(getRequest.error);
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.syncStatus = 'synced';
          item.lastSynced = Date.now();
          
          const putRequest = store.put(item);
          putRequest.onerror = () => reject(putRequest.error);
          putRequest.onsuccess = () => resolve();
        } else {
          resolve(); // Item n'existe pas, pas d'erreur
        }
      };
    });
  }
}

// Instance singleton
export const offlineStorage = new OfflineStorageService();