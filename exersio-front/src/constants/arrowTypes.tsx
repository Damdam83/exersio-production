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
    width: 0.6,
    style: 'solid',
    dashArray: 'none',
    markerType: 'triangle',
    icon: '➡️'
  },
  shot: {
    id: 'shot',
    label: 'Tir',
    color: '#ef4444',
    width: 0.6,
    style: 'solid',
    dashArray: 'none',
    markerType: 'large-triangle',
    icon: '⚡'
  },
  movement: {
    id: 'movement',
    label: 'Déplacement',
    color: '#10b981',
    width: 0.6,
    style: 'dashed',
    dashArray: '1.5,0.8',
    markerType: 'circle',
    icon: '👟'
  },
  dribble: {
    id: 'dribble',
    label: 'Dribble',
    color: '#f59e0b',
    width: 0.6,
    style: 'dotted',
    dashArray: '0.8,0.8',
    markerType: 'small-triangle',
    icon: '⚽'
  },
  defense: {
    id: 'defense',
    label: 'Défense',
    color: '#8b5cf6',
    width: 0.6,
    style: 'solid',
    dashArray: '1.2,0.6',
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
            markerWidth="3"
            markerHeight="3"
            refX="2.5"
            refY="1.5"
            orient="auto"
          >
            <path d="M0,0 L0,3 L2.5,1.5 z" fill={color} />
          </marker>
        );

      case 'large-triangle':
        return (
          <marker
            key={id}
            id={`arrow-${id}`}
            markerWidth="4"
            markerHeight="4"
            refX="3.5"
            refY="2"
            orient="auto"
          >
            <path d="M0,0 L0,4 L3.5,2 z" fill={color} />
          </marker>
        );

      case 'circle':
        return (
          <marker
            key={id}
            id={`arrow-${id}`}
            markerWidth="5"
            markerHeight="5"
            refX="2.5"
            refY="2.5"
            orient="auto"
          >
            <circle cx="2.5" cy="2.5" r="2" fill={color} />
          </marker>
        );

      case 'small-triangle':
        return (
          <marker
            key={id}
            id={`arrow-${id}`}
            markerWidth="3.5"
            markerHeight="3.5"
            refX="3"
            refY="1.75"
            orient="auto"
          >
            <path d="M0,0 L0,3.5 L3,1.75 z" fill={color} />
          </marker>
        );

      case 'cross':
        return (
          <marker
            key={id}
            id={`arrow-${id}`}
            markerWidth="5"
            markerHeight="5"
            refX="2.5"
            refY="2.5"
            orient="auto"
          >
            <path d="M0.5,0.5 L4.5,4.5 M0.5,4.5 L4.5,0.5" stroke={color} strokeWidth="1.2" />
          </marker>
        );

      default:
        return null;
    }
  });
}
