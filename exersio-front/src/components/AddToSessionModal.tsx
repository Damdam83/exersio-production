import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Exercise, Session } from '../types';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  Target,
  CheckCircle2,
  ArrowRight 
} from 'lucide-react';

interface AddToSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise | null;
  sessions: Session[];
  onAddToExistingSession: (sessionId: string, exerciseId: string) => void;
  onCreateNewSession: (exerciseId: string) => void;
}

export function AddToSessionModal({
  isOpen,
  onClose,
  exercise,
  sessions,
  onAddToExistingSession,
  onCreateNewSession
}: AddToSessionModalProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');

  if (!exercise) return null;

  // Filtrer les séances disponibles (planifiées ou en cours)
  const availableSessions = sessions.filter(s => 
    s.status === 'planned' || s.status === 'in-progress'
  );

  const handleAddToExisting = () => {
    if (selectedSessionId) {
      onAddToExistingSession(selectedSessionId, exercise.id);
      onClose();
    }
  };

  const handleCreateNew = () => {
    onCreateNewSession(exercise.id);
    onClose();
  };

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.4);
        }
      `}</style>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto text-white" style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px'
        }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#00d4aa] to-[#00b894] flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold">Ajouter "{exercise.name}" à une séance</span>
            </DialogTitle>
          </DialogHeader>

        <div className="space-y-6">
          {/* Aperçu de l'exercice */}
          <Card style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px'
          }}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4aa] to-[#00b894] flex items-center justify-center">
                    🏐
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{exercise.name}</h4>
                    <p className="text-sm text-gray-400">{exercise.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {exercise.duration}min
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {exercise.category}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Options d'ajout */}
          <div className="flex flex-col gap-6">
            {/* Ajouter à une séance existante */}
            <Card style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px'
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="w-5 h-5 text-[#00d4aa]" />
                  Ajouter à une séance existante
                </CardTitle>
                <p className="text-sm text-gray-400">
                  Sélectionnez une séance programmée ou en cours
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {availableSessions.length > 0 ? (
                  <>
                    <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                      {availableSessions.map((session) => (
                        <div
                          key={session.id}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            selectedSessionId === session.id
                              ? 'border-[#00d4aa] bg-[#00d4aa]/10'
                              : 'border-white/20 hover:border-[#00d4aa]/50 hover:bg-white/5'
                          }`}
                          onClick={() => setSelectedSessionId(session.id)}
                          style={{
                            background: selectedSessionId === session.id 
                              ? 'rgba(0, 212, 170, 0.1)' 
                              : 'rgba(255, 255, 255, 0.03)'
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-white">{session.name}</h5>
                            <Badge 
                              variant="secondary"
                              className={`${
                                session.status === 'planned' 
                                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                                  : 'bg-green-500/20 text-green-400 border-green-500/30'
                              }`}
                            >
                              {session.status === 'planned' ? 'Programmée' : 'En cours'}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(session.date).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {session.duration}min
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {session.exercises.length} exercices
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={handleAddToExisting}
                      disabled={!selectedSessionId}
                      className="w-full bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:from-[#00b894] hover:to-[#009775]"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Ajouter à la séance sélectionnée
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto bg-gray-500/20 rounded-full flex items-center justify-center mb-3">
                      <Calendar className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-sm">
                      Aucune séance programmée ou en cours
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Créer une nouvelle séance */}
            <Card style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px'
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="w-5 h-5 text-[#00d4aa]" />
                  Créer une nouvelle séance
                </CardTitle>
                <p className="text-sm text-gray-400">
                  Démarrez une séance avec cet exercice
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className="p-6 border-2 border-dashed border-white/20 rounded-xl text-center cursor-pointer transition-all duration-200 hover:border-[#00d4aa]/50 hover:bg-white/5"
                  onClick={handleCreateNew}
                >
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-full flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-white" />
                  </div>
                  <h5 className="font-medium text-white mb-2">Nouvelle séance d'entraînement</h5>
                  <p className="text-sm text-gray-400 mb-4">
                    L'exercice sera automatiquement ajouté à votre nouvelle séance
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-[#00d4aa]">
                    <span>Exercice</span>
                    <ArrowRight className="w-3 h-3" />
                    <span>Nouvelle séance</span>
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    Cliquez pour créer une nouvelle séance
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Boutons d'actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-white/20">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
            >
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}