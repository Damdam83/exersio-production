/**
 * Composant d'indicateur de synchronisation pour les éléments
 */

import React from 'react';
import { Cloud, CloudOff, RefreshCw, AlertTriangle, CheckCircle, Upload } from 'lucide-react';
import { Button } from './ui/button';

export type SyncStatus = 'synced' | 'pending' | 'conflict' | 'local-only' | 'syncing';

interface SyncIndicatorProps {
  status: SyncStatus;
  onSync?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const statusConfig = {
  synced: {
    icon: CheckCircle,
    color: '#00d4aa',
    bgColor: 'rgba(0, 212, 170, 0.1)',
    borderColor: 'rgba(0, 212, 170, 0.2)',
    label: 'Synchronisé',
    description: 'Les données sont à jour sur le serveur'
  },
  pending: {
    icon: Upload,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
    label: 'En attente',
    description: 'En attente de synchronisation avec le serveur'
  },
  'local-only': {
    icon: CloudOff,
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
    borderColor: 'rgba(107, 114, 128, 0.2)',
    label: 'Local uniquement',
    description: 'Sauvé localement, sera synchronisé quand vous serez en ligne'
  },
  conflict: {
    icon: AlertTriangle,
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    label: 'Conflit',
    description: 'Conflit de synchronisation - action manuelle requise'
  },
  syncing: {
    icon: RefreshCw,
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    label: 'Synchronisation...',
    description: 'Synchronisation en cours avec le serveur'
  }
};

const sizeConfig = {
  sm: {
    containerSize: '24px',
    iconSize: '12px',
    fontSize: '10px',
    padding: '4px 6px'
  },
  md: {
    containerSize: '28px',
    iconSize: '14px',
    fontSize: '11px',
    padding: '6px 8px'
  },
  lg: {
    containerSize: '32px',
    iconSize: '16px',
    fontSize: '12px',
    padding: '8px 12px'
  }
};

export function SyncIndicator({ 
  status, 
  onSync, 
  size = 'md', 
  showLabel = false,
  className = '' 
}: SyncIndicatorProps) {
  const config = statusConfig[status];
  const sizeConf = sizeConfig[size];
  const IconComponent = config.icon;

  const handleClick = () => {
    if (onSync && (status === 'pending' || status === 'local-only' || status === 'conflict')) {
      onSync();
    }
  };

  const isClickable = onSync && (status === 'pending' || status === 'local-only' || status === 'conflict');

  if (!showLabel) {
    // Version icône seule
    return (
      <div
        className={`inline-flex items-center justify-center ${isClickable ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
        style={{
          width: sizeConf.containerSize,
          height: sizeConf.containerSize,
          backgroundColor: config.bgColor,
          border: `1px solid ${config.borderColor}`,
          borderRadius: '6px'
        }}
        onClick={handleClick}
        title={config.description}
      >
        <IconComponent 
          style={{ 
            width: sizeConf.iconSize, 
            height: sizeConf.iconSize,
            color: config.color,
            animation: status === 'syncing' ? 'spin 1s linear infinite' : undefined
          }}
        />
      </div>
    );
  }

  // Version avec label
  return (
    <div
      className={`inline-flex items-center gap-2 ${isClickable ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
      style={{
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        borderRadius: '8px',
        padding: sizeConf.padding
      }}
      onClick={handleClick}
      title={config.description}
    >
      <IconComponent 
        style={{ 
          width: sizeConf.iconSize, 
          height: sizeConf.iconSize,
          color: config.color,
          animation: status === 'syncing' ? 'spin 1s linear infinite' : undefined
        }}
      />
      <span style={{ 
        color: config.color, 
        fontSize: sizeConf.fontSize,
        fontWeight: '500',
        whiteSpace: 'nowrap'
      }}>
        {config.label}
      </span>
    </div>
  );
}

// Composant pour les boutons de synchronisation rapide
interface QuickSyncButtonProps {
  status: SyncStatus;
  onSync: () => void;
  disabled?: boolean;
}

export function QuickSyncButton({ status, onSync, disabled }: QuickSyncButtonProps) {
  if (status === 'synced') {
    return null; // Rien à synchroniser
  }

  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={onSync}
      disabled={disabled || status === 'syncing'}
      className="h-7 w-7 p-0 hover:bg-white/10"
      title={status === 'syncing' ? 'Synchronisation en cours...' : 'Synchroniser maintenant'}
    >
      <IconComponent 
        className={`w-4 h-4 ${status === 'syncing' ? 'animate-spin' : ''}`}
        style={{ color: config.color }}
      />
    </Button>
  );
}