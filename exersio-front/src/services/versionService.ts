/**
 * Service de vérification de version de l'application
 */

import { api } from './api';

export interface AppVersionInfo {
  currentVersion: string;
  minimumVersion: string;
  latestVersion: string;
  updateRequired: boolean;
  updateOptional: boolean;
  releaseNotes?: string;
  downloadUrl?: {
    android?: string;
    ios?: string;
  };
  maintenanceMode?: boolean;
}

export interface MaintenanceInfo {
  maintenanceMode: boolean;
  message: string | null;
  estimatedDuration: string | null;
}

export interface VersionCheckResult {
  needsUpdate: boolean;
  updateType: 'none' | 'optional' | 'required';
  versionInfo: AppVersionInfo;
  currentAppVersion: string;
}

class VersionService {
  private currentAppVersion: string = '1.0.0'; // Version actuelle de l'app (à synchroniser avec config)

  /**
   * Définir la version actuelle de l'app
   */
  setCurrentVersion(version: string) {
    this.currentAppVersion = version;
  }

  /**
   * Récupérer les informations de version depuis le serveur
   */
  async getVersionInfo(): Promise<AppVersionInfo> {
    try {
      const response = await api.get<AppVersionInfo>('/app/version');
      return response;
    } catch (error) {
      console.error('Error fetching version info:', error);
      // Fallback en cas d'erreur réseau
      return {
        currentVersion: this.currentAppVersion,
        minimumVersion: this.currentAppVersion,
        latestVersion: this.currentAppVersion,
        updateRequired: false,
        updateOptional: false,
        maintenanceMode: false
      };
    }
  }

  /**
   * Vérifier le statut de maintenance
   */
  async getMaintenanceStatus(): Promise<MaintenanceInfo> {
    try {
      const response = await api.get<MaintenanceInfo>('/app/maintenance');
      return response;
    } catch (error) {
      console.error('Error fetching maintenance status:', error);
      return {
        maintenanceMode: false,
        message: null,
        estimatedDuration: null
      };
    }
  }

  /**
   * Vérifier si l'app nécessite une mise à jour
   */
  async checkForUpdates(): Promise<VersionCheckResult> {
    const versionInfo = await this.getVersionInfo();
    
    const currentVersion = this.parseVersion(this.currentAppVersion);
    const minimumVersion = this.parseVersion(versionInfo.minimumVersion);
    const latestVersion = this.parseVersion(versionInfo.latestVersion);

    // Vérifier si la mise à jour est obligatoire
    const updateRequired = this.compareVersions(currentVersion, minimumVersion) < 0;
    
    // Vérifier si une mise à jour optionnelle est disponible
    const updateOptional = this.compareVersions(currentVersion, latestVersion) < 0 && !updateRequired;

    let updateType: 'none' | 'optional' | 'required' = 'none';
    if (updateRequired) {
      updateType = 'required';
    } else if (updateOptional) {
      updateType = 'optional';
    }

    return {
      needsUpdate: updateRequired || updateOptional,
      updateType,
      versionInfo,
      currentAppVersion: this.currentAppVersion
    };
  }

  /**
   * Parser une version string en tableau de nombres [major, minor, patch]
   */
  private parseVersion(version: string): number[] {
    return version.split('.').map(v => parseInt(v, 10) || 0);
  }

  /**
   * Comparer deux versions
   * @returns -1 si version1 < version2, 0 si égales, 1 si version1 > version2
   */
  private compareVersions(version1: number[], version2: number[]): number {
    // Normaliser les tableaux à la même longueur
    const maxLength = Math.max(version1.length, version2.length);
    const v1 = [...version1, ...Array(maxLength - version1.length).fill(0)];
    const v2 = [...version2, ...Array(maxLength - version2.length).fill(0)];

    for (let i = 0; i < maxLength; i++) {
      if (v1[i] < v2[i]) return -1;
      if (v1[i] > v2[i]) return 1;
    }
    return 0;
  }

  /**
   * Obtenir l'URL de téléchargement appropriée selon la plateforme
   */
  getDownloadUrl(versionInfo: AppVersionInfo, platform: 'android' | 'ios' = 'android'): string | null {
    return versionInfo.downloadUrl?.[platform] || null;
  }

  /**
   * Vérification complète au démarrage de l'app
   */
  async performStartupCheck(): Promise<{
    updateCheck: VersionCheckResult;
    maintenance: MaintenanceInfo;
  }> {
    const [updateCheck, maintenance] = await Promise.all([
      this.checkForUpdates(),
      this.getMaintenanceStatus()
    ]);

    return { updateCheck, maintenance };
  }
}

// Instance singleton
export const versionService = new VersionService();