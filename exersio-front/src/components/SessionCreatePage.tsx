import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useExercises } from '../contexts/ExercisesContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useSessions } from '../contexts/SessionsContext';
import { useCategories } from '../contexts/CategoriesContext';
import { useSports } from '../contexts/SportsContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { MobileHeader } from './MobileHeader';
import { ExerciseSelectionModal } from './ExerciseSelectionModal';

export function SessionCreatePage() {
  const { t } = useTranslation();
  const { actions: sessionsActions, state: sessionsState, sessionDraft } = useSessions();
  const { state: authState } = useAuth();
  const { setCurrentPage, params, navigateWithReturn } = useNavigation();
  const { exercises, actions: exerciseActions } = useExercises();
  const { state: categoriesState } = useCategories();
  const { state: sportsState, loadSports } = useSports();
  const isMobile = useIsMobile();

  const currentUserId = authState.user?.id || '';
  const user = authState.user;
  
  // Détection des différents modes
  const mode = params?.mode || 'create'; // 'create', 'edit', 'draft', 'edit-draft'
  const isDraftMode = mode === 'draft' || mode === 'edit-draft';
  const isEditMode = mode === 'edit' || mode === 'edit-draft';
  
  // Source des données selon le mode
  const sessionData = isDraftMode ? sessionDraft : 
                     isEditMode ? sessionsState.sessions.data?.find(s => s.id === params?.sessionId) :
                     null;
  
  // Utilisation d'useRef pour les inputs problématiques
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const objectivesInputRef = useRef<HTMLTextAreaElement>(null);
  const equipmentInputRef = useRef<HTMLTextAreaElement>(null);
  
  // États React normaux pour les autres champs
  const [sessionDuration, setSessionDuration] = useState(90);
  const [ageCategory, setAgeCategory] = useState('seniors');
  const [level, setLevel] = useState('intermediaire');
  const [date, setDate] = useState(() => {
    const now = new Date();
    now.setHours(18, 0, 0, 0); // Par défaut à 18h00
    return now.toISOString().slice(0, 16); // Format datetime-local
  });
  const [participants, setParticipants] = useState(18);
  const [generalIntensity, setGeneralIntensity] = useState('moyenne');
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Sport sélectionné pour filtrer les catégories d'âge
  const [selectedSportId, setSelectedSportId] = useState<string>(() => {
    return user?.preferredSportId || '';
  });

  // Timeline des exercices sélectionnés
  const [sessionExercises, setSessionExercises] = useState<string[]>([]);

  // Popup state
  const [isExercisePopupOpen, setIsExercisePopupOpen] = useState(false);

  // Filtrer les catégories d'âge par sport sélectionné
  const filteredAgeCategories = categoriesState.ageCategories.data.filter(
    cat => cat.sportId === selectedSportId
  );

  // Charger les sports au montage (une seule fois)
  useEffect(() => {
    loadSports();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Charger les exercices au montage (une seule fois)
  useEffect(() => {
    exerciseActions.loadExercises();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialiser selectedSportId quand les sports sont chargés
  useEffect(() => {
    if (sportsState.sports.data && sportsState.sports.data.length > 0 && !selectedSportId) {
      setSelectedSportId(user?.preferredSportId || sportsState.sports.data[0].id);
    }
  }, [sportsState.sports.data, selectedSportId, user?.preferredSportId]);

  // Charger les sessions si nécessaire
  useEffect(() => {
    if (isEditMode && params?.sessionId && (!sessionsState.sessions.data || sessionsState.sessions.data.length === 0)) {
      sessionsActions.loadSessions();
    }
  }, [isEditMode, params?.sessionId, sessionsState.sessions.isLoading, sessionsActions.loadSessions]);

  // useEffect pour populer les valeurs en mode édition ou draft
  useEffect(() => {
    if ((isEditMode || isDraftMode) && sessionData) {
      // Populer les inputs via refs
      if (nameInputRef.current) {
        nameInputRef.current.value = sessionData.name || '';
      }
      if (descriptionInputRef.current) {
        descriptionInputRef.current.value = sessionData.description || '';
      }
      
      // Extraire les objectifs et matériel des notes
      const notesLines = (sessionData.notes || '').split('\n');
      let objectives = '';
      let equipment = '';
      let currentSection = '';
      
      notesLines.forEach(line => {
        if (line.startsWith('Objectifs:')) {
          currentSection = 'objectives';
          objectives = line.replace('Objectifs:', '').trim();
        } else if (line.startsWith('Matériel:')) {
          currentSection = 'equipment';
          equipment = line.replace('Matériel:', '').trim();
        } else if (line.trim() && currentSection === 'objectives') {
          objectives += (objectives ? '\n' : '') + line;
        } else if (line.trim() && currentSection === 'equipment') {
          equipment += (equipment ? '\n' : '') + line;
        }
      });
      
      if (objectivesInputRef.current) {
        objectivesInputRef.current.value = objectives;
      }
      if (equipmentInputRef.current) {
        equipmentInputRef.current.value = equipment;
      }
      
      // Populer les états React
      setSessionDuration(sessionData.duration || 90);
      setAgeCategory(sessionData.ageCategory || 'seniors');
      setLevel(sessionData.level || 'intermediaire');
      
      // Convertir la date au format datetime-local
      if (sessionData.date) {
        const sessionDate = new Date(sessionData.date);
        const formattedDate = sessionDate.toISOString().slice(0, 16);
        setDate(formattedDate);
      }
      
      setParticipants(18); // Participants n'est pas dans le schéma Session
      setGeneralIntensity('moyenne'); // Intensity n'est pas dans le schéma Session
      
      // Populer les exercices de la session
      setSessionExercises(sessionData.exercises || []);
    }
  }, [isEditMode, isDraftMode, sessionData]);

  // Calculs
  const totalExerciseDuration = sessionExercises.reduce((total, exerciseId) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    return total + (exercise ? exercise.duration : 0);
  }, 0);

  // Filtrage des exercices
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
                          exercise.category.toLowerCase().includes(exerciseSearch.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || exercise.category.toLowerCase() === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const filters = ['all', 'échauffement', 'technique', 'tactique', 'physique', 'match'];

  const addExerciseToSession = (exerciseId: string) => {
    if (!sessionExercises.includes(exerciseId)) {
      setSessionExercises(prev => [...prev, exerciseId]);
    }
    setIsExercisePopupOpen(false);
  };

  const removeExerciseFromSession = (exerciseId: string) => {
    setSessionExercises(prev => prev.filter(id => id !== exerciseId));
  };

  const moveExercise = (exerciseId: string, direction: 'up' | 'down') => {
    const currentIndex = sessionExercises.indexOf(exerciseId);
    if (direction === 'up' && currentIndex > 0) {
      const newOrder = [...sessionExercises];
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
      setSessionExercises(newOrder);
    } else if (direction === 'down' && currentIndex < sessionExercises.length - 1) {
      const newOrder = [...sessionExercises];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      setSessionExercises(newOrder);
    }
  };

  const handleCreateSession = async () => {
    try {
      const name = nameInputRef.current?.value?.trim();
      if (!name) {
        alert('Le nom de la séance est obligatoire !');
        return;
      }

      // S'assurer que la date est correctement formatée
      let formattedDate: string;
      try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
          throw new Error('Date invalide');
        }
        formattedDate = dateObj.toISOString();
      } catch (error) {
        alert('Format de date invalide !');
        return;
      }

      const baseSessionData = {
        name: name,
        description: descriptionInputRef.current?.value || 'Description par défaut',
        date: formattedDate,
        duration: sessionDuration,
        exercises: sessionExercises,
        sport: 'volleyball',
        ageCategory: ageCategory,
        level: level,
        status: 'planned' as const,
        notes: `Objectifs: ${objectivesInputRef.current?.value || ''}\n\nMatériel: ${equipmentInputRef.current?.value || ''}`,
      };
      
      if (mode === 'edit-draft' && sessionData?.originalId) {
        // Mode édition d'un draft : mettre à jour la session originale
        await sessionsActions.updateSession(sessionData.originalId, baseSessionData);
        // Nettoyer le draft
        sessionsActions.clearSessionDraft();
      } else if (isEditMode && sessionData) {
        // Mode édition classique : mise à jour
        await sessionsActions.updateSession(sessionData.id, baseSessionData);
      } else {
        // Mode création : nouvelle session
        const createSessionData = {
          ...baseSessionData,
          createdById: currentUserId,
        };
        await sessionsActions.createSession(createSessionData);
        // Nettoyer le draft si il y en a un
        if (isDraftMode) {
          sessionsActions.clearSessionDraft();
        }
      }
      
      setCurrentPage('sessions');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleSaveDraft = () => {
    const draft = {
      name: nameInputRef.current?.value || '',
      description: descriptionInputRef.current?.value || '',
      objectives: objectivesInputRef.current?.value || '',
      equipment: equipmentInputRef.current?.value || '',
      sessionDuration,
      ageCategory,
      level,
      date,
      participants,
      generalIntensity,
      sessionExercises
    };
    
    localStorage.setItem('exersio_session_draft', JSON.stringify(draft));
    alert('Brouillon sauvegardé !');
  };

  const incrementParticipants = () => {
    if (participants < 30) setParticipants(prev => prev + 1);
  };

  const decrementParticipants = () => {
    if (participants > 1) setParticipants(prev => prev - 1);
  };

  const openExercisePopup = () => {
    setIsExercisePopupOpen(true);
  };

  const closeExercisePopup = () => {
    setIsExercisePopupOpen(false);
    setExerciseSearch('');
    setSelectedFilter('all');
  };

  // Fonction pour créer une copie d'exercice et naviguer vers l'édition
  const handleEditExerciseInSession = (exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    // Créer une copie de l'exercice avec un nouveau nom
    const copyName = `${exercise.name} (Copie)`;
    navigateWithReturn('exercise-edit', { 
      exerciseId,
      copyMode: true,
      copyName,
      sessionContext: true,
      from: 'session-create',
      fromId: existingSession?.id
    });
  };

  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', color: '#ffffff', position: 'relative' }}>
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

        <MobileHeader 
          title={isEditMode ? t('sessions.modifyTitle') : t('sessions.newTitle')}
          icon={isEditMode ? "✏️" : "✨"}
          onBack={() => setCurrentPage('sessions')}
          actions={[
            {
              label: "Brouillon",
              icon: "💾",
              onClick: handleSaveDraft,
              variant: "secondary"
            },
            {
              label: isEditMode ? "Mettre à jour" : "Sauvegarder",
              icon: "💾",
              onClick: handleCreateSession,
              variant: "primary"
            }
          ]}
        />

        <div className="p-2 sm:p-3 pt-20">
          {/* Informations générales */}
          <div className="p-4 sm:p-5 mb-3 sm:mb-4" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px'
          }}>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 text-sm sm:text-base font-bold">
              <div style={{ width: '16px', height: '16px', background: 'linear-gradient(135deg, #3b82f6, #10b981)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' }}>📝</div>
              {t('sessions.generalInfo')}
            </div>

            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">{t('sessions.sessionNameRequired')}</label>
              <input ref={nameInputRef} type="text" placeholder="Ex: Entraînement Seniors" style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none' }} />
            </div>

            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">{t('sessions.description')}</label>
              <textarea ref={descriptionInputRef} placeholder={t('sessions.descriptionPlaceholder')} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical', minHeight: '60px' }} />
            </div>

            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">{t('sessions.sport') || 'Sport'}</label>
              <select
                value={selectedSportId}
                onChange={(e) => setSelectedSportId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                {sportsState.sports.data && sportsState.sports.data.map(sport => (
                  <option key={sport.id} value={sport.id}>{sport.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">{t('sessions.ageCategory')}</label>
                <select value={ageCategory} onChange={(e) => setAgeCategory(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none' }}>
                  {filteredAgeCategories.map(category => (
                    <option key={category.id} value={category.name.toLowerCase()}>{category.name}</option>
                  ))}
                  {filteredAgeCategories.length === 0 && (
                    <option value="seniors">Seniors</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">{t('sessions.level')}</label>
                <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none' }}>
                  {categoriesState.levels.data.map(levelOption => (
                    <option key={levelOption.id} value={levelOption.name.toLowerCase()}>{levelOption.name}</option>
                  ))}
                  {categoriesState.levels.data.length === 0 && (
                    <>
                      <option value="debutant">Débutant</option>
                      <option value="intermediaire">Intermédiaire</option>
                      <option value="avance">Avancé</option>
                      <option value="expert">Expert</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">{t('sessions.dateTime')}</label>
              <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none' }} />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">Durée</label>
                <select value={sessionDuration} onChange={(e) => setSessionDuration(parseInt(e.target.value))} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none' }}>
                  <option value={60}>1h00</option>
                  <option value={90}>1h30</option>
                  <option value={120}>2h00</option>
                  <option value={150}>2h30</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">Participants</label>
                <div className="custom-number-input">
                  <input type="number" value={participants} onChange={(e) => setParticipants(parseInt(e.target.value) || 0)} min="1" max="30" style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none' }} />
                  <div className="custom-number-buttons">
                    <button type="button" onClick={incrementParticipants} className="custom-number-btn">▲</button>
                    <button type="button" onClick={decrementParticipants} className="custom-number-btn">▼</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">{t('sessions.objectives')}</label>
              <textarea ref={objectivesInputRef} placeholder="Lister les objectifs pédagogiques..." style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical', minHeight: '60px' }} />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">{t('sessions.requirementsList')}</label>
              <textarea ref={equipmentInputRef} placeholder={t('sessions.listEquipment')} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical', minHeight: '60px' }} />
            </div>
          </div>

          {/* Constructeur de séance mobile */}
          <div className="p-4 sm:p-5" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px'
          }}>
            <div className="flex justify-between items-center mb-3 sm:mb-4 pb-2 sm:pb-3" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-bold">
                <div style={{ width: '16px', height: '16px', background: 'linear-gradient(135deg, #3b82f6, #10b981)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' }}>🏗️</div>
                Exercices
              </div>
              <div style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(16, 185, 129, 0.2))', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#3b82f6', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
                {totalExerciseDuration}min / {sessionDuration}min
              </div>
            </div>

            {/* Liste des exercices mobile */}
            {sessionExercises.length === 0 ? (
              <div onClick={openExercisePopup} style={{ border: '2px dashed rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80px', cursor: 'pointer', borderRadius: '12px', marginBottom: '16px' }}>
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ fontSize: '20px', marginBottom: '6px' }}>➕</div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>{t('sessions.addExercisesButton')}</div>
                </div>
              </div>
            ) : (
              <>
                {sessionExercises.map((exerciseId, index) => {
                  const exercise = exercises.find(ex => ex.id === exerciseId);
                  if (!exercise) return null;

                  return (
                    <div key={exerciseId} style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ flex: 1, marginRight: '12px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>{exercise.name}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>{exercise.category}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '3px 6px', borderRadius: '6px', fontSize: '10px', fontWeight: '600' }}>{exercise.duration}min</div>
                          <button onClick={() => removeExerciseFromSession(exerciseId)} style={{ width: '24px', height: '24px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8', fontSize: '10px' }}>🗑️</button>
                        </div>
                      </div>
                      {exercise.description && (
                        <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4', marginBottom: '8px' }}>{exercise.description}</div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => moveExercise(exerciseId, 'up')} disabled={index === 0} style={{ width: '24px', height: '24px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8', fontSize: '10px', opacity: index === 0 ? 0.3 : 1 }}>⬆️</button>
                          <button onClick={() => moveExercise(exerciseId, 'down')} disabled={index === sessionExercises.length - 1} style={{ width: '24px', height: '24px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8', fontSize: '10px', opacity: index === sessionExercises.length - 1 ? 0.3 : 1 }}>⬇️</button>
                        </div>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>#{index + 1}</span>
                      </div>
                    </div>
                  );
                })}
                <div onClick={openExercisePopup} style={{ border: '1px dashed rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50px', cursor: 'pointer', borderRadius: '8px', marginTop: '8px' }}>
                  <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: '16px', marginBottom: '4px' }}>➕</div>
                    <div style={{ fontSize: '12px', fontWeight: '500' }}>Ajouter exercice</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal de sélection d'exercices */}
        <ExerciseSelectionModal
          isOpen={isExercisePopupOpen}
          onClose={closeExercisePopup}
          onSelectExercise={addExerciseToSession}
          selectedSportId={selectedSportId}
          selectedExercises={sessionExercises}
        />

        <style>{`
          .custom-number-input { position: relative; }
          .custom-number-input input { padding-right: 40px; }
          .custom-number-buttons { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 2px; }
          .custom-number-btn { width: 20px; height: 16px; background: none; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 3px; color: white; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
          .custom-number-btn:hover { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.3); }
          select option { background-color: #1e293b !important; color: white !important; }
          select:focus option { background-color: #334155 !important; color: white !important; }
          input[type="number"]::-webkit-outer-spin-button, input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
          input[type="number"] { -moz-appearance: textfield; }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      // background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',
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

      <div style={{ maxWidth: '1600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
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
              <button onClick={() => setCurrentPage('home')} style={{ color: '#3b82f6', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}>
                🏠 Dashboard
              </button>
              <span>›</span>
              <button onClick={() => setCurrentPage('sessions')} style={{ color: '#3b82f6', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}>
                📅 Séances
              </button>
              <span>›</span>
              <span>{isEditMode ? t('sessions.modifyTitle') : t('sessions.newTitle')}</span>
            </div>
            <div className='flex items-center'>
              <h1 style={{
              fontSize: '28px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #ffffff, #94a3b8)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
            }}>
              {isEditMode ? '✏️' : '✨'}
            </h1><h1 style={{
              fontSize: '28px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #ffffff, #94a3b8)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {isEditMode ? t('sessions.modifySession') : t('sessions.createSession')}
            </h1>
            </div>
            
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleSaveDraft} style={{
              padding: '12px 20px',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}>
              💾 Brouillon
            </button>
            <button onClick={handleCreateSession} style={{
              padding: '12px 20px',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              border: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #10b981)',
              color: 'white'
            }}>
              {isEditMode ? '💾 Mettre à jour' : '💾 Sauvegarder'}
            </button>
          </div>
        </header>

        {/* Layout principal responsive */}
        <div className="main-layout">
          
          {/* Colonne gauche - Informations */}
          <div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '20px',
              padding: '25px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              marginBottom: '25px'
            }}>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                marginBottom: '20px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px' 
              }}>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  background: 'linear-gradient(135deg, #3b82f6, #10b981)', 
                  borderRadius: '5px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '10px' 
                }}>📝</div>
                Informations générales
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Nom de la séance *
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  placeholder="Ex: Entraînement Seniors"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Description
                </label>
                <textarea
                  ref={descriptionInputRef}
                  placeholder="Objectifs et focus de la séance..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '80px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Sport
                </label>
                <select
                  value={selectedSportId}
                  onChange={(e) => setSelectedSportId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  {sportsState.sports.data && sportsState.sports.data.map(sport => (
                    <option key={sport.id} value={sport.id}>{sport.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Catégorie d'âge
                  </label>
                  <select
                    value={ageCategory}
                    onChange={(e) => setAgeCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    {filteredAgeCategories.map(category => (
                      <option key={category.id} value={category.name.toLowerCase()}>
                        {category.name}
                      </option>
                    ))}
                    {filteredAgeCategories.length === 0 && (
                      <option value="seniors">Seniors</option>
                    )}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Niveau
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    {categoriesState.levels.data.map(levelOption => (
                      <option key={levelOption.id} value={levelOption.name.toLowerCase()}>
                        {levelOption.name}
                      </option>
                    ))}
                    {categoriesState.levels.data.length === 0 && (
                      <>
                        <option value="debutant">Débutant</option>
                        <option value="intermediaire">Intermédiaire</option>
                        <option value="avance">Avancé</option>
                        <option value="expert">Expert</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Date et heure
                  </label>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Durée
                  </label>
                  <select
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    <option value={60}>1h00</option>
                    <option value={90}>1h30</option>
                    <option value={120}>2h00</option>
                    <option value={150}>2h30</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Participants
                  </label>
                  <div className="custom-number-input">
                    <input
                      type="number"
                      value={participants}
                      onChange={(e) => setParticipants(parseInt(e.target.value) || 0)}
                      min="1"
                      max="30"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                    <div className="custom-number-buttons">
                      <button 
                        type="button"
                        onClick={incrementParticipants}
                        className="custom-number-btn"
                      >
                        ▲
                      </button>
                      <button 
                        type="button"
                        onClick={decrementParticipants}
                        className="custom-number-btn"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Intensité générale
                  </label>
                  <select
                    value={generalIntensity}
                    onChange={(e) => setGeneralIntensity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    <option value="faible">Faible</option>
                    <option value="moyenne">Moyenne</option>
                    <option value="haute">Haute</option>
                    <option value="mixte">Mixte</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Objectifs de la séance
                </label>
                <textarea
                  ref={objectivesInputRef}
                  placeholder="Lister les objectifs pédagogiques..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '80px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Matériel nécessaire
                </label>
                <textarea
                  ref={equipmentInputRef}
                  placeholder="Lister le matériel requis..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '80px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Colonne droite - Constructeur de séance */}
          <div className="session-builder" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            padding: '25px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            minHeight: '350px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '15px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px' 
              }}>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  background: 'linear-gradient(135deg, #3b82f6, #10b981)', 
                  borderRadius: '5px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '10px' 
                }}>🏗️</div>
                Constructeur de séance
              </div>
              <div style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(16, 185, 129, 0.2))',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#3b82f6',
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '700'
              }}>
                Durée totale : {totalExerciseDuration} min / {sessionDuration} min
              </div>
            </div>

            {/* Timeline des exercices */}
            <div className="exercise-timeline" style={{ position: 'relative', paddingLeft: '30px', minHeight: '400px' }}>
              {/* Ligne verticale */}
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '0',
                bottom: '60px',
                width: '2px',
                background: 'linear-gradient(to bottom, #3b82f6, #10b981, #f59e0b)',
                borderRadius: '1px'
              }}></div>

              {/* Exercices de la séance */}
              {sessionExercises.map((exerciseId, index) => {
                const exercise = exercises.find(ex => ex.id === exerciseId);
                if (!exercise) return null;

                return (
                  <div key={exerciseId} className="exercise-slot" style={{
                    position: 'relative',
                    marginBottom: '15px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '20px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}>
                    {/* Point sur la timeline */}
                    <div style={{
                      position: 'absolute',
                      left: '-37px',
                      top: '20px',
                      width: '12px',
                      height: '12px',
                      background: '#3b82f6',
                      borderRadius: '50%',
                      border: '3px solid #0f172a'
                    }}></div>

                    {/* Header de l'exercice */}
                    <div className="exercise-header" style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      marginBottom: '12px' 
                    }}>
                      <div>
                        <div className="exercise-name" style={{ 
                          fontSize: '16px', 
                          fontWeight: '700', 
                          color: '#ffffff', 
                          marginBottom: '4px' 
                        }}>
                          {exercise.name}
                        </div>
                        <div className="exercise-category" style={{ 
                          fontSize: '12px', 
                          color: '#94a3b8', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.5px' 
                        }}>
                          {exercise.category} • Tous niveaux
                        </div>
                      </div>
                      <div className="exercise-duration" style={{
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

                    {/* Description */}
                    {exercise.description && (
                      <div className="exercise-description" style={{ 
                        fontSize: '13px', 
                        color: '#94a3b8', 
                        lineHeight: '1.5', 
                        marginBottom: '12px' 
                      }}>
                        {exercise.description}
                      </div>
                    )}

                    {/* Meta informations */}
                    <div className="exercise-meta" style={{ 
                      display: 'flex', 
                      gap: '15px', 
                      fontSize: '11px', 
                      color: '#94a3b8', 
                      marginBottom: '10px' 
                    }}>
                      <span>👥 {exercise.playersMin && exercise.playersMax ? 
                        `${exercise.playersMin}-${exercise.playersMax} joueurs` : 
                        exercise.playersMin ? `${exercise.playersMin}+ joueurs` :
                        exercise.playersMax ? `Max ${exercise.playersMax} joueurs` :
                        'Tout effectif'}</span>
                      <span>🎯 {exercise.intensity || 'Moyenne'} intensité</span>
                      <span>📍 Terrain entier</span>
                    </div>

                    {/* Actions et tags */}
                    <div className="exercise-actions" style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      <div className="exercise-tags" style={{ display: 'flex', gap: '4px' }}>
                        <span className="exercise-tag" style={{
                          background: 'rgba(59, 130, 246, 0.15)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#3b82f6',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          fontSize: '9px',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {exercise.category}
                        </span>
                        <span className="exercise-tag" style={{
                          background: 'rgba(59, 130, 246, 0.15)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#3b82f6',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          fontSize: '9px',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {exercise.intensity}
                        </span>
                      </div>
                      <div className="exercise-controls" style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="control-btn"
                          onClick={() => navigateWithReturn('exercise-detail', { 
                            exerciseId,
                            from: 'session-create',
                            fromId: existingSession?.id
                          })}
                          title="Voir détails"
                          style={{
                            width: '28px',
                            height: '28px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#94a3b8',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          👁️
                        </button>
                        <button
                          className="control-btn"
                          onClick={() => handleEditExerciseInSession(exerciseId)}
                          title="Modifier (créer une copie)"
                          style={{
                            width: '28px',
                            height: '28px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#94a3b8',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          className="control-btn"
                          onClick={() => moveExercise(exerciseId, 'up')}
                          disabled={index === 0}
                          title="Déplacer vers le haut"
                          style={{
                            width: '28px',
                            height: '28px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#94a3b8',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          ⬆️
                        </button>
                        <button
                          className="control-btn"
                          onClick={() => moveExercise(exerciseId, 'down')}
                          disabled={index === sessionExercises.length - 1}
                          title="Déplacer vers le bas"
                          style={{
                            width: '28px',
                            height: '28px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#94a3b8',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          ⬇️
                        </button>
                        <button
                          className="control-btn"
                          onClick={() => removeExerciseFromSession(exerciseId)}
                          title="Supprimer"
                          style={{
                            width: '28px',
                            height: '28px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#94a3b8',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Zone pour ajouter un exercice */}
              <div 
                className="exercise-slot empty"
                onClick={openExercisePopup}
                style={{
                  border: '2px dashed rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '80px',
                  cursor: 'pointer',
                  borderRadius: '16px',
                  marginBottom: '20px',
                  transition: 'all 0.3s ease'
                }}
              >
                <div className="empty-slot-content" style={{ textAlign: 'center', color: '#94a3b8' }}>
                  <div className="empty-slot-icon" style={{ fontSize: '24px', marginBottom: '8px' }}>➕</div>
                  <div className="empty-slot-text" style={{ fontSize: '14px', fontWeight: '500' }}>Ajouter un exercice</div>
                </div>
              </div>

              {/* Message de fin */}
              <div style={{
                textAlign: 'center',
                padding: '20px',
                color: '#94a3b8',
                fontSize: '14px',
                border: '2px dashed rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                marginTop: '20px'
              }}>
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>🎯</div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>Séance en construction</div>
                <div style={{ fontSize: '12px' }}>Cliquez sur ➕ pour ajouter des exercices</div>
              </div>
            </div>
          </div>
        </div>

        {/* Nouvelle modal de sélection d'exercices */}
        <ExerciseSelectionModal
          isOpen={isExercisePopupOpen}
          onClose={closeExercisePopup}
          onSelectExercise={addExerciseToSession}
          selectedSportId={selectedSportId}
          selectedExercises={sessionExercises}
        />

        {/* CSS pour corriger les styles des éléments natifs */}
        <style>{`
          .main-layout {
            display: grid;
            grid-template-columns: 350px 1fr;
            gap: 30px;
          }
          
          /* Responsive pour desktop uniquement */
          @media (max-width: 1400px) {
            .main-layout {
              grid-template-columns: 300px 1fr;
              gap: 25px;
            }
          }
          
          @media (max-width: 1200px) {
            .main-layout {
              grid-template-columns: 1fr;
              gap: 20px;
            }
          }
          
          /* Fix pour les options des select */
          select option {
            background-color: #1e293b !important;
            color: white !important;
          }
          
          select:focus option {
            background-color: #334155 !important;
            color: white !important;
          }
          
          /* Fix pour les flèches de l'input number */
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          
          input[type="number"] {
            -moz-appearance: textfield;
          }
          
          /* Custom number input */
          .custom-number-input {
            position: relative;
          }
          
          .custom-number-input input {
            padding-right: 40px;
          }
          
          .custom-number-buttons {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          
          .custom-number-btn {
            width: 20px;
            height: 16px;
            background: none;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 3px;
            color: white;
            font-size: 10px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          }
          
          .custom-number-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.3);
          }
          
          /* Exercise slot hover effects */
          .exercise-slot:hover {
            background: rgba(255, 255, 255, 0.08);
            transform: translateX(5px);
          }
          
          .exercise-slot.empty:hover {
            border-color: rgba(59, 130, 246, 0.4);
            background: rgba(59, 130, 246, 0.05);
          }
          
          /* Control buttons hover */
          .control-btn:hover {
            background: rgba(59, 130, 246, 0.2);
            border-color: rgba(59, 130, 246, 0.3);
            color: #3b82f6;
          }
          
          /* Exercise items hover */
          .exercise-item:hover {
            transform: translateX(-3px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
          }
        `}</style>
      </div>
    </div>
  );
}