import { ArrowLeft, Clock, Copy, Edit3, Heart, Lightbulb, Package, Plus, Share2, StickyNote, Tag, Target, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { useSessions } from '../contexts/SessionsContext';
import { useExercises } from '../contexts/ExercisesContext';
import type { Exercise } from '../types';
import { initializeArrows, initializeBalls, initializePlayers, initializeZones } from '../utils/exerciseEditorHelpers';
import { AddToSessionModal } from './AddToSessionModal';
import { VolleyballCourtViewer } from './ExerciseEditor/VolleyballCourtViewer';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ExerciseDetailViewProps {
  exercise: Exercise;
  onBack: () => void;
  onEdit: () => void;
  onToggleFavorite: () => void;
  isFavorite?: boolean;
  contextInfo?: {
    from?: string;
    fromId?: string;
    fromName?: string; // Nom de la session ou autre contexte
  };
}

export function ExerciseDetailView({
  exercise,
  onBack,
  onEdit,
  onToggleFavorite,
  isFavorite = false,
  contextInfo
}: ExerciseDetailViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [permissions, setPermissions] = useState({ canEdit: false, canDelete: false });
  const [isSharing, setIsSharing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { sessions, actions } = useSessions();
  const { actions: exerciseActions } = useExercises();
  const { navigate } = useNavigation();

  // Charger les permissions au montage
  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const perms = await exerciseActions.getPermissions(exercise.id);
        setPermissions(perms);
      } catch (error) {
        console.error('Erreur lors du chargement des permissions:', error);
      }
    };
    loadPermissions();
  }, [exercise.id, exerciseActions]);

  const handleAddToExistingSession = async (sessionId: string, exerciseId: string) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        // Créer un draft local de la session avec l'exercice ajouté
        const sessionDraft = {
          ...session,
          exercises: [...session.exercises, exerciseId]
        };
        
        // Stocker le draft dans le contexte Sessions
        actions.createSessionDraft(sessionDraft, sessionId); // sessionId en tant qu'id de session existante
        
        // Rediriger vers la page d'édition de la session avec le draft
        navigate('session-create', { mode: 'edit-draft', sessionId, exerciseId });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la session:', error);
    }
  };

  const handleCreateNewSession = async (exerciseId: string) => {
    try {
      // Créer un draft de session localement (pas de sauvegarde en base)
      const sessionDraft = {
        name: `Séance avec ${exercise.name}`,
        description: `Séance créée automatiquement avec l'exercice "${exercise.name}"`,
        date: new Date().toISOString(),
        duration: exercise.duration || 60,
        exercises: [exerciseId],
        status: 'planned' as const,
        sport: 'volleyball',
        ageCategory: 'tous',
        objectives: `Travailler avec l'exercice : ${exercise.name}`
      };

      // Stocker le draft dans le contexte Sessions (il faut l'implémenter)
      actions.createSessionDraft(sessionDraft);

      // Rediriger vers la page de création de session en mode draft
      navigate('session-create', { mode: 'draft', exerciseId });
    } catch (error) {
      console.error('Erreur lors de la création du draft de session:', error);
    }
  };

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    
    try {
      await exerciseActions.shareWithClub(exercise.id);
      // Mettre à jour les données locales si nécessaire
      // Optionnel: Afficher une notification de succès
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      // Optionnel: Afficher une notification d'erreur
    } finally {
      setIsSharing(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    
    // Demander confirmation
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'exercice "${exercise.name}" ?`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await exerciseActions.deleteExercise(exercise.id);
      // Retourner à la page précédente
      onBack();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      // Optionnel: Afficher une notification d'erreur
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopy = () => {
    // Créer une copie locale au lieu de sauvegarder immédiatement
    exerciseActions.createLocalCopy(exercise);
    // Rediriger vers l'éditeur en mode copie/draft
    navigate('exercise-create', { mode: 'copy' });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Actions */}
      <Card style={{
        // background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        // border: '1px solid rgba(255, 255, 255, 0.12)',
        // borderRadius: '20px'
      }} className="mb-8">
        <CardHeader className="pb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              {/* Breadcrumb contextuelle */}
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <Button variant="ghost" size="sm" onClick={onBack} className="h-auto p-0 text-[#00d4aa] hover:text-[#00b894]">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  {contextInfo?.from === 'session-create' || contextInfo?.from === 'session-detail'
                    ? (contextInfo.fromName || 'Séance') 
                    : 'Exercices'
                  }
                </Button>
                {(contextInfo?.from === 'session-create' || contextInfo?.from === 'session-detail') && contextInfo?.fromName && (
                  <>
                    <span>›</span>
                    <span>Exercices</span>
                  </>
                )}
                <span>›</span>
                <span>{exercise.name}</span>
              </div>

              {/* Description */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00d4aa] to-[#00b894] rounded-xl flex items-center justify-center text-xl shadow-lg shadow-[#00d4aa]/30">
                  🏐
                </div>
                <div>
                  <p className="text-gray-400">
                    Exercice {exercise.category} • Niveau {exercise.level} • {exercise.duration} minutes
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant={isFavorite ? "default" : "outline"}
                size="sm"
                onClick={onToggleFavorite}
                className={isFavorite ? 
                  "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" : 
                  "border-white/20 hover:bg-white/10"
                }
              >
                <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                Favori
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShare}
                disabled={isSharing || exercise.clubId !== null} // Désactiver si déjà partagé
                className="border-white/20 hover:bg-white/10"
              >
                <Share2 className="w-4 h-4 mr-2" />
                {isSharing ? 'Partage...' : exercise.clubId ? 'Partagé' : 'Partager'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopy}
                className="border-white/20 hover:bg-white/10"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copier
              </Button>
              {permissions.canEdit && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onEdit}
                  className="border-white/20 hover:bg-white/10"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              )}
              {permissions.canDelete && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? 'Suppression...' : 'Supprimer'}
                </Button>
              )}
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:from-[#00b894] hover:to-[#009775]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter à la séance
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="xl:col-span-2 space-y-8">
          {/* Visualisation du terrain */}
          <Card style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px'
          }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-[#00d4aa] to-[#00b894] rounded-md flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                Schéma tactique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-[#1e293b] rounded-xl p-4 relative overflow-hidden">
                {/* Pattern background */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(45deg, transparent 49%, rgba(59, 130, 246, 0.1) 50%, transparent 51%), linear-gradient(-45deg, transparent 49%, rgba(16, 185, 129, 0.1) 50%, transparent 51%)`,
                    backgroundSize: '30px 30px'
                  }} />
                </div>

                {/* Terrain unifié */}
                <div className="relative max-w-3xl mx-auto">
                  <VolleyballCourtViewer
                    players={initializePlayers(exercise)}
                    arrows={initializeArrows(exercise)}
                    balls={initializeBalls(exercise)}
                    zones={initializeZones(exercise)}
                    showGrid={true}
                    style={{ height: '400px' }}
                  />
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Consignes détaillées */}
          <Card style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px'
          }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-[#00d4aa] to-[#00b894] rounded-md flex items-center justify-center">
                  <StickyNote className="w-4 h-4 text-white" />
                </div>
                Consignes détaillées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {exercise.instructions && exercise.instructions.length > 0 ? (
                  exercise.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#00d4aa] to-[#00b894] rounded-full flex items-center justify-center text-sm font-bold text-white mt-0.5">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="h-0.5 bg-gradient-to-r from-[#00d4aa]/30 to-transparent mb-3"></div>
                        <p className="text-gray-200 text-base leading-relaxed">{instruction}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <p>Aucune instruction détaillée disponible pour cet exercice.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informations */}
          <Card style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px'
          }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-[#00d4aa] to-[#00b894] rounded-md flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Statistiques rapides */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/8 transition-colors">
                  <div className="text-xl font-bold bg-gradient-to-r from-[#00d4aa] to-[#00b894] bg-clip-text text-transparent">
                    {exercise.duration}min
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Durée</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/8 transition-colors">
                  <div className="text-xl font-bold bg-gradient-to-r from-[#00d4aa] to-[#00b894] bg-clip-text text-transparent">
                    {exercise.playersMin}-{exercise.playersMax}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Joueurs</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/8 transition-colors">
                  <div className="text-xl font-bold bg-gradient-to-r from-[#00d4aa] to-[#00b894] bg-clip-text text-transparent">
                    {exercise.intensity}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Intensité</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/8 transition-colors">
                  <div className="text-xl font-bold bg-gradient-to-r from-[#00d4aa] to-[#00b894] bg-clip-text text-transparent">
                    {exercise.level}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Niveau</div>
                </div>
              </div>

              {/* Catégories */}
              <div>
                <h4 className="flex items-center gap-3 text-sm font-medium text-gray-400 mb-3">
                  <div className="w-5 h-5 bg-gradient-to-br from-[#00d4aa] to-[#00b894] rounded-md flex items-center justify-center">
                    <Tag className="w-3 h-3 text-white" />
                  </div>
                  Catégories
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    {exercise.category}
                  </Badge>
                  <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    {exercise.ageCategory}
                  </Badge>
                  {exercise.clubId && (
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      📢 Partagé avec le club
                    </Badge>
                  )}
                  {exercise.tags && exercise.tags
                    .filter(tag => tag !== exercise.category && tag !== exercise.ageCategory && tag !== exercise.intensity)
                    .map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {tag}
                      </Badge>
                  ))}
                </div>
              </div>

              {/* Matériel */}
              {exercise.material && exercise.material.trim() && (
                <div>
                  <h4 className="flex items-center gap-3 text-sm font-medium text-gray-400 mb-3">
                    <div className="w-5 h-5 bg-gradient-to-br from-[#00d4aa] to-[#00b894] rounded-md flex items-center justify-center">
                      <Package className="w-3 h-3 text-white" />
                    </div>
                    Matériel requis
                  </h4>
                  <div className="space-y-2">
                    {exercise.material.split('\n').map((item, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm text-gray-300">
                        <span className="text-base">📦</span>
                        <span>{item.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="flex items-center gap-3 text-sm font-medium text-gray-400 mb-3">
                  <div className="w-5 h-5 bg-gradient-to-br from-[#00d4aa] to-[#00b894] rounded-md flex items-center justify-center">
                    <Lightbulb className="w-3 h-3 text-white" />
                  </div>
                  Description
                </h4>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-gray-300 text-sm leading-relaxed">
                  {exercise.description}
                </div>
              </div>

              {/* Notes du coach */}
              {exercise.notes && (
                <div>
                  <h4 className="flex items-center gap-3 text-sm font-medium text-gray-400 mb-3">
                    <div className="w-5 h-5 bg-gradient-to-br from-[#00d4aa] to-[#00b894] rounded-md flex items-center justify-center">
                      <StickyNote className="w-3 h-3 text-white" />
                    </div>
                    Notes du coach
                  </h4>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-gray-400 text-sm leading-relaxed italic">
                    {exercise.notes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions flottantes */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-20">
        <Button
          size="icon"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:from-[#00b894] hover:to-[#009775] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-6 h-6" />
        </Button>
        {permissions.canEdit && (
          <Button
            size="icon"
            variant="outline"
            className="w-14 h-14 rounded-full glass-strong border-white/20 hover:bg-white/10 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            onClick={onEdit}
          >
            <Edit3 className="w-5 h-5" />
          </Button>
        )}
        {permissions.canDelete && (
          <Button
            size="icon"
            variant="outline"
            className="w-14 h-14 rounded-full glass-strong border-red-500/50 hover:bg-red-500/10 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-red-400 hover:text-red-300"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Modal pour ajouter à la séance */}
      <AddToSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        exercise={exercise}
        sessions={sessions}
        onAddToExistingSession={handleAddToExistingSession}
        onCreateNewSession={handleCreateNewSession}
      />
    </div>
  );
}