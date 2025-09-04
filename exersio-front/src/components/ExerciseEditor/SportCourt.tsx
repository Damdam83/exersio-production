import React from 'react';
import { Player, Arrow, Ball, Zone } from '../../constants/exerciseEditor';
import { SportType, SPORTS_CONFIG } from '../../constants/sportsConfig';

interface SportCourtProps {
  sport: SportType;
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
  displayMode?: 'role' | 'number';
  style?: React.CSSProperties;
}

export function SportCourt({
  sport,
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
  onElementSelect,
  displayMode = 'role',
  style = {}
}: SportCourtProps) {
  const sportConfig = SPORTS_CONFIG[sport];

  const renderSportSpecificElements = () => {
    const elements = [];

    // Filet (volleyball, tennis)
    if (sportConfig.specificElements?.net) {
      elements.push(
        <div
          key="net"
          style={{
            position: 'absolute',
            top: '48%',
            left: '0',
            right: '0',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '2px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}
        />
      );
    }

    // Buts (football, handball)
    if (sportConfig.specificElements?.goals) {
      elements.push(
        <div key="goal-left" style={{
          position: 'absolute',
          left: '0px',
          top: '35%',
          bottom: '35%',
          width: '12px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '0 4px 4px 0',
          boxShadow: '2px 0 6px rgba(0, 0, 0, 0.3)'
        }} />,
        <div key="goal-right" style={{
          position: 'absolute',
          right: '0px',
          top: '35%',
          bottom: '35%',
          width: '12px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '4px 0 0 4px',
          boxShadow: '-2px 0 6px rgba(0, 0, 0, 0.3)'
        }} />
      );
    }

    // Paniers (basketball)
    if (sportConfig.specificElements?.baskets) {
      elements.push(
        <div key="basket-left" style={{
          position: 'absolute',
          left: '12px',
          top: '20px',
          width: '24px',
          height: '24px',
          border: '3px solid rgba(255, 255, 255, 0.9)',
          borderRadius: '50%',
          background: 'rgba(255, 165, 0, 0.3)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
        }} />,
        <div key="basket-right" style={{
          position: 'absolute',
          right: '12px',
          bottom: '20px',
          width: '24px',
          height: '24px',
          border: '3px solid rgba(255, 255, 255, 0.9)',
          borderRadius: '50%',
          background: 'rgba(255, 165, 0, 0.3)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
        }} />
      );
    }

    return elements;
  };

  const renderGrid = () => {
    if (!showGrid) return null;

    const gridLines = [];
    const { width, height } = sportConfig.fieldDimensions;
    
    // Lignes verticales
    for (let i = 0; i <= width; i += 10) {
      gridLines.push(
        <line
          key={`v-${i}`}
          x1={`${i}%`}
          y1="0%"
          x2={`${i}%`}
          y2="100%"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
      );
    }
    
    // Lignes horizontales
    for (let i = 0; i <= height; i += 10) {
      gridLines.push(
        <line
          key={`h-${i}`}
          x1="0%"
          y1={`${(i / height) * 100}%`}
          x2="100%"
          y2={`${(i / height) * 100}%`}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
      );
    }

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none'
        }}
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {gridLines}
      </svg>
    );
  };

  const renderPreviewArrow = () => {
    if (!isCreating || selectedTool !== 'arrow' || !creationStart || !currentMousePos) return null;

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none'
        }}
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <defs>
          <marker
            id="preview-arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="rgba(59, 130, 246, 0.8)"
            />
          </marker>
        </defs>
        <line
          x1={`${creationStart.x}%`}
          y1={`${creationStart.y}%`}
          x2={`${currentMousePos.x}%`}
          y2={`${currentMousePos.y}%`}
          stroke="rgba(59, 130, 246, 0.8)"
          strokeWidth="2"
          strokeDasharray="5,5"
          markerEnd="url(#preview-arrowhead)"
        />
      </svg>
    );
  };

  const renderPreviewZone = () => {
    if (!isCreating || selectedTool !== 'zone' || !creationStart || !currentMousePos) return null;

    const left = Math.min(currentMousePos.x, creationStart.x);
    const top = Math.min(currentMousePos.y, creationStart.y);
    const width = Math.abs(currentMousePos.x - creationStart.x);
    const height = Math.abs(currentMousePos.y - creationStart.y);

    return (
      <div
        style={{
          position: 'absolute',
          left: `${left}%`,
          top: `${top}%`,
          width: `${width}%`,
          height: `${height}%`,
          background: 'rgba(59, 130, 246, 0.2)',
          border: '2px dashed rgba(59, 130, 246, 0.6)',
          borderRadius: '4px',
          pointerEvents: 'none'
        }}
      />
    );
  };

  return (
    <div style={{ padding: '16px 32px 32px 32px' }}>
      {/* Zone d'information fixe */}
      <div style={{ minHeight: '60px', marginBottom: '16px' }}>
        {isCreating && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#60a5fa',
              fontWeight: '500'
            }}>
              {selectedTool === 'arrow' ? "🎯 Glissez pour créer la flèche" : "📦 Glissez pour créer la zone"}
            </div>
          </div>
        )}
      </div>

      {/* Header du terrain avec nom du sport */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>{sportConfig.emoji}</span>
          <span style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>
            Terrain de {sportConfig.name}
          </span>
        </div>
        <div style={{
          fontSize: '12px',
          color: '#94a3b8',
          display: 'flex',
          gap: '12px'
        }}>
          <span>👥 {players.length}</span>
          <span>🎯 {arrows.length}</span>
          <span>{sport === 'volleyball' ? '🏐' : sport === 'football' ? '⚽' : sport === 'basketball' ? '🏀' : sport === 'tennis' ? '🎾' : '🤾'} {balls.length}</span>
          <span>📦 {zones.length}</span>
        </div>
      </div>

      {/* Terrain de sport */}
      <div
        ref={courtRef}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: sportConfig.fieldDimensions.aspectRatio,
          background: sportConfig.fieldColor,
          borderRadius: '8px',
          border: '3px solid #ffffff',
          cursor: selectedTool === 'select' ? 'default' : 'crosshair',
          overflow: 'hidden',
          userSelect: 'none',
          touchAction: 'none',
          ...style
        }}
        onMouseDown={onCourtPointerDown}
        onTouchStart={onCourtPointerDown}
        onMouseMove={onCourtPointerMove}
        onTouchMove={onCourtPointerMove}
        onMouseUp={onCourtPointerUp}
        onTouchEnd={onCourtPointerUp}
      >
        {/* Pattern de terrain spécifique */}
        {sportConfig.fieldPattern === 'grass' && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 20px,
              rgba(255, 255, 255, 0.05) 20px,
              rgba(255, 255, 255, 0.05) 22px
            )`
          }} />
        )}

        {/* Grille */}
        {renderGrid()}

        {/* Lignes du terrain SVG */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none'
          }}
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          {/* Lignes volleyball */}
          {sport === 'volleyball' && (
            <>
              {/* Ligne centrale */}
              <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="0.3" />
              {/* Lignes de fond */}
              <line x1="0%" y1="5%" x2="100%" y2="5%" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.2" />
              <line x1="0%" y1="95%" x2="100%" y2="95%" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.2" />
              {/* Lignes latérales */}
              <line x1="5%" y1="0%" x2="5%" y2="100%" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.2" />
              <line x1="95%" y1="0%" x2="95%" y2="100%" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.2" />
              {/* Ligne d'attaque */}
              <line x1="5%" y1="25%" x2="95%" y2="25%" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.15" strokeDasharray="2,2" />
              <line x1="5%" y1="75%" x2="95%" y2="75%" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.15" strokeDasharray="2,2" />
            </>
          )}
          
          {/* Lignes basketball */}
          {sport === 'basketball' && (
            <>
              {/* Ligne centrale */}
              <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="0.3" />
              {/* Contour du terrain */}
              <rect x="5%" y="5%" width="90%" height="90%" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.2" />
              {/* Cercle central */}
              <circle cx="50%" cy="50%" r="8%" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.2" />
              {/* Zones restrictives */}
              <rect x="5%" y="30%" width="15%" height="40%" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.15" />
              <rect x="80%" y="30%" width="15%" height="40%" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.15" />
            </>
          )}
          
          {/* Lignes football */}
          {sport === 'football' && (
            <>
              {/* Ligne centrale */}
              <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="0.3" />
              {/* Contour du terrain */}
              <rect x="2%" y="5%" width="96%" height="90%" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.2" />
              {/* Cercle central */}
              <circle cx="50%" cy="50%" r="8%" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.2" />
              {/* Surfaces de réparation */}
              <rect x="2%" y="25%" width="18%" height="50%" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.15" />
              <rect x="80%" y="25%" width="18%" height="50%" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.15" />
            </>
          )}
        </svg>

        {/* Éléments spécifiques du sport */}
        {renderSportSpecificElements()}

        {/* Zones */}
        {zones.map((zone) => (
          <div
            key={zone.id}
            style={{
              position: 'absolute',
              left: `${zone.position.x}%`,
              top: `${zone.position.y}%`,
              width: `${zone.width}%`,
              height: `${zone.height}%`,
              background: `${zone.color}40`,
              border: `2px ${selectedElement === zone.id ? 'solid' : 'dashed'} ${zone.color}`,
              borderRadius: '4px',
              cursor: selectedTool === 'select' ? 'pointer' : 'crosshair',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600',
              color: zone.color,
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
              boxShadow: selectedElement === zone.id ? `0 0 0 2px ${zone.color}60` : 'none'
            }}
            onMouseDown={(e) => onElementPointerDown(e, zone.id, 'zone')}
            onTouchStart={(e) => onElementPointerDown(e, zone.id, 'zone')}
            onClick={(e) => {
              e.stopPropagation();
              onElementSelect(zone.id);
            }}
          >
            {zone.label}
          </div>
        ))}

        {/* Joueurs */}
        {players.map((player) => {
          const roleColor = sportConfig.roleColors[player.role] || '#6b7280';
          const roleLabel = sportConfig.playerRoles[player.role] || player.role.charAt(0).toUpperCase();
          
          return (
            <div
              key={player.id}
              style={{
                position: 'absolute',
                left: `${player.position.x}%`,
                top: `${player.position.y}%`,
                width: '32px',
                height: '32px',
                background: roleColor,
                border: `3px solid ${selectedElement === player.id ? '#ffffff' : 'rgba(255, 255, 255, 0.3)'}`,
                borderRadius: '50%',
                cursor: selectedTool === 'select' ? 'pointer' : 'crosshair',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700',
                color: '#ffffff',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.7)',
                transform: 'translate(-50%, -50%)',
                transition: selectedTool === 'select' ? 'all 0.2s ease' : 'none',
                boxShadow: selectedElement === player.id 
                  ? `0 0 0 3px ${roleColor}60, 0 4px 12px rgba(0, 0, 0, 0.3)` 
                  : '0 2px 8px rgba(0, 0, 0, 0.3)',
                zIndex: selectedElement === player.id ? 100 : 10
              }}
              onMouseDown={(e) => onElementPointerDown(e, player.id, 'player')}
              onTouchStart={(e) => onElementPointerDown(e, player.id, 'player')}
              onClick={(e) => {
                e.stopPropagation();
                onElementSelect(player.id);
              }}
            >
              {displayMode === 'number' && player.playerNumber 
                ? player.playerNumber 
                : roleLabel}
            </div>
          );
        })}

        {/* Ballons */}
        {balls.map((ball) => (
          <div
            key={ball.id}
            style={{
              position: 'absolute',
              left: `${ball.position.x}%`,
              top: `${ball.position.y}%`,
              width: '20px',
              height: '20px',
              background: sport === 'volleyball' ? '#ff6b35' : 
                          sport === 'football' ? '#000000' :
                          sport === 'basketball' ? '#ff8c00' :
                          sport === 'tennis' ? '#90ee90' :
                          '#4169e1', // handball
              border: `2px solid ${selectedElement === ball.id ? '#ffffff' : 'rgba(255, 255, 255, 0.3)'}`,
              borderRadius: '50%',
              cursor: selectedTool === 'select' ? 'pointer' : 'crosshair',
              transform: 'translate(-50%, -50%)',
              transition: selectedTool === 'select' ? 'all 0.2s ease' : 'none',
              boxShadow: selectedElement === ball.id 
                ? '0 0 0 2px #ffffff60, 0 4px 12px rgba(0, 0, 0, 0.3)' 
                : '0 2px 8px rgba(0, 0, 0, 0.3)',
              zIndex: selectedElement === ball.id ? 100 : 20
            }}
            onMouseDown={(e) => onElementPointerDown(e, ball.id, 'ball')}
            onTouchStart={(e) => onElementPointerDown(e, ball.id, 'ball')}
            onClick={(e) => {
              e.stopPropagation();
              onElementSelect(ball.id);
            }}
          />
        ))}

        {/* Flèches */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none'
          }}
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="rgba(255, 255, 255, 0.9)"
              />
            </marker>
          </defs>
          {arrows.map((arrow) => (
            <line
              key={arrow.id}
              x1={`${arrow.startPosition.x}%`}
              y1={`${arrow.startPosition.y}%`}
              x2={`${arrow.endPosition.x}%`}
              y2={`${arrow.endPosition.y}%`}
              stroke={selectedElement === arrow.id ? '#00d4aa' : 'rgba(255, 255, 255, 0.9)'}
              strokeWidth={selectedElement === arrow.id ? "3" : "2"}
              markerEnd="url(#arrowhead)"
              style={{
                filter: selectedElement === arrow.id ? 'drop-shadow(0 0 6px #00d4aa60)' : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                cursor: selectedTool === 'select' ? 'pointer' : 'crosshair'
              }}
              onClick={(e) => {
                e.stopPropagation();
                onElementSelect(arrow.id);
              }}
            />
          ))}
        </svg>

        {/* Aperçu de création */}
        {renderPreviewArrow()}
        {renderPreviewZone()}
      </div>
    </div>
  );
}