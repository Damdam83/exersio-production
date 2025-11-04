import { Exercise, FieldData } from '../types';
import { Player, Arrow, Ball, Zone, roleColors } from '../constants/exerciseEditor';

// Fonctions d'initialisation des données de terrain
export const initializePlayers = (exercise?: Exercise): Player[] => {
  if (!exercise?.fieldData) return [];
  
  // Check new format first (players array)
  if (exercise.fieldData.players) {
    return exercise.fieldData.players.map(player => ({
      id: player.id,
      role: player.role,
      position: player.position,
      label: player.label,
      displayMode: player.displayMode || 'role',
      playerNumber: player.playerNumber
    }));
  }
  
  // Fallback to old format (points array)
  return exercise.fieldData.points
    .filter(point => point.type === 'player')
    .map(point => ({
      id: point.id,
      role: 'attaque' as Player['role'],
      position: { x: point.x, y: point.y },
      label: point.label || 'A',
      displayMode: 'role' as const
    }));
};

export const initializeArrows = (exercise?: Exercise): Arrow[] => {
  if (!exercise?.fieldData) return [];

  // Check new format first
  if (exercise.fieldData.arrows && exercise.fieldData.arrows[0]?.startPosition) {
    return exercise.fieldData.arrows.map(arrow => ({
      id: arrow.id,
      startPosition: arrow.startPosition,
      endPosition: arrow.endPosition,
      type: arrow.type || 'movement',
      actionType: arrow.actionType || 'pass',
      step: arrow.step,
      isCurved: arrow.isCurved,
      controlX: arrow.controlX,
      controlY: arrow.controlY
    }));
  }

  // Fallback to old format
  return exercise.fieldData.arrows.map(arrow => ({
    id: arrow.id,
    startPosition: { x: arrow.startX, y: arrow.startY },
    endPosition: { x: arrow.endX, y: arrow.endY },
    type: 'movement',
    actionType: 'pass'
  }));
};

export const initializeBalls = (exercise?: Exercise): Ball[] => {
  if (!exercise?.fieldData) return [];
  
  // Check new format first
  if (exercise.fieldData.balls) {
    return exercise.fieldData.balls.map(ball => ({
      id: ball.id,
      position: ball.position
    }));
  }
  
  // Fallback to old format
  return exercise.fieldData.points
    .filter(point => point.type === 'ball')
    .map(point => ({
      id: point.id,
      position: { x: point.x, y: point.y }
    }));
};

export const initializeZones = (exercise?: Exercise): Zone[] => {
  if (!exercise?.fieldData) return [];
  
  // Check new format first
  if (exercise.fieldData.zones) {
    return exercise.fieldData.zones.map(zone => ({
      id: zone.id,
      position: zone.position,
      width: zone.width,
      height: zone.height,
      label: zone.label,
      color: zone.color
    }));
  }
  
  // Fallback to old format
  return exercise.fieldData.annotations
    .filter(annotation => annotation.type === 'zone')
    .map(annotation => ({
      id: annotation.id,
      position: { x: annotation.x, y: annotation.y },
      width: annotation.width || 10,
      height: annotation.height || 10,
      label: annotation.text,
      color: annotation.color
    }));
};

// Conversion vers FieldData - nouveau format avec rétrocompatibilité
export const convertToFieldData = (
  players: Player[],
  arrows: Arrow[],
  balls: Ball[],
  zones: Zone[]
): FieldData => ({
  // Nouveau format
  players: players,
  arrows: arrows,
  balls: balls,
  zones: zones,
  // Ancien format pour rétrocompatibilité
  points: [
    // Convertir les joueurs en points
    ...players.map(player => ({
      id: player.id,
      x: player.position.x,
      y: player.position.y,
      color: roleColors[player.role],
      size: 20,
      label: player.label,
      type: 'player' as const
    })),
    // Convertir les ballons en points
    ...balls.map(ball => ({
      id: ball.id,
      x: ball.position.x,
      y: ball.position.y,
      color: '#fbbf24',
      size: 15,
      type: 'ball' as const
    }))
  ],
  annotations: zones.map(zone => ({
    id: zone.id,
    x: zone.position.x,
    y: zone.position.y,
    text: zone.label,
    fontSize: 12,
    color: zone.color,
    width: zone.width,
    height: zone.height,
    type: 'zone' as const
  })),
  fieldType: 'volleyball' as const
});

// Utilitaires pour la gestion des positions
export const getEventPosition = (
  e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  courtRef: React.RefObject<HTMLDivElement>
) => {
  if (!courtRef.current) return { x: 0, y: 0 };
  
  let clientX, clientY;
  
  if ('touches' in e && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if ('clientX' in e) {
    clientX = e.clientX;
    clientY = e.clientY;
  } else {
    return { x: 0, y: 0 };
  }
  
  // courtRef pointe directement vers le terrain (#actual-court)
  const targetRect = courtRef.current.getBoundingClientRect();

  // Soustraire la bordure (3px de chaque côté)
  const borderWidth = 3;
  const innerWidth = targetRect.width - (borderWidth * 2);
  const innerHeight = targetRect.height - (borderWidth * 2);
  const innerLeft = targetRect.left + borderWidth;
  const innerTop = targetRect.top + borderWidth;

  // Calculer par rapport à la zone intérieure (sans bordure)
  const x = ((clientX - innerLeft) / innerWidth) * 100;
  const y = ((clientY - innerTop) / innerHeight) * 100;

  // Permettre placement dans une zone élargie autour du terrain
  return { x: Math.max(-30, Math.min(130, x)), y: Math.max(-30, Math.min(130, y)) };
};