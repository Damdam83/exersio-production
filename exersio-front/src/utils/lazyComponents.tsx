/**
 * Lazy loading des composants pour optimisation du bundle
 * Réduction du temps de chargement initial et code splitting automatique
 */

import { lazy, Suspense, ComponentType } from 'react';

// Loading fallback component
const PageLoader = ({ message = "Chargement..." }: { message?: string }) => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white/70">{message}</p>
    </div>
  </div>
);

// Utility function pour créer des composants lazy avec fallback
const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallbackMessage?: string
) => {
  const LazyComponent = lazy(importFn);
  
  return (props: Parameters<T>[0]) => (
    <Suspense fallback={<PageLoader message={fallbackMessage} />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Pages principales - chargement différé avec exports nommés
export const HomePage = createLazyComponent(
  () => import('../components/HomePage').then(module => ({ default: module.HomePage })),
  "Chargement de l'accueil..."
);

export const ExercisesPage = createLazyComponent(
  () => import('../components/ExercisesPage').then(module => ({ default: module.ExercisesPage })),
  "Chargement des exercices..."
);

export const SessionsPage = createLazyComponent(
  () => import('../components/SessionsPage').then(module => ({ default: module.SessionsPage })),
  "Chargement des séances..."
);

export const HistoryPage = createLazyComponent(
  () => import('../components/HistoryPage').then(module => ({ default: module.HistoryPage })),
  "Chargement de l'historique..."
);

export const ProfilePage = createLazyComponent(
  () => import('../components/ProfilePage').then(module => ({ default: module.ProfilePage })),
  "Chargement du profil..."
);

// StatsPage n'existe pas encore - sera ajouté plus tard
// export const StatsPage = createLazyComponent(
//   () => import('../components/StatsPage'),
//   "Chargement des statistiques..."
// );

// Pages de création/édition - chargement différé (utilisées moins souvent)
export const ExerciseCreatePage = createLazyComponent(
  () => import('../components/ExerciseCreatePage').then(module => ({ default: module.ExerciseCreatePage })),
  "Chargement de l'éditeur..."
);

export const SessionCreatePage = createLazyComponent(
  () => import('../components/SessionCreatePage').then(module => ({ default: module.SessionCreatePage })),
  "Chargement de l'éditeur..."
);

export const SessionDetailView = createLazyComponent(
  () => import('../components/SessionDetailView').then(module => ({ default: module.SessionDetailView })),
  "Chargement des détails..."
);

// Composants de détail - chargement différé
export const ExerciseDetailView = createLazyComponent(
  () => import('../components/ExerciseDetailView').then(module => ({ default: module.ExerciseDetailView })),
  "Chargement des détails..."
);

// Composants lourds - chargement différé
export const OfflinePanel = createLazyComponent(
  () => import('../components/OfflinePanel').then(module => ({ default: module.OfflinePanel })),
  "Chargement du panneau hors-ligne..."
);

// Export du loader pour usage externe
export { PageLoader };