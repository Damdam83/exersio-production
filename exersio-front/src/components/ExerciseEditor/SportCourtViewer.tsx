import React, { useRef, useEffect, useState } from 'react';
import { Arrow, Ball, Player, Zone } from '../../constants/exerciseEditor';
import { SPORTS_CONFIG, SportType } from '../../constants/sportsConfig';
import { ARROW_TYPES, getArrowStyle, generateArrowMarkers } from '../../constants/arrowTypes';
import { CourtBackgroundImage } from './CourtBackgroundImage';

interface SportCourtViewerProps {
  sport: SportType;
  players: Player[];
  arrows: Arrow[];
  balls: Ball[];
  zones: Zone[];
  showGrid?: boolean;
  className?: string;
  style?: React.CSSProperties;
  displayMode?: 'role' | 'number';
}

/**
 * Composant en lecture seule pour afficher un terrain de sport avec ses éléments
 * Utilisé dans les listes d'exercices, détails, sessions, etc.
 * Ne gère pas l'édition ni les interactions (drag & drop, sélection, etc.)
 */
export function SportCourtViewer({
  sport,
  players,
  arrows,
  balls,
  zones,
  showGrid = false,
  className = '',
  style = {},
  displayMode = 'role'
}: SportCourtViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const sportConfig = SPORTS_CONFIG[sport];

  // Calculer le viewBox basé sur l'aspect ratio du sport
  const aspectRatio = sportConfig.fieldDimensions.aspectRatio;
  const viewBoxWidth = 100 * aspectRatio;
  const viewBox = `0 0 ${viewBoxWidth} 100`;

  // Observer les changements de taille du conteneur
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Tailles adaptatives basées sur la largeur du conteneur
  // Utiliser un ratio de la largeur pour avoir des tailles cohérentes
  const baseSize = Math.max(containerWidth * 0.04, 16); // Minimum 16px
  const playerSize = baseSize;
  const ballSize = baseSize * 0.67;
  const fontSize = baseSize * 0.42;
  const borderWidth = Math.max(baseSize * 0.08, 1.5);

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
          pointerEvents: 'none',
          zIndex: 1
        }}
        preserveAspectRatio="none"
        viewBox={viewBox}
      >
        {gridLines}
      </svg>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: sportConfig.fieldDimensions.aspectRatio,
        border: '3px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        overflow: 'hidden',
        userSelect: 'none',
        touchAction: 'none',
        ...style
      }}
    >
        {/* Image de fond du terrain */}
        <CourtBackgroundImage sport={sport} loading="lazy" />

        {/* Grille optionnelle */}
        {renderGrid()}

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
              border: `2px dashed ${zone.color}`,
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: '600',
              color: zone.color,
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
              zIndex: 2,
              pointerEvents: 'none'
            }}
          >
            {zone.label}
          </div>
        ))}

        {/* Joueurs */}
        {players.map((player) => {
          const roleColor = sportConfig.roleColors[player.role] || '#6b7280';
          const roleLabel = player.role;

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
                border: `${borderWidth}px solid rgba(255, 255, 255, 0.3)`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: `${fontSize}px`,
                fontWeight: '700',
                color: '#ffffff',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                transform: 'translate(-50%, -50%)',
                zIndex: 3,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                pointerEvents: 'none'
              }}
            >
              {displayMode === 'number' && player.label
                ? player.label
                : roleLabel}

              {player.variant && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '12px',
                    height: '12px',
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: '#ffffff',
                    borderRadius: '50%',
                    fontSize: '7px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.5)'
                  }}
                >
                  {player.variant}
                </div>
              )}
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
              background: 'radial-gradient(circle, #fbbf24, #f59e0b)',
              border: `${borderWidth}px solid rgba(255, 255, 255, 0.5)`,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 3,
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
              pointerEvents: 'none'
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
            pointerEvents: 'none',
            zIndex: 2
          }}
          preserveAspectRatio="none"
          viewBox={viewBox}
        >
          <defs>
            {/* Générer les markers pour chaque type de flèche */}
            {generateArrowMarkers()}
          </defs>
          {arrows.map((arrow) => {
            // Type de flèche (utilise actionType si disponible, sinon 'pass' par défaut)
            const arrowActionType = arrow.actionType || 'pass';
            const arrowConfig = ARROW_TYPES[arrowActionType];
            const arrowStyle = getArrowStyle(arrowActionType);

            const startX = arrow.startPosition.x;
            const startY = arrow.startPosition.y;
            const endX = arrow.endPosition.x;
            const endY = arrow.endPosition.y;

            // Vérifier si la flèche a un point de contrôle (courbe)
            const isCurved = arrow.controlX !== undefined && arrow.controlY !== undefined;

            if (isCurved) {
              // Flèche courbe
              const vbStartX = (startX / 100) * viewBoxWidth;
              const vbStartY = startY;
              const vbEndX = (endX / 100) * viewBoxWidth;
              const vbEndY = endY;
              const vbControlX = (arrow.controlX / 100) * viewBoxWidth;
              const vbControlY = arrow.controlY;

              return (
                <path
                  key={arrow.id}
                  d={`M ${vbStartX} ${vbStartY} Q ${vbControlX} ${vbControlY} ${vbEndX} ${vbEndY}`}
                  fill="none"
                  stroke={arrowStyle.stroke}
                  strokeWidth={arrowConfig.width}
                  strokeDasharray={arrowStyle.strokeDasharray}
                  markerEnd={arrowStyle.markerEnd}
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                  }}
                />
              );
            }

            // Flèche droite - convertir les coordonnées en valeurs viewBox
            const vbStartX = (startX / 100) * viewBoxWidth;
            const vbStartY = startY;
            const vbEndX = (endX / 100) * viewBoxWidth;
            const vbEndY = endY;

            return (
              <line
                key={arrow.id}
                x1={vbStartX}
                y1={vbStartY}
                x2={vbEndX}
                y2={vbEndY}
                stroke={arrowStyle.stroke}
                strokeWidth={arrowConfig.width}
                strokeDasharray={arrowStyle.strokeDasharray}
                markerEnd={arrowStyle.markerEnd}
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                }}
              />
            );
          })}
        </svg>

        {/* Afficher le numéro d'étape sur les flèches si présent */}
        {arrows.map((arrow) => {
          if (!arrow.step) return null;

          const isCurved = arrow.controlX !== undefined && arrow.controlY !== undefined;

          // Position au milieu de la flèche
          let midX, midY;
          if (isCurved) {
            // Pour une courbe quadratique, le point milieu est à t=0.5
            // Q(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
            const t = 0.5;
            midX = (1-t)*(1-t)*arrow.startPosition.x + 2*(1-t)*t*arrow.controlX! + t*t*arrow.endPosition.x;
            midY = (1-t)*(1-t)*arrow.startPosition.y + 2*(1-t)*t*arrow.controlY! + t*t*arrow.endPosition.y;
          } else {
            midX = (arrow.startPosition.x + arrow.endPosition.x) / 2;
            midY = (arrow.startPosition.y + arrow.endPosition.y) / 2;
          }

          return (
            <div
              key={`${arrow.id}-step`}
              style={{
                position: 'absolute',
                left: `${midX}%`,
                top: `${midY}%`,
                width: '16px',
                height: '16px',
                background: 'rgba(0, 0, 0, 0.8)',
                color: '#ffffff',
                borderRadius: '50%',
                fontSize: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(255, 255, 255, 0.8)',
                transform: 'translate(-50%, -50%)',
                zIndex: 4,
                fontWeight: '700',
                pointerEvents: 'none'
              }}
            >
              {arrow.step}
            </div>
          );
        })}
    </div>
  );
}
