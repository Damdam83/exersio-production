import React from 'react';
import { SportType, SPORTS_CONFIG } from '../../constants/sportsConfig';
import { PlayerDisplayMode } from '../../constants/exerciseEditor';

interface SportToolbarProps {
  sport: SportType;
  selectedTool: string;
  onToolChange: (tool: string) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  selectedElement: string | null;
  onDeleteElement: (elementId: string) => void;
  displayMode: PlayerDisplayMode;
  onDisplayModeChange: (mode: PlayerDisplayMode) => void;
  onClearField: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isMobile?: boolean;
}

export function SportToolbar({
  sport,
  selectedTool,
  onToolChange,
  showGrid,
  onToggleGrid,
  selectedElement,
  onDeleteElement,
  displayMode,
  onDisplayModeChange,
  onClearField,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isMobile = false
}: SportToolbarProps) {
  const sportConfig = SPORTS_CONFIG[sport];
  
  const toolButtons = [
    { id: 'select', label: 'Sélectionner', icon: '🎯' },
    { id: 'arrow', label: 'Flèche', icon: '➡️' },
    { 
      id: 'ball', 
      label: 'Ballon', 
      icon: sport === 'volleyball' ? '🏐' : 
            sport === 'football' ? '⚽' : 
            sport === 'basketball' ? '🏀' : 
            sport === 'tennis' ? '🎾' : '🤾'
    },
    { id: 'zone', label: 'Zone', icon: '📦' }
  ];

  const buttonStyle = (isSelected: boolean) => ({
    padding: isMobile ? '8px 12px' : '10px 16px',
    background: isSelected 
      ? 'linear-gradient(135deg, #00d4aa, #00b894)' 
      : 'rgba(255, 255, 255, 0.1)',
    border: `1px solid ${isSelected ? '#00d4aa' : 'rgba(255, 255, 255, 0.2)'}`,
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: isMobile ? '11px' : '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    minWidth: isMobile ? 'auto' : '120px',
    justifyContent: 'center'
  });

  const sectionStyle = {
    display: 'flex',
    gap: isMobile ? '6px' : '8px',
    flexWrap: 'wrap' as const,
    alignItems: 'center'
  };

  return (
    <div style={{
      padding: isMobile ? '12px 16px' : '16px 24px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '12px' : '16px',
      alignItems: isMobile ? 'stretch' : 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap'
    }}>
      {/* Section 1: Outils principaux */}
      <div style={sectionStyle}>
        {toolButtons.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            style={buttonStyle(selectedTool === tool.id)}
            onMouseOver={(e) => {
              if (selectedTool !== tool.id) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              }
            }}
            onMouseOut={(e) => {
              if (selectedTool !== tool.id) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }
            }}
          >
            <span>{tool.icon}</span>
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Section 2: Rôles de joueurs spécifiques au sport */}
      {selectedTool.startsWith('player') && (
        <div style={{
          ...sectionStyle,
          padding: isMobile ? '8px 12px' : '12px 16px',
          background: 'rgba(0, 212, 170, 0.1)',
          borderRadius: '10px',
          border: '1px solid rgba(0, 212, 170, 0.3)'
        }}>
          <span style={{ 
            fontSize: isMobile ? '11px' : '12px', 
            fontWeight: '600', 
            color: '#00d4aa',
            marginRight: '8px'
          }}>
            Rôles {sportConfig.name}:
          </span>
          {Object.entries(sportConfig.playerRoles).map(([role, label]) => (
            <button
              key={role}
              onClick={() => onToolChange(`player-${role}`)}
              style={{
                ...buttonStyle(selectedTool === `player-${role}`),
                minWidth: isMobile ? '36px' : '50px',
                padding: isMobile ? '6px 8px' : '8px 12px',
                background: selectedTool === `player-${role}` 
                  ? sportConfig.roleColors[role] 
                  : 'rgba(255, 255, 255, 0.1)',
                borderColor: selectedTool === `player-${role}` 
                  ? sportConfig.roleColors[role] 
                  : 'rgba(255, 255, 255, 0.2)'
              }}
              onMouseOver={(e) => {
                if (selectedTool !== `player-${role}`) {
                  e.currentTarget.style.background = `${sportConfig.roleColors[role]}40`;
                  e.currentTarget.style.borderColor = sportConfig.roleColors[role];
                }
              }}
              onMouseOut={(e) => {
                if (selectedTool !== `player-${role}`) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Section 3: Options d'affichage et actions */}
      <div style={sectionStyle}>
        {/* Toggle display mode */}
        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '2px' }}>
          <button
            onClick={() => onDisplayModeChange('role')}
            style={{
              ...buttonStyle(displayMode === 'role'),
              minWidth: isMobile ? '40px' : '60px',
              padding: isMobile ? '4px 8px' : '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: displayMode === 'role' ? '#00d4aa' : 'transparent'
            }}
          >
            Rôles
          </button>
          <button
            onClick={() => onDisplayModeChange('number')}
            style={{
              ...buttonStyle(displayMode === 'number'),
              minWidth: isMobile ? '40px' : '60px',
              padding: isMobile ? '4px 8px' : '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: displayMode === 'number' ? '#00d4aa' : 'transparent'
            }}
          >
            N°
          </button>
        </div>

        {/* Grid toggle */}
        <button
          onClick={onToggleGrid}
          style={{
            ...buttonStyle(showGrid),
            minWidth: isMobile ? 'auto' : '80px'
          }}
        >
          <span>🔲</span>
          {!isMobile && <span>Grille</span>}
        </button>

        {/* Undo/Redo */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={onUndo}
            disabled={!canUndo}
            style={{
              ...buttonStyle(false),
              minWidth: isMobile ? '32px' : '50px',
              padding: isMobile ? '6px' : '8px 12px',
              opacity: canUndo ? 1 : 0.5,
              cursor: canUndo ? 'pointer' : 'not-allowed'
            }}
          >
            ↶
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            style={{
              ...buttonStyle(false),
              minWidth: isMobile ? '32px' : '50px',
              padding: isMobile ? '6px' : '8px 12px',
              opacity: canRedo ? 1 : 0.5,
              cursor: canRedo ? 'pointer' : 'not-allowed'
            }}
          >
            ↷
          </button>
        </div>

        {/* Delete selected */}
        {selectedElement && (
          <button
            onClick={() => onDeleteElement(selectedElement)}
            style={{
              ...buttonStyle(false),
              background: 'rgba(239, 68, 68, 0.2)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              minWidth: isMobile ? 'auto' : '100px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
            }}
          >
            <span>🗑️</span>
            {!isMobile && <span>Supprimer</span>}
          </button>
        )}

        {/* Clear field */}
        <button
          onClick={onClearField}
          style={{
            ...buttonStyle(false),
            background: 'rgba(245, 158, 11, 0.2)',
            borderColor: 'rgba(245, 158, 11, 0.3)',
            color: '#f59e0b',
            minWidth: isMobile ? 'auto' : '100px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(245, 158, 11, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)';
          }}
        >
          <span>🧹</span>
          {!isMobile && <span>Effacer</span>}
        </button>
      </div>
    </div>
  );
}