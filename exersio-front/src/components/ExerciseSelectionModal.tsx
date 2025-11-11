import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useCategories } from '../contexts/CategoriesContext';
import { SportCourtViewer } from './ExerciseEditor/SportCourtViewer';
import { Exercise } from '../types';
import { exercisesApi } from '../services/exercisesService';
import { initializeArrows, initializeBalls, initializePlayers, initializeZones } from '../utils/exerciseEditorHelpers';
import { useIsMobile } from '../hooks/useIsMobile';

interface ExerciseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exerciseId: string) => void;
  selectedSportId: string;
  selectedExercises: string[];
}

export function ExerciseSelectionModal({
  isOpen,
  onClose,
  onSelectExercise,
  selectedSportId,
  selectedExercises
}: ExerciseSelectionModalProps) {
  const { t } = useTranslation();
  const { state: categoriesState } = useCategories();
  const isMobile = useIsMobile();

  // États pour la recherche et les filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAgeCategory, setSelectedAgeCategory] = useState<string>('all');
  const [selectedIntensity, setSelectedIntensity] = useState<string>('all');
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // États pour la pagination
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalExercises, setTotalExercises] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const exercisesPerPage = 9;

  // Filtrer les catégories par sport sélectionné
  const filteredCategories = categoriesState.exerciseCategories.data.filter(
    cat => cat.sportId === selectedSportId
  );

  const filteredAgeCategories = categoriesState.ageCategories.data.filter(
    cat => cat.sportId === selectedSportId
  );

  // Charger les exercices avec pagination
  const loadExercises = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: exercisesPerPage,
        sportId: selectedSportId,
        scope: 'all'
      };

      if (searchQuery) params.search = searchQuery;
      if (selectedCategory !== 'all') params.categoryId = selectedCategory;
      if (selectedAgeCategory !== 'all') params.ageCategoryId = selectedAgeCategory;
      if (selectedIntensity !== 'all') params.intensity = selectedIntensity;

      const response = await exercisesApi.getExercises(params);

      setExercises(response.exercises || []);
      setTotalExercises(response.total || 0);
      const pages = Math.ceil((response.total || 0) / exercisesPerPage);
      setTotalPages(pages);
      console.log('ExerciseSelectionModal - Pagination:', { total: response.total, exercisesPerPage, pages, totalPages: pages });
      setIsInitialLoad(false);
    } catch (error) {
      console.error('Error loading exercises:', error);
      setExercises([]);
      setTotalExercises(0);
      setTotalPages(1);
      setIsInitialLoad(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Réinitialiser la page à 1 quand les filtres changent
  useEffect(() => {
    if (!isOpen) return;
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedAgeCategory, selectedIntensity, selectedSportId, isOpen]);

  // Recharger quand la page change ou quand la modal s'ouvre
  useEffect(() => {
    if (!isOpen) return;
    loadExercises();
  }, [currentPage, isOpen]);

  // Debounce pour la recherche et les filtres
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      loadExercises();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedAgeCategory, selectedIntensity, selectedSportId]);

  const handleSelectExercise = (exerciseId: string) => {
    if (!selectedExercises.includes(exerciseId)) {
      onSelectExercise(exerciseId);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedAgeCategory('all');
    setSelectedIntensity('all');
    setCurrentPage(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-2 sm:p-4">
      <div className="relative w-full max-w-6xl h-[90vh] bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-slate-700 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
              {t('sessions.addExercises')}
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1">
              {isInitialLoad ? '...' : `${totalExercises} ${t('exercises.exercisesAvailable')}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-white flex-shrink-0 ml-2"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="border-b border-slate-700 flex-shrink-0">
          {/* Collapsible filters header (mobile) */}
          {isMobile && (
            <button
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className="w-full flex items-center justify-between p-3 text-white hover:bg-slate-700/50 transition-colors"
            >
              <span className="text-sm font-medium">
                {t('exercises.filters.title') || 'Filtres'}
              </span>
              {filtersExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          )}

          {/* Filters content */}
          <div className={`${isMobile && !filtersExpanded ? 'hidden' : 'block'} p-3 sm:p-4 md:p-6 space-y-3`}>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('exercises.searchExercises')}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Filter buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {/* Category filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2 sm:px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="all">{t('exercises.filters.allCategories')}</option>
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              {/* Age category filter */}
              <select
                value={selectedAgeCategory}
                onChange={(e) => setSelectedAgeCategory(e.target.value)}
                className="px-2 sm:px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="all">{t('exercises.filters.allAges')}</option>
                {filteredAgeCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              {/* Intensity filter */}
              <select
                value={selectedIntensity}
                onChange={(e) => setSelectedIntensity(e.target.value)}
                className="px-2 sm:px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="all">{t('exercises.filters.allIntensities')}</option>
                <option value="faible">{t('exercises.intensity.light')}</option>
                <option value="moyenne">{t('exercises.intensity.moderate')}</option>
                <option value="élevée">{t('exercises.intensity.high')}</option>
              </select>

              {/* Reset button */}
              <button
                onClick={resetFilters}
                className="px-2 sm:px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                {t('exercises.resetFilters')}
              </button>
            </div>
          </div>
        </div>

        {/* Exercise grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
          ) : exercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <p className="text-base sm:text-lg">{t('exercises.noExercisesFound')}</p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {t('exercises.resetFilters')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {exercises.map(exercise => {
                const isSelected = selectedExercises.includes(exercise.id);
                const sport = exercise.sport || 'volleyball';

                // Initialize exercise data for viewer
                // Note: Pass the full exercise object, not individual arrays
                const players = initializePlayers(exercise);
                const arrows = initializeArrows(exercise);
                const balls = initializeBalls(exercise);
                const zones = initializeZones(exercise);

                return (
                  <div
                    key={exercise.id}
                    onClick={() => !isSelected && handleSelectExercise(exercise.id)}
                    className={`
                      relative h-24 sm:h-28 border rounded-xl overflow-hidden transition-all cursor-pointer
                      ${isSelected
                        ? 'border-green-500 opacity-50 cursor-not-allowed'
                        : 'border-slate-600 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20'
                      }
                    `}
                  >
                    {/* Court as background */}
                    <div className="absolute inset-0 z-0">
                      <SportCourtViewer
                        sport={sport}
                        players={players}
                        arrows={arrows}
                        balls={balls}
                        zones={zones}
                      />
                    </div>

                    {/* Overlay gradient for readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/70 to-slate-900/30 z-10" />

                    {/* Exercise info overlay */}
                    <div className="absolute inset-0 p-2 sm:p-3 flex flex-col justify-end z-20">
                      <h3 className="font-semibold text-white text-sm sm:text-base mb-1 sm:mb-1.5 line-clamp-1 drop-shadow-lg">
                        {exercise.name}
                      </h3>

                      <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-1 sm:mb-2">
                        {exercise.category && (
                          <span className="px-1.5 py-0.5 bg-blue-500/40 backdrop-blur-sm text-blue-200 text-[10px] sm:text-xs rounded">
                            {exercise.category}
                          </span>
                        )}
                        {exercise.ageCategory && (
                          <span className="px-1.5 py-0.5 bg-purple-500/40 backdrop-blur-sm text-purple-200 text-[10px] sm:text-xs rounded">
                            {exercise.ageCategory}
                          </span>
                        )}
                        {exercise.intensity && (
                          <span className={`px-1.5 py-0.5 text-[10px] sm:text-xs rounded backdrop-blur-sm ${
                            exercise.intensity === 'faible' ? 'bg-green-500/40 text-green-200' :
                            exercise.intensity === 'moyenne' ? 'bg-yellow-500/40 text-yellow-200' :
                            'bg-red-500/40 text-red-200'
                          }`}>
                            {exercise.intensity}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-200 drop-shadow-lg">
                        <span>⏱️ {exercise.duration || 15} min</span>
                        <span>👥 {exercise.playerCount || 12}</span>
                      </div>
                    </div>

                    {/* Selected overlay */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center z-30">
                        <div className="text-green-400 text-sm sm:text-base font-semibold drop-shadow-lg">
                          ✓ {t('exercises.selected')}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3 sm:p-4 md:p-6 border-t border-slate-700 flex-shrink-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-gray-400 order-2 sm:order-1">
                {t('exercises.showing')} {((currentPage - 1) * exercisesPerPage) + 1} - {Math.min(currentPage * exercisesPerPage, totalExercises)} {t('exercises.of')} {totalExercises}
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 sm:p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(isMobile ? 3 : 5, totalPages) }, (_, i) => {
                    let pageNum;
                    const visiblePages = isMobile ? 3 : 5;

                    if (totalPages <= visiblePages) {
                      pageNum = i + 1;
                    } else if (currentPage <= Math.ceil(visiblePages / 2)) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - Math.floor(visiblePages / 2)) {
                      pageNum = totalPages - visiblePages + 1 + i;
                    } else {
                      pageNum = currentPage - Math.floor(visiblePages / 2) + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`
                          w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-sm sm:text-base font-medium transition-colors
                          ${currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                          }
                        `}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 sm:p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
