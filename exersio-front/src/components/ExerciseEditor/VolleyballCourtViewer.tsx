import React from 'react';
import { Player, Arrow, Ball, Zone, roleColors } from '../../constants/exerciseEditor';

interface VolleyballCourtViewerProps {
  players: Player[];
  arrows: Arrow[];
  balls: Ball[];
  zones: Zone[];
  showGrid?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function VolleyballCourtViewer({
  players,
  arrows,
  balls,
  zones,
  showGrid = true,
  className = '',
  style = {}
}: VolleyballCourtViewerProps) {
  // Dimensions standard du terrain (comme une image fixe)
  const STANDARD_WIDTH = 600;
  const STANDARD_HEIGHT = 360; // Ratio 5:3 pour volleyball
  const STANDARD_PADDING = 60; // Zone autour du terrain
  
  // Calculer la hauteur finale souhaitée
  const targetHeight = (style as any)?.height ? 
    parseInt(String((style as any).height).replace('px', '')) : 
    STANDARD_HEIGHT + (STANDARD_PADDING * 2);
    
  // Calculer le facteur d'échelle basé sur la hauteur cible
  const scale = targetHeight / (STANDARD_HEIGHT + (STANDARD_PADDING * 2));
  const scaledWidth = (STANDARD_WIDTH + (STANDARD_PADDING * 2)) * scale;
  const scaledHeight = targetHeight;
  
  return (
    <div className={`relative mx-auto ${className}`} style={{
      width: scaledWidth,
      height: scaledHeight,
      overflow: 'hidden', // Éviter les débordements
      ...style
    }}>
      {/* Conteneur avec dimensions fixes et échelle */}
      <div 
        className="relative bg-gray-800/20 border border-gray-500/30 rounded-xl select-none touch-none"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left', // Changer l'origine pour éviter les décalages
          width: STANDARD_WIDTH + (STANDARD_PADDING * 2),
          height: STANDARD_HEIGHT + (STANDARD_PADDING * 2),
        }}
      >
        {/* Le terrain de volleyball avec dimensions fixes */}
        <div 
          className="absolute bg-green-500/10 border-4 border-green-500/40 rounded-xl overflow-visible"
          id="actual-court-viewer"
          style={{
            width: STANDARD_WIDTH,
            height: STANDARD_HEIGHT,
            left: STANDARD_PADDING,
            top: STANDARD_PADDING
          }}
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
                <div className="border border-white/20 flex items-center justify-center text-sm text-white/80 font-bold bg-blue-500/5">
                  5
                </div>
                <div className="border border-white/20 flex items-center justify-center text-sm text-white/80 font-bold bg-blue-500/5">
                  4
                </div>
                {/* Ligne du milieu */}
                <div className="border border-white/20 flex items-center justify-center text-sm text-white/80 font-bold bg-blue-500/5">
                  6
                </div>
                <div className="border border-white/20 flex items-center justify-center text-sm text-white/80 font-bold bg-blue-500/5">
                  3
                </div>
                {/* Ligne du bas - avant (près du filet) */}
                <div className="border border-white/20 flex items-center justify-center text-sm text-white/80 font-bold bg-blue-500/5">
                  1
                </div>
                <div className="border border-white/20 flex items-center justify-center text-sm text-white/80 font-bold bg-blue-500/5">
                  2
                </div>
              </div>

              {/* Côté droit (zones 1-6) - 2 colonnes x 3 lignes */}
              <div className="absolute top-0 bottom-0 right-0 w-1/2 grid grid-cols-2 grid-rows-3 opacity-40">
                {/* Ligne du haut */}
                <div className="border border-white/20 flex items-center justify-center text-sm text-white/80 font-bold bg-emerald-500/5">
                  2
                </div>
                <div className="border border-white/20 flex items-center justify-center text-sm text-white/80 font-bold bg-emerald-500/5">
                  1
                </div>
                {/* Ligne du milieu */}
                <div className="border border-white/20 flex items-center justify-center text-sm text-white/80 font-bold bg-emerald-500/5">
                  3
                </div>
                <div className="border border-white/20 flex items-center justify-center text-sm text-white/80 font-bold bg-emerald-500/5">
                  6
                </div>
                {/* Ligne du bas */}
                <div className="border border-white/20 flex items-center justify-center text-sm text-white/80 font-bold bg-emerald-500/5">
                  4
                </div>
                <div className="border border-white/20 flex items-center justify-center text-sm text-white/80 font-bold bg-emerald-500/5">
                  5
                </div>
              </div>
            </>
          )}

          {/* Zones */}
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="absolute border-2 border-dashed rounded-lg transition-all select-none touch-none"
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
              className="absolute w-8 h-8 md:w-7 md:h-7 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-white transition-all select-none touch-none"
              style={{
                left: `${player.position.x}%`,
                top: `${player.position.y}%`,
                backgroundColor: roleColors[player.role],
                transform: 'translate(-50%, -50%)'
              }}
            >
              {(player.label && player.label !== 'undefined' && player.label !== 'null' && player.label.toString() !== 'undefined') ? player.label : 'P'}
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
                className="absolute transition-all"
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
              className="absolute w-5 h-5 md:w-4 md:h-4 rounded-full transition-all select-none touch-none"
              style={{
                left: `${ball.position.x}%`,
                top: `${ball.position.y}%`,
                background: 'radial-gradient(circle, #fbbf24, #f59e0b)',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}