import { ScrollText } from 'lucide-react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useExercises } from '../contexts/ExercisesContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { memoizedFilters, useDebouncedCallback } from '../utils/memoization';
import { MobileHeader } from './MobileHeader';
import { MobileFilters } from './MobileFilters';
import { ResultsCounter } from './ResultsCounter';
import type { Exercise } from '../types';
import { initializeArrows, initializeBalls, initializePlayers, initializeZones } from '../utils/exerciseEditorHelpers';
import { SportCourtViewer } from './ExerciseEditor/SportCourtViewer';

export function ExercisesPage() {
  const { exercises, actions, state } = useExercises();
  const { navigate } = useNavigation();
  const { actions: favoritesActions } = useFavorites();
  const isMobile = useIsMobile();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [currentScope, setCurrentScope] = useState<'personal' | 'club' | 'all'>('all');

  // Debounce de la recherche pour éviter les filtres trop fréquents
  const debouncedSearch = useDebouncedCallback((term: string) => {
    setDebouncedSearchTerm(term);
  }, 300, []);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Charger les exercices et favoris au montage et quand le scope change
  useEffect(() => {
    actions.setFilters({ scope: currentScope });
    actions.loadExercises();
    // Charger aussi les favoris depuis l'API pour synchroniser
    favoritesActions.loadFavorites();
  }, [currentScope]);

  // Générer les tags dynamiquement à partir des exercices
  const filterTags = useMemo(() => {
    const categories = [...new Set(exercises.map(ex => ex.category))].filter(Boolean);
    const ageCategories = [...new Set(exercises.map(ex => ex.ageCategory))].filter(Boolean);
    
    const allTags = [
      'Tous',
      ...categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
      ...ageCategories.map(age => age.charAt(0).toUpperCase() + age.slice(1)),
      'Favoris'
    ];
    
    // Déduplicater les tags pour éviter les clés dupliquées
    return [...new Set(allTags)];
  }, [exercises]);

  // Fonction pour copier un exercice - maintenant en mode local
  const copyExercise = (exercise: Exercise) => {
    // Créer une copie locale au lieu de sauvegarder immédiatement
    actions.createLocalCopy(exercise);
    // Rediriger vers l'éditeur en mode copie/draft
    navigate('exercise-create', { mode: 'copy' });
  };

  // Fonction pour partager un exercice avec le club
  const shareWithClub = async (exercise: Exercise) => {
    try {
      await actions.shareWithClub(exercise.id);
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  // Gestion des favoris via le contexte
  const toggleFavorite = async (exerciseId: string) => {
    try {
      await favoritesActions.toggleFavorite(exerciseId);
    } catch (error) {
      console.error('Erreur lors de la modification du favori:', error);
      // L'erreur sera gérée par le contexte avec une notification
    }
  };

  const isFavorite = (exerciseId: string) => favoritesActions.isFavorite(exerciseId);

  // Filtrage des exercices avec mémorisation optimisée et debounce
  const filteredExercises = useMemo(() => {
    const filters = {
      search: debouncedSearchTerm,
      category: activeFilter === 'Tous' ? 'all' : activeFilter,
      favorites: activeFilter === 'Favoris'
    };

    return memoizedFilters.filterExercises(
      exercises.map(ex => ({ ...ex, isFavorite: isFavorite(ex.id) })),
      filters
    );
  }, [exercises, debouncedSearchTerm, activeFilter, favoritesActions.favorites]);

  // Fonction pour créer un diagramme de terrain unifié
  const createCourtDiagram = (exercise: Exercise) => {
    const players = initializePlayers(exercise);
    const arrows = initializeArrows(exercise);
    const balls = initializeBalls(exercise);
    const zones = initializeZones(exercise);

    // Utiliser le sport de l'exercice (par défaut volleyball si non spécifié)
    const sport = exercise.sport || 'volleyball';

    return (
      <SportCourtViewer
        sport={sport}
        players={players}
        arrows={arrows}
        balls={balls}
        zones={zones}
        showGrid={false}
      />
    );
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity.toLowerCase()) {
      case 'faible': return '#10b981';
      case 'moyenne': return '#f59e0b';
      case 'élevée': 
      case 'haute': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Filtres pour la version mobile
  const mobileFilters = useMemo(() => {
    // Générer les catégories dynamiquement
    const categories = [...new Set(exercises.map(ex => ex.category).filter(Boolean))];
    const ageCategories = [...new Set(exercises.map(ex => ex.ageCategory).filter(Boolean))];
    
    return [
      {
        key: 'category',
        label: 'Catégorie',
        value: activeFilter === 'Tous' ? 'all' : activeFilter.toLowerCase(),
        onChange: (value: string) => setActiveFilter(value === 'all' ? 'Tous' : value.charAt(0).toUpperCase() + value.slice(1)),
        options: [
          { value: 'all', label: 'Tous' },
          ...categories.map(cat => ({ 
            value: cat.toLowerCase(), 
            label: cat.charAt(0).toUpperCase() + cat.slice(1),
            count: exercises.filter(ex => ex.category === cat).length
          })),
          { value: 'favoris', label: 'Favoris', count: exercises.filter(ex => favoritesActions.isFavorite(ex.id)).length }
        ]
      }
    ];
  }, [exercises, activeFilter, favoritesActions]);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-900">
        <MobileHeader
          title="Exercices"
          onAction={() => navigate('exercise-create')}
          actionIcon={<ScrollText className="w-5 h-5" />}
          actionLabel="Nouvel exercice"
        />

        <MobileFilters
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filters={mobileFilters}
        />

        <ResultsCounter
          total={exercises.length}
          filtered={filteredExercises.length}
          itemType="exercice"
          isLoading={state.exercises.isLoading}
        />

        <div className="p-4 space-y-4">
          {state.exercises.isLoading ? (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
              <div className="w-8 h-8 border-2 border-[#00d4aa] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Chargement des exercices...</p>
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">🏐</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchTerm || activeFilter !== 'Tous' 
                  ? 'Aucun exercice trouvé'
                  : 'Aucun exercice disponible'
                }
              </h3>
              <p className="text-gray-400 mb-4">
                {searchTerm || activeFilter !== 'Tous' 
                  ? 'Essayez de modifier vos filtres ou recherche.'
                  : 'Commencez par créer votre premier exercice.'
                }
              </p>
              {(!searchTerm && activeFilter === 'Tous') && (
                <button
                  onClick={() => navigate('exercise-create')}
                  className="bg-[#00d4aa] hover:bg-[#00b894] text-slate-900 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  ➕ Créer mon premier exercice
                </button>
              )}
            </div>
          ) : (
            filteredExercises.map((exercise: Exercise) => (
              <div
                key={exercise.id}
                onClick={() => navigate('exercise-detail', { exerciseId: exercise.id })}
                className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden active:scale-[0.98] transition-all duration-200"
              >
                {/* Terrain de visualisation mobile */}
                <div className="h-32 bg-gradient-to-br from-slate-700 to-slate-600 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center p-2">
                    <div style={{ width: '100%', maxHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {createCourtDiagram(exercise)}
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-xs font-semibold">
                    {exercise.duration} min
                  </div>
                </div>

                {/* Contenu de la carte */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-lg truncate mb-1">
                        {exercise.name}
                      </h3>
                      <div className="text-sm text-gray-400">
                        {exercise.category} • {exercise.ageCategory}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(exercise.id);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        isFavorite(exercise.id)
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-white/5 text-gray-400'
                      }`}
                    >
                      {isFavorite(exercise.id) ? '❤️' : '🤍'}
                    </button>
                  </div>

                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                    {exercise.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-medium border border-blue-500/30">
                      {exercise.category}
                    </span>
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-medium border border-green-500/30">
                      {exercise.intensity} intensité
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>👥 {exercise.playersMin || 1}-{exercise.playersMax || 12} joueurs</span>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-white/5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('exercise-detail', { exerciseId: exercise.id });
                      }}
                      className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                      title="Voir détails"
                    >
                      👁️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('exercise-edit', { exerciseId: exercise.id });
                      }}
                      className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyExercise(exercise);
                      }}
                      className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                      title="Copier"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats mobiles */}
        <div className="p-4 bg-slate-800/30 border-t border-white/10">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[#00d4aa]">{exercises.length}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Exercices totaux</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#00d4aa]">{filteredExercises.length}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Affichés</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-gradient-radial from-blue-500/15 via-transparent to-transparent"
             style={{ backgroundPosition: '15% 85%' }}></div>
        <div className="absolute inset-0 bg-gradient-radial from-emerald-500/10 via-transparent to-transparent"
             style={{ backgroundPosition: '85% 15%' }}></div>
      </div>

      <div className="max-w-[1400px] mx-auto p-1 relative z-10">
        {/* Header */}
        <header className="backdrop-blur-xl px-9 py-1 mb-8 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <button onClick={() => navigate('home')} className="text-blue-400 hover:text-blue-300 bg-transparent border-none cursor-pointer">
                🏠 Dashboard
              </button>
              <span>›</span>
              <span>Base d'exercices</span>
            </div>
            <div className="flex justify-center items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00d4aa] to-[#00b894] rounded-md flex items-center justify-center">
                <ScrollText className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Base d'Exercices
              </h1>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-3 rounded-2xl text-sm font-semibold cursor-pointer transition-all bg-white/8 border border-white/12 text-white flex items-center gap-2 hover:bg-white/12">
              📤 Exporter
            </button>
            <button
              onClick={() => navigate('exercise-create')}
              className="px-5 py-3 rounded-2xl text-sm font-semibold cursor-pointer transition-all border-none bg-gradient-to-r from-blue-500 to-emerald-500 text-white flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30"
            >
              ➕ Nouvel exercice
            </button>
          </div>
        </header>

        {/* Filtres et recherche */}
        <div className="bg-white/8 backdrop-blur-xl border border-white/12 rounded-3xl p-6 mb-8">
          <div className="exercise-filters-top" style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div className="exercise-search-box" style={{ flex: '1', minWidth: '300px', position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: '16px'
              }}>
                🔍
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un exercice..."
                style={{
                  width: '100%',
                  padding: '14px 20px 14px 50px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '14px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {filterTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveFilter(tag)}
                style={{
                  padding: '8px 16px',
                  background: activeFilter === tag 
                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(16, 185, 129, 0.2))' 
                    : 'rgba(255, 255, 255, 0.05)',
                  border: activeFilter === tag 
                    ? '1px solid rgba(59, 130, 246, 0.3)' 
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: activeFilter === tag ? '#3b82f6' : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  if (activeFilter !== tag) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeFilter !== tag) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Grille des exercices */}
        {state.exercises.isLoading ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            marginBottom: '40px'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px',
              animation: 'spin 2s linear infinite'
            }}>
              ⚡
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '12px'
            }}>
              Chargement des exercices...
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#94a3b8'
            }}>
              Veuillez patienter pendant que nous récupérons vos exercices.
            </p>
          </div>
        ) : filteredExercises.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            marginBottom: '40px'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>
              🏐
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '12px'
            }}>
              {searchTerm || activeFilter !== 'Tous' 
                ? 'Aucun exercice trouvé'
                : 'Aucun exercice disponible'
              }
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#94a3b8',
              marginBottom: '30px',
              lineHeight: '1.6'
            }}>
              {searchTerm || activeFilter !== 'Tous' 
                ? 'Essayez de modifier vos filtres ou votre recherche pour voir plus d\'exercices.'
                : 'Commencez par créer votre premier exercice pour enrichir votre base de données.'
              }
            </p>
            {(!searchTerm && activeFilter === 'Tous') && (
              <button 
                onClick={() => navigate('exercise-create')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  background: 'linear-gradient(135deg, #3b82f6, #10b981)',
                  color: 'white',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                ➕ Créer mon premier exercice
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '25px',
            marginBottom: '40px'
          }}>
            {filteredExercises.map((exercise: Exercise) => (
            <div
              key={exercise.id}
              onClick={() => navigate('exercise-detail', { exerciseId: exercise.id })}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '20px',
                padding: '0',
                overflow: 'hidden',
                transition: 'all 0.4s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Visualisation du terrain unifié */}
              <div style={{
                height: '180px',
                background: 'linear-gradient(135deg, #1e293b, #334155)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `
                    linear-gradient(45deg, transparent 49%, rgba(59, 130, 246, 0.1) 50%, transparent 51%),
                    linear-gradient(-45deg, transparent 49%, rgba(16, 185, 129, 0.1) 50%, transparent 51%)
                  `,
                  backgroundSize: '20px 20px'
                }}></div>

                {/* Diagramme de l'exercice avec le nouveau composant */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px'
                }}>
                  {createCourtDiagram(exercise)}
                </div>
              </div>

              {/* Contenu de la carte */}
              <div style={{ padding: '20px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#ffffff',
                      marginBottom: '4px'
                    }}>
                      {exercise.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {exercise.category} • {exercise.ageCategory}
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.2)',
                    color: '#f59e0b',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {exercise.duration} min
                  </div>
                </div>

                <div style={{
                  fontSize: '14px',
                  color: '#94a3b8',
                  lineHeight: '1.5',
                  marginBottom: '15px'
                }}>
                  {exercise.description}
                </div>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: '15px'
                }}>
                  {exercise.category && (
                    <span style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#3b82f6',
                      padding: '4px 8px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px'
                    }}>
                      {exercise.category}
                    </span>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '15px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '15px',
                    fontSize: '12px',
                    color: '#94a3b8'
                  }}>
                    <span>👥 {exercise.playersMin || 1}-{exercise.playersMax || 12} joueurs</span>
                    <span>🎯 {exercise.intensity} intensité</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('exercise-detail', { exerciseId: exercise.id });
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontSize: '14px'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                        e.currentTarget.style.color = '#3b82f6';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.color = 'inherit';
                      }}
                    >
                      👁️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('exercise-edit', { exerciseId: exercise.id });
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontSize: '14px'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                        e.currentTarget.style.color = '#3b82f6';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.color = 'inherit';
                      }}
                    >
                      📝
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyExercise(exercise);
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontSize: '14px'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                        e.currentTarget.style.color = '#10b981';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.color = 'inherit';
                      }}
                      title="Créer une copie"
                    >
                      📋
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(exercise.id);
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        background: isFavorite(exercise.id) ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: isFavorite(exercise.id) ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontSize: '14px',
                        color: isFavorite(exercise.id) ? '#ef4444' : 'inherit'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                        e.currentTarget.style.color = '#ef4444';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = isFavorite(exercise.id) ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = isFavorite(exercise.id) ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.color = isFavorite(exercise.id) ? '#ef4444' : 'inherit';
                      }}
                      title={isFavorite(exercise.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                      {isFavorite(exercise.id) ? '❤️' : '🤍'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Barre de statistiques */}
        <div className="exercise-stats-bar" style={{
          display: 'flex',
          gap: '30px',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          padding: '25px',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '28px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #3b82f6, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '4px'
            }}>
              {exercises.length}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: '600'
            }}>
              Exercices totaux
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '28px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #3b82f6, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '4px'
            }}>
              {filteredExercises.length}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: '600'
            }}>
              Affichés
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '28px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #3b82f6, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '4px'
            }}>
              {exercises.filter(ex => ex.category === 'attaque').length}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: '600'
            }}>
              Attaque
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '28px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #3b82f6, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '4px'
            }}>
              {exercises.filter(ex => ex.ageCategory === 'seniors').length}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: '600'
            }}>
              Seniors
            </div>
          </div>
        </div>
      </div>

      {/* CSS intégré pour le responsive */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @media (max-width: 900px) {
            .exercises-grid {
              grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
            }
          }

          @media (max-width: 768px) {
            .exercise-page-header {
              flex-direction: column !important;
              gap: 20px !important;
              text-align: center !important;
            }
            
            .exercise-filters-top {
              flex-direction: column !important;
              gap: 15px !important;
            }
            
            .exercise-search-box {
              min-width: auto !important;
            }
            
            .exercises-grid {
              grid-template-columns: 1fr !important;
            }
            
            .exercise-stats-bar {
              flex-direction: column !important;
              gap: 20px !important;
            }
          }
        `
      }} />
    </div>
  );
}