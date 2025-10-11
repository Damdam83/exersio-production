import React from 'react';
import { SportType } from '../../constants/sportsConfig';

/**
 * Composant générant des placeholders SVG pour les terrains
 * À utiliser temporairement en attendant les vraies images
 * Supprimable une fois toutes les images WebP disponibles
 */

interface PlaceholderProps {
  sport: SportType;
  className?: string;
}

export function CourtPlaceholderSVG({ sport, className = '' }: PlaceholderProps) {
  // Configs par sport
  const configs = {
    volleyball: {
      bg: '#1e2731',
      accent: '#00d4aa',
      label: 'VOLLEYBALL',
      emoji: '🏐',
      lines: [
        { x1: '50%', y1: '0%', x2: '50%', y2: '100%', width: 3 }, // Net central
        { x1: '16.67%', y1: '0%', x2: '16.67%', y2: '100%', width: 1 }, // Ligne attaque gauche
        { x1: '83.33%', y1: '0%', x2: '83.33%', y2: '100%', width: 1 } // Ligne attaque droite
      ]
    },
    football: {
      bg: '#1a3a1a',
      accent: '#00d4aa',
      label: 'FOOTBALL',
      emoji: '⚽',
      lines: [
        { x1: '50%', y1: '0%', x2: '50%', y2: '100%', width: 1 }, // Centre
        { x1: '0%', y1: '50%', x2: '100%', y2: '50%', width: 1 } // Milieu
      ]
    },
    tennis: {
      bg: '#1e3a5f',
      accent: '#00d4aa',
      label: 'TENNIS',
      emoji: '🎾',
      lines: [
        { x1: '50%', y1: '0%', x2: '50%', y2: '100%', width: 2 }, // Net
        { x1: '15%', y1: '0%', x2: '15%', y2: '100%', width: 1 }, // Simple gauche
        { x1: '85%', y1: '0%', x2: '85%', y2: '100%', width: 1 } // Simple droite
      ]
    },
    handball: {
      bg: '#3d2f1f',
      accent: '#00d4aa',
      label: 'HANDBALL',
      emoji: '🤾',
      lines: [
        { x1: '50%', y1: '0%', x2: '50%', y2: '100%', width: 1 }, // Centre
        { x1: '0%', y1: '50%', x2: '100%', y2: '50%', width: 1 } // Milieu
      ]
    },
    basketball: {
      bg: '#2d1f1a',
      accent: '#00d4aa',
      label: 'BASKETBALL',
      emoji: '🏀',
      lines: [
        { x1: '50%', y1: '0%', x2: '50%', y2: '100%', width: 1 }, // Centre
        { x1: '0%', y1: '50%', x2: '100%', y2: '50%', width: 1 } // Milieu
      ]
    }
  };

  const config = configs[sport];

  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{
        zIndex: 0,
        backgroundColor: config.bg,
        background: `linear-gradient(135deg, ${config.bg} 0%, #0f172a 100%)`
      }}
    >
      {/* SVG Lines overlay */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
        preserveAspectRatio="none"
      >
        {/* Lignes de terrain blanches */}
        {config.lines.map((line, index) => (
          <line
            key={index}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth={line.width}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* Bordure extérieure */}
        <rect
          x="2%"
          y="2%"
          width="96%"
          height="96%"
          fill="none"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />

        {/* Accent teal sur bords */}
        <rect
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          fill="none"
          stroke={config.accent}
          strokeWidth="1"
          opacity="0.3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Label watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          pointerEvents: 'none',
          opacity: 0.15
        }}
      >
        <div className="text-center">
          <div style={{ fontSize: '64px', marginBottom: '8px' }}>{config.emoji}</div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'white',
              letterSpacing: '4px'
            }}
          >
            {config.label}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: config.accent,
              marginTop: '8px',
              fontWeight: 500
            }}
          >
            PLACEHOLDER
          </div>
        </div>
      </div>
    </div>
  );
}
