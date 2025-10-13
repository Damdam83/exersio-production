import React from 'react';
import { Arrow, Ball, Player, Zone } from '../../constants/exerciseEditor';
import { SPORTS_CONFIG, SportType } from '../../constants/sportsConfig';
import { ARROW_TYPES, ArrowActionType, getArrowStyle, generateArrowMarkers } from '../../constants/arrowTypes';
import { CourtBackgroundImage } from './CourtBackgroundImage';

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
  onUpdateElement?: (elementId: string, updates: Partial<Arrow>) => void;
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
  onUpdateElement,
  displayMode = 'role',
  style = {}
}: SportCourtProps) {
  const [draggingControlPoint, setDraggingControlPoint] = React.useState<string | null>(null);
  const sportConfig = SPORTS_CONFIG[sport];
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 770;
  const isVerySmall = typeof window !== 'undefined' && window.innerWidth < 400;

  // Handler pour gérer le drag du point de contrôle
  const handleControlPointMove = React.useCallback((e: React.MouseEvent | React.Touch) => {
    if (!draggingControlPoint || !courtRef.current || !onUpdateElement) return;

    const rect = courtRef.current.getBoundingClientRect();
    const borderWidth = 3;
    const innerWidth = rect.width - (borderWidth * 2);
    const innerHeight = rect.height - (borderWidth * 2);
    const innerLeft = rect.left + borderWidth;
    const innerTop = rect.top + borderWidth;

    const x = ((e.clientX - innerLeft) / innerWidth) * 100;
    const y = ((e.clientY - innerTop) / innerHeight) * 100;

    // Mettre à jour le point de contrôle de la flèche
    onUpdateElement(draggingControlPoint, {
      controlX: Math.max(-30, Math.min(130, x)),
      controlY: Math.max(-30, Math.min(130, y))
    });
  }, [draggingControlPoint, courtRef, onUpdateElement]);

  // Listeners globaux pour le drag
  React.useEffect(() => {
    if (!draggingControlPoint) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleControlPointMove(e);
    };

    const handleMouseUp = () => {
      setDraggingControlPoint(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingControlPoint, handleControlPointMove]);

  // Calculate correct viewBox based on aspect ratio
  const aspectRatio = sportConfig.fieldDimensions.aspectRatio;
  const viewBoxWidth = 100 * aspectRatio;
  const viewBox = `0 0 ${viewBoxWidth} 100`;

  // Scaling adaptatif selon taille écran
  const playerSize = isVerySmall ? 16 : (isMobile ? 20 : 32);
  const ballSize = isVerySmall ? 10 : (isMobile ? 12 : 20);
  const fontSize = isVerySmall ? 8 : (isMobile ? 10 : 12);
  const borderWidth = isVerySmall ? 1 : (isMobile ? 2 : 3);

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
          top: '3px',
          left: '3px',
          right: '3px',
          bottom: '3px',
          pointerEvents: 'none'
        }}
        preserveAspectRatio="none"
        viewBox={viewBox}
      >
        {gridLines}
      </svg>
    );
  };

  const renderPreviewArrow = () => {
    if (!isCreating || !selectedTool.startsWith('arrow-') || !creationStart || !currentMousePos) return null;

    // Get the action type from selectedTool (e.g., 'arrow-pass' -> 'pass')
    const actionType = selectedTool.replace('arrow-', '') as ArrowActionType;
    const arrowConfig = ARROW_TYPES[actionType];

    return (
      <svg
        style={{
          position: 'absolute',
          top: '3px',
          left: '3px',
          right: '3px',
          bottom: '3px',
          pointerEvents: 'none'
        }}
        preserveAspectRatio="none"
        viewBox={viewBox}
      >
        <defs>
          <marker
            id="preview-arrowhead"
            markerWidth="2"
            markerHeight="2"
            refX="1.5"
            refY="1"
            orient="auto"
          >
            <path d="M0,0 L0,2 L1.5,1 z" fill={arrowConfig.color} fillOpacity="0.7" />
          </marker>
        </defs>
        <line
          x1={`${creationStart.x}%`}
          y1={`${creationStart.y}%`}
          x2={`${currentMousePos.x}%`}
          y2={`${currentMousePos.y}%`}
          stroke={arrowConfig.color}
          strokeWidth={arrowConfig.width}
          strokeDasharray={arrowConfig.dashArray === 'none' ? '1,0.5' : arrowConfig.dashArray}
          strokeOpacity="0.7"
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
    <div style={{ padding: isMobile ? '0' : '16px 32px 32px 32px' }}>
      {/* Zone d'information fixe */}
      <div style={{ minHeight: '60px', marginBottom: isMobile ? '8px' : '16px' }}>
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
        id="actual-court"
        ref={courtRef}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: sportConfig.fieldDimensions.aspectRatio,
          backgroundColor: sportConfig.fieldColor, // Fallback si image ne charge pas
          borderRadius: '8px',
          border: '3px solid #ffffff',
          cursor: selectedTool === 'select' ? 'default' : 'crosshair',
          overflow: 'hidden',
          userSelect: 'none',
          touchAction: 'none',
          // Scaling automatique des éléments enfants sur très petit écran
          transform: isVerySmall ? 'scale(0.95)' : 'scale(1)',
          transformOrigin: 'center center',
          ...style
        }}
        onMouseDown={onCourtPointerDown}
        onTouchStart={onCourtPointerDown}
        onMouseMove={onCourtPointerMove}
        onTouchMove={onCourtPointerMove}
        onMouseUp={onCourtPointerUp}
        onTouchEnd={onCourtPointerUp}
      >
        {/* Image de fond du terrain (z-index: 0) */}
        <CourtBackgroundImage sport={sport} loading="eager" />

        {/* Pattern de terrain spécifique - DÉSACTIVÉ (remplacé par images) */}
        {/* Ancien système CSS patterns - commenté car images le gèrent maintenant */}

        {/* Grille */}
        {renderGrid()}

        {/* Lignes du terrain SVG - DÉSACTIVÉES (incluses dans les images) */}
        {/* Ancien système de lignes - commenté car images les contiennent déjà */}
        {/*
      <svg
          style={{
            position: 'absolute',
            top: '3px',
            left: '3px',
            right: '3px',
            bottom: '3px',
            pointerEvents: 'none'
          }}
          preserveAspectRatio="none"
          viewBox={viewBox}
        >
          {*\/ Lignes volleyball \/*}
          {sport === 'volleyball' && (
            <>
              {*\/ Ligne centrale \/*}
              <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="0.3" />
              {*\/ Lignes de fond \/*}
              <line x1="0%" y1="5%" x2="100%" y2="5%" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.2" />
              <line x1="0%" y1="95%" x2="100%" y2="95%" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.2" />
              {*\/ Lignes latérales \/*}
              <line x1="5%" y1="0%" x2="5%" y2="100%" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.2" />
              <line x1="95%" y1="0%" x2="95%" y2="100%" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.2" />
              {*\/ Ligne d'attaque \/*}
              <line x1="5%" y1="25%" x2="95%" y2="25%" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.15" strokeDasharray="2,2" />
              <line x1="5%" y1="75%" x2="95%" y2="75%" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.15" strokeDasharray="2,2" />
            </>
          )}
          
          {*\/ Lignes basketball \/*}
          {sport === 'basketball' && (
            <>
              {*\/ Ligne centrale \/*}
              <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="0.3" />
              {*\/ Contour du terrain \/*}
              <rect x="5%" y="5%" width="90%" height="90%" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.2" />
              {*\/ Cercle central \/*}
              <circle cx="50%" cy="50%" r="8%" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.2" />
              {*\/ Zones restrictives \/*}
              <rect x="5%" y="30%" width="15%" height="40%" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.15" />
              <rect x="80%" y="30%" width="15%" height="40%" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.15" />
            </>
          )}
          
          {*\/ Lignes football \/*}
          {sport === 'football' && (
            <>
              {*\/ Ligne centrale \/*}
              <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="0.3" />
              {*\/ Contour du terrain \/*}
              <rect x="2%" y="5%" width="96%" height="90%" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.2" />
              {*\/ Cercle central \/*}
              <circle cx="50%" cy="50%" r="8%" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.2" />
              {*\/ Surfaces de réparation \/*}
              <rect x="2%" y="25%" width="18%" height="50%" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.15" />
              <rect x="80%" y="25%" width="18%" height="50%" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.15" />
            </>
          )}
        </svg>

        {*\/ Éléments spécifiques du sport \/*}
        {renderSportSpecificElements()}
      */}

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
          // Afficher l'abréviation (la clé) au lieu du nom complet (la valeur)
          const roleLabel = player.role; // Ex: "G" au lieu de "Gardien"
          
          return (
            <div
              key={player.id}
              style={{
                position: 'absolute',
                left: `${player.position.x}%`,
                top: `${player.position.y}%`,
                width: `${playerSize}px`,
                height: `${playerSize}px`,
                background: roleColor,
                border: `${borderWidth}px solid ${selectedElement === player.id ? '#ffffff' : 'rgba(255, 255, 255, 0.3)'}`,
                borderRadius: '50%',
                cursor: selectedTool === 'select' ? 'pointer' : 'crosshair',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: `${fontSize}px`,
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
              width: `${ballSize}px`,
              height: `${ballSize}px`,
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
            top: '3px',
            left: '3px',
            right: '3px',
            bottom: '3px',
            pointerEvents: 'none'
          }}
          preserveAspectRatio="none"
          viewBox={viewBox}
        >
          <defs>
            {/* Generate markers for each arrow type */}
            {generateArrowMarkers()}
          </defs>
          {arrows.map((arrow) => {
            // Get arrow type (use actionType if available, fallback to 'pass' for old arrows)
            const arrowActionType = arrow.actionType || 'pass';
            const arrowConfig = ARROW_TYPES[arrowActionType];
            const arrowStyle = getArrowStyle(arrowActionType);

            const startX = arrow.startPosition.x;
            const startY = arrow.startPosition.y;
            const endX = arrow.endPosition.x;
            const endY = arrow.endPosition.y;

            // Vérifier si la flèche a un point de contrôle (courbe personnalisée)
            const isCurved = arrow.controlX !== undefined && arrow.controlY !== undefined;

            if (isCurved) {
              // Flèche courbe avec point de contrôle personnalisé
              return (
                <path
                  key={arrow.id}
                  d={`M ${startX} ${startY} Q ${arrow.controlX} ${arrow.controlY} ${endX} ${endY}`}
                  fill="none"
                  stroke={selectedElement === arrow.id ? '#00d4aa' : arrowStyle.stroke}
                  strokeWidth={selectedElement === arrow.id ? arrowConfig.width + 1 : arrowConfig.width}
                  strokeDasharray={arrowStyle.strokeDasharray}
                  markerEnd={selectedElement === arrow.id ? 'url(#arrow-pass)' : arrowStyle.markerEnd}
                  style={{
                    filter: selectedElement === arrow.id ? 'drop-shadow(0 0 6px #00d4aa60)' : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                    cursor: selectedTool === 'select' ? 'pointer' : 'crosshair'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onElementSelect(arrow.id);
                  }}
                />
              );
            }

            return (
              <line
                key={arrow.id}
                x1={`${arrow.startPosition.x}%`}
                y1={`${arrow.startPosition.y}%`}
                x2={`${arrow.endPosition.x}%`}
                y2={`${arrow.endPosition.y}%`}
                stroke={selectedElement === arrow.id ? '#00d4aa' : arrowStyle.stroke}
                strokeWidth={selectedElement === arrow.id ? arrowConfig.width + 1 : arrowConfig.width}
                strokeDasharray={arrowStyle.strokeDasharray}
                markerEnd={selectedElement === arrow.id ? 'url(#arrow-pass)' : arrowStyle.markerEnd}
                style={{
                  filter: selectedElement === arrow.id ? 'drop-shadow(0 0 6px #00d4aa60)' : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                  cursor: selectedTool === 'select' ? 'pointer' : 'crosshair'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onElementSelect(arrow.id);
                }}
              />
            );
          })}
        </svg>

        {/* Point de contrôle pour courber la flèche sélectionnée */}
        {selectedElement && arrows.find(a => a.id === selectedElement) && selectedTool === 'select' && (() => {
          const selectedArrow = arrows.find(a => a.id === selectedElement);
          if (!selectedArrow) return null;

          const startX = selectedArrow.startPosition.x;
          const startY = selectedArrow.startPosition.y;
          const endX = selectedArrow.endPosition.x;
          const endY = selectedArrow.endPosition.y;

          // Point de contrôle au milieu par défaut (ligne droite)
          const defaultControlX = (startX + endX) / 2;
          const defaultControlY = (startY + endY) / 2;

          // Utiliser le point de contrôle existant ou celui par défaut
          const controlX = selectedArrow.controlX ?? defaultControlX;
          const controlY = selectedArrow.controlY ?? defaultControlY;

          return (
            <div
              style={{
                position: 'absolute',
                left: `${controlX}%`,
                top: `${controlY}%`,
                width: '16px',
                height: '16px',
                background: '#00d4aa',
                border: '2px solid #ffffff',
                borderRadius: '50%',
                cursor: 'move',
                transform: 'translate(-50%, -50%)',
                zIndex: 150,
                boxShadow: '0 2px 8px rgba(0, 212, 170, 0.4)',
                transition: draggingControlPoint === selectedArrow.id ? 'none' : 'all 0.15s ease'
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setDraggingControlPoint(selectedArrow.id);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                if (e.touches.length > 0 && onUpdateElement) {
                  setDraggingControlPoint(selectedArrow.id);
                }
              }}
            />
          );
        })()}

        {/* Aperçu de création */}
        {renderPreviewArrow()}
        {renderPreviewZone()}
      </div>
    </div>
  );
}