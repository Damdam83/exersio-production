import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Edit, Copy, Trash2 } from 'lucide-react';
import { Player, Arrow, Ball, Zone, roleColors } from '../../constants/exerciseEditor';

interface PropertiesPanelProps {
  players: Player[];
  arrows: Arrow[];
  balls: Ball[];
  zones: Zone[];
  selectedElement: string | null;
  onElementSelect: (elementId: string) => void;
  onDeleteElement: (elementId: string) => void;
  onUpdateElement?: (elementId: string, updates: Partial<Player | Arrow | Ball | Zone>) => void;
  onSave: () => void;
  onCancel: () => void;
  canSave: boolean;
  isModal?: boolean;
}

export function PropertiesPanel({
  players,
  arrows,
  balls,
  zones,
  selectedElement,
  onElementSelect,
  onDeleteElement,
  onUpdateElement,
  onSave,
  onCancel,
  canSave,
  isModal = false
}: PropertiesPanelProps) {
  return (
    <div className={isModal ? "" : "exersio-card backdrop-blur-xl border rounded-2xl p-6"}>
      {!isModal && (
        <div className="flex items-center gap-2 mb-6">
          <div className="w-5 h-5 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded flex items-center justify-content center text-xs">⚙️</div>
          <h3 className="text-lg font-bold">Propriétés</h3>
        </div>
      )}

      {/* Liste des éléments */}
      <div className="space-y-2 mb-6">
        <h4 className="text-xs exersio-text-muted font-medium uppercase tracking-wide">Éléments sur le terrain</h4>
        
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {/* Joueurs */}
          {players.map((player) => (
            <div
              key={player.id}
              onClick={() => onElementSelect(player.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: selectedElement === player.id 
                  ? 'rgba(59, 130, 246, 0.15)' 
                  : 'rgba(255, 255, 255, 0.05)',
                border: selectedElement === player.id 
                  ? '1px solid rgba(59, 130, 246, 0.3)' 
                  : '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onMouseOver={(e) => {
                if (selectedElement !== player.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseOut={(e) => {
                if (selectedElement !== player.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white relative"
                  style={{ backgroundColor: roleColors[player.role] }}
                >
                  {player.label}
                  {player.variant && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-black/80 text-white rounded-full text-[6px] flex items-center justify-center">
                      {player.variant}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{player.label}{player.variant || ''}</div>
                  <div className="text-xs exersio-text-muted capitalize">{player.role}</div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-gray-400 hover:text-white">
                  <Edit className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-gray-400 hover:text-white">
                  <Copy className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onDeleteElement(player.id)}
                  className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}

          {/* Ballons */}
          {balls.map((ball) => (
            <div
              key={ball.id}
              onClick={() => onElementSelect(ball.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: selectedElement === ball.id 
                  ? 'rgba(59, 130, 246, 0.15)' 
                  : 'rgba(255, 255, 255, 0.05)',
                border: selectedElement === ball.id 
                  ? '1px solid rgba(59, 130, 246, 0.3)' 
                  : '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onMouseOver={(e) => {
                if (selectedElement !== ball.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseOut={(e) => {
                if (selectedElement !== ball.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                <div>
                  <div className="text-sm font-medium text-white">Ballon</div>
                  <div className="text-xs exersio-text-muted">Position initiale</div>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => onDeleteElement(ball.id)}
                className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}

          {/* Flèches */}
          {arrows.map((arrow) => (
            <div
              key={arrow.id}
              onClick={() => onElementSelect(arrow.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: selectedElement === arrow.id 
                  ? 'rgba(59, 130, 246, 0.15)' 
                  : 'rgba(255, 255, 255, 0.05)',
                border: selectedElement === arrow.id 
                  ? '1px solid rgba(59, 130, 246, 0.3)' 
                  : '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onMouseOver={(e) => {
                if (selectedElement !== arrow.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseOut={(e) => {
                if (selectedElement !== arrow.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-0.5 bg-[#00d4aa] relative">
                  {arrow.step && (
                    <div className="absolute -top-2 -right-1 w-3 h-3 bg-black/80 text-white rounded-full text-[6px] flex items-center justify-center">
                      {arrow.step}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Mouvement {arrow.step || ''}</div>
                  <div className="text-xs exersio-text-muted capitalize">{arrow.type}</div>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => onDeleteElement(arrow.id)}
                className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}

          {/* Zones */}
          {zones.map((zone) => (
            <div
              key={zone.id}
              onClick={() => onElementSelect(zone.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: selectedElement === zone.id 
                  ? 'rgba(59, 130, 246, 0.15)' 
                  : 'rgba(255, 255, 255, 0.05)',
                border: selectedElement === zone.id 
                  ? '1px solid rgba(59, 130, 246, 0.3)' 
                  : '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onMouseOver={(e) => {
                if (selectedElement !== zone.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseOut={(e) => {
                if (selectedElement !== zone.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-3 border-2 border-dashed rounded"
                  style={{ borderColor: zone.color, backgroundColor: `${zone.color}20` }}
                />
                <div>
                  <div className="text-sm font-medium text-white">{zone.label}</div>
                  <div className="text-xs exersio-text-muted">Zone d'annotation</div>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => onDeleteElement(zone.id)}
                className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration de l'élément sélectionné */}
      {selectedElement && (
        <div className="border-t border-white/10 pt-6">
          <h4 className="text-xs exersio-text-muted font-medium uppercase tracking-wide mb-4">
            Propriétés - {players.find(p => p.id === selectedElement)?.label || 'Élément'}
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Libellé</label>
              <Input
                value={players.find(p => p.id === selectedElement)?.label || ''}
                onChange={(e) => {
                  if (onUpdateElement && selectedElement) {
                    onUpdateElement(selectedElement, { label: e.target.value });
                  }
                }}
                placeholder="Nom de l'élément"
                className="bg-white/5 exersio-border text-white text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Couleur</label>
              <div className="flex gap-2">
                {Object.entries(roleColors).map(([role, color]) => (
                  <div
                    key={role}
                    className="w-6 h-6 rounded-full border-2 border-white cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {!isModal && (
        <div className="border-t border-white/10 pt-6 mt-6">
          <div className="flex gap-2">
            <Button 
              onClick={onCancel}
              variant="outline" 
              className="flex-1 exersio-border text-white hover:bg-white/20"
            >
              Annuler
            </Button>
            <Button 
              onClick={onSave}
              disabled={!canSave}
              className="flex-1 bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:from-[#00b894] hover:to-[#009775]"
            >
              Sauvegarder
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}