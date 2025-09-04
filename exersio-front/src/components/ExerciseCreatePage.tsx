import { ChevronRight, Eye, Home, Plus, Save, Upload } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Exercise } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

import { Toolbar } from './ExerciseEditor/Toolbar';
import { VolleyballCourt } from './ExerciseEditor/VolleyballCourt';

import { Arrow, Ball, FIELD_AGE_CATEGORIES, FIELD_CATEGORIES, FIELD_INTENSITIES, roleLabels as importedRoleLabels, Player, PlayerDisplayMode, TAG_SUGGESTIONS, Zone } from '../constants/exerciseEditor';
import { convertToFieldData, getEventPosition, initializeArrows, initializeBalls, initializePlayers, initializeZones } from '../utils/exerciseEditorHelpers';

// Backup roleLabels au cas où l'import ne marche pas
const backupRoleLabels = { 
  attaque: 'A',
  central: 'C',
  passe: 'P',
  reception: 'R',
  libero: 'L',
  neutre: 'N'
};

const roleLabels = importedRoleLabels || backupRoleLabels;

import { useExercises } from '../contexts/ExercisesContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { useOrientation } from '../hooks/useOrientation';
import { MobileHeader } from './MobileHeader';

export function ExerciseCreatePage() {
  // contexts
  const { currentPage, params, navigate } = useNavigation();
  const { state: auth } = useAuth();
  const { state: exState, actions: exActions } = useExercises();
  const isMobile = useIsMobile();
  const { isLandscape, isPortrait } = useOrientation();

  // si on est en mode édition, on récupère l'exo ciblé
  const exerciseToEdit = useMemo(
    () => (params?.exerciseId ? exState.exercises.data.find(e => e.id === params.exerciseId) : undefined),
    [params?.exerciseId, exState.exercises.data]
  );
  
  // Mode copie : utiliser le brouillon du contexte si disponible
  const isDraftMode = params?.mode === 'copy' && exState.draftExercise;
  const sourceExercise = isDraftMode ? exState.draftExercise : exerciseToEdit;

  
  // Modes d'édition
  const isCopyMode = !!params?.copyMode || isDraftMode;
  const isEditMode = !!params?.exerciseId && !isCopyMode;

  // state formulaire
  const [exerciseData, setExerciseData] = useState({
    name: isCopyMode ? params?.copyName || `${sourceExercise?.name} (Copie)` : sourceExercise?.name || '',
    description: sourceExercise?.description || '',
    duration: sourceExercise?.duration || 15,
    playerCount: sourceExercise?.playerCount || 6,
    categories: sourceExercise?.category ? [sourceExercise.category] : [], // Pas de catégorie par défaut
    ageCategory: sourceExercise?.ageCategory || 'seniors',
    intensity: (sourceExercise?.intensity as string) || 'moyenne',
    material: sourceExercise?.material || '',
    tags: sourceExercise?.tags || [],
    steps: sourceExercise?.instructions || sourceExercise?.steps || [], // Utiliser instructions en priorité
    successCriteria: sourceExercise?.successCriteria || []
  });

  // terrain
  const [players, setPlayers] = useState<Player[]>(() => initializePlayers(sourceExercise));
  const [arrows, setArrows] = useState<Arrow[]>(() => initializeArrows(sourceExercise));
  const [balls, setBalls] = useState<Ball[]>(() => initializeBalls(sourceExercise));
  const [zones, setZones] = useState<Zone[]>(() => initializeZones(sourceExercise));

  // éditeur
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [showGrid, setShowGrid] = useState(true);
  const [tagInput, setTagInput] = useState('');
  const [newStep, setNewStep] = useState('');
  const [newCriterion, setNewCriterion] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [creationStart, setCreationStart] = useState<{ x: number; y: number } | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number } | null>(null);
  
  // Drag functionality for select tool
  const [draggedElement, setDraggedElement] = useState<{
    id: string;
    type: 'player' | 'ball' | 'zone';
    startPos: { x: number; y: number };
  } | null>(null);
  
  // Undo/Redo functionality
  const [history, setHistory] = useState<Array<{
    players: Player[];
    arrows: Arrow[];
    balls: Ball[];
    zones: Zone[];
  }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Preview and Draft state
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [savedAsDraft, setSavedAsDraft] = useState(false);
  
  // Display mode for players
  const [displayMode, setDisplayMode] = useState<PlayerDisplayMode>('role');
  const [playerCounter, setPlayerCounter] = useState(1);
  
  // Tag suggestions
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [filteredTagSuggestions, setFilteredTagSuggestions] = useState<string[]>([]);
  
  // Properties modal
  const [showPropertiesModal, setShowPropertiesModal] = useState(false);
  

  const courtRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);

  // Initialize history with current state
  useEffect(() => {
    if (history.length === 0) {
      const initialState = { players, arrows, balls, zones };
      setHistory([initialState]);
      setHistoryIndex(0);
    }
  }, [players, arrows, balls, zones, history.length]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Synchroniser les données de l'exercice quand sourceExercise change
  useEffect(() => {
    if (sourceExercise && isEditMode) {
      setExerciseData(prev => ({
        ...prev,
        name: sourceExercise.name || '',
        description: sourceExercise.description || '',
        duration: sourceExercise.duration || 15,
        playerCount: sourceExercise.playerCount || 6,
        categories: sourceExercise.category ? [sourceExercise.category] : [],
        ageCategory: sourceExercise.ageCategory || 'seniors',
        intensity: sourceExercise.intensity as string || 'moyenne',
        material: sourceExercise.material || '',
        tags: sourceExercise.tags || [],
        steps: sourceExercise.instructions || sourceExercise.steps || []
      }));
      
      // Synchroniser aussi les éléments du terrain
      setPlayers(initializePlayers(sourceExercise));
      setArrows(initializeArrows(sourceExercise));
      setBalls(initializeBalls(sourceExercise));
      setZones(initializeZones(sourceExercise));
    }
  }, [sourceExercise, isEditMode]);

  // Save current state to history when elements change
  const saveToHistory = useCallback(() => {
    const newState = { players, arrows, balls, zones };
    const newHistory = [...history.slice(0, historyIndex + 1), newState];
    
    // Limit history to 20 items
    if (newHistory.length > 20) {
      newHistory.shift();
      // Index remains the same because we removed the first element
      setHistory(newHistory);
    } else {
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [players, arrows, balls, zones, history, historyIndex]);

  // Undo/Redo functions
  const handleUndo = useCallback(() => {
    if (historyIndex > 0 && history.length > 0) {
      const newIndex = historyIndex - 1;
      const prevState = history[newIndex];
      if (prevState) {
        setPlayers(prevState.players || []);
        setArrows(prevState.arrows || []);
        setBalls(prevState.balls || []);
        setZones(prevState.zones || []);
        setHistoryIndex(newIndex);
        setSelectedElement(null);
      }
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      if (nextState) {
        setPlayers(nextState.players || []);
        setArrows(nextState.arrows || []);
        setBalls(nextState.balls || []);
        setZones(nextState.zones || []);
        setHistoryIndex(newIndex);
        setSelectedElement(null);
      }
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0 && history.length > 0;
  const canRedo = historyIndex < history.length - 1 && history.length > 0;


  // handlers court
  const handleCourtPointerDown = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!courtRef.current || selectedTool === 'select') return;
    const { x, y } = getEventPosition(e, courtRef);

    if (selectedTool.startsWith('player-')) {
      // Parse tool format: "player-role" or "player-role-number"
      const toolParts = selectedTool.split('-');
      const role = toolParts[1] as Player['role'];
      const selectedNumber = toolParts[2] ? parseInt(toolParts[2]) : undefined;
      
      const label = displayMode === 'number' && selectedNumber
        ? selectedNumber.toString() 
        : (roleLabels[role as keyof typeof roleLabels] || 'A');
      
      const newPlayer: Player = { 
        id: Date.now().toString(), 
        role, 
        position: { x, y }, 
        label,
        displayMode,
        playerNumber: displayMode === 'number' ? (selectedNumber || playerCounter) : undefined
      };
      
      setPlayers(prev => [...prev, newPlayer]);
      
      if (displayMode === 'number') {
        setPlayerCounter(prev => prev + 1);
      }
      
      // Save to history after adding element
      setTimeout(saveToHistory, 0);
    } else if (selectedTool === 'ball') {
      const newBall: Ball = { id: Date.now().toString(), position: { x, y } };
      setBalls(prev => [...prev, newBall]);
      
      // Save to history after adding element
      setTimeout(saveToHistory, 0);
    } else if (selectedTool === 'arrow' || selectedTool === 'zone') {
      e.preventDefault();
      setIsCreating(true);
      setCreationStart({ x, y });
      setCurrentMousePos({ x, y });
    }
  }, [selectedTool, displayMode, playerCounter]);

  const handleCourtPointerMove = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!courtRef.current) return;
    
    const { x, y } = getEventPosition(e, courtRef);
    
    // Handle dragging elements in select mode
    if (draggedElement && selectedTool === 'select') {
      const deltaX = x - draggedElement.startPos.x;
      const deltaY = y - draggedElement.startPos.y;
      
      if (draggedElement.type === 'player') {
        setPlayers(prev => prev.map(p => 
          p.id === draggedElement.id 
            ? { ...p, position: { x: Math.max(-20, Math.min(120, x)), y: Math.max(-20, Math.min(120, y)) } }
            : p
        ));
      } else if (draggedElement.type === 'ball') {
        setBalls(prev => prev.map(b => 
          b.id === draggedElement.id 
            ? { ...b, position: { x: Math.max(-20, Math.min(120, x)), y: Math.max(-20, Math.min(120, y)) } }
            : b
        ));
      } else if (draggedElement.type === 'zone') {
        setZones(prev => prev.map(z => 
          z.id === draggedElement.id 
            ? { ...z, position: { x: Math.max(-20, Math.min(120, x)), y: Math.max(-20, Math.min(120, y)) } }
            : z
        ));
      }
      
      e.preventDefault();
      return;
    }
    
    // Handle creating elements - always update mouse position when creating
    if ((selectedTool === 'arrow' || selectedTool === 'zone') && (isCreating || creationStart)) {
      setCurrentMousePos({ x, y });
      e.preventDefault();
    }
  }, [isCreating, creationStart, draggedElement, selectedTool]);

  const handleCourtPointerUp = useCallback(() => {
    // Handle end of dragging
    if (draggedElement) {
      setDraggedElement(null);
      // Save to history after moving element
      setTimeout(saveToHistory, 0);
      return;
    }
    
    // Handle creation
    if (!isCreating || !creationStart || !currentMousePos) return;

    if (selectedTool === 'arrow') {
      const deltaX = currentMousePos.x - creationStart.x;
      const deltaY = currentMousePos.y - creationStart.y;
      const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (length > 3) {
        const newArrow: Arrow = { id: Date.now().toString(), startPosition: creationStart, endPosition: currentMousePos, type: 'movement' };
        setArrows(prev => [...prev, newArrow]);
        
        // Save to history after adding element
        setTimeout(saveToHistory, 0);
      }
    } else if (selectedTool === 'zone') {
      const width = Math.abs(currentMousePos.x - creationStart.x);
      const height = Math.abs(currentMousePos.y - creationStart.y);
      const left = Math.min(currentMousePos.x, creationStart.x);
      const top = Math.min(currentMousePos.y, creationStart.y);
      if (width > 2 && height > 2) {
        const newZone: Zone = { id: Date.now().toString(), position: { x: left, y: top }, width, height, label: `Zone ${zones.length + 1}`, color: '#3b82f6' };
        setZones(prev => [...prev, newZone]);
        
        // Save to history after adding element
        setTimeout(saveToHistory, 0);
      }
    }

    setIsCreating(false);
    setCreationStart(null);
    setCurrentMousePos(null);
  }, [isCreating, creationStart, currentMousePos, selectedTool, zones.length, draggedElement, saveToHistory]);

  const handleElementPointerDown = (e: React.MouseEvent | React.TouchEvent, elementId: string, elementType: 'player' | 'ball' | 'zone') => {
    if (selectedTool !== 'select') return;
    e.stopPropagation();
    
    if (!courtRef.current) return;
    const { x, y } = getEventPosition(e, courtRef);
    
    setSelectedElement(elementId);
    setDraggedElement({
      id: elementId,
      type: elementType,
      startPos: { x, y }
    });
  };

  const handleDeleteElement = (elementId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== elementId));
    setArrows(prev => prev.filter(a => a.id !== elementId));
    setBalls(prev => prev.filter(b => b.id !== elementId));
    setZones(prev => prev.filter(z => z.id !== elementId));
    setSelectedElement(null);
    
    // Save to history after deleting element
    setTimeout(saveToHistory, 0);
  };

  const handleUpdateElement = (elementId: string, updates: Partial<Player | Arrow | Ball | Zone>) => {
    setPlayers(prev => prev.map(p => (p.id === elementId ? ({ ...p, ...updates } as Player) : p)));
    setArrows(prev => prev.map(a => (a.id === elementId ? ({ ...a, ...updates } as Arrow) : a)));
    setBalls(prev => prev.map(b => (b.id === elementId ? ({ ...b, ...updates } as Ball) : b)));
    setZones(prev => prev.map(z => (z.id === elementId ? ({ ...z, ...updates } as Zone) : z)));
  };

  // tags / steps
  const addTag = (tagToAdd?: string) => {
    const t = (tagToAdd || tagInput).trim().toLowerCase();
    if (t && !exerciseData.tags.includes(t)) {
      setExerciseData(prev => ({ ...prev, tags: [...prev.tags, t] }));
      setTagInput('');
      setShowTagSuggestions(false);
    }
  };
  
  const removeTag = (t: string) => setExerciseData(prev => ({ ...prev, tags: prev.tags.filter(x => x !== t) }));
  
  const handleTagInputChange = (value: string) => {
    setTagInput(value);
    if (value.trim()) {
      const filtered = TAG_SUGGESTIONS.filter(tag => 
        tag.toLowerCase().includes(value.trim().toLowerCase()) && 
        !exerciseData.tags.includes(tag)
      );
      setFilteredTagSuggestions(filtered);
      setShowTagSuggestions(filtered.length > 0);
    } else {
      setShowTagSuggestions(false);
    }
  };
  const addStep = () => {
    const s = newStep.trim();
    if (s) {
      setExerciseData(prev => ({ ...prev, steps: [...prev.steps, s] }));
      setNewStep('');
    }
  };
  const updateStep = (i: number, v: string) => setExerciseData(prev => ({ ...prev, steps: prev.steps.map((s, idx) => (idx === i ? v : s)) }));
  const removeStep = (i: number) => setExerciseData(prev => ({ ...prev, steps: prev.steps.filter((_, idx) => idx !== i) }));

  const addCriterion = () => {
    const c = newCriterion.trim();
    if (c) {
      setExerciseData(prev => ({ ...prev, successCriteria: [...prev.successCriteria, c] }));
      setNewCriterion('');
    }
  };
  const updateCriterion = (i: number, v: string) => setExerciseData(prev => ({ ...prev, successCriteria: prev.successCriteria.map((c, idx) => (idx === i ? v : c)) }));
  const removeCriterion = (i: number) => setExerciseData(prev => ({ ...prev, successCriteria: prev.successCriteria.filter((_, idx) => idx !== i) }));

  // Preview and Draft handlers
  const handlePreview = () => {
    if (!exerciseData.name.trim()) {
      alert('Veuillez saisir un nom pour l\'exercice');
      return;
    }
    setIsPreviewMode(true);
    // In preview mode, we'll show a modal or navigate to a preview view
    // For now, we'll create a temporary exercise to preview
    const tempExercise = {
      ...exerciseData,
      id: 'preview_temp',
      fieldData: convertToFieldData(players, arrows, balls, zones),
      instructions: exerciseData.steps.filter(Boolean)
    };
    
    // Navigate to exercise detail with preview mode
    navigate('exercise-detail', { 
      exerciseId: 'preview_temp', 
      previewData: tempExercise,
      returnTo: currentPage,
      returnParams: params 
    });
  };

  const handleSaveDraft = async () => {
    if (!exerciseData.name.trim()) {
      alert('Veuillez saisir un nom pour l\'exercice');
      return;
    }

    const fieldData = convertToFieldData(players, arrows, balls, zones);
    const now = new Date();
    
    const draftExercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'> = {
      name: `[BROUILLON] ${exerciseData.name.trim()}`,
      description: exerciseData.description.trim(),
      duration: exerciseData.duration,
      category: (exerciseData.categories.length > 0 ? exerciseData.categories[0] : 'attaque') as Exercise['category'],
      ageCategory: exerciseData.ageCategory as Exercise['ageCategory'],
      sport: selectedSport,
      instructions: exerciseData.steps.filter(Boolean),
      fieldData,
      createdById: sourceExercise?.createdById || auth.user?.id || 'anonymous',
      clubId: sourceExercise?.clubId || auth.club?.id || null,
      isPublic: false, // Drafts are always private
      level: exerciseData.intensity,
      intensity: exerciseData.intensity as Exercise['intensity'],
      playersMin: Math.max(1, exerciseData.playerCount - 2),
      playersMax: exerciseData.playerCount + 2,
      notes: 'Brouillon - Non publié',
      tags: [...exerciseData.tags, 'brouillon'],
      steps: exerciseData.steps.filter(Boolean),
      material: exerciseData.material.trim(),
      playerCount: exerciseData.playerCount,
      successCriteria: exerciseData.successCriteria.filter(Boolean)
    };

    await exActions.createExercise(draftExercise);
    setSavedAsDraft(true);
    
    // Show success message
    alert('Exercice sauvegardé comme brouillon !');
  };

  // save
  const canSave = exerciseData.name.trim().length > 0 && exerciseData.categories.length > 0;
  const [isSaving, setIsSaving] = useState(false);
  // Removed: showSuccessDialog - now redirects directly

  const handleSave = async () => {
    if (!canSave || isSaving) return;
    
    console.log('🚀 handleSave called - modes:', { isEditMode, isCopyMode, isDraftMode });

    setIsSaving(true);
    
    try {
      const fieldData = convertToFieldData(players, arrows, balls, zones);
      const now = new Date();
      
      const base: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'> = {
        name: exerciseData.name.trim(),
        description: exerciseData.description.trim(),
        duration: exerciseData.duration,
        category: (exerciseData.categories.length > 0 ? exerciseData.categories[0] : 'attaque') as Exercise['category'],
        ageCategory: exerciseData.ageCategory as Exercise['ageCategory'],
        sport: 'volleyball',
        instructions: exerciseData.steps.filter(Boolean),
        fieldData,
        createdById: sourceExercise?.createdById || auth.user?.id || 'anonymous',
        clubId: sourceExercise?.clubId || auth.club?.id || null,
        isPublic: true,
        level: exerciseData.intensity,
        intensity: exerciseData.intensity as Exercise['intensity'],
        playersMin: Math.max(1, exerciseData.playerCount - 2),
        playersMax: exerciseData.playerCount + 2,
        notes: sourceExercise?.notes || '',
        tags: [...exerciseData.tags, ...exerciseData.categories],
        steps: exerciseData.steps.filter(Boolean),
        material: exerciseData.material.trim(),
        playerCount: exerciseData.playerCount,
        successCriteria: exerciseData.successCriteria.filter(Boolean)
      };

      if (isEditMode && sourceExercise) {
        await exActions.updateExercise(sourceExercise.id, base);
      } else {
        await exActions.createExercise(base);
      }

      // Rediriger directement vers la page exercices après sauvegarde
      navigate('exercises');
      
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
      alert('Erreur lors de la publication de l\'exercice. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };

  // UI
  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', color: '#ffffff', position: 'relative' }} key={`exercise-create-${currentPage}-${params?.exerciseId || 'new'}`}>
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
          title={isCopyMode ? "Copier exercice" : isEditMode ? "Modifier exercice" : "Nouvel exercice"}
          icon={isCopyMode ? "📋" : isEditMode ? "✏️" : "✨"}
          onBack={() => navigate('exercises')}
          actions={[
            {
              label: savedAsDraft ? "Brouillon sauvé" : "Brouillon",
              icon: "💾",
              onClick: handleSaveDraft,
              variant: "secondary",
              disabled: !exerciseData.name.trim()
            },
            {
              label: "Aperçu",
              icon: "👁️",
              onClick: handlePreview,
              variant: "secondary",
              disabled: !exerciseData.name.trim()
            },
            {
              label: isSaving ? "Publication..." : "Publier",
              icon: "📤",
              onClick: handleSave,
              variant: "primary",
              disabled: !canSave || isSaving
            }
          ]}
        />

        <div style={{ padding: '8px', paddingTop: '80px' }}>
          {/* Informations générales mobile */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', background: 'linear-gradient(135deg, #00d4aa, #00b894)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' }}>📝</div>
              Informations générales
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Nom de l'exercice *</label>
              <Input value={exerciseData.name} onChange={e => setExerciseData(p => ({ ...p, name: e.target.value }))} className="bg-white/5 exersio-border text-white" style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Description</label>
              <Textarea value={exerciseData.description} onChange={e => setExerciseData(p => ({ ...p, description: e.target.value }))} rows={3} className="bg-white/5 exersio-border text-white resize-none" style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical', minHeight: '60px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Durée (min)</label>
                <input type="number" value={exerciseData.duration} min={1} max={60} onChange={e => setExerciseData(p => ({ ...p, duration: parseInt(e.target.value || '0', 10) }))} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none', colorScheme: 'dark' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Nb. joueurs</label>
                <input type="number" value={exerciseData.playerCount} min={1} max={12} onChange={e => setExerciseData(p => ({ ...p, playerCount: parseInt(e.target.value || '0', 10) }))} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none', colorScheme: 'dark' }} />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Catégories</label>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', padding: '12px', minHeight: '60px', maxHeight: '60px', overflowY: 'auto' }}>
                {exerciseData.categories.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {exerciseData.categories.map((category, index) => {
                      const categoryLabel = FIELD_CATEGORIES.find(c => c.value === category)?.label || category;
                      return (
                        <Badge key={`category-${category}-${index}`} variant="secondary" style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', fontSize: '10px', padding: '2px 6px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>{categoryLabel}</span>
                          <button onClick={() => setExerciseData(p => ({ ...p, categories: p.categories.filter(c => c !== category), tags: [...p.tags.filter(t => t !== category), category] }))} style={{ color: '#ef4444', fontSize: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ color: '#9ca3af', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Aucune catégorie</div>
                )}
              </div>
              {exerciseData.categories.length < FIELD_CATEGORIES.length && (
                <select value="" onChange={e => { const selectedValue = e.target.value; if (selectedValue && !exerciseData.categories.includes(selectedValue)) { setExerciseData(p => ({ ...p, categories: [...p.categories, selectedValue], tags: p.tags.filter(t => t !== selectedValue) })); } e.target.value = ''; }} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white', fontSize: '12px', outline: 'none', marginTop: '8px' }}>
                  <option value="">+ Ajouter catégorie...</option>
                  {FIELD_CATEGORIES.filter(cat => !exerciseData.categories.includes(cat.value)).map(cat => (<option key={`option-${cat.value}`} value={cat.value} style={{ backgroundColor: '#283544', color: 'white' }}>{cat.label}</option>))}
                </select>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Niveau</label>
                <select value={exerciseData.ageCategory} onChange={e => setExerciseData(p => ({ ...p, ageCategory: e.target.value }))} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none' }}>
                  {FIELD_AGE_CATEGORIES.map(cat => (<option key={cat.value} value={cat.value} style={{ backgroundColor: '#283544', color: 'white' }}>{cat.label}</option>))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Intensité</label>
                <select value={exerciseData.intensity} onChange={e => setExerciseData(p => ({ ...p, intensity: e.target.value }))} style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none' }}>
                  {FIELD_INTENSITIES.map(int => (<option key={int.value} value={int.value} style={{ backgroundColor: '#283544', color: 'white' }}>{int.label}</option>))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Matériel</label>
              <Textarea value={exerciseData.material} onChange={e => setExerciseData(p => ({ ...p, material: e.target.value }))} rows={3} className="bg-white/5 exersio-border text-white resize-none" style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical', minHeight: '60px' }} />
            </div>

            {/* Tags mobile */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Tags</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {exerciseData.tags.map((tag, index) => (
                  <Badge key={`tag-${tag}-${index}`} variant="secondary" style={{ background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#3b82f6', fontSize: '10px', padding: '2px 6px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {tag}
                    <button onClick={() => removeTag(tag)} style={{ color: '#ef4444', fontSize: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                  </Badge>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input value={tagInput} onChange={e => { setTagInput(e.target.value); setShowTagSuggestions(e.target.value.length > 0); setFilteredTagSuggestions(TAG_SUGGESTIONS.filter(s => s.toLowerCase().includes(e.target.value.toLowerCase()) && !exerciseData.tags.includes(s))); }} onKeyDown={e => e.key === 'Enter' && addTag()} placeholder="Nouveau tag..." style={{ flex: 1, padding: '8px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white', fontSize: '12px', outline: 'none' }} />
                <Button onClick={addTag} size="sm" className="bg-gradient-to-r from-[#00d4aa] to-[#00b894]" style={{ padding: '8px 12px', borderRadius: '8px', background: 'linear-gradient(135deg, #00d4aa, #00b894)', border: 'none', color: 'white', fontSize: '12px', cursor: 'pointer' }}>+</Button>
              </div>
            </div>
          </div>

          {/* Étapes mobile */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', background: 'linear-gradient(135deg, #00d4aa, #00b894)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' }}>📋</div>
              Étapes ({exerciseData.steps.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {exerciseData.steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', alignItems: 'flex-start' }}>
                  <div style={{ width: '20px', height: '20px', background: 'linear-gradient(135deg, #00d4aa, #00b894)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: '700', flexShrink: 0, marginTop: '2px' }}>{i + 1}</div>
                  <Input value={step} onChange={e => updateStep(i, e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', padding: '0', fontSize: '13px', outline: 'none' }} />
                  <button onClick={() => removeStep(i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', flexShrink: 0, marginTop: '2px' }}>×</button>
                </div>
              ))}

              <div style={{ display: 'flex', gap: '10px' }}>
                <Input value={newStep} onChange={e => setNewStep(e.target.value)} onKeyDown={e => e.key === 'Enter' && addStep()} placeholder="Nouvelle étape..." style={{ flex: 1, padding: '10px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }} />
                <Button onClick={addStep} size="sm" className="bg-gradient-to-r from-[#00d4aa] to-[#00b894]" style={{ padding: '10px 12px', borderRadius: '8px', background: 'linear-gradient(135deg, #00d4aa, #00b894)', border: 'none', color: 'white', fontSize: '12px', cursor: 'pointer' }}>+</Button>
              </div>
            </div>
          </div>

          {/* Critères de réussite mobile */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', background: 'linear-gradient(135deg, #00d4aa, #00b894)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' }}>✅</div>
              Critères de réussite ({exerciseData.successCriteria.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {exerciseData.successCriteria.map((criterion, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', alignItems: 'flex-start' }}>
                  <div style={{ width: '20px', height: '20px', background: 'linear-gradient(135deg, #00d4aa, #00b894)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: '700', flexShrink: 0, marginTop: '2px' }}>✓</div>
                  <Input value={criterion} onChange={e => updateCriterion(i, e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', padding: '0', fontSize: '13px', outline: 'none' }} />
                  <button onClick={() => removeCriterion(i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', flexShrink: 0, marginTop: '2px' }}>×</button>
                </div>
              ))}

              <div style={{ display: 'flex', gap: '10px' }}>
                <Input value={newCriterion} onChange={e => setNewCriterion(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCriterion()} placeholder="Nouveau critère..." style={{ flex: 1, padding: '10px 12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }} />
                <Button onClick={addCriterion} size="sm" className="bg-gradient-to-r from-[#00d4aa] to-[#00b894]" style={{ padding: '10px 12px', borderRadius: '8px', background: 'linear-gradient(135deg, #00d4aa, #00b894)', border: 'none', color: 'white', fontSize: '12px', cursor: 'pointer' }}>+</Button>
              </div>
            </div>
          </div>

          {/* Terrain mobile - mode paysage ou portrait */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '20px',
            position: isLandscape ? 'fixed' : 'relative',
            top: isLandscape ? '0' : 'auto',
            left: isLandscape ? '0' : 'auto',
            right: isLandscape ? '0' : 'auto',
            bottom: isLandscape ? '0' : 'auto',
            zIndex: isLandscape ? 1000 : 'auto',
            height: isLandscape ? '100vh' : 'auto',
            width: isLandscape ? '100vw' : 'auto',
            display: isLandscape ? 'flex' : 'block',
            flexDirection: isLandscape ? 'column' : 'initial'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: isLandscape ? 'space-between' : 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', background: 'linear-gradient(135deg, #00d4aa, #00b894)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' }}>🏐</div>
                Schéma tactique
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => {}}
                  style={{ 
                    padding: '6px 10px', 
                    background: 'rgba(59, 130, 246, 0.2)', 
                    border: '1px solid rgba(59, 130, 246, 0.3)', 
                    borderRadius: '6px', 
                    color: '#60a5fa', 
                    fontSize: '11px', 
                    cursor: 'pointer' 
                  }}
                >
                  🔄 Sport
                </button>
                {isLandscape && (
                  <button onClick={() => { if (window.screen && window.screen.orientation && window.screen.orientation.unlock) { window.screen.orientation.unlock(); } }} style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', color: 'white', fontSize: '12px', cursor: 'pointer' }}>🔄 Portrait</button>
                )}
              </div>
            </div>
            
            {isPortrait ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed rgba(255, 255, 255, 0.2)', borderRadius: '12px', color: '#94a3b8' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📱</div>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Éditeur tactique</div>
                <div style={{ fontSize: '12px' }}>Retournez l'écran en mode paysage pour accéder à l'éditeur de terrain</div>
                <button onClick={() => { if (window.screen && window.screen.orientation && window.screen.orientation.lock) { window.screen.orientation.lock('landscape').catch(() => {}); } }} style={{ marginTop: '16px', padding: '10px 16px', background: 'linear-gradient(135deg, #00d4aa, #00b894)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px', cursor: 'pointer' }}>🔄 Mode paysage</button>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Toolbar mobile simple */}
                <div style={{ marginBottom: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {['select', 'player-attaque', 'arrow', 'ball', 'zone'].map(tool => (
                    <button key={tool} onClick={() => setSelectedTool(tool)} style={{ padding: '8px 12px', background: selectedTool === tool ? 'linear-gradient(135deg, #00d4aa, #00b894)' : 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', color: 'white', fontSize: '11px', cursor: 'pointer', minWidth: '60px' }}>
                      {tool === 'select' ? '🎯' : tool === 'player-attaque' ? '👤' : tool === 'arrow' ? '➡️' : tool === 'ball' ? '🏐' : '🟨'} {tool === 'player-attaque' ? 'Joueur' : tool.charAt(0).toUpperCase() + tool.slice(1)}
                    </button>
                  ))}
                  <button onClick={() => setShowGrid(!showGrid)} style={{ padding: '8px 12px', background: showGrid ? 'linear-gradient(135deg, #00d4aa, #00b894)' : 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', color: 'white', fontSize: '11px', cursor: 'pointer' }}>🔲 Grille</button>
                  {selectedElement && (
                    <button onClick={() => handleDeleteElement(selectedElement)} style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', fontSize: '11px', cursor: 'pointer' }}>🗑️ Suppr.</button>
                  )}
                </div>
                
                {/* Terrain de volleyball en mode paysage */}
                <div style={{ flex: 1, position: 'relative', minHeight: '200px', maxHeight: 'calc(100vh - 120px)' }}>
                  <VolleyballCourt
                    courtRef={courtRef}
                    selectedTool={selectedTool}
                    showGrid={showGrid}
                    players={players}
                    arrows={arrows}
                    balls={balls}
                    zones={zones}
                    selectedElement={selectedElement}
                    isCreating={isCreating}
                    creationStart={creationStart}
                    currentMousePos={currentMousePos}
                    onCourtPointerDown={handleCourtPointerDown}
                    onCourtPointerMove={handleCourtPointerMove}
                    onCourtPointerUp={handleCourtPointerUp}
                    onElementPointerDown={handleElementPointerDown}
                    onElementSelect={setSelectedElement}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" key={`exercise-create-${currentPage}-${params?.exerciseId || 'new'}`}>
      {/* Header */}
      <div style={{
        // background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        // border: '1px solid rgba(255, 255, 255, 0.12)',
        // borderRadius: '24px',
        padding: '5px 35px',
        // marginBottom: '30px',
        // boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-sm exersio-text-muted mb-2">
              <Home className="w-4 h-4" />
              <span className="text-[#00d4aa] hover:text-[#00b894] cursor-pointer" onClick={() => navigate('home')}>Dashboard</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-[#00d4aa] hover:text-[#00b894] cursor-pointer" onClick={() => navigate('exercises')}>Exercices</span>
              <ChevronRight className="w-4 h-4" />
              <span>
                {isCopyMode ? 'Copier exercice' : isEditMode ? 'Modifier exercice' : 'Nouvel exercice'}
              </span>
            </div>
            <div className='flex justify-center items-center gap-2'>
            <h1 className="text-3xl font-bold bg-gradient-to-r bg-clip-text">
              {isCopyMode ? '📋' : isEditMode ? '✏️' : '✨'}
              </h1>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-emerald-200 bg-clip-text text-transparent">
              {isCopyMode ? 'Copier l\'exercice' : isEditMode ? 'Modifier l\'exercice' : ' Créer un exercice'}
            </h1>
            </div>
            
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleSaveDraft}
              disabled={!exerciseData.name.trim()}
              className="exersio-border text-white hover:bg-white/20 rounded-xl disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {savedAsDraft ? 'Brouillon sauvé' : 'Brouillon'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handlePreview}
              disabled={!exerciseData.name.trim()}
              className="exersio-border text-white hover:bg-white/20 rounded-xl disabled:opacity-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              Aperçu
            </Button>
            <Button onClick={handleSave} disabled={!canSave || isSaving}
              className="bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:from-[#00b894] hover:to-[#009775] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50">
              <Upload className="w-4 h-4 mr-2" />
              {isSaving ? 'Publication...' : 'Publier'}
            </Button>
          </div>
        </div>
      </div>

      {/* Layout 2 colonnes */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Col gauche : formulaire */}
        <div className="xl:col-span-4">
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            padding: '25px',
            marginBottom: '30px'
          }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded text-xs flex items-center justify-center">📝</div>
              <h3 className="text-lg font-bold">Informations générales</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom de l'exercice *</label>
                <Input value={exerciseData.name} onChange={e => setExerciseData(p => ({ ...p, name: e.target.value }))} className="bg-white/5 exersio-border text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea value={exerciseData.description} onChange={e => setExerciseData(p => ({ ...p, description: e.target.value }))} rows={3} className="bg-white/5 exersio-border text-white resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Durée (min)</label>
                  <input 
                    type="number" 
                    value={exerciseData.duration} 
                    min={1} 
                    max={60} 
                    onChange={e => setExerciseData(p => ({ ...p, duration: parseInt(e.target.value || '0', 10) }))} 
                    className="w-full bg-white/5 exersio-border text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00d4aa]"
                    style={{
                      colorScheme: 'dark'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nb. joueurs</label>
                  <input 
                    type="number" 
                    value={exerciseData.playerCount} 
                    min={1} 
                    max={12} 
                    onChange={e => setExerciseData(p => ({ ...p, playerCount: parseInt(e.target.value || '0', 10) }))} 
                    className="w-full bg-white/5 exersio-border text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00d4aa]"
                    style={{
                      colorScheme: 'dark'
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Catégories</label>
                  
                  {/* Zone d'affichage des catégories sélectionnées - hauteur fixe */}
                  <div className="bg-white/5 border exersio-border rounded-xl p-3 min-h-[80px] max-h-[80px] overflow-y-auto">
                    {exerciseData.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {exerciseData.categories.map((category, index) => {
                          const categoryLabel = FIELD_CATEGORIES.find(c => c.value === category)?.label || category;
                          return (
                            <Badge 
                              key={`category-${category}-${index}`} 
                              variant="secondary" 
                              className="bg-emerald-500/20 border-emerald-500/30 text-emerald-400 text-xs whitespace-nowrap flex items-center gap-1"
                            >
                              <span>{categoryLabel}</span>
                              <button 
                                onClick={() => setExerciseData(p => ({ 
                                  ...p, 
                                  categories: p.categories.filter(c => c !== category),
                                  tags: [...p.tags.filter(t => t !== category), category]
                                }))}
                                className="hover:text-red-400 text-xs"
                              >
                                ×
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm flex items-center justify-center h-full">
                        Aucune catégorie sélectionnée
                      </div>
                    )}
                  </div>
                  
                  {/* Sélecteur pour ajouter des catégories - toujours en dessous */}
                  {exerciseData.categories.length < FIELD_CATEGORIES.length && (
                    <select
                      key="category-selector"
                      value=""
                      onChange={e => {
                        const selectedValue = e.target.value;
                        console.log('Selected value:', selectedValue);
                        console.log('Current categories:', exerciseData.categories);
                        console.log('Already includes?', exerciseData.categories.includes(selectedValue));
                        
                        if (selectedValue && !exerciseData.categories.includes(selectedValue)) {
                          setExerciseData(p => ({ 
                            ...p, 
                            categories: [...p.categories, selectedValue],
                            tags: p.tags.filter(t => t !== selectedValue)
                          }));
                        }
                        // Reset to empty value
                        e.target.value = '';
                      }}
                      className="w-full bg-white/5 exersio-border text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00d4aa] mt-2"
                    >
                      <option value="">+ Ajouter une catégorie...</option>
                      {FIELD_CATEGORIES
                        .filter(cat => !exerciseData.categories.includes(cat.value))
                        .map(cat => (
                          <option key={`option-${cat.value}`} value={cat.value} className="bg-[#283544] text-white">
                            {cat.label}
                          </option>
                        ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Niveau</label>
                  <select 
                    value={exerciseData.ageCategory} 
                    onChange={e => setExerciseData(p => ({ ...p, ageCategory: e.target.value }))}
                    className="w-full bg-white/5 exersio-border text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00d4aa]"
                  >
                    {FIELD_AGE_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value} className="bg-[#283544] text-white">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Intensité</label>
                <select 
                  value={exerciseData.intensity} 
                  onChange={e => setExerciseData(p => ({ ...p, intensity: e.target.value }))}
                  className="w-full bg-white/5 exersio-border text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00d4aa]"
                >
                  {FIELD_INTENSITIES.map(int => (
                    <option key={int.value} value={int.value} className="bg-[#283544] text-white">
                      {int.label}
                    </option>
                  ))}
                </select>
              </div>


              <div>
                <label className="block text-sm font-medium mb-2">Matériel</label>
                <Textarea value={exerciseData.material} onChange={e => setExerciseData(p => ({ ...p, material: e.target.value }))} rows={4} className="bg-white/5 exersio-border text-white resize-none" />
              </div>
            </div>

            {/* Etapes */}
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded text-xs flex items-center justify-center">📋</div>
                <h3 className="text-lg font-bold">Étapes</h3>
              </div>

              <div className="space-y-3">
                {exerciseData.steps.map((step, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-white/5 rounded-lg items-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{i + 1}</div>
                    <Input value={step} onChange={e => updateStep(i, e.target.value)} className="flex-1 bg-transparent border-none text-white p-0" />
                    <Button size="sm" variant="ghost" onClick={() => removeStep(i)} className="text-red-400 hover:text-red-300 h-6 w-6 p-0 flex-shrink-0">×</Button>
                  </div>
                ))}

                <div className="flex gap-3">
                  <Input value={newStep} onChange={e => setNewStep(e.target.value)} onKeyDown={e => e.key === 'Enter' && addStep()} placeholder="Nouvelle étape..." className="bg-white/5 exersio-border text-white" />
                  <Button onClick={addStep} size="sm" className="bg-gradient-to-r from-[#00d4aa] to-[#00b894]">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Critères de réussite */}
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded text-xs flex items-center justify-center">✅</div>
                <h3 className="text-lg font-bold">Critères de réussite</h3>
              </div>

              <div className="space-y-3">
                {exerciseData.successCriteria.map((criterion, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-white/5 rounded-lg items-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                    <Input value={criterion} onChange={e => updateCriterion(i, e.target.value)} className="flex-1 bg-transparent border-none text-white p-0" />
                    <Button size="sm" variant="ghost" onClick={() => removeCriterion(i)} className="text-red-400 hover:text-red-300 h-6 w-6 p-0 flex-shrink-0">×</Button>
                  </div>
                ))}

                <div className="flex gap-3">
                  <Input value={newCriterion} onChange={e => setNewCriterion(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCriterion()} placeholder="Nouveau critère..." className="bg-white/5 exersio-border text-white" />
                  <Button onClick={addCriterion} size="sm" className="bg-gradient-to-r from-[#00d4aa] to-[#00b894]">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Editeur central */}
        <div className="xl:col-span-8">
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            overflow: 'hidden'
          }}>
            
            {/* Header éditeur avec sport sélectionné */}
            <div style={{
              padding: '20px 24px 16px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  background: 'linear-gradient(135deg, #00d4aa, #00b894)', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '14px' 
                }}>
                  🏐
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    color: '#ffffff', 
                    margin: 0,
                    marginBottom: '2px'
                  }}>
                    Éditeur de terrain
                  </h3>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#94a3b8', 
                    margin: 0 
                  }}>
                    Volleyball • Éditeur tactique
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => {}}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '10px',
                  color: '#60a5fa',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                🔄 Changer de sport
              </button>
            </div>

            <Toolbar
              selectedTool={selectedTool}
              onToolChange={setSelectedTool}
              showGrid={showGrid}
              onToggleGrid={() => setShowGrid(!showGrid)}
              selectedElement={selectedElement}
              onDeleteElement={handleDeleteElement}
              displayMode={displayMode}
              onDisplayModeChange={(mode) => {
                setDisplayMode(mode);
                
                // Mettre à jour les labels de tous les joueurs existants
                setPlayers(prev => prev.map((player, index) => ({
                  ...player,
                  displayMode: mode,
                  label: mode === 'number' 
                    ? (index + 1).toString()
                    : (roleLabels[player.role as keyof typeof roleLabels] || 'A'),
                  playerNumber: mode === 'number' ? (index + 1) : undefined
                })));
                
                if (mode === 'number') {
                  // Reset counter when switching to number mode
                  setPlayerCounter(players.length + 1);
                } else {
                  setPlayerCounter(1);
                }
              }}
              onClearField={() => {
                setPlayers([]); setArrows([]); setBalls([]); setZones([]);
                setSelectedElement(null); setIsCreating(false); setCreationStart(null); setCurrentMousePos(null);
                setPlayerCounter(1);
                
                // Save to history after clearing field
                setTimeout(saveToHistory, 0);
              }}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={canUndo}
              canRedo={canRedo}
            />

            <VolleyballCourt
              courtRef={courtRef}
              selectedTool={selectedTool}
              showGrid={showGrid}
              players={players}
              arrows={arrows}
              balls={balls}
              zones={zones}
              selectedElement={selectedElement}
              isCreating={isCreating}
              creationStart={creationStart}
              currentMousePos={currentMousePos}
              onCourtPointerDown={handleCourtPointerDown}
              onCourtPointerMove={handleCourtPointerMove}
              onCourtPointerUp={handleCourtPointerUp}
              onElementPointerDown={handleElementPointerDown}
              onElementSelect={setSelectedElement}
            />
            
            {/* Bouton propriétés sous le terrain */}
            <div style={{ margin: '20px', marginTop: '0' }}>
              <button
                onClick={() => setShowPropertiesModal(true)}
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '12px',
                  color: '#3b82f6',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{ fontSize: '20px' }}>🔧</span>
                <span>Propriétés des éléments</span>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#94a3b8'
                }}>
                  👥{players.length} • 🏐{balls.length} • ➡️{arrows.length} • 📦{zones.length}
                </div>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Properties Modal */}
      {showPropertiesModal && (
        <div 
          key="properties-modal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPropertiesModal(false);
            }
          }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 25px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#ffffff',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                🔧 Propriétés des éléments
              </h2>
              <button
                onClick={() => setShowPropertiesModal(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content - Version simplifiée */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px 25px'
            }}>
              <div style={{
                color: '#ffffff',
                textAlign: 'center',
                padding: '40px 20px'
              }}>
                <p>Propriétés des éléments</p>
                <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '10px' }}>
                  Joueurs: {players.length} | Flèches: {arrows.length} | Ballons: {balls.length} | Zones: {zones.length}
                </p>
                <button
                  onClick={handleSave}
                  disabled={!canSave}
                  style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    background: canSave ? '#00d4aa' : '#666',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    cursor: canSave ? 'pointer' : 'not-allowed'
                  }}
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
