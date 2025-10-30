import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useExercises } from "../contexts/ExercisesContext";
import { useNavigation } from "../contexts/NavigationContext";
import { useSessions } from "../contexts/SessionsContext";
import { useIsMobile } from "../hooks/useIsMobile";
import { MobileHeader } from "./MobileHeader";
import { MobileFilters } from "./MobileFilters";
import { ResultsCounter } from "./ResultsCounter";

export function HistoryPage() {
  const { t } = useTranslation();
  const { state, actions } = useSessions();
  const { exercises } = useExercises();
  const { navigate } = useNavigation();
  const isMobile = useIsMobile();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Charger les sessions au montage
  useEffect(() => {
    actions.loadSessions();
  }, []);
  
  const allSessions = state.sessions.data || [];
  const isLoading = state.sessions.isLoading;

  // Filtrer uniquement les séances terminées ou annulées
  const historySessions = allSessions.filter(session => 
    session.status === 'completed' || session.status === 'cancelled'
  );

  // Fonction pour obtenir les exercices d'une séance
  const getSessionExercises = (exerciseIds: string[]) => {
    if (!exerciseIds || !Array.isArray(exerciseIds)) return [];
    return exercises.filter(ex => exerciseIds.includes(ex.id));
  };

  // Fonction pour calculer la durée totale des exercices
  const getTotalExercisesDuration = (exerciseIds: string[]) => {
    const sessionExercises = getSessionExercises(exerciseIds);
    return sessionExercises.reduce((total, ex) => total + (ex.duration || 0), 0);
  };

  // Fonction pour calculer "il y a X temps"
  const getTimeAgo = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    
    if (diffInDays === 0) return 'Aujourd\'hui';
    if (diffInDays === 1) return 'Hier';
    if (diffInDays < 7) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    if (diffInWeeks === 1) return 'Il y a 1 semaine';
    if (diffInWeeks < 4) return `Il y a ${diffInWeeks} semaines`;
    if (diffInMonths === 1) return 'Il y a 1 mois';
    if (diffInMonths < 12) return `Il y a ${diffInMonths} mois`;
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `Il y a ${diffInYears} an${diffInYears > 1 ? 's' : ''}`;
  };

  // Fonction pour formater la date complète
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string | Date) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrer les sessions
  const filteredSessions = historySessions.filter((session) => {
    if (!session) return false;
    
    const matchesSearch = !searchQuery || 
      (session.name && session.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (session.description && session.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTeam = !teamFilter || session.ageCategory === teamFilter;
    
    // Filtre par période
    let matchesPeriod = true;
    if (periodFilter !== 'all') {
      const sessionDate = new Date(session.date);
      const today = new Date();
      
      switch (periodFilter) {
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          matchesPeriod = sessionDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          matchesPeriod = sessionDate >= monthAgo;
          break;
        case 'quarter':
          const quarterAgo = new Date(today);
          quarterAgo.setMonth(today.getMonth() - 3);
          matchesPeriod = sessionDate >= quarterAgo;
          break;
        case 'year':
          const yearAgo = new Date(today);
          yearAgo.setFullYear(today.getFullYear() - 1);
          matchesPeriod = sessionDate >= yearAgo;
          break;
      }
    }
    
    return matchesSearch && matchesTeam && matchesPeriod;
  });

  // Trier les sessions
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'name':
        comparison = (a.name || '').localeCompare(b.name || '');
        break;
      case 'duration':
        comparison = (a.duration || 0) - (b.duration || 0);
        break;
      case 'exercises':
        comparison = (a.exercises?.length || 0) - (b.exercises?.length || 0);
        break;
      default:
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Fonction pour obtenir le statut formaté
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Terminée', class: 'status-completed' };
      case 'cancelled':
        return { label: 'Annulée', class: 'status-cancelled' };
      default:
        return { label: 'Terminée', class: 'status-completed' };
    }
  };

  // Fonction pour obtenir la classe de la carte selon le statut
  const getCardClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'completed';
    }
  };

  // Calculer les statistiques
  const totalSessions = historySessions.length;
  const completedSessions = historySessions.filter(s => s.status === 'completed');
  const cancelledSessions = historySessions.filter(s => s.status === 'cancelled');
  const totalMinutes = completedSessions.reduce((total, s) => total + (s.duration || 0), 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const averageDuration = completedSessions.length > 0 ? Math.round(totalMinutes / completedSessions.length) : 0;
  const totalExercises = completedSessions.reduce((total, s) => total + (s.exercises?.length || 0), 0);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',
        backgroundAttachment: 'fixed',
        color: '#ffffff',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '2px solid rgba(59, 130, 246, 0.2)',
            borderTop: '2px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#94a3b8' }}>Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  // Filtres pour mobile
  const mobileFilters = [
    {
      key: 'team',
      label: 'Équipe',
      value: teamFilter || 'all',
      onChange: (value: string) => setTeamFilter(value === 'all' ? '' : value),
      options: [
        { value: 'all', label: 'Toutes' },
        { value: 'seniors', label: 'Seniors' },
        { value: 'minimes', label: 'Minimes' },
        { value: 'enfants', label: 'Enfants' },
        { value: 'mixte', label: 'Mixte' }
      ]
    },
    {
      key: 'period',
      label: 'Période',
      value: periodFilter,
      onChange: setPeriodFilter,
      options: [
        { value: 'all', label: 'Toutes' },
        { value: 'week', label: '7 derniers jours' },
        { value: 'month', label: '30 derniers jours' },
        { value: 'quarter', label: '3 derniers mois' },
        { value: 'year', label: 'Dernière année' }
      ]
    }
  ];

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-900">
        <MobileHeader
          title={t('history.title')}
          actionIcon={<span className="text-lg">📅</span>}
          actionLabel={t('sessions.title')}
          onAction={() => navigate('sessions')}
        />

        <MobileFilters
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filters={mobileFilters}
        />

        <ResultsCounter
          total={historySessions.length}
          filtered={sortedSessions.length}
          itemType="séance terminée"
          isLoading={isLoading}
        />

        {/* Stats mobiles compactes */}
        <div className="bg-slate-800/30 border-b border-white/10 p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-400">{totalSessions}</div>
              <div className="text-[10px] sm:text-xs text-gray-400">Séances totales</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-blue-400">{totalHours}h</div>
              <div className="text-[10px] sm:text-xs text-gray-400">Temps total</div>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {isLoading ? (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 sm:p-8 text-center">
              <div className="w-8 h-8 border-2 border-[#00d4aa] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-gray-400">Chargement de l'historique...</p>
            </div>
          ) : sortedSessions.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 sm:p-8 text-center">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📋</div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                Aucune séance dans l'historique
              </h3>
              <p className="text-sm text-gray-400 mb-3 sm:mb-4">
                {historySessions.length === 0
                  ? "Vous n'avez pas encore de séances terminées."
                  : "Aucune séance ne correspond à vos critères."}
              </p>
              <button
                onClick={() => navigate('sessions')}
                className="bg-[#00d4aa] hover:bg-[#00b894] text-slate-900 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm font-medium transition-colors"
              >
                📅 Voir les séances
              </button>
            </div>
          ) : (
            sortedSessions.map((session, index) => {
              const sessionExercises = getSessionExercises(session.exercises || []);
              const totalDuration = getTotalExercisesDuration(session.exercises || []);
              const statusInfo = getStatusInfo(session.status || 'completed');
              const cardClass = getCardClass(session.status || 'completed');
              
              return (
                <div
                  key={`session-${session.id || index}`}
                  onClick={() => navigate('session-detail', { sessionId: session.id })}
                  className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-4 relative overflow-hidden active:scale-[0.98] transition-all duration-200"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    cardClass === 'completed' ? 'bg-emerald-500' : 'bg-red-500'
                  }`}></div>

                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-base sm:text-lg truncate mb-1">
                        {session.name || 'Séance sans nom'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400 mb-1">
                        <span className="flex items-center gap-1">
                          📅 {formatDate(session.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          ⏰ {formatTime(session.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-xs sm:text-sm text-[#00d4aa] font-medium">
                          Équipe {session.ageCategory || 'Seniors'}
                        </span>
                        <span className="bg-blue-500/20 text-blue-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold border border-blue-500/30">
                          {getTimeAgo(session.date)}
                        </span>
                      </div>
                    </div>
                    <div className={`px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold ${
                      cardClass === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {statusInfo.label}
                    </div>
                  </div>

                  {session.description && (
                    <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                      {session.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <span className="bg-amber-500/20 text-amber-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium border border-amber-500/30">
                      ⏱️ {session.duration || totalDuration} min
                    </span>
                    <span className="bg-purple-500/20 text-purple-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium border border-purple-500/30">
                      🎯 {sessionExercises.length} exercice{sessionExercises.length !== 1 ? 's' : ''}
                    </span>
                    {session.status === 'completed' && (
                      <span className="bg-emerald-500/20 text-emerald-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium border border-emerald-500/30">
                        ✅ Terminée
                      </span>
                    )}
                    {session.status === 'cancelled' && (
                      <span className="bg-red-500/20 text-red-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium border border-red-500/30">
                        ❌ Annulée
                      </span>
                    )}
                  </div>

                  {sessionExercises.length > 0 && (
                    <div className="space-y-1 mb-2 sm:mb-3">
                      <div className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Programme réalisé
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {sessionExercises.slice(0, 3).map(exercise => (
                          <div
                            key={exercise.id}
                            className="bg-white/5 text-[10px] sm:text-xs text-gray-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded"
                          >
                            {exercise.name}
                          </div>
                        ))}
                        {sessionExercises.length > 3 && (
                          <div className="bg-white/5 text-[10px] sm:text-xs text-gray-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                            +{sessionExercises.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('session-detail', { sessionId: session.id });
                      }}
                      className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                      title="Voir détails"
                    >
                      👁️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('session-create', { sessionId: session.id, mode: 'duplicate' });
                      }}
                      className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                      title="Dupliquer"
                    >
                      📋
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundAttachment: 'fixed',
      color: '#ffffff',
      position: 'relative',
      padding: '5px'
    }}>
      {/* Background effects */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 15% 85%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 85% 15%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
        zIndex: -1
      }}></div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <header style={{
          backdropFilter: 'blur(20px)',
          padding: '5px 35px',
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>
              <button onClick={() => navigate('home')} style={{ color: '#3b82f6', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}>
                🏠 Dashboard
              </button>
              <span>›</span>
              <span>Historique</span>
            </div>
            <div className="flex justify-center items-center">
              <h1 style={{
                fontSize: '28px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #ffffff, #94a3b8)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
              }}>
                📚
              </h1>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #ffffff, #94a3b8)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Historique des Séances
              </h1>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{
              padding: '12px 20px',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📊 Rapport
            </button>
            <button style={{
              padding: '12px 20px',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📤 Exporter
            </button>
          </div>
        </header>

        {/* Statistiques */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          padding: '25px',
          marginBottom: '30px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981' }}>
                {totalSessions}
              </div>
              <div style={{ fontSize: '14px', color: '#94a3b8' }}>Séances totales</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                {completedSessions.length} terminées • {cancelledSessions.length} annulées
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#3b82f6' }}>
                {totalHours}h
              </div>
              <div style={{ fontSize: '14px', color: '#94a3b8' }}>Temps total</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                {totalMinutes} minutes d'entraînement
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#f59e0b' }}>
                {averageDuration}min
              </div>
              <div style={{ fontSize: '14px', color: '#94a3b8' }}>Durée moyenne</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Par séance terminée
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#8b5cf6' }}>
                {totalExercises}
              </div>
              <div style={{ fontSize: '14px', color: '#94a3b8' }}>Exercices réalisés</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Dans les séances terminées
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et contrôles */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          padding: '25px',
          marginBottom: '30px'
        }}>
          {/* Barre de recherche */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <div style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: '16px'
              }}>🔍</div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher dans l'historique..."
                style={{
                  width: '100%',
                  padding: '12px 20px 12px 45px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '14px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>

            {/* Tri */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '500' }}>Trier par :</span>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '13px',
                  outline: 'none',
                  minWidth: '160px'
                }}
              >
                <option value="date-desc">Plus récentes</option>
                <option value="date-asc">Plus anciennes</option>
                <option value="name-asc">Nom A-Z</option>
                <option value="name-desc">Nom Z-A</option>
                <option value="duration-desc">Plus longues</option>
                <option value="duration-asc">Plus courtes</option>
                <option value="exercises-desc">Plus d'exercices</option>
                <option value="exercises-asc">Moins d'exercices</option>
              </select>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '500' }}>Équipe :</span>
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '13px',
                  outline: 'none',
                  minWidth: '120px'
                }}
              >
                <option value="">Toutes</option>
                <option value="seniors">Seniors</option>
                <option value="minimes">Minimes</option>
                <option value="enfants">Enfants</option>
                <option value="mixte">Mixte</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['all', 'week', 'month', 'quarter', 'year'].map(period => (
                <div
                  key={period}
                  onClick={() => setPeriodFilter(period)}
                  style={{
                    padding: '6px 12px',
                    background: periodFilter === period ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(16, 185, 129, 0.2))' : 'rgba(255, 255, 255, 0.05)',
                    border: periodFilter === period ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: periodFilter === period ? '#3b82f6' : '#94a3b8',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {period === 'all' ? 'Toutes' : 
                   period === 'week' ? '7 derniers jours' :
                   period === 'month' ? '30 derniers jours' :
                   period === 'quarter' ? '3 derniers mois' :
                   'Dernière année'}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Liste des séances */}
        <div className="sessions-list">
          {sortedSessions.length === 0 ? (
            <div style={{
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center',
              color: '#94a3b8'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#ffffff' }}>
                Aucune séance dans l'historique
              </h3>
              <p>
                {historySessions.length === 0 
                  ? "Vous n'avez pas encore de séances terminées." 
                  : "Aucune séance ne correspond à vos critères de recherche."
                }
              </p>
              <button 
                onClick={() => navigate('sessions')}
                style={{
                  marginTop: '16px',
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #3b82f6, #10b981)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                📅 Voir les séances
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {sortedSessions.map((session, index) => {
                const sessionExercises = getSessionExercises(session.exercises || []);
                const totalDuration = getTotalExercisesDuration(session.exercises || []);
                const statusInfo = getStatusInfo(session.status || 'completed');
                const cardClass = getCardClass(session.status || 'completed');
                
                return (
                  <div 
                    key={`session-${session.id || index}`} 
                    className={`session-card ${cardClass}`} 
                    onClick={() => navigate('session-detail', { sessionId: session.id })}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      padding: '20px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                    {/* Bande colorée à gauche selon le statut */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '4px',
                      background: cardClass === 'completed' ? 'linear-gradient(to bottom, #10b981, #059669)' : 'linear-gradient(to bottom, #ef4444, #dc2626)'
                    }}></div>

                    <div className="session-header" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <div className="session-main-info" style={{ flex: 1 }}>
                        <div className="session-title" style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#ffffff',
                          marginBottom: '4px'
                        }}>
                          {session.name || 'Séance sans nom'}
                        </div>
                        <div className="session-datetime" style={{
                          fontSize: '13px',
                          color: '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px',
                          marginBottom: '2px',
                          flexWrap: 'wrap'
                        }}>
                          <span>📅 {formatDate(session.date)}</span>
                          <span>⏰ {formatTime(session.date)}</span>
                          <span style={{
                            background: 'rgba(59, 130, 246, 0.15)',
                            color: '#3b82f6',
                            padding: '2px 8px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            {getTimeAgo(session.date)}
                          </span>
                        </div>
                        <div className="session-team" style={{
                          fontSize: '12px',
                          color: '#3b82f6',
                          fontWeight: '600'
                        }}>
                          Équipe {session.ageCategory || 'Seniors'} • Niveau Intermédiaire
                        </div>
                      </div>
                      <div className={`session-status ${statusInfo.class}`} style={{
                        padding: '6px 12px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        whiteSpace: 'nowrap',
                        background: cardClass === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: cardClass === 'completed' ? '#10b981' : '#ef4444',
                        border: cardClass === 'completed' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                      }}>
                        {statusInfo.label}
                      </div>
                    </div>

                    <div className="session-content" style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '20px',
                      marginBottom: '15px'
                    }}>
                      <div>
                        <div className="session-description" style={{
                          fontSize: '14px',
                          color: '#cbd5e1',
                          lineHeight: '1.5',
                          marginBottom: '10px'
                        }}>
                          {session.description || 'Pas de description disponible.'}
                        </div>
                        <div className="session-stats" style={{
                          display: 'flex',
                          gap: '15px',
                          fontSize: '12px',
                          color: '#94a3b8',
                          flexWrap: 'wrap'
                        }}>
                          <span>⏱️ {session.duration || totalDuration} min</span>
                          <span>🎯 {sessionExercises.length} exercice{sessionExercises.length > 1 ? 's' : ''}</span>
                          {session.status === 'completed' && <span>✅ Terminée avec succès</span>}
                          {session.status === 'cancelled' && <span>❌ Annulée</span>}
                        </div>
                      </div>
                      
                      <div className="session-exercises" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        minWidth: '200px'
                      }}>
                        <div className="exercises-title" style={{
                          fontSize: '11px',
                          color: '#94a3b8',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '6px'
                        }}>
                          Programme réalisé
                        </div>
                        {sessionExercises.length > 0 ? sessionExercises.slice(0, 4).map(exercise => (
                          <div key={exercise.id} className="exercise-preview" style={{
                            fontSize: '11px',
                            color: '#e2e8f0',
                            padding: '4px 8px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            borderRadius: '6px',
                            display: 'flex',
                            justifyContent: 'space-between'
                          }}>
                            <span>{exercise.name}</span>
                            <span>{exercise.duration} min</span>
                          </div>
                        )) : (
                          <div style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                            Aucun exercice programmé
                          </div>
                        )}
                        {sessionExercises.length > 4 && (
                          <div style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center', marginTop: '4px' }}>
                            +{sessionExercises.length - 4} autre{sessionExercises.length - 4 > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="session-actions" style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      paddingTop: '15px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)'
                    }}>
                      <div className="session-controls" style={{ display: 'flex', gap: '8px' }}>
                        <div 
                          className="control-btn" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('session-detail', { sessionId: session.id });
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
                            fontSize: '14px',
                            color: '#94a3b8'
                          }} title="Voir détails">
                          👁️
                        </div>
                        <div 
                          className="control-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('session-create', { sessionId: session.id, mode: 'duplicate' });
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
                            fontSize: '14px',
                            color: '#94a3b8'
                          }} title="Dupliquer">
                          📋
                        </div>
                        <div className="control-btn" style={{
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
                          fontSize: '14px',
                          color: '#94a3b8'
                        }} title="Télécharger rapport">
                          📥
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CSS pour les animations et effets hover */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .session-card:hover {
          transform: translateY(-2px);
          border-color: rgba(59, 130, 246, 0.3);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        
        .control-btn:hover {
          background: rgba(59, 130, 246, 0.15) !important;
          border-color: rgba(59, 130, 246, 0.3) !important;
          color: #3b82f6 !important;
        }
        
        select option {
          background-color: #1e293b !important;
          color: white !important;
        }
        
        @media (max-width: 768px) {
          .session-content {
            grid-template-columns: 1fr !important;
          }
          
          .session-header {
            flex-direction: column !important;
            gap: 8px !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </div>
  );
}
