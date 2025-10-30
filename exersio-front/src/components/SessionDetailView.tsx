import React, { useState, useEffect } from 'react';
import { Session, Exercise } from '../types';
import { SportCourtViewer } from './ExerciseEditor/SportCourtViewer';
import { initializeArrows, initializeBalls, initializePlayers, initializeZones } from '../utils/exerciseEditorHelpers';
import { useIsMobile } from '../hooks/useIsMobile';
import { MobileHeader } from './MobileHeader';

interface SessionDetailViewProps {
  session: Session;
  exercises: Exercise[];
  onBack: () => void;
  onUpdateSession: (sessionId: string, updates: Partial<Session>) => void;
  onExportSession?: (session: Session) => void;
  onViewExercise?: (exerciseId: string) => void;
  onEditSession?: () => void;
  onAddExercise?: () => void;
}

export function SessionDetailView({ 
  session, 
  exercises, 
  onBack, 
  onUpdateSession,
  onExportSession,
  onViewExercise,
  onEditSession,
  onAddExercise
}: SessionDetailViewProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionNotes, setSessionNotes] = useState(session.notes || '');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(session.status === 'in-progress');
  const [elapsedTime, setElapsedTime] = useState(0);
  const isMobile = useIsMobile();

  // Get session exercises
  const sessionExercises = exercises.filter(ex => session.exercises.includes(ex.id));
  
  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (isRunning) {
        setElapsedTime(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  // Calculate session stats
  const totalExercises = sessionExercises.length;
  const completedExercises = currentExerciseIndex;
  const remainingTime = session.duration - elapsedTime;
  const progressPercentage = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getExerciseStatus = (index: number) => {
    if (index < currentExerciseIndex) return 'completed';
    if (index === currentExerciseIndex && isRunning) return 'current';
    return 'upcoming';
  };

  // Fonction pour créer le terrain de l'exercice
  const createCourtDiagram = (exercise: Exercise) => {
    const players = initializePlayers(exercise);
    const arrows = initializeArrows(exercise);
    const balls = initializeBalls(exercise);
    const zones = initializeZones(exercise);

    return (
      <SportCourtViewer
        sport={exercise.sport || 'volleyball'}
        players={players}
        arrows={arrows}
        balls={balls}
        zones={zones}
        showGrid={false}
        style={{ height: '120px', width: '100%' }}
      />
    );
  };

  const handleStartSession = () => {
    setIsRunning(true);
    onUpdateSession(session.id, { status: 'in-progress' });
  };

  const handlePauseSession = () => {
    setIsRunning(false);
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    }
  };

  const handleCompleteSession = () => {
    setIsRunning(false);
    onUpdateSession(session.id, { 
      status: 'completed',
      notes: sessionNotes 
    });
  };

  const sessionDate = new Date(session.date);

  // Mock participants data
  const participants = [
    { id: 1, name: 'Marc D.', status: 'present', avatar: 'M' },
    { id: 2, name: 'Sophie L.', status: 'present', avatar: 'S' },
    { id: 3, name: 'Thomas B.', status: 'late', avatar: 'T' },
    { id: 4, name: 'Julie M.', status: 'present', avatar: 'J' },
    { id: 5, name: 'Pierre C.', status: 'absent', avatar: 'P' },
    { id: 6, name: 'Emma R.', status: 'present', avatar: 'E' }
  ];

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-900">
        <MobileHeader
          title={session.name}
          showBack
          onBack={onBack}
          onAction={session.status === 'planned' ? handleStartSession : undefined}
          actionIcon={session.status === 'planned' ? <span className="text-lg">▶️</span> : undefined}
          actionLabel={session.status === 'planned' ? "Commencer" : undefined}
        />

        {/* Infos rapides en haut */}
        <div className="bg-slate-800/50 backdrop-blur-sm border-b border-white/10 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div>
              <div className="text-sm text-gray-400">
                {sessionDate.toLocaleDateString('fr-FR', { 
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </div>
              <div className="text-lg font-semibold text-white">
                {sessionDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - 
                {new Date(sessionDate.getTime() + session.duration * 60000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              session.status === 'planned' ? 'bg-blue-500/20 text-blue-400' :
              session.status === 'in-progress' ? 'bg-amber-500/20 text-amber-400' :
              session.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {
                session.status === 'planned' ? 'À venir' :
                session.status === 'in-progress' ? 'En cours' :
                session.status === 'completed' ? 'Terminée' :
                'Annulée'
              }
            </div>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
            <div>
              <div className="text-base sm:text-lg font-bold text-[#00d4aa]">{Math.floor(elapsedTime / 60)}</div>
              <div className="text-[10px] sm:text-xs text-gray-400">Min écoulées</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-[#00d4aa]">{completedExercises}/{totalExercises}</div>
              <div className="text-[10px] sm:text-xs text-gray-400">Exercices</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-[#00d4aa]">{participants.length}</div>
              <div className="text-[10px] sm:text-xs text-gray-400">Participants</div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mt-3 sm:mt-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progression</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#00d4aa] to-[#00b894] transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Liste des exercices mobile */}
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
            📋 Programme ({sessionExercises.length} exercices)
          </h2>
          
          {sessionExercises.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 sm:p-8 text-center">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📋</div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Aucun exercice planifié</h3>
              <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4">Ajoutez des exercices à cette séance pour commencer</p>
              <button 
                onClick={onAddExercise}
                className="bg-[#00d4aa] hover:bg-[#00b894] text-slate-900 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                ➕ Ajouter exercice
              </button>
            </div>
          ) : (
            sessionExercises.map((exercise, index) => {
              const status = getExerciseStatus(index);
              const startTime = new Date(sessionDate.getTime() + (index * 15 * 60 * 1000));
              const endTime = new Date(startTime.getTime() + (exercise.duration * 60 * 1000));
              
              return (
                <div 
                  key={exercise.id} 
                  onClick={() => onViewExercise?.(exercise.id)}
                  className={`bg-slate-800/50 backdrop-blur-sm border rounded-xl overflow-hidden relative ${
                    status === 'completed' ? 'border-emerald-500/30' :
                    status === 'current' ? 'border-amber-500/30 ring-2 ring-amber-500/20' :
                    'border-white/10'
                  } active:scale-[0.98] transition-all duration-200`}
                >
                  {/* Indicateur de statut */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    status === 'completed' ? 'bg-emerald-500' :
                    status === 'current' ? 'bg-amber-500' :
                    'bg-slate-600'
                  }`}></div>

                  {/* Terrain mobile plus petit et adapté */}
                  <div className="h-24 bg-gradient-to-br from-slate-700 to-slate-600 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-60" style={{ transform: 'scale(0.7)' }}>
                      {createCourtDiagram(exercise)}
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-xs font-semibold">
                        {exercise.duration} min
                      </div>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-base truncate">
                          {exercise.name}
                        </h3>
                        <div className="text-sm text-gray-400">
                          {startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - 
                          {endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-semibold ${
                        status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                        status === 'current' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-slate-600/20 text-gray-400'
                      }`}>
                        {
                          status === 'completed' ? '✅ Terminé' :
                          status === 'current' ? `⏳ En cours • ${Math.max(0, exercise.duration - Math.floor(elapsedTime / 60))} min` :
                          '⏰ À venir'
                        }
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm line-clamp-2 mb-2 sm:mb-3">
                      {exercise.description || 'Description de l\'exercice avec objectifs pédagogiques.'}
                    </p>

                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-medium border border-blue-500/30">
                        {exercise.category}
                      </span>
                      <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-medium border border-green-500/30">
                        {exercise.intensity || 'Moyenne'}
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3">
                      👥 {exercise.playersMin && exercise.playersMax ? `${exercise.playersMin}-${exercise.playersMax} joueurs` : 'Équipe complète'} • 📍 Terrain entier
                    </div>

                    {/* Boutons d'action pour l'exercice en cours */}
                    {status === 'current' && (
                      <div className="flex gap-2 pt-2 sm:pt-3 border-t border-white/10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePauseSession();
                          }}
                          className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          ⏸️ Pause
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNextExercise();
                          }}
                          className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          ⏭️ Suivant
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Section notes en bas */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-slate-800/30">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
            📝 Notes de séance
          </h3>
          <textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="Ajouter des notes sur le déroulement de la séance..."
            className="w-full h-20 sm:h-24 bg-slate-700/50 border border-white/10 rounded-lg p-2 sm:p-3 text-sm sm:text-base text-white placeholder-gray-400 resize-none"
          />
          <button
            onClick={() => onUpdateSession(session.id, { notes: sessionNotes })}
            className="w-full mt-2 sm:mt-3 bg-[#00d4aa] hover:bg-[#00b894] text-slate-900 px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors flex items-center justify-center gap-2"
          >
            💾 Sauvegarder les notes
          </button>
        </div>

        {/* Bouton de fin de séance si en cours */}
        {session.status === 'in-progress' && (
          <div className="p-3 sm:p-4 bg-slate-800/50 border-t border-white/10">
            <button
              onClick={handleCompleteSession}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-colors flex items-center justify-center gap-2"
            >
              ✅ Terminer la séance
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',
      backgroundAttachment: 'fixed',
      color: '#ffffff',
      position: 'relative',
      padding: '20px'
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
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: '25px 35px',
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>
              <button onClick={onBack} style={{ color: '#3b82f6', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}>
                🏠 Dashboard
              </button>
              <span>›</span>
              <button onClick={onBack} style={{ color: '#3b82f6', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}>
                📅 Séances
              </button>
              <span>›</span>
              <span>Entraînement Seniors</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ 
                width: '50px', 
                height: '50px', 
                background: 'linear-gradient(135deg, #3b82f6, #10b981)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)'
              }}>
                🏐
              </div>
              <div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #ffffff, #94a3b8)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {session.name}
                </div>
                <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                  {sessionDate.toLocaleDateString('fr-FR', { 
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long', 
                    year: 'numeric' 
                  })} • {sessionDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {new Date(sessionDate.getTime() + session.duration * 60000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} • Terrain principal
                </div>
              </div>
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
              👥 Participants
            </button>
            <button 
              onClick={() => onExportSession?.(session)}
              style={{
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
              }}
            >
              📤 Exporter
            </button>
            {session.status !== 'in-progress' && (
              <button 
                onClick={onEditSession}
                style={{
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
                }}
              >
                ✏️ Éditer
              </button>
            )}
            {session.status === 'planned' && (
              <button 
                onClick={handleStartSession}
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
                ▶️ Commencer
              </button>
            )}
          </div>
        </header>

        {/* Layout principal */}
        <div className="main-layout">
          {/* Timeline des exercices */}
          <div>
            <div className="glass-card">
              <div className="card-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="card-icon">📋</div>
                  Programme de la séance
                </div>
                <button 
                  onClick={onAddExercise}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: 'white',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  ➕ Ajouter exercice
                </button>
              </div>

              <div className="session-timeline">
                {sessionExercises.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#ffffff' }}>
                      Aucun exercice planifié
                    </h3>
                    <p>Ajoutez des exercices à cette séance pour commencer</p>
                  </div>
                ) : (
                  sessionExercises.map((exercise, index) => {
                    const status = getExerciseStatus(index);
                    const startTime = new Date(sessionDate.getTime() + (index * 15 * 60 * 1000));
                    const endTime = new Date(startTime.getTime() + (exercise.duration * 60 * 1000));
                    
                    return (
                      <div 
                        key={exercise.id} 
                        className={`exercise-block ${status}`}
                        onClick={(e) => {
                          // Si on clique sur un bouton d'action, ne pas déclencher la navigation
                          if ((e.target as HTMLElement).closest('.exercise-controls')) {
                            return;
                          }
                          onViewExercise?.(exercise.id);
                        }}
                      >
                        <div className="exercise-header">
                          <div className="exercise-time-badge">
                            ⏰ {startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="exercise-duration">{exercise.duration} min</div>
                        </div>
                        <div className="exercise-content">
                          <div className="exercise-title">{exercise.name}</div>
                          
                          {/* Terrain de l'exercice */}
                          <div className="exercise-court">
                            <div style={{
                              background: 'linear-gradient(135deg, #1e293b, #334155)',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              marginBottom: '12px',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                              {createCourtDiagram(exercise)}
                            </div>
                          </div>
                          
                          <div className="exercise-description">
                            {exercise.description || 'Description de l\'exercice avec objectifs pédagogiques et consignes techniques.'}
                          </div>
                          
                          {/* Critères de réussite */}
                          {exercise.successCriteria && exercise.successCriteria.length > 0 && (
                            <div className="exercise-criteria" style={{ 
                              marginTop: '12px', 
                              padding: '12px', 
                              background: 'rgba(0, 212, 170, 0.1)', 
                              border: '1px solid rgba(0, 212, 170, 0.2)', 
                              borderRadius: '8px' 
                            }}>
                              <div style={{ 
                                fontSize: '14px', 
                                fontWeight: '600', 
                                color: '#00d4aa', 
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                ✅ Critères de réussite
                              </div>
                              <ul style={{ margin: 0, paddingLeft: '16px', color: '#d1d5db' }}>
                                {exercise.successCriteria.map((criterion, idx) => (
                                  <li key={idx} style={{ 
                                    fontSize: '13px', 
                                    lineHeight: '1.4',
                                    marginBottom: '4px' 
                                  }}>
                                    {criterion}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="exercise-meta">
                            <span>👥 {exercise.playersMin && exercise.playersMax ? `${exercise.playersMin}-${exercise.playersMax} joueurs` : 'Équipe complète'}</span>
                            <span>🎯 {exercise.intensity || 'Moyenne'} intensité</span>
                            <span>📍 Terrain entier</span>
                          </div>
                          <div className="exercise-tags">
                            <span className="exercise-tag">{exercise.category}</span>
                            <span className="exercise-tag">{exercise.intensity || 'Moyenne'}</span>
                          </div>
                          <div className="exercise-actions">
                            <div className={`exercise-status ${
                              status === 'completed' ? 'status-completed' :
                              status === 'current' ? 'status-in-progress' :
                              'status-not-started'
                            }`}>
                              {status === 'completed' ? '✅ Terminé' :
                               status === 'current' ? '⏳ En cours • ' + Math.max(0, exercise.duration - Math.floor(elapsedTime / 60)) + ' min restantes' :
                               '⏰ À venir'}
                            </div>
                            <div className="exercise-controls">
                              {status === 'current' ? (
                                <>
                                  <div 
                                    className="control-btn" 
                                    onClick={(e) => { e.stopPropagation(); handlePauseSession(); }} 
                                    title="Pause"
                                  >
                                    ⏸️
                                  </div>
                                  <div 
                                    className="control-btn" 
                                    onClick={(e) => { e.stopPropagation(); handleNextExercise(); }} 
                                    title="Suivant"
                                  >
                                    ⏭️
                                  </div>
                                </>
                              ) : (
                                <div 
                                  className="control-btn" 
                                  onClick={(e) => { e.stopPropagation(); onViewExercise?.(exercise.id); }} 
                                  title="Voir détails"
                                >
                                  👁️
                                </div>
                              )}
                              <div
                                className="control-btn"
                                onClick={(e) => { e.stopPropagation(); /* TODO: Add notes feature */ }}
                                title="Ajouter des notes"
                              >
                                📝
                              </div>
                              <div
                                className="control-btn"
                                onClick={(e) => { e.stopPropagation(); /* TODO: Reorder exercise */ }}
                                title="Réorganiser"
                              >
                                🔀
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Chronométrage */}
            <div className="glass-card">
              <div className="card-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="card-icon">⏱️</div>
                  Chronométrage
                </div>
              </div>
              
              <div className="timing-display">
                <div className="current-time">{formatCurrentTime()}</div>
                <div className="timing-label">Temps actuel</div>
              </div>
              
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-value">{Math.floor(elapsedTime / 60)} min</div>
                  <div className="info-label">Écoulé</div>
                </div>
                <div className="info-item">
                  <div className="info-value">{Math.max(0, Math.floor(remainingTime / 60))} min</div>
                  <div className="info-label">Restant</div>
                </div>
              </div>
            </div>

            {/* Progression */}
            <div className="glass-card">
              <div className="card-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="card-icon">📊</div>
                  Progression
                </div>
              </div>
              
              <div className="progress-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px', color: '#94a3b8' }}>Exercices terminés</span>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{completedExercises}/{totalExercises}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
                </div>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <div className="info-value" style={{ color: '#10b981' }}>{completedExercises}</div>
                  <div className="info-label">Terminés</div>
                </div>
                <div className="info-item">
                  <div className="info-value" style={{ color: '#f59e0b' }}>{totalExercises - completedExercises}</div>
                  <div className="info-label">Restants</div>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="glass-card">
              <div className="card-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="card-icon">👥</div>
                  Participants
                </div>
                <div style={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#3b82f6',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  {participants.length}
                </div>
              </div>
              
              <div className="participants-list">
                {participants.map((participant) => (
                  <div key={participant.id} className="participant-item">
                    <div className="participant-avatar">
                      {participant.avatar}
                    </div>
                    <span>{participant.name}</span>
                    <div className={`participant-status ${
                      participant.status === 'present' ? 'status-present' :
                      participant.status === 'late' ? 'status-late' :
                      'status-absent'
                    }`}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes rapides */}
            <div className="glass-card">
              <div className="card-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="card-icon">📝</div>
                  Notes de séance
                </div>
              </div>
              
              <textarea
                className="notes-area"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Ajouter des notes sur le déroulement de la séance..."
              />
              
              <button 
                onClick={() => onUpdateSession(session.id, { notes: sessionNotes })}
                style={{
                  width: '100%',
                  marginTop: '15px',
                  padding: '10px',
                  background: 'linear-gradient(135deg, #3b82f6, #10b981)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                💾 Sauvegarder les notes
              </button>
            </div>

            {/* Bouton de fin de séance */}
            {session.status === 'in-progress' && (
              <div className="glass-card">
                <button 
                  onClick={handleCompleteSession}
                  style={{
                    width: '100%',
                    padding: '15px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  ✅ Terminer la séance
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions flottantes */}
      <div className="floating-actions">
        <button 
          className="floating-btn floating-btn-secondary" 
          onClick={() => {
            const notesArea = document.querySelector('.notes-area') as HTMLTextAreaElement;
            if (notesArea) {
              notesArea.focus();
              notesArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
          title="Notes rapides"
        >
          📝
        </button>
        <button 
          className="floating-btn floating-btn-primary" 
          onClick={onAddExercise}
          title="Ajouter exercice"
        >
          ➕
        </button>
      </div>

      {/* CSS pour les styles */}
      <style>{`
        .main-layout {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 30px;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          margin-bottom: 25px;
        }

        .card-title {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #ffffff;
        }

        .card-icon {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #3b82f6, #10b981);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        .session-timeline {
          position: relative;
          padding-left: 40px;
        }

        .session-timeline::before {
          content: '';
          position: absolute;
          left: 15px;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(to bottom, #3b82f6, #10b981, #f59e0b);
          border-radius: 2px;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }

        .exercise-block {
          position: relative;
          margin-bottom: 25px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.4s ease;
          cursor: pointer;
        }

        .exercise-block:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(59, 130, 246, 0.3);
          transform: translateX(5px);
        }

        .exercise-block::before {
          content: '';
          position: absolute;
          left: -52px;
          top: 20px;
          width: 16px;
          height: 16px;
          background: linear-gradient(135deg, #3b82f6, #10b981);
          border-radius: 50%;
          border: 4px solid #0f172a;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }

        .exercise-block.completed {
          border-left: 4px solid #10b981;
        }

        .exercise-block.current {
          border-left: 4px solid #f59e0b;
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
        }

        .exercise-block.upcoming {
          border-left: 4px solid #94a3b8;
        }

        .exercise-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px 20px 0 20px;
        }

        .exercise-time-badge {
          background: linear-gradient(135deg, #3b82f6, #10b981);
          color: white;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .exercise-duration {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
        }

        .exercise-content {
          padding: 15px 20px 20px 20px;
        }

        .exercise-title {
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .exercise-description {
          font-size: 14px;
          color: #94a3b8;
          line-height: 1.5;
          margin-bottom: 15px;
        }

        .exercise-meta {
          display: flex;
          gap: 15px;
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 12px;
        }

        .exercise-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 15px;
        }

        .exercise-tag {
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #3b82f6;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .exercise-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 15px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .exercise-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-not-started { color: #94a3b8; }
        .status-in-progress { color: #f59e0b; }
        .status-completed { color: #10b981; }

        .exercise-controls {
          display: flex;
          gap: 8px;
        }

        .control-btn {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          color: #94a3b8;
        }

        .control-btn:hover {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.3);
          color: #3b82f6;
        }

        .timing-display {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(16, 185, 129, 0.2));
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          margin-bottom: 20px;
        }

        .current-time {
          font-size: 32px;
          font-weight: 800;
          background: linear-gradient(135deg, #3b82f6, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
        }

        .timing-label {
          font-size: 12px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }

        .info-item {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 15px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .info-item:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-2px);
        }

        .info-value {
          font-size: 20px;
          font-weight: 800;
          background: linear-gradient(135deg, #3b82f6, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 4px;
        }

        .info-label {
          font-size: 11px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .progress-section {
          margin-bottom: 20px;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-top: 10px;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #10b981);
          border-radius: 4px;
          transition: width 0.5s ease;
          position: relative;
        }

        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .participants-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .participant-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          font-size: 13px;
        }

        .participant-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #10b981);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          color: white;
        }

        .participant-status {
          margin-left: auto;
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-present { background: #10b981; }
        .status-absent { background: #ef4444; }
        .status-late { background: #f59e0b; }

        .notes-area {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 15px;
          min-height: 100px;
          color: #ffffff;
          font-size: 14px;
          line-height: 1.6;
          resize: vertical;
          outline: none;
          width: 100%;
        }

        .notes-area::placeholder {
          color: #94a3b8;
        }

        .notes-area:focus {
          border-color: rgba(59, 130, 246, 0.3);
          background: rgba(255, 255, 255, 0.08);
        }

        .floating-actions {
          position: fixed;
          bottom: 30px;
          right: 30px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 100;
        }

        .floating-btn {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .floating-btn-primary {
          background: linear-gradient(135deg, #3b82f6, #10b981);
        }

        .floating-btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
        }

        .floating-btn:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
        }

        @media (max-width: 1200px) {
          .main-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .session-timeline {
            padding-left: 20px;
          }
          
          .session-timeline::before {
            left: 8px;
          }
          
          .exercise-block::before {
            left: -28px;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
          }
          
          .floating-actions {
            bottom: 20px;
            right: 20px;
          }
        }
      `}</style>
    </div>
  );
}