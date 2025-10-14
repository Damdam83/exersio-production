/**
 * Outils d'analyse et d'optimisation du bundle
 * Performance monitoring et métriques de chargement
 */

// Métriques de performance
export interface PerformanceMetrics {
  bundleSize: number;
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  chunksLoaded: number;
  timestamp: number;
}

// Collecteur de métriques de performance
export class BundleAnalyzer {
  private metrics: PerformanceMetrics[] = [];
  private startTime: number = Date.now();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initPerformanceTracking();
    }
  }

  private initPerformanceTracking() {
    // Observer les métriques de performance
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.recordNavigationMetrics(entry as PerformanceNavigationTiming);
          }
        }
      });
      
      try {
        observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] });
      } catch (e) {
        console.warn('PerformanceObserver not supported:', e);
      }
    }

    // Tracker le usage mémoire
    this.trackMemoryUsage();
  }

  private recordNavigationMetrics(entry: PerformanceNavigationTiming) {
    const metrics: PerformanceMetrics = {
      bundleSize: this.estimateBundleSize(),
      loadTime: entry.loadEventEnd - entry.navigationStart,
      renderTime: entry.domContentLoadedEventEnd - entry.navigationStart,
      memoryUsage: this.getMemoryUsage(),
      chunksLoaded: this.countLoadedChunks(),
      timestamp: Date.now()
    };

    this.metrics.push(metrics);
    this.logMetrics(metrics);
  }

  private estimateBundleSize(): number {
    if (typeof performance === 'undefined') return 0;

    let totalSize = 0;
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    resources.forEach(resource => {
      if (resource.name.includes('.js') || resource.name.includes('.css')) {
        totalSize += resource.transferSize || 0;
      }
    });

    return totalSize;
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize || 0;
    }
    return 0;
  }

  private countLoadedChunks(): number {
    if (typeof performance === 'undefined') return 0;

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resources.filter(r => r.name.includes('.js')).length;
  }

  private trackMemoryUsage() {
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
          console.warn('⚠️ High memory usage detected:', {
            used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
            limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
          });
        }
      }
    }, 30000); // Vérifier toutes les 30 secondes
  }

  private logMetrics(metrics: PerformanceMetrics) {
    // Bundle Performance Metrics silently tracked

    // Alertes de performance
    if (metrics.loadTime > 3000) {
      console.warn('🐌 Slow loading detected:', metrics.loadTime + 'ms');
    }
    if (metrics.bundleSize > 500 * 1024) { // 500KB
      console.warn('📦 Large bundle detected:', Math.round(metrics.bundleSize / 1024) + 'KB');
    }
  }

  getLatestMetrics(): PerformanceMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  getAllMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageMetrics(): Partial<PerformanceMetrics> {
    if (this.metrics.length === 0) return {};

    const totals = this.metrics.reduce((acc, metric) => ({
      bundleSize: acc.bundleSize + metric.bundleSize,
      loadTime: acc.loadTime + metric.loadTime,
      renderTime: acc.renderTime + metric.renderTime,
      memoryUsage: acc.memoryUsage + metric.memoryUsage,
      chunksLoaded: acc.chunksLoaded + metric.chunksLoaded
    }), { bundleSize: 0, loadTime: 0, renderTime: 0, memoryUsage: 0, chunksLoaded: 0 });

    const count = this.metrics.length;
    return {
      bundleSize: Math.round(totals.bundleSize / count),
      loadTime: Math.round(totals.loadTime / count),
      renderTime: Math.round(totals.renderTime / count),
      memoryUsage: Math.round(totals.memoryUsage / count),
      chunksLoaded: Math.round(totals.chunksLoaded / count)
    };
  }
}

// Instance singleton
export const bundleAnalyzer = new BundleAnalyzer();

// Hook React pour utiliser les métriques
import { useState, useEffect } from 'react';

export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [averageMetrics, setAverageMetrics] = useState<Partial<PerformanceMetrics>>({});

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(bundleAnalyzer.getLatestMetrics());
      setAverageMetrics(bundleAnalyzer.getAverageMetrics());
    };

    // Mise à jour initiale
    updateMetrics();

    // Mise à jour périodique
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  return { metrics, averageMetrics };
}

// Recommendations d'optimisation basées sur les métriques
export function getOptimizationRecommendations(metrics: PerformanceMetrics): string[] {
  const recommendations: string[] = [];

  if (metrics.bundleSize > 1024 * 1024) { // 1MB
    recommendations.push('Bundle trop volumineux - considérer le code splitting');
  }

  if (metrics.loadTime > 4000) { // 4s
    recommendations.push('Temps de chargement lent - optimiser les ressources critiques');
  }

  if (metrics.renderTime > 2000) { // 2s
    recommendations.push('Rendu lent - vérifier les composants et re-renders');
  }

  if (metrics.memoryUsage > 100 * 1024 * 1024) { // 100MB
    recommendations.push('Usage mémoire élevé - chercher les fuites mémoire');
  }

  if (metrics.chunksLoaded > 20) {
    recommendations.push('Trop de chunks - consolider les modules similaires');
  }

  if (recommendations.length === 0) {
    recommendations.push('Performance optimale ! 🚀');
  }

  return recommendations;
}