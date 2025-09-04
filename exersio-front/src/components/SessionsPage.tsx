import { useEffect, useState } from "react";
import { useExercises } from "../contexts/ExercisesContext";
import { useNavigation } from "../contexts/NavigationContext";
import { useSessions } from "../contexts/SessionsContext";
import { useIsMobile } from "../hooks/useIsMobile";
import { MobileHeader } from "./MobileHeader";
import { MobileFilters } from "./MobileFilters";
import { ResultsCounter } from "./ResultsCounter";

export function SessionsPage() {
  const { state, actions } = useSessions();
  const { exercises } = useExercises();
  const { navigate } = useNavigation();
  const isMobile = useIsMobile();
  
  const [activeView, setActiveView] = useState("list");
  const [periodFilter, setPeriodFilter] = useState("all");
  
  // Charger les sessions au montage
  useEffect(() => {
    actions.loadSessions();
  }, []);
  
  const sessions = actions.getFilteredSessions();
  const isLoading = state.sessions.isLoading;

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

  // Fonction pour formater la date
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    if (isToday) return 'Aujourd\'hui';
    if (isTomorrow) return 'Demain';
    
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

  // Fonctions pour gérer les filtres
  const handleSearchChange = (search: string) => {
    actions.setFilters({ search });
  };

  const handleStatusFilter = (status: string) => {
    actions.setFilters({ status: status || undefined });
  };

  const handleAgeCategoryFilter = (ageCategory: string) => {
    actions.setFilters({ ageCategory: ageCategory || undefined });
  };

  const handleLevelFilter = (level: string) => {
    actions.setFilters({ level: level || undefined });
  };

  // Appliquer le filtre de période localement car c'est plus complexe
  const filteredSessions = sessions.filter((session) => {
    if (!session) return false;
    
    // Filtre par période
    if (periodFilter !== 'all') {
      const sessionDate = new Date(session.date);
      const today = new Date();
      
      switch (periodFilter) {
        case 'today':
          return sessionDate.toDateString() === today.toDateString();
        case 'week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return sessionDate >= weekStart && sessionDate <= weekEnd;
        case 'month':
          return sessionDate.getMonth() === today.getMonth() && 
                 sessionDate.getFullYear() === today.getFullYear();
      }
    }
    
    return true;
  });

  // Fonction pour obtenir le statut formaté
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'planned':
        return { label: 'À venir', class: 'status-upcoming' };
      case 'in-progress':
        return { label: 'En cours', class: 'status-in-progress' };
      case 'completed':
        return { label: 'Terminée', class: 'status-completed' };
      case 'cancelled':
        return { label: 'Annulée', class: 'status-cancelled' };
      default:
        return { label: 'À venir', class: 'status-upcoming' };
    }
  };

  // Fonction pour obtenir la classe de la carte selon le statut
  const getCardClass = (status: string) => {
    switch (status) {
      case 'planned':
        return 'upcoming';
      case 'in-progress':
        return 'in-progress';
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'upcoming';
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',
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
          <p style={{ color: '#94a3b8' }}>Chargement des séances...</p>
        </div>
      </div>
    );
  }

  // Préparation des données pour les filtres mobiles
  const mobileFilters = [
    {
      key: 'ageCategory',
      label: 'Catégorie',
      value: state.filters.ageCategory || 'all',
      onChange: handleAgeCategoryFilter,
      options: [
        { value: 'all', label: 'Toutes' },
        { value: 'seniors', label: 'Seniors' },
        { value: 'minimes', label: 'Minimes' },
        { value: 'enfants', label: 'Enfants' },
        { value: 'mixte', label: 'Mixte' }
      ]
    },
    {
      key: 'status',
      label: 'Statut',
      value: state.filters.status || 'all',
      onChange: handleStatusFilter,
      options: [
        { value: 'all', label: 'Tous' },
        { value: 'planned', label: 'À venir' },
        { value: 'in-progress', label: 'En cours' },
        { value: 'completed', label: 'Terminées' },
        { value: 'cancelled', label: 'Annulées' }
      ]
    },
    {
      key: 'level',
      label: 'Niveau',
      value: state.filters.level || 'all',
      onChange: handleLevelFilter,
      options: [
        { value: 'all', label: 'Tous' },
        { value: 'debutant', label: 'Débutant' },
        { value: 'intermediaire', label: 'Intermédiaire' },
        { value: 'avance', label: 'Avancé' },
        { value: 'expert', label: 'Expert' }
      ]
    }
  ];

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-900">
        <MobileHeader
          title="Séances"
          onAction={() => navigate('session-create')}
          actionIcon={<span className="text-lg">➕</span>}
          actionLabel="Nouvelle séance"
        />

        <MobileFilters
          searchValue={state.filters.search || ''}
          onSearchChange={handleSearchChange}
          filters={mobileFilters}
        />

        <ResultsCounter
          total={sessions.length}
          filtered={filteredSessions.length}
          itemType="séance"
          isLoading={isLoading}
        />

        <div className="p-4 space-y-4">
          {filteredSessions.length === 0 && !isLoading ? (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Aucune séance trouvée
              </h3>
              <p className="text-gray-400 mb-4">
                Aucune séance ne correspond à vos critères.
              </p>
              <button
                onClick={() => navigate('session-create')}
                className="bg-[#00d4aa] hover:bg-[#00b894] text-slate-900 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                ➕ Créer une séance
              </button>
            </div>
          ) : (
            filteredSessions.map((session, index) => {
              const sessionExercises = getSessionExercises(session.exercises || []);
              const totalDuration = getTotalExercisesDuration(session.exercises || []);
              const statusInfo = getStatusInfo(session.status || 'planned');
              const cardClass = getCardClass(session.status || 'planned');
              
              return (
                <div
                  key={`session-${session.id || index}`}
                  onClick={() => navigate('session-detail', { sessionId: session.id })}
                  className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-4 relative overflow-hidden active:scale-[0.98] transition-all duration-200"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    cardClass === 'upcoming' ? 'bg-blue-500' :
                    cardClass === 'in-progress' ? 'bg-amber-500' :
                    cardClass === 'completed' ? 'bg-emerald-500' :
                    'bg-red-500'
                  }`}></div>

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-lg truncate mb-1">
                        {session.name || 'Séance sans nom'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-1">
                        <span className="flex items-center gap-1">
                          📅 {formatDate(session.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          ⏰ {formatTime(session.date)}
                        </span>
                      </div>
                      <div className="text-sm text-[#00d4aa] font-medium">
                        Équipe {session.ageCategory || 'Seniors'}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                      cardClass === 'upcoming' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      cardClass === 'in-progress' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      cardClass === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {statusInfo.label}
                    </div>
                  </div>

                  {session.description && (
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                      {session.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                    <div className="flex items-center gap-4">
                      <span>⏱️ {session.duration || totalDuration} min</span>
                      <span>🎯 {sessionExercises.length} exercice{sessionExercises.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {sessionExercises.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Programme
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {sessionExercises.slice(0, 3).map(exercise => (
                          <div
                            key={exercise.id}
                            className="bg-white/5 text-xs text-gray-300 px-2 py-1 rounded"
                          >
                            {exercise.name}
                          </div>
                        ))}
                        {sessionExercises.length > 3 && (
                          <div className="bg-white/5 text-xs text-gray-400 px-2 py-1 rounded">
                            +{sessionExercises.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-white/5">
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
                        navigate('session-create', { sessionId: session.id, mode: 'edit' });
                      }}
                      className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                      title="Modifier"
                    >
                      ✏️
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
          // background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          // border: '1px solid rgba(255, 255, 255, 0.12)',
          // borderRadius: '24px',
          padding: '5px 35px',
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          // boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>
              <button onClick={() => navigate('home')} style={{ color: '#3b82f6', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}>
                🏠 Dashboard
              </button>
              <span>›</span>
              <span>Séances</span>
            </div>
            <div className="flex justify-center items-center">
            <h1 style={{
              fontSize: '28px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #ffffff, #94a3b8)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
             
            }}>
              📅
            </h1><h1 style={{
              fontSize: '28px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #ffffff, #94a3b8)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Gestion des Séances
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
              📤 Exporter
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
              📋 Dupliquer
            </button>
            <button 
              onClick={() => navigate('session-create')}
              style={{
                padding: '12px 20px',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                border: 'none',
                background: 'linear-gradient(135deg, #3b82f6, #10b981)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ➕ Nouvelle séance
            </button>
          </div>
        </header>

        {/* Contrôles et filtres */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          padding: '25px',
          marginBottom: '30px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '4px',
              gap: '4px'
            }}>
              <button
                onClick={() => setActiveView('list')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  background: activeView === 'list' ? 'linear-gradient(135deg, #3b82f6, #10b981)' : 'transparent',
                  color: activeView === 'list' ? 'white' : '#94a3b8'
                }}
              >
                📋 Liste
              </button>
              <button
                onClick={() => setActiveView('calendar')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  background: activeView === 'calendar' ? 'linear-gradient(135deg, #3b82f6, #10b981)' : 'transparent',
                  color: activeView === 'calendar' ? 'white' : '#94a3b8'
                }}
              >
                📅 Calendrier
              </button>
            </div>
            
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
                value={state.filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Rechercher une séance..."
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
          </div>
          
          <div style={{
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '500' }}>Catégorie :</span>
              <select
                value={state.filters.ageCategory || ''}
                onChange={(e) => handleAgeCategoryFilter(e.target.value)}
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
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '500' }}>Statut :</span>
              <select
                value={state.filters.status || ''}
                onChange={(e) => handleStatusFilter(e.target.value)}
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
                <option value="">Tous</option>
                <option value="planned">À venir</option>
                <option value="in-progress">En cours</option>
                <option value="completed">Terminées</option>
                <option value="cancelled">Annulées</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '500' }}>Niveau :</span>
              <select
                value={state.filters.level || ''}
                onChange={(e) => handleLevelFilter(e.target.value)}
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
                <option value="">Tous</option>
                <option value="debutant">Débutant</option>
                <option value="intermediaire">Intermédiaire</option>
                <option value="avance">Avancé</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['all', 'today', 'week', 'month'].map(period => (
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
                   period === 'today' ? 'Aujourd\'hui' :
                   period === 'week' ? 'Cette semaine' :
                   'Ce mois'}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vue Liste */}
        {activeView === 'list' && (
          <div className="sessions-list">
            {filteredSessions.length === 0 ? (
              <div style={{
                background: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '40px',
                textAlign: 'center',
                color: '#94a3b8'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#ffffff' }}>
                  Aucune séance trouvée
                </h3>
                <p>Aucune séance ne correspond à vos critères de recherche.</p>
                <button 
                  onClick={() => navigate('session-create')}
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
                  ➕ Créer une séance
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredSessions.map((session, index) => {
                  const sessionExercises = getSessionExercises(session.exercises || []);
                  const totalDuration = getTotalExercisesDuration(session.exercises || []);
                  const statusInfo = getStatusInfo(session.status || 'planned');
                  const cardClass = getCardClass(session.status || 'planned');
                  
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
                        background: cardClass === 'upcoming' ? 'linear-gradient(to bottom, #3b82f6, #1d4ed8)' :
                                   cardClass === 'in-progress' ? 'linear-gradient(to bottom, #f59e0b, #d97706)' :
                                   cardClass === 'completed' ? 'linear-gradient(to bottom, #10b981, #059669)' :
                                   'linear-gradient(to bottom, #ef4444, #dc2626)'
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
                            <span>📍 Terrain principal</span>
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
                          background: cardClass === 'upcoming' ? 'rgba(59, 130, 246, 0.15)' :
                                     cardClass === 'in-progress' ? 'rgba(245, 158, 11, 0.15)' :
                                     cardClass === 'completed' ? 'rgba(16, 185, 129, 0.15)' :
                                     'rgba(239, 68, 68, 0.15)',
                          color: cardClass === 'upcoming' ? '#3b82f6' :
                                cardClass === 'in-progress' ? '#f59e0b' :
                                cardClass === 'completed' ? '#10b981' :
                                '#ef4444',
                          border: cardClass === 'upcoming' ? '1px solid rgba(59, 130, 246, 0.3)' :
                                 cardClass === 'in-progress' ? '1px solid rgba(245, 158, 11, 0.3)' :
                                 cardClass === 'completed' ? '1px solid rgba(16, 185, 129, 0.3)' :
                                 '1px solid rgba(239, 68, 68, 0.3)'
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
                            <span>🔥 Intensité moyenne</span>
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
                            Programme
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
                          {session.status === 'in-progress' && (
                            <div className="control-btn primary" style={{
                              width: '32px',
                              height: '32px',
                              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                              color: 'white',
                              borderColor: 'transparent',
                              border: 'none',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              fontSize: '14px'
                            }} title="Continuer la séance">
                              ▶️
                            </div>
                          )}
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
                              navigate('session-create', { sessionId: session.id, mode: 'edit' });
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
                            }} title="Modifier">
                            ✏️
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
                          }} title="Partager">
                            📤
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Vue Calendrier */}
        {activeView === 'calendar' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            color: '#94a3b8'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#ffffff' }}>
              Vue Calendrier
            </h3>
            <p>La vue calendrier sera bientôt disponible.</p>
          </div>
        )}
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
        
        .control-btn.primary:hover {
          transform: scale(1.05);
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