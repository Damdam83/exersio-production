import { Grid3X3, Move, Redo, RotateCcw, Trash2, Undo } from 'lucide-react';
import { displayModes, PlayerDisplayMode } from '../../constants/exerciseEditor';
import { SPORTS_CONFIG, SportType } from '../../constants/sportsConfig';

interface ToolbarProps {
  selectedTool: string;
  onToolChange: (tool: string) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  selectedElement: string | null;
  onDeleteElement: (elementId: string) => void;
  onClearField: () => void;
  displayMode?: PlayerDisplayMode;
  onDisplayModeChange?: (mode: PlayerDisplayMode) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  sport?: SportType;
}

export function Toolbar({
  selectedTool,
  onToolChange,
  showGrid,
  onToggleGrid,
  selectedElement,
  onDeleteElement,
  onClearField,
  displayMode = 'role',
  onDisplayModeChange,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  sport = 'volleyball'
}: ToolbarProps) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 770;

  // Obtenir les rôles et couleurs selon le sport sélectionné
  const sportConfig = SPORTS_CONFIG[sport];
  const roleColors = sportConfig.roleColors;
  const roleLabels = sportConfig.playerRoles;

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '16px',
      margin: isMobile ? '0' : '16px',
      padding: isMobile ? '8px' : '16px',
      marginBottom: '0'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#ffffff',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          🎨 Éditeur Visuel
        </h3>
        
        {/* Mode Switch in header */}
        {onDisplayModeChange && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
            {displayModes.map((mode) => (
              <button
                key={mode.value}
                onClick={() => onDisplayModeChange(mode.value)}
                style={{
                  padding: '4px 8px',
                  background: displayMode === mode.value
                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(16, 185, 129, 0.3))'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: displayMode === mode.value
                    ? '1px solid rgba(59, 130, 246, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  fontSize: '9px',
                  fontWeight: '600',
                  color: displayMode === mode.value ? '#3b82f6' : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
                title={mode.label}
              >
                <span style={{ fontSize: '8px' }}>{mode.icon}</span>
                {mode.value === 'role' ? 'ABC' : '123'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tool Sections - Single compact row */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        gap: '12px',
        width: '100%',
        flexWrap: 'wrap'
      }}>
        
        {/* Players Section */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: '1 1 auto',
          minWidth: '280px'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: '#94a3b8',
            whiteSpace: 'nowrap'
          }}>
            👥 Joueurs
          </div>
          
          <div style={{ display: 'flex', gap: '4px' }}>
            {Object.entries(roleColors).map(([role, color], index) => (
              <button
                key={role}
                onClick={() => onToolChange(displayMode === 'number' ? `player-${role}-${index + 1}` : `player-${role}`)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  border: (selectedTool === `player-${role}` || (displayMode === 'number' && selectedTool === `player-${role}-${index + 1}`))
                    ? '2px solid #00d4aa' 
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  background: (selectedTool === `player-${role}` || (displayMode === 'number' && selectedTool === `player-${role}-${index + 1}`))
                    ? 'rgba(0, 212, 170, 0.3)'
                    : 'rgba(255, 255, 255, 0.08)',
                  color: displayMode === 'number' ? '#ffffff' : color,
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={displayMode === 'number'
                  ? `Joueur ${index + 1}`
                  : `${role} - ${roleLabels[role]}`
                }
              >
                {displayMode === 'number' ? (index + 1).toString() : role}
              </button>
            ))}
          </div>
        </div>

        {/* Elements Section */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: '#94a3b8',
            whiteSpace: 'nowrap'
          }}>
            ⚡ Éléments
          </div>
          
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => onToolChange('ball')}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                border: selectedTool === 'ball' 
                  ? '2px solid #00d4aa' 
                  : '1px solid rgba(255, 255, 255, 0.2)',
                background: selectedTool === 'ball'
                  ? 'rgba(0, 212, 170, 0.3)'
                  : 'rgba(255, 255, 255, 0.08)',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Ballon"
            >
              🏐
            </button>
            <button
              onClick={() => onToolChange('arrow')}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                border: selectedTool === 'arrow' 
                  ? '2px solid #00d4aa' 
                  : '1px solid rgba(255, 255, 255, 0.2)',
                background: selectedTool === 'arrow'
                  ? 'rgba(0, 212, 170, 0.3)'
                  : 'rgba(255, 255, 255, 0.08)',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Flèche"
            >
              ➡️
            </button>
            <button
              onClick={() => onToolChange('zone')}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                border: selectedTool === 'zone' 
                  ? '2px solid #00d4aa' 
                  : '1px solid rgba(255, 255, 255, 0.2)',
                background: selectedTool === 'zone'
                  ? 'rgba(0, 212, 170, 0.3)'
                  : 'rgba(255, 255, 255, 0.08)',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Zone"
            >
              📦
            </button>
          </div>
        </div>
        
        {/* Tools Section */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: '#94a3b8',
            whiteSpace: 'nowrap'
          }}>
            🛠️ Outils
          </div>
          
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => onToolChange('select')}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                border: selectedTool === 'select' 
                  ? '2px solid #00d4aa' 
                  : '1px solid rgba(255, 255, 255, 0.2)',
                background: selectedTool === 'select'
                  ? 'rgba(0, 212, 170, 0.3)'
                  : 'rgba(255, 255, 255, 0.08)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Sélectionner"
            >
              <Move className="w-3 h-3" />
            </button>
            <button
              onClick={onToggleGrid}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                border: showGrid 
                  ? '2px solid #00d4aa' 
                  : '1px solid rgba(255, 255, 255, 0.2)',
                background: showGrid
                  ? 'rgba(0, 212, 170, 0.3)'
                  : 'rgba(255, 255, 255, 0.08)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Grille"
            >
              <Grid3X3 className="w-3 h-3" />
            </button>
            {onUndo && (
              <button
                onClick={onUndo}
                disabled={!canUndo}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: canUndo ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                  color: canUndo ? 'white' : 'rgba(255, 255, 255, 0.3)',
                  cursor: canUndo ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Annuler"
              >
                <Undo className="w-3 h-3" />
              </button>
            )}
            {onRedo && (
              <button
                onClick={onRedo}
                disabled={!canRedo}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: canRedo ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                  color: canRedo ? 'white' : 'rgba(255, 255, 255, 0.3)',
                  cursor: canRedo ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Refaire"
              >
                <Redo className="w-3 h-3" />
              </button>
            )}
            {selectedElement && (
              <button
                onClick={() => onDeleteElement(selectedElement)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Supprimer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={onClearField}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Effacer tout"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}