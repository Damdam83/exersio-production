import { ScrollText } from 'lucide-react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useExercises } from '../contexts/ExercisesContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCategories } from '../contexts/CategoriesContext';
import { useSports } from '../contexts/SportsContext';
import { useAuth } from '../contexts/AuthContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { memoizedFilters, useDebouncedCallback } from '../utils/memoization';
import { MobileHeader } from './MobileHeader';
import { MobileFilters } from './MobileFilters';
import { ResultsCounter } from './ResultsCounter';
import type { Exercise } from '../types';
import { initializeArrows, initializeBalls, initializePlayers, initializeZones } from '../utils/exerciseEditorHelpers';
import { SportCourtViewer } from './ExerciseEditor/SportCourtViewer';

export function ExercisesPage() {
  const { t } = useTranslation();
  const { exercises, actions, state } = useExercises();
  const { navigate } = useNavigation();
  const { actions: favoritesActions } = useFavorites();
  const { state: categoriesState } = useCategories();
  const { state: sportsState, loadSports } = useSports();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Initialiser selectedSport avec le sport préféré de l'utilisateur, ou 'all' par défaut
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAge, setSelectedAge] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [currentScope, setCurrentScope] = useState<'personal' | 'club' | 'all'>('all');

  // Debounce de la recherche pour éviter les filtres trop fréquents
  const debouncedSearch = useDebouncedCallback((term: string) => {
    setDebouncedSearchTerm(term);
  }, 300, []);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Charger les sports au montage
  useEffect(() => {
    loadSports();
  }, []);

  // Initialiser le filtre de sport avec le sport préféré de l'utilisateur (une seule fois au montage)
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const sports = sportsState.sports.data || [];

    // Vérifier si on doit initialiser avec le sport préféré (une seule fois)
    if (!hasInitialized && user?.preferredSport && sports.length > 0 && selectedSport === 'all') {
      setSelectedSport(user.preferredSport.slug);
      setHasInitialized(true);
    }
  }, [user, sportsState.sports.data]);

  // Réinitialiser les filtres catégorie/âge quand le sport change
  useEffect(() => {
    setSelectedCategory('all');
    setSelectedAge('all');
  }, [selectedSport]);

  // Charger les favoris au montage
  useEffect(() => {
    favoritesActions.loadFavorites();
  }, []);

  // Charger les exercices au montage et quand le scope change
  useEffect(() => {
    actions.setFilters({ scope: currentScope });
    actions.loadExercises();
  }, [currentScope]);

  // Générer les filtres de sports depuis le backend (SportsContext)
  const sportFilters = useMemo(() => {
    const sports = sportsState.sports.data || [];
    return [
      { value: 'all', label: 'Tous les sports' },
      ...sports
        .sort((a, b) => a.order - b.order)
        .map(sport => ({
          value: sport.slug,
          label: sport.name
        }))
    ];
  }, [sportsState.sports.data]);

  // Générer les filtres de catégories depuis le backend (CategoriesContext)
  // Filtrés par le sport sélectionné
  const categoryFilters = useMemo(() => {
    const categories = categoriesState.exerciseCategories.data || [];
    const sports = sportsState.sports.data || [];

    // Si un sport est sélectionné, filtrer les catégories par ce sport
    let filteredCategories = categories;
    if (selectedSport !== 'all') {
      const currentSport = sports.find(s => s.slug === selectedSport);
      if (currentSport) {
        filteredCategories = categories.filter(cat => cat.sportId === currentSport.id);
      }
    }

    return [
      { value: 'all', label: 'Toutes', id: 'all' },
      ...filteredCategories
        .sort((a, b) => a.order - b.order)
        .map(cat => ({
          value: cat.slug,
          label: cat.name,
          id: cat.id
        }))
    ];
  }, [categoriesState.exerciseCategories.data, sportsState.sports.data, selectedSport]);

  // Générer les filtres d'âges depuis le backend (CategoriesContext)
  // Filtrés par le sport sélectionné
  const ageFilters = useMemo(() => {
    const ages = categoriesState.ageCategories.data || [];
    const sports = sportsState.sports.data || [];

    // Si un sport est sélectionné, filtrer les âges par ce sport
    let filteredAges = ages;
    if (selectedSport !== 'all') {
      const currentSport = sports.find(s => s.slug === selectedSport);
      if (currentSport) {
        filteredAges = ages.filter(age => age.sportId === currentSport.id);
      }
    }

    return [
      { value: 'all', label: 'Tous âges', id: 'all' },
      ...filteredAges
        .sort((a, b) => a.order - b.order)
        .map(age => ({
          value: age.slug,
          label: age.name,
          id: age.id  // Ajouter l'ID pour les clés React uniques
        }))
    ];
  }, [categoriesState.ageCategories.data, sportsState.sports.data, selectedSport]);

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
      console.error(t('exercises.errors.share'), error);
    }
  };

  // Gestion des favoris via le contexte
  const toggleFavorite = async (exerciseId: string) => {
    try {
      await favoritesActions.toggleFavorite(exerciseId);
    } catch (error) {
      console.error(t('exercises.errors.favorite'), error);
      // L'erreur sera gérée par le contexte avec une notification
    }
  };

  const isFavorite = (exerciseId: string) => favoritesActions.isFavorite(exerciseId);

  // Filtrage des exercices avec mémorisation optimisée et debounce
  const filteredExercises = useMemo(() => {
    let result = exercises.map(ex => ({ ...ex, isFavorite: isFavorite(ex.id) }));

    // Filtre de recherche
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      result = result.filter(ex =>
        ex.name.toLowerCase().includes(term) ||
        ex.description?.toLowerCase().includes(term) ||
        ex.category?.toLowerCase().includes(term) ||
        ex.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Filtre par sport
    if (selectedSport !== 'all') {
      result = result.filter(ex => ex.sport === selectedSport);
    }

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      result = result.filter(ex => ex.category === selectedCategory);
    }

    // Filtre par âge
    if (selectedAge !== 'all') {
      result = result.filter(ex => ex.ageCategory === selectedAge);
    }

    // Filtre favoris
    if (showFavoritesOnly) {
      result = result.filter(ex => ex.isFavorite);
    }

    return result;
  }, [exercises, debouncedSearchTerm, selectedSport, selectedCategory, selectedAge, showFavoritesOnly, favoritesActions.favorites]);

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

  // Fonction pour réinitialiser tous les filtres
  const resetFilters = () => {
    setSelectedSport('all');
    setSelectedCategory('all');
    setSelectedAge('all');
    setShowFavoritesOnly(false);
    setSearchTerm('');
  };

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = selectedSport !== 'all' || selectedCategory !== 'all' || selectedAge !== 'all' || showFavoritesOnly || searchTerm !== '';

  // Filtres pour la version mobile
  const mobileFilters = useMemo(() => {
    return [
      {
        key: 'sport',
        label: t('exercises.filters.sport'),
        value: selectedSport,
        onChange: (value: string) => {
          setSelectedSport(value);
        },
        options: sportFilters.map(filter => ({
          value: filter.value,
          label: filter.label,
          id: filter.value, // ID unique pour chaque sport
          count: filter.value === 'all' ? exercises.length : exercises.filter(ex => ex.sport === filter.value).length
        }))
      },
      {
        key: 'category',
        label: t('exercises.filters.category'),
        value: selectedCategory,
        onChange: (value: string) => setSelectedCategory(value),
        options: categoryFilters.map(filter => ({
          value: filter.value,
          label: filter.label,
          id: filter.id, // ID unique de la DB pour éviter les doublons entre sports
          count: filter.value === 'all' ? exercises.length : exercises.filter(ex => ex.category === filter.value).length
        }))
      },
      {
        key: 'age',
        label: t('exercises.filters.ageRange'),
        value: selectedAge,
        onChange: (value: string) => setSelectedAge(value),
        options: ageFilters.map(filter => ({
          value: filter.value,
          label: filter.label,
          id: filter.id, // ID unique de la DB pour éviter les doublons entre sports
          count: filter.value === 'all' ? exercises.length : exercises.filter(ex => ex.ageCategory === filter.value).length
        }))
      },
      {
        key: 'favorites',
        label: t('exercises.filters.favorites'),
        value: showFavoritesOnly ? 'favorites' : 'all',
        onChange: (value: string) => setShowFavoritesOnly(value === 'favorites'),
        options: [
          { value: 'all', label: 'Tous', id: 'favorites-all', count: exercises.length },
          { value: 'favorites', label: 'Favoris uniquement', id: 'favorites-only', count: exercises.filter(ex => favoritesActions.isFavorite(ex.id)).length }
        ]
      }
    ];
  }, [selectedSport, selectedCategory, selectedAge, showFavoritesOnly, sportFilters, categoryFilters, ageFilters, exercises, favoritesActions]);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-900">
        <MobileHeader
          title={t('exercises.title')}
          onAction={() => navigate('exercise-create')}
          actionIcon={<ScrollText className="w-5 h-5" />}
          actionLabel={t('exercises.newExercise')}
        />

        <MobileFilters
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filters={mobileFilters}
          onResetFilters={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <ResultsCounter
          total={exercises.length}
          filtered={filteredExercises.length}
          itemType="exercice"
          isLoading={state.exercises.isLoading}
        />

        <div className="p-4">
          {state.exercises.isLoading ? (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
              <div className="w-8 h-8 border-2 border-[#00d4aa] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Chargement des exercices...</p>
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">🏐</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {hasActiveFilters
                  ? t('exercises.noExercisesFound')
                  : t('exercises.noExercisesAvailable')
                }
              </h3>
              <p className="text-gray-400 mb-4">
                {hasActiveFilters
                  ? t('exercises.tryModifyFilters')
                  : t('exercises.createFirstExercise')
                }
              </p>
              {!hasActiveFilters && (
                <button
                  onClick={() => navigate('exercise-create')}
                  className="bg-[#00d4aa] hover:bg-[#00b894] text-slate-900 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  ➕ Créer mon premier exercice
                </button>
              )}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, 330px)',
              gap: '16px',
              justifyContent: 'center'
            }}>
              {filteredExercises.map((exercise: Exercise) => (
                <div
                  key={exercise.id}
                  onClick={() => navigate('exercise-detail', { exerciseId: exercise.id })}
                  className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden active:scale-[0.98] transition-all duration-200"
                >
                {/* Terrain de visualisation mobile */}
                <div style={{ height: '190px' }} className="bg-gradient-to-br from-slate-700 to-slate-600 relative overflow-hidden">
                  <div className="absolute inset-0">
                    {createCourtDiagram(exercise)}
                  </div>
                  <div className="absolute top-1.5 right-1.5 bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded text-xs font-semibold">
                    {exercise.duration} min
                  </div>
                </div>

                {/* Contenu de la carte */}
                <div className="p-2.5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-base truncate mb-0.5">
                        {exercise.name}
                      </h3>
                      <div className="text-xs text-gray-400">
                        {exercise.category} • {exercise.ageCategory}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(exercise.id);
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isFavorite(exercise.id)
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-white/5 text-gray-400'
                      }`}
                    >
                      {isFavorite(exercise.id) ? '❤️' : '🤍'}
                    </button>
                  </div>

                  <p className="text-gray-300 text-xs mb-2 line-clamp-2">
                    {exercise.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className="bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded text-xs font-medium border border-blue-500/30">
                      {exercise.category}
                    </span>
                    <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded text-xs font-medium border border-green-500/30">
                      {exercise.intensity}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span>👥 {exercise.playersMin || 1}-{exercise.playersMax || 12}</span>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-white/5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('exercise-detail', { exerciseId: exercise.id });
                      }}
                      className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors text-sm"
                      title={t('exercises.viewDetails')}
                    >
                      👁️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('exercise-edit', { exerciseId: exercise.id });
                      }}
                      className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors text-sm"
                      title={t('exercises.edit')}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyExercise(exercise);
                      }}
                      className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors text-sm"
                      title={t('exercises.copy')}
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>
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
                placeholder={t('exercises.searchPlaceholder')}
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
          {/* Section Filtres */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Sports */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Sports
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {sportFilters.map(filter => (
                  <button
                    key={`sport-${filter.value}`}
                    onClick={() => {
                      setSelectedSport(filter.value);
                      // Réinitialiser catégorie et âge lors du changement de sport
                      setSelectedCategory('all');
                      setSelectedAge('all');
                    }}
                    style={{
                      padding: '8px 16px',
                      background: selectedSport === filter.value
                        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.2))'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: selectedSport === filter.value
                        ? '1px solid rgba(139, 92, 246, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: selectedSport === filter.value ? '#a78bfa' : '#94a3b8',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      if (selectedSport !== filter.value) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (selectedSport !== filter.value) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }
                    }}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Catégories */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Catégories
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {categoryFilters.map(filter => (
                  <button
                    key={`category-${filter.id}`}
                    onClick={() => setSelectedCategory(filter.value)}
                    style={{
                      padding: '8px 16px',
                      background: selectedCategory === filter.value
                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(16, 185, 129, 0.2))'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: selectedCategory === filter.value
                        ? '1px solid rgba(59, 130, 246, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: selectedCategory === filter.value ? '#3b82f6' : '#94a3b8',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      if (selectedCategory !== filter.value) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (selectedCategory !== filter.value) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }
                    }}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tranches d'âge */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Tranches d'âge
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {ageFilters.map(filter => (
                  <button
                    key={`age-${filter.id}`}
                    onClick={() => setSelectedAge(filter.value)}
                    style={{
                      padding: '8px 16px',
                      background: selectedAge === filter.value
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(34, 197, 94, 0.2))'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: selectedAge === filter.value
                        ? '1px solid rgba(16, 185, 129, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: selectedAge === filter.value ? '#10b981' : '#94a3b8',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      if (selectedAge !== filter.value) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (selectedAge !== filter.value) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }
                    }}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Boutons Favoris et Réinitialiser */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                style={{
                  padding: '8px 16px',
                  background: showFavoritesOnly
                    ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2))'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: showFavoritesOnly
                    ? '1px solid rgba(251, 191, 36, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: showFavoritesOnly ? '#fbbf24' : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseOver={(e) => {
                  if (!showFavoritesOnly) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!showFavoritesOnly) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
              >
                ⭐ Favoris uniquement
              </button>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#ef4444',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                  }}
                >
                  🔄 Réinitialiser
                </button>
              )}
            </div>
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
              {hasActiveFilters
                ? t('exercises.noExercisesFound')
                : t('exercises.noExercisesAvailable')
              }
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#94a3b8',
              marginBottom: '30px',
              lineHeight: '1.6'
            }}>
              {hasActiveFilters
                ? t('exercises.tryModifyFiltersLong')
                : t('exercises.createFirstExerciseLong')
              }
            </p>
            {!hasActiveFilters && (
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
            gridTemplateColumns: 'repeat(auto-fill, 330px)',
            gap: '25px',
            marginBottom: '40px',
            justifyContent: 'center'
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
                height: '190px',
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
                  bottom: 0
                }}>
                  {createCourtDiagram(exercise)}
                </div>
              </div>

              {/* Contenu de la carte */}
              <div style={{ padding: '16px' }}>
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
                      title={t('exercises.createCopy')}
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
                      title={isFavorite(exercise.id) ? t('exercises.removeFromFavorites') : t('exercises.addToFavorites')}
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