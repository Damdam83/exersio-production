import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

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

@ApiTags('app')
@Controller('app')
export class AppVersionController {
  
  @Get('version')
  @ApiOperation({ summary: 'Get current app version information' })
  @ApiResponse({ 
    status: 200, 
    description: 'App version information',
    schema: {
      type: 'object',
      properties: {
        currentVersion: { type: 'string', example: '1.0.0' },
        minimumVersion: { type: 'string', example: '1.0.0' },
        latestVersion: { type: 'string', example: '1.1.0' },
        updateRequired: { type: 'boolean', example: false },
        updateOptional: { type: 'boolean', example: true },
        releaseNotes: { type: 'string', example: 'Nouvelles fonctionnalités et corrections' },
        downloadUrl: {
          type: 'object',
          properties: {
            android: { type: 'string', example: 'https://play.google.com/store/apps/details?id=com.exersio.app' },
            ios: { type: 'string', example: 'https://apps.apple.com/app/exersio/id123456789' }
          }
        },
        maintenanceMode: { type: 'boolean', example: false }
      }
    }
  })
  async getVersionInfo(): Promise<AppVersionInfo> {
    // Pour l'instant, valeurs hardcodées - à terme, ces valeurs pourraient venir d'une DB ou config
    const versionInfo: AppVersionInfo = {
      currentVersion: '1.0.0',
      minimumVersion: '1.0.0', // Version minimum requise pour fonctionner
      latestVersion: '1.1.0',  // Dernière version disponible
      updateRequired: false,   // Mise à jour obligatoire si la version utilisateur < minimumVersion
      updateOptional: true,    // Mise à jour optionnelle si une nouvelle version est disponible
      releaseNotes: 'Nouvelles fonctionnalités :\n• Mode hors connexion\n• Critères de réussite pour les exercices\n• Interface mobile optimisée\n• Corrections de bugs et améliorations',
      downloadUrl: {
        android: 'https://github.com/exersio/app/releases/latest/download/exersio-release.apk',
        ios: 'https://apps.apple.com/app/exersio/id123456789' // Placeholder
      },
      maintenanceMode: false
    };

    return versionInfo;
  }

  @Get('maintenance')
  @ApiOperation({ summary: 'Check if app is in maintenance mode' })
  @ApiResponse({ 
    status: 200, 
    description: 'Maintenance status',
    schema: {
      type: 'object',
      properties: {
        maintenanceMode: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Maintenance programmée le 01/09/2025 de 2h à 4h' },
        estimatedDuration: { type: 'string', example: '2 heures' }
      }
    }
  })
  async getMaintenanceStatus() {
    return {
      maintenanceMode: false,
      message: null,
      estimatedDuration: null
    };
  }
}