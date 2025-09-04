/**
 * Modal de mise à jour de l'application
 * Affiche les informations de mise à jour obligatoire ou optionnelle
 */

import React from 'react';
import { X, Download, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { VersionCheckResult } from '../services/versionService';

interface UpdateModalProps {
  isOpen: boolean;
  updateInfo: VersionCheckResult;
  onClose: () => void;
  onUpdate: () => void;
  onLater?: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  updateInfo,
  onClose,
  onUpdate,
  onLater
}) => {
  if (!isOpen) return null;

  const isRequired = updateInfo.updateType === 'required';
  const isOptional = updateInfo.updateType === 'optional';

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isRequired) {
      onClose();
    }
  };

  const handleLater = () => {
    if (!isRequired && onLater) {
      onLater();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-md w-full mx-4 relative">
        {/* Header */}
        <div className={`px-6 py-4 rounded-t-lg ${
          isRequired ? 'bg-red-50 border-b border-red-200' : 'bg-blue-50 border-b border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isRequired ? (
                <AlertTriangle className="h-6 w-6 text-red-600" />
              ) : (
                <Info className="h-6 w-6 text-blue-600" />
              )}
              <h2 className="text-lg font-semibold text-gray-900">
                {isRequired ? 'Mise à jour obligatoire' : 'Mise à jour disponible'}
              </h2>
            </div>
            {!isRequired && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Version Info */}
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Version actuelle :</span>
                <div className="text-gray-900">{updateInfo.currentAppVersion}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Nouvelle version :</span>
                <div className="text-gray-900">{updateInfo.versionInfo.latestVersion}</div>
              </div>
            </div>
          </div>

          {/* Update Message */}
          <div className={`p-3 rounded-md mb-4 ${
            isRequired 
              ? 'bg-red-50 border border-red-200' 
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <p className={`text-sm ${
              isRequired ? 'text-red-800' : 'text-blue-800'
            }`}>
              {isRequired 
                ? 'Cette mise à jour est obligatoire pour continuer à utiliser l\'application. Elle contient des correctifs de sécurité importants.'
                : 'Une nouvelle version de l\'application est disponible avec de nouvelles fonctionnalités et des améliorations.'
              }
            </p>
          </div>

          {/* Release Notes */}
          {updateInfo.versionInfo.releaseNotes && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 mb-2">Nouveautés :</h3>
              <div className="bg-gray-50 rounded-md p-3">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                  {updateInfo.versionInfo.releaseNotes}
                </pre>
              </div>
            </div>
          )}

          {/* Download Info */}
          <div className="text-xs text-gray-500 mb-4">
            <div className="flex items-center space-x-1">
              <Download className="h-3 w-3" />
              <span>Taille approximative : ~15 MB</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <div className="flex space-x-3">
            {/* Bouton principal - Mettre à jour */}
            <button
              onClick={onUpdate}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                isRequired
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <ExternalLink className="h-4 w-4" />
              <span>Mettre à jour maintenant</span>
            </button>

            {/* Bouton secondaire - Plus tard (uniquement pour optionnel) */}
            {isOptional && (
              <button
                onClick={handleLater}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Plus tard
              </button>
            )}
          </div>

          {/* Message pour mise à jour obligatoire */}
          {isRequired && (
            <p className="text-xs text-red-600 mt-2 text-center">
              Vous ne pouvez pas utiliser l'application sans cette mise à jour
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Modal de maintenance
interface MaintenanceModalProps {
  isOpen: boolean;
  message: string | null;
  estimatedDuration: string | null;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  isOpen,
  message,
  estimatedDuration
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 bg-orange-50 border-b border-orange-200 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Maintenance en cours
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="text-center">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-gray-700">
                L'application est actuellement en maintenance. 
                Veuillez réessayer plus tard.
              </p>
            </div>

            {message && (
              <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-4">
                <p className="text-sm text-orange-800">{message}</p>
              </div>
            )}

            {estimatedDuration && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Durée estimée :</span> {estimatedDuration}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg text-center">
          <p className="text-xs text-gray-500">
            Merci pour votre patience
          </p>
        </div>
      </div>
    </div>
  );
};