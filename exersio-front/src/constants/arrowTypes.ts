// Configuration des types de flèches avec styles visuels différenciés

export type ArrowActionType = 'pass' | 'shot' | 'movement' | 'dribble' | 'defense';

export interface ArrowTypeConfig {
  id: ArrowActionType;
  label: string;
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
  dashArray?: string;
  markerType: 'triangle' | 'large-triangle' | 'circle' | 'small-triangle' | 'cross';
  icon: string;
}

export const ARROW_TYPES: Record<ArrowActionType, ArrowTypeConfig> = {
  pass: {
    id: 'pass',
    label: 'Passe',
    color: '#3b82f6',
    width: 3,
    style: 'solid',
    dashArray: 'none',
    markerType: 'triangle',
    icon: '➡️'
  },
  shot: {
    id: 'shot',
    label: 'Tir',
    color: '#ef4444',
    width: 4,
    style: 'solid',
    dashArray: 'none',
    markerType: 'large-triangle',
    icon: '⚡'
  },
  movement: {
    id: 'movement',
    label: 'Déplacement',
    color: '#10b981',
    width: 2,
    style: 'dashed',
    dashArray: '8,4',
    markerType: 'circle',
    icon: '👟'
  },
  dribble: {
    id: 'dribble',
    label: 'Dribble',
    color: '#f59e0b',
    width: 2,
    style: 'dotted',
    dashArray: '2,4',
    markerType: 'small-triangle',
    icon: '⚽'
  },
  defense: {
    id: 'defense',
    label: 'Défense',
    color: '#8b5cf6',
    width: 3,
    style: 'solid',
    dashArray: '4,2',
    markerType: 'cross',
    icon: '🛡️'
  }
};

// Helper pour obtenir le style SVG d'une flèche
export function getArrowStyle(actionType: ArrowActionType) {
  const config = ARROW_TYPES[actionType];

  return {
    stroke: config.color,
    strokeWidth: config.width,
    strokeDasharray: config.dashArray === 'none' ? undefined : config.dashArray,
    markerEnd: `url(#arrow-${actionType})`
  };
}

// Génération des markers SVG pour chaque type
export function generateArrowMarkers() {
  return Object.values(ARROW_TYPES).map(config => {
    const { id, color, markerType } = config;

    switch (markerType) {
      case 'triangle':
        return (
          <marker
            key={id}
            id={`arrow-${id}`}
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill={color} />
          </marker>
        );

      case 'large-triangle':
        return (
          <marker
            key={id}
            id={`arrow-${id}`}
            markerWidth="14"
            markerHeight="14"
            refX="12"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,8 L12,4 z" fill={color} />
          </marker>
        );

      case 'circle':
        return (
          <marker
            key={id}
            id={`arrow-${id}`}
            markerWidth="8"
            markerHeight="8"
            refX="4"
            refY="4"
            orient="auto"
          >
            <circle cx="4" cy="4" r="3" fill={color} />
          </marker>
        );

      case 'small-triangle':
        return (
          <marker
            key={id}
            id={`arrow-${id}`}
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="2.5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,5 L7,2.5 z" fill={color} />
          </marker>
        );

      case 'cross':
        return (
          <marker
            key={id}
            id={`arrow-${id}`}
            markerWidth="10"
            markerHeight="10"
            refX="5"
            refY="5"
            orient="auto"
          >
            <path d="M2,2 L8,8 M2,8 L8,2" stroke={color} strokeWidth="2" />
          </marker>
        );

      default:
        return null;
    }
  });
}
