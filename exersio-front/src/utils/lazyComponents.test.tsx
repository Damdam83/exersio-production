/**
 * Tests pour les composants lazy loading
 * Vérifie le bon fonctionnement du code splitting
 */

import { render, screen, waitFor } from '@testing-library/react';
import { Suspense, lazy } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { PageLoader } from './lazyComponents';

describe('LazyComponents', () => {
  describe('PageLoader', () => {
    it('should display default loading message', () => {
      render(<PageLoader />);
      expect(screen.getByText('Chargement...')).toBeInTheDocument();
    });

    it('should display custom loading message', () => {
      const customMessage = 'Chargement des exercices...';
      render(<PageLoader message={customMessage} />);
      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('should have proper loading spinner', () => {
      render(<PageLoader />);
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should have proper styling classes', () => {
      const { container } = render(<PageLoader />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center', 'min-h-screen');
    });
  });

  describe('Lazy Loading Behavior', () => {
    it('should show loading state while component loads', async () => {
      // Mock d'un composant lazy
      const LazyComponent = lazy(() => 
        Promise.resolve({
          default: () => <div>Composant chargé</div>
        })
      );

      render(
        <Suspense fallback={<PageLoader message="Test loading..." />}>
          <LazyComponent />
        </Suspense>
      );

      // Le loader devrait être visible initialement
      expect(screen.getByText('Test loading...')).toBeInTheDocument();

      // Attendre que le composant soit chargé
      await waitFor(() => {
        expect(screen.getByText('Composant chargé')).toBeInTheDocument();
      });
    });
  });
});