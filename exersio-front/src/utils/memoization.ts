/**
 * Utilities de mémorisation pour optimiser les performances
 * Évite les recalculs et re-renders inutiles
 */

import { useMemo, useCallback, useRef, useEffect } from 'react';

/**
 * Hook de mémorisation avancée avec dépendances profondes
 */
export function useDeepMemo<T>(factory: () => T, deps: any[]): T {
  const depsRef = useRef<any[]>();
  const valueRef = useRef<T>();

  const hasChanged = useMemo(() => {
    if (!depsRef.current) return true;
    if (depsRef.current.length !== deps.length) return true;
    
    return deps.some((dep, index) => 
      JSON.stringify(dep) !== JSON.stringify(depsRef.current![index])
    );
  }, deps);

  if (hasChanged) {
    depsRef.current = deps;
    valueRef.current = factory();
  }

  return valueRef.current!;
}

/**
 * Cache simple pour les calculs coûteux
 */
class SimpleCache<T> {
  private cache = new Map<string, { value: T; timestamp: number }>();
  private ttl: number;

  constructor(ttlMs: number = 5 * 60 * 1000) { // 5 minutes par défaut
    this.ttl = ttlMs;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Vérifier l'expiration
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key: string, value: T): void {
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Instances de cache globales pour différents types de données
export const exerciseCache = new SimpleCache(10 * 60 * 1000); // 10 minutes
export const sessionCache = new SimpleCache(5 * 60 * 1000);   // 5 minutes
export const userCache = new SimpleCache(15 * 60 * 1000);     // 15 minutes

/**
 * Hook pour les callbacks mémorisés avec debouncing
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: any[] = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay, ...deps]) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Hook pour la mémorisation de calculs coûteux avec cache persistant
 */
export function useCachedComputation<T>(
  key: string,
  computation: () => T,
  deps: any[],
  cache: SimpleCache<T>
): T {
  return useMemo(() => {
    // Créer une clé unique incluant les dépendances
    const cacheKey = `${key}_${JSON.stringify(deps)}`;
    
    // Vérifier le cache
    const cached = cache.get(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Calculer et mettre en cache
    const result = computation();
    cache.set(cacheKey, result);
    return result;
  }, [key, ...deps]);
}

/**
 * Hook pour limiter les appels de fonction (throttling)
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number,
  deps: any[] = []
): T {
  const inThrottle = useRef<boolean>(false);

  const throttledCallback = useCallback((...args: Parameters<T>) => {
    if (!inThrottle.current) {
      callback(...args);
      inThrottle.current = true;
      setTimeout(() => {
        inThrottle.current = false;
      }, limit);
    }
  }, [callback, limit, ...deps]) as T;

  return throttledCallback;
}

/**
 * Mémorisation des filtres et transformations de données
 */
export const memoizedFilters = {
  /**
   * Filtre les exercices selon les critères avec mémorisation
   */
  filterExercises: (() => {
    const cache = new Map<string, any[]>();
    
    return (exercises: any[], filters: any) => {
      const key = JSON.stringify({ exercises: exercises.length, filters });
      
      if (cache.has(key)) {
        return cache.get(key)!;
      }

      const filtered = exercises.filter(exercise => {
        // Filtrage par recherche
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const matchesSearch = 
            exercise.name.toLowerCase().includes(searchLower) ||
            exercise.description?.toLowerCase().includes(searchLower);
          if (!matchesSearch) return false;
        }

        // Filtrage par favoris
        if (filters.favorites) {
          return exercise.isFavorite;
        }

        // Filtrage par catégorie
        if (filters.category && filters.category !== 'all') {
          const category = filters.category.toLowerCase();
          const matchesCategory = 
            exercise.category?.toLowerCase().includes(category) ||
            exercise.ageCategory?.toLowerCase().includes(category);
          if (!matchesCategory) return false;
        }

        // Autres filtres
        if (filters.intensity && exercise.intensity !== filters.intensity) {
          return false;
        }
        if (filters.ageCategory && exercise.ageCategory !== filters.ageCategory) {
          return false;
        }

        return true;
      });

      cache.set(key, filtered);
      
      // Nettoyer le cache si il devient trop grand
      if (cache.size > 100) {
        const keys = Array.from(cache.keys());
        keys.slice(0, 50).forEach(key => cache.delete(key));
      }

      return filtered;
    };
  })(),

  /**
   * Trie les données avec mémorisation
   */
  sortData: (() => {
    const cache = new Map<string, any[]>();
    
    return (data: any[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc') => {
      const key = JSON.stringify({ length: data.length, sortBy, sortOrder });
      
      if (cache.has(key)) {
        return cache.get(key)!;
      }

      const sorted = [...data].sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortOrder === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        return 0;
      });

      cache.set(key, sorted);
      return sorted;
    };
  })()
};