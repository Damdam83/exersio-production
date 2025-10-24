/**
 * Hook pour gérer la vérification de version au démarrage de l'app
 */

import { useEffect, useState, useCallback } from 'react';
import { versionService, VersionCheckResult, MaintenanceInfo } from '../services/versionService';
import { useIsMobile } from './useIsMobile';

interface VersionCheckState {
  isChecking: boolean;
  showUpdateModal: boolean;
  showMaintenanceModal: boolean;
  updateInfo: VersionCheckResult | null;
  maintenanceInfo: MaintenanceInfo | null;
  hasChecked: boolean;
}

export function useVersionCheck() {
  const [state, setState] = useState<VersionCheckState>({
    isChecking: false,
    showUpdateModal: false,
    showMaintenanceModal: false,
    updateInfo: null,
    maintenanceInfo: null,
    hasChecked: false
  });
  
  const isMobile = useIsMobile();

  // Effectuer la vérification de version
  const checkVersion = useCallback(async () => {
    setState(prev => ({ ...prev, isChecking: true }));
    
    try {
      // Définir la version actuelle (à synchroniser avec la config Capacitor)
      versionService.setCurrentVersion('1.0.0');
      
      // Vérification complète
      const { updateCheck, maintenance } = await versionService.performStartupCheck();
      
      setState(prev => ({
        ...prev,
        updateInfo: updateCheck,
        maintenanceInfo: maintenance,
        hasChecked: true,
        isChecking: false,
        showMaintenanceModal: maintenance.maintenanceMode,
        showUpdateModal: updateCheck.needsUpdate && !maintenance.maintenanceMode
      }));
      
    } catch (error) {
      console.error('Error checking version:', error);
      setState(prev => ({
        ...prev,
        isChecking: false,
        hasChecked: true
      }));
    }
  }, []);

  // Vérifier au montage du composant (seulement sur mobile ou en dev)
  useEffect(() => {
    if (isMobile || import.meta.env.DEV) {
      checkVersion();
    } else {
      // Sur desktop en production, marquer comme vérifié sans faire d'appel
      setState(prev => ({ ...prev, hasChecked: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Ne dépend que du montage initial

  // Actions pour les modals
  const handleUpdateNow = useCallback(() => {
    if (state.updateInfo?.versionInfo.downloadUrl?.android) {
      // Ouvrir l'URL de téléchargement
      const downloadUrl = versionService.getDownloadUrl(state.updateInfo.versionInfo, 'android');
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      }
    }
    
    // Pour les mises à jour obligatoires, ne pas fermer la modal
    if (state.updateInfo?.updateType !== 'required') {
      setState(prev => ({ ...prev, showUpdateModal: false }));
    }
  }, [state.updateInfo]);

  const handleUpdateLater = useCallback(() => {
    if (state.updateInfo?.updateType === 'optional') {
      setState(prev => ({ ...prev, showUpdateModal: false }));
      
      // Programmer un rappel dans 24h (stockage local)
      const nextReminder = Date.now() + (24 * 60 * 60 * 1000);
      localStorage.setItem('version_reminder_time', nextReminder.toString());
    }
  }, [state.updateInfo]);

  const closeUpdateModal = useCallback(() => {
    if (state.updateInfo?.updateType !== 'required') {
      setState(prev => ({ ...prev, showUpdateModal: false }));
    }
  }, [state.updateInfo]);

  // Vérifier si on doit rappeler une mise à jour optionnelle
  const checkUpdateReminder = useCallback(() => {
    const reminderTime = localStorage.getItem('version_reminder_time');
    if (reminderTime && Date.now() > parseInt(reminderTime)) {
      localStorage.removeItem('version_reminder_time');
      checkVersion(); // Re-vérifier
    }
  }, [checkVersion]);

  // Vérifier les rappels au montage
  useEffect(() => {
    checkUpdateReminder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Ne dépend que du montage initial

  return {
    ...state,
    checkVersion,
    handleUpdateNow,
    handleUpdateLater,
    closeUpdateModal
  };
}