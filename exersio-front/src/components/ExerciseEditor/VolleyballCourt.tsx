import React from 'react';
import { Player, Arrow, Ball, Zone, roleColors } from '../../constants/exerciseEditor';

interface VolleyballCourtProps {
  courtRef: React.RefObject<HTMLDivElement>;
  selectedTool: string;
  showGrid: boolean;
  players: Player[];
  arrows: Arrow[];
  balls: Ball[];
  zones: Zone[];
  selectedElement: string | null;
  isCreating: boolean;
  creationStart: { x: number; y: number } | null;
  currentMousePos: { x: number; y: number } | null;
  onCourtPointerDown: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
  onCourtPointerMove: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
  onCourtPointerUp: () => void;
  onElementPointerDown: (e: React.MouseEvent | React.TouchEvent, elementId: string, elementType: 'player' | 'ball' | 'zone') => void;
  onElementSelect: (elementId: string) => void;
}

export function VolleyballCourt({
  courtRef,
  selectedTool,
  showGrid,
  players,
  arrows,
  balls,
  zones,
  selectedElement,
  isCreating,
  creationStart,
  currentMousePos,
  onCourtPointerDown,
  onCourtPointerMove,
  onCourtPointerUp,
  onElementPointerDown,
  onElementSelect
}: VolleyballCourtProps) {
  return (
    <div className="p-4 md:p-8">
      {/* Zone d'information fixe - toujours présente pour éviter le décalage */}
      <div style={{ minHeight: '60px', marginBottom: '16px' }}>
        {/* Indicateur de mode */}
        {isCreating && (
          <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-center">
            <div className="text-sm text-blue-400 font-medium">
              {selectedTool === 'arrow' ? "🎯 Glissez pour créer la flèche" : "📦 Glissez pour créer la zone"}
            </div>
          </div>
        )}
        
        {/* Message d'aide tactile pour mobile */}
        {(selectedTool === 'arrow' || selectedTool === 'zone') && !isCreating && window.innerWidth <= 768 && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-center md:hidden">
            <div className="text-sm text-emerald-400 font-medium">
              📱 Appuyez et glissez sur le terrain pour {selectedTool === 'arrow' ? 'créer une flèche' : 'dessiner une zone'}
            </div>
          </div>
        )}
        
        {/* Message d'aide pour desktop */}
        {(selectedTool === 'arrow' || selectedTool === 'zone') && !isCreating && window.innerWidth > 768 && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-center hidden md:block">
            <div className="text-sm text-emerald-400 font-medium">
              🖱️ Cliquez et glissez sur le terrain pour {selectedTool === 'arrow' ? 'créer une flèche' : 'dessiner une zone'}
            </div>
          </div>
        )}
      </div>
      
      {/* Zone élargie autour du terrain - avec zone de placement */}
      <div 
        ref={courtRef}
        onMouseDown={onCourtPointerDown}
        onMouseMove={onCourtPointerMove}
        onMouseUp={onCourtPointerUp}
        onMouseLeave={onCourtPointerUp}
        onTouchStart={onCourtPointerDown}
        onTouchMove={onCourtPointerMove}
        onTouchEnd={onCourtPointerUp}
        className={`relative w-full max-w-[700px] h-[380px] md:h-[460px] mx-auto bg-gray-800/20 border border-gray-500/30 rounded-xl p-8 select-none touch-none ${
          selectedTool === 'select' ? 'cursor-default' : selectedTool === 'arrow' || selectedTool === 'zone' ? 'cursor-crosshair' : 'cursor-pointer'
        }`}
      >
        {/* Le terrain de volleyball */}
        <div 
          className="relative w-full h-full bg-green-500/10 border-4 border-green-500/40 rounded-xl overflow-visible"
          id="actual-court"
        >
        {/* Filet central */}
        <div className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-white/80 to-white/40 rounded"></div>
        
        {/* Lignes de tiers - côté gauche (1/3 depuis le centre vers la gauche) */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-white/60 rounded" style={{ left: '33.33%' }}></div>
        
        {/* Lignes de tiers - côté droit (1/3 depuis le centre vers la droite) */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-white/60 rounded" style={{ left: '66.67%' }}></div>

        {/* Grille des zones volley-ball */}
        {showGrid && (
          <>
            {/* Côté gauche (zones 1-6) - 2 colonnes x 3 lignes */}
            <div className="absolute top-0 bottom-0 left-0 w-1/2 grid grid-cols-2 grid-rows-3 opacity-40">
              {/* Ligne du haut - arrière */}
              <div className="border border-white/20 flex items-center justify-center text-sm text-white/80 font-bold bg-blue-500/5 hover:bg-blue-500/15 transition-colors">
                5
              </div>
              <div className="border border-white/20 flex items-center justify-center text-sm text-white/80 font-bold bg-blue-500/5 hover:bg-blue-500/15 transition-colors">
                4
              </div>
              {/* Ligne du milieu */}
              <div className="border border-white/20 flex items-center justify-center text-sm text-white/80 font-bold bg-blue-500/5 hover:bg-blue-500/15 transition-colors">
                6
              </div>
              <div className="border border-white/20 flex items-center justify-center text-sm text-white/80 font-bold bg-blue-500/5 hover:bg-blue-500/15 transition-colors">
                3
              </div>
              {/* Ligne du bas - avant (près du filet) */}
              <div className="border border-white/20 flex items-center justify-center text-sm text-white/80 font-bold bg-blue-500/5 hover:bg-blue-500/15 transition-colors">
                1
              </div>
              <div className="border border-white/20 flex items-center justify-center text-sm text-white/80 font-bold bg-blue-500/5 hover:bg-blue-500/15 transition-colors">
                2
              </div>
            </div>

            {/* Côté droit (zones 1-6) - 2 colonnes x 3 lignes */}
            <div className="absolute top-0 bottom-0 right-0 w-1/2 grid grid-cols-2 grid-rows-3 opacity-40">
              {/* Ligne du haut */}
              <div className="border border-white/20 flex items-center justify-center text-sm text-white/80 font-bold bg-emerald-500/5 hover:bg-emerald-500/15 transition-colors">
                2
              </div>
              <div className="border border-white/20 flex items-center justify-center text-sm text-white/80 font-bold bg-emerald-500/5 hover:bg-emerald-500/15 transition-colors">
                1
              </div>
              {/* Ligne du milieu */}
              <div className="border border-white/20 flex items-center justify-center text-sm text-white/80 font-bold bg-emerald-500/5 hover:bg-emerald-500/15 transition-colors">
                3
              </div>
              <div className="border border-white/20 flex items-center justify-center text-sm text-white/80 font-bold bg-emerald-500/5 hover:bg-emerald-500/15 transition-colors">
                6
              </div>
              {/* Ligne du bas */}
              <div className="border border-white/20 flex items-center justify-center text-sm text-white/80 font-bold bg-emerald-500/5 hover:bg-emerald-500/15 transition-colors">
                4
              </div>
              <div className="border border-white/20 flex items-center justify-center text-sm text-white/80 font-bold bg-emerald-500/5 hover:bg-emerald-500/15 transition-colors">
                5
              </div>
            </div>
          </>
        )}

        {/* Zones */}
        {zones.map((zone) => (
          <div
            key={zone.id}
            onMouseDown={(e) => onElementPointerDown(e, zone.id, 'zone')}
            onTouchStart={(e) => onElementPointerDown(e, zone.id, 'zone')}
            onClick={(e) => {
              e.stopPropagation();
              onElementSelect(zone.id);
            }}
            className={`absolute border-2 border-dashed rounded-lg transition-all select-none touch-none ${
              selectedTool === 'select' ? 'cursor-move' : 'cursor-crosshair'
            } ${
              selectedElement === zone.id ? 'ring-2 ring-[#00d4aa]' : ''
            }`}
            style={{
              left: `${zone.position.x}%`,
              top: `${zone.position.y}%`,
              width: `${zone.width}%`,
              height: `${zone.height}%`,
              borderColor: zone.color,
              backgroundColor: `${zone.color}20`,
              minHeight: '20px',
              minWidth: '20px'
            }}
          >
            <div 
              className="absolute top-1 left-1 text-xs font-bold px-1 py-0.5 rounded pointer-events-none"
              style={{ 
                backgroundColor: zone.color,
                color: 'white'
              }}
            >
              {zone.label}
            </div>
          </div>
        ))}

        {/* Joueurs */}
        {players.map((player) => (
          <div
            key={player.id}
            onMouseDown={(e) => onElementPointerDown(e, player.id, 'player')}
            onTouchStart={(e) => onElementPointerDown(e, player.id, 'player')}
            onClick={(e) => {
              e.stopPropagation();
              onElementSelect(player.id);
            }}
            className={`absolute w-8 h-8 md:w-7 md:h-7 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-white transition-all hover:scale-110 select-none touch-none ${
              selectedTool === 'select' ? 'cursor-move' : 'cursor-crosshair'
            } ${
              selectedElement === player.id ? 'ring-2 ring-[#00d4aa]' : ''
            }`}
            style={{
              left: `${player.position.x}%`,
              top: `${player.position.y}%`,
              backgroundColor: roleColors[player.role],
              transform: 'translate(-50%, -50%)'
            }}
          >
            {(player.label && player.label !== 'undefined' && player.label !== 'null' && player.label.toString() !== 'undefined') ? player.label : 'DEBUG'}
            {player.variant && (
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-black/80 text-white rounded-full text-[8px] flex items-center justify-center border-2 border-white pointer-events-none">
                {player.variant}
              </div>
            )}
          </div>
        ))}

        {/* Flèches */}
        {arrows.map((arrow) => {
          const deltaX = arrow.endPosition.x - arrow.startPosition.x;
          const deltaY = arrow.endPosition.y - arrow.startPosition.y;
          const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

          return (
            <div
              key={arrow.id}
              onClick={(e) => {
                e.stopPropagation();
                onElementSelect(arrow.id);
              }}
              className={`absolute cursor-move transition-all ${
                selectedElement === arrow.id ? 'opacity-80' : ''
              }`}
              style={{
                left: `${arrow.startPosition.x}%`,
                top: `${arrow.startPosition.y}%`,
                width: `${length}%`,
                height: '3px',
                background: 'linear-gradient(90deg, #00d4aa, rgba(0, 212, 170, 0.3))',
                transform: `translate(0, -50%) rotate(${angle}deg)`,
                transformOrigin: 'left center'
              }}
            >
              <div className="absolute right-[-6px] top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-[#00d4aa] border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent"></div>
              {arrow.step && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-black/80 text-white rounded-full text-[8px] flex items-center justify-center border-2 border-white">
                  {arrow.step}
                </div>
              )}
            </div>
          );
        })}

        {/* Ballons */}
        {balls.map((ball) => (
          <div
            key={ball.id}
            onMouseDown={(e) => onElementPointerDown(e, ball.id, 'ball')}
            onTouchStart={(e) => onElementPointerDown(e, ball.id, 'ball')}
            onClick={(e) => {
              e.stopPropagation();
              onElementSelect(ball.id);
            }}
            className={`absolute w-5 h-5 md:w-4 md:h-4 rounded-full transition-all hover:scale-110 select-none touch-none ${
              selectedTool === 'select' ? 'cursor-move' : 'cursor-crosshair'
            } ${
              selectedElement === ball.id ? 'ring-2 ring-[#00d4aa]' : ''
            }`}
            style={{
              left: `${ball.position.x}%`,
              top: `${ball.position.y}%`,
              background: 'radial-gradient(circle, #fbbf24, #f59e0b)',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
            }}
          />
        ))}

        {/* Aperçu en temps réel pendant la création */}
        {isCreating && creationStart && currentMousePos && (
          <div className="absolute inset-0 pointer-events-none">
            {selectedTool === 'arrow' && (
              <>
              {(() => {
                const deltaX = currentMousePos.x - creationStart.x;
                const deltaY = currentMousePos.y - creationStart.y;
                const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

                return (
                  <div
                    className="absolute transition-all opacity-70"
                    style={{
                      left: `${creationStart.x}%`,
                      top: `${creationStart.y}%`,
                      width: `${length}%`,
                      height: '3px',
                      background: 'linear-gradient(90deg, #00d4aa, rgba(0, 212, 170, 0.3))',
                      transform: `translate(0, -50%) rotate(${angle}deg)`,
                      transformOrigin: 'left center'
                    }}
                  >
                    <div className="absolute right-[-6px] top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-[#00d4aa] border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent"></div>
                  </div>
                );
              })()}
              </>
            )}
            
            {selectedTool === 'zone' && (
              <div
                className="absolute border-2 border-dashed border-[#00d4aa] bg-[#00d4aa]/10 rounded-lg transition-all"
                style={{
                  left: `${Math.min(creationStart.x, currentMousePos.x)}%`,
                  top: `${Math.min(creationStart.y, currentMousePos.y)}%`,
                  width: `${Math.abs(currentMousePos.x - creationStart.x)}%`,
                  height: `${Math.abs(currentMousePos.y - creationStart.y)}%`
                }}
              />
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}