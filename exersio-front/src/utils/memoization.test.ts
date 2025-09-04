/**
 * Tests pour les utilitaires de mémorisation
 * Vérifie l'efficacité des optimisations de performance
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { 
  useDeepMemo, 
  useDebouncedCallback, 
  useThrottledCallback,
  memoizedFilters,
  exerciseCache,
  sessionCache
} from './memoization';

describe('Memoization Utils', () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
    exerciseCache.clear();
    sessionCache.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useDeepMemo', () => {
    it('should memoize based on deep equality', () => {
      const factory = vi.fn(() => ({ computed: 'value' }));
      const deps = [{ nested: { value: 'test' } }];

      const { result, rerender } = renderHook(
        ({ deps }) => useDeepMemo(factory, deps),
        { initialProps: { deps } }
      );

      expect(factory).toHaveBeenCalledTimes(1);
      const firstResult = result.current;

      // Rerender avec les mêmes deps (deep equal)
      rerender({ deps: [{ nested: { value: 'test' } }] });
      expect(factory).toHaveBeenCalledTimes(1);
      expect(result.current).toBe(firstResult);

      // Rerender avec des deps différentes
      rerender({ deps: [{ nested: { value: 'changed' } }] });
      expect(factory).toHaveBeenCalledTimes(2);
      expect(result.current).not.toBe(firstResult);
    });

    it('should handle empty dependencies', () => {
      const factory = vi.fn(() => 'result');
      const { result } = renderHook(() => useDeepMemo(factory, []));

      expect(factory).toHaveBeenCalledTimes(1);
      expect(result.current).toBe('result');
    });
  });

  describe('useDebouncedCallback', () => {
    it('should debounce function calls', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => 
        useDebouncedCallback(callback, 500)
      );

      // Appeler plusieurs fois rapidement
      act(() => {
        result.current('arg1');
        result.current('arg2');
        result.current('arg3');
      });

      // Callback ne devrait pas encore être appelé
      expect(callback).not.toHaveBeenCalled();

      // Avancer le temps
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Callback devrait être appelé une seule fois avec le dernier argument
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('arg3');
    });

    it('should reset debounce on new calls', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => 
        useDebouncedCallback(callback, 500)
      );

      act(() => {
        result.current('arg1');
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      act(() => {
        result.current('arg2');
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Callback ne devrait pas encore être appelé
      expect(callback).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Maintenant callback devrait être appelé
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('arg2');
    });
  });

  describe('useThrottledCallback', () => {
    it('should throttle function calls', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => 
        useThrottledCallback(callback, 500)
      );

      // Premier appel - devrait passer
      act(() => {
        result.current('arg1');
      });
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('arg1');

      // Appels suivants - devraient être ignorés
      act(() => {
        result.current('arg2');
        result.current('arg3');
      });
      expect(callback).toHaveBeenCalledTimes(1);

      // Avancer le temps pour dépasser la limite
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Nouvel appel - devrait passer
      act(() => {
        result.current('arg4');
      });
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenLastCalledWith('arg4');
    });
  });

  describe('memoizedFilters', () => {
    describe('filterExercises', () => {
      const mockExercises = [
        {
          id: '1',
          name: 'Exercise 1',
          description: 'Description 1',
          category: 'technique',
          ageCategory: 'junior',
          isFavorite: true
        },
        {
          id: '2',
          name: 'Exercise 2',
          description: 'Description 2',
          category: 'physical',
          ageCategory: 'senior',
          isFavorite: false
        }
      ];

      it('should filter by search term', () => {
        const filters = { search: 'Exercise 1' };
        const result = memoizedFilters.filterExercises(mockExercises, filters);
        
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Exercise 1');
      });

      it('should filter by favorites', () => {
        const filters = { favorites: true };
        const result = memoizedFilters.filterExercises(mockExercises, filters);
        
        expect(result).toHaveLength(1);
        expect(result[0].isFavorite).toBe(true);
      });

      it('should filter by category', () => {
        const filters = { category: 'technique' };
        const result = memoizedFilters.filterExercises(mockExercises, filters);
        
        expect(result).toHaveLength(1);
        expect(result[0].category).toBe('technique');
      });

      it('should return cached results for same filters', () => {
        const filters = { search: 'Exercise' };
        
        const result1 = memoizedFilters.filterExercises(mockExercises, filters);
        const result2 = memoizedFilters.filterExercises(mockExercises, filters);
        
        expect(result1).toBe(result2); // Same reference = cached
      });

      it('should handle combined filters', () => {
        const filters = { 
          search: 'Exercise',
          category: 'technique',
          favorites: false 
        };
        const result = memoizedFilters.filterExercises(mockExercises, filters);
        
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('1');
      });
    });

    describe('sortData', () => {
      const mockData = [
        { id: '2', name: 'B Item', value: 10 },
        { id: '1', name: 'A Item', value: 20 },
        { id: '3', name: 'C Item', value: 5 }
      ];

      it('should sort by string field ascending', () => {
        const result = memoizedFilters.sortData(mockData, 'name', 'asc');
        
        expect(result[0].name).toBe('A Item');
        expect(result[1].name).toBe('B Item');
        expect(result[2].name).toBe('C Item');
      });

      it('should sort by string field descending', () => {
        const result = memoizedFilters.sortData(mockData, 'name', 'desc');
        
        expect(result[0].name).toBe('C Item');
        expect(result[1].name).toBe('B Item');
        expect(result[2].name).toBe('A Item');
      });

      it('should sort by number field', () => {
        const result = memoizedFilters.sortData(mockData, 'value', 'asc');
        
        expect(result[0].value).toBe(5);
        expect(result[1].value).toBe(10);
        expect(result[2].value).toBe(20);
      });

      it('should return cached results', () => {
        const result1 = memoizedFilters.sortData(mockData, 'name', 'asc');
        const result2 = memoizedFilters.sortData(mockData, 'name', 'asc');
        
        expect(result1).toBe(result2);
      });
    });
  });

  describe('Cache classes', () => {
    it('should store and retrieve cached values', () => {
      exerciseCache.set('key1', { data: 'test' });
      const result = exerciseCache.get('key1');
      
      expect(result).toEqual({ data: 'test' });
    });

    it('should return null for non-existent keys', () => {
      const result = exerciseCache.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should expire cached values after TTL', () => {
      exerciseCache.set('key1', { data: 'test' });
      
      // Avancer le temps au-delà du TTL
      vi.advanceTimersByTime(11 * 60 * 1000); // 11 minutes
      
      const result = exerciseCache.get('key1');
      expect(result).toBeNull();
    });

    it('should clear all cached values', () => {
      exerciseCache.set('key1', 'value1');
      exerciseCache.set('key2', 'value2');
      
      expect(exerciseCache.size()).toBe(2);
      
      exerciseCache.clear();
      expect(exerciseCache.size()).toBe(0);
      expect(exerciseCache.get('key1')).toBeNull();
    });
  });
});