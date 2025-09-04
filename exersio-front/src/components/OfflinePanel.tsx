/**
 * Panneau de gestion du mode hors connexion
 */

import React, { useEffect, useState } from 'react';
import { 
  Cloud, 
  CloudOff, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2, 
  AlertCircle, 
  CheckCircle2,
  X,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Button } from './ui/button';
import { useOffline } from '../hooks/useOffline';
import { SyncIndicator } from './SyncIndicator';

interface OfflinePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OfflinePanel({ isOpen, onClose }: OfflinePanelProps) {
  const { state, actions } = useOffline();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto-hide message après 3 secondes
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSyncAll = async () => {
    if (!state.isOnline) {
      setMessage({ type: 'error', text: 'Vous devez être en ligne pour synchroniser' });
      return;
    }

    setIsProcessing(true);
    try {
      await actions.syncAll();
      setMessage({ type: 'success', text: 'Synchronisation terminée avec succès!' });
    } catch (error) {
      console.error('Sync error:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la synchronisation' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAll = async () => {
    if (!state.isOnline) {
      setMessage({ type: 'error', text: 'Vous devez être en ligne pour télécharger' });
      return;
    }

    setIsProcessing(true);
    try {
      await actions.downloadAll();
      setMessage({ type: 'success', text: 'Données téléchargées avec succès!' });
    } catch (error) {
      console.error('Download error:', error);
      setMessage({ type: 'error', text: 'Erreur lors du téléchargement' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer toutes les données locales ? Cette action est irréversible.')) {
      return;
    }

    setIsProcessing(true);
    try {
      await actions.clearOfflineData();
      setMessage({ type: 'success', text: 'Données locales supprimées' });
    } catch (error) {
      console.error('Clear error:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatLastSync = (timestamp: number | null): string => {
    if (!timestamp) return 'Jamais';
    
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    return 'À l\'instant';
  };

  const totalPending = state.pendingCount.exercises + state.pendingCount.sessions;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-md border border-white/10 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {state.isOnline ? (
              <Wifi className="w-6 h-6 text-[#00d4aa]" />
            ) : (
              <WifiOff className="w-6 h-6 text-gray-400" />
            )}
            <h2 className="text-xl font-bold text-white">Mode Hors Connexion</h2>
          </div>
          <Button
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Status de connexion */}
        <div className="mb-6 p-4 rounded-lg" style={{
          backgroundColor: state.isOnline ? 'rgba(0, 212, 170, 0.1)' : 'rgba(107, 114, 128, 0.1)',
          border: `1px solid ${state.isOnline ? 'rgba(0, 212, 170, 0.2)' : 'rgba(107, 114, 128, 0.2)'}`
        }}>
          <div className="flex items-center gap-2 mb-2">
            {state.isOnline ? (
              <CheckCircle2 className="w-5 h-5 text-[#00d4aa]" />
            ) : (
              <AlertCircle className="w-5 h-5 text-gray-400" />
            )}
            <span className={`font-medium ${state.isOnline ? 'text-[#00d4aa]' : 'text-gray-400'}`}>
              {state.isOnline ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
          <p className="text-sm text-gray-300">
            {state.isOnline 
              ? 'Vous pouvez synchroniser vos données avec le serveur'
              : 'Vos modifications seront sauvées localement'
            }
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="text-2xl font-bold text-white mb-1">{state.pendingCount.exercises}</div>
            <div className="text-xs text-gray-400">Exercices en attente</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="text-2xl font-bold text-white mb-1">{state.pendingCount.sessions}</div>
            <div className="text-xs text-gray-400">Sessions en attente</div>
          </div>
        </div>

        {/* Dernière sync */}
        <div className="mb-6 text-center">
          <div className="text-sm text-gray-400 mb-1">Dernière synchronisation</div>
          <div className="text-white font-medium">{formatLastSync(state.lastSyncTime)}</div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Synchroniser tout */}
          <Button
            onClick={handleSyncAll}
            disabled={!state.isOnline || isProcessing || state.isSyncing || totalPending === 0}
            className="w-full bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:opacity-90"
          >
            {state.isSyncing || (isProcessing && message?.text.includes('Synchronisation')) ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Synchronisation...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Synchroniser tout ({totalPending})
              </>
            )}
          </Button>

          {/* Télécharger tout */}
          <Button
            onClick={handleDownloadAll}
            disabled={!state.isOnline || isProcessing || state.isSyncing}
            variant="outline"
            className="w-full border-white/20 hover:bg-white/5"
          >
            {isProcessing && message?.text.includes('téléchargées') ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Téléchargement...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Télécharger tout
              </>
            )}
          </Button>

          {/* Effacer données locales */}
          <Button
            onClick={handleClearAll}
            disabled={isProcessing}
            variant="outline"
            className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Effacer données locales
          </Button>
        </div>

        {/* Message de status */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-300">
            💡 Vos données sont automatiquement sauvées localement. 
            Synchronisez régulièrement pour partager avec votre équipe.
          </p>
        </div>
      </div>
    </div>
  );
}