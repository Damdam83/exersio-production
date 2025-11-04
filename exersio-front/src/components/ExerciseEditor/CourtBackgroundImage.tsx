import React, { useState } from 'react';
import { SportType } from '../../constants/sportsConfig';
import { CourtPlaceholderSVG } from './CourtPlaceholders';

interface CourtBackgroundImageProps {
  sport: SportType;
  className?: string;
  loading?: 'eager' | 'lazy';
  usePlaceholder?: boolean; // Force l'utilisation du placeholder SVG
}

/**
 * Composant affichant l'image de fond du terrain selon le sport
 * Utilise des images WebP optimisées (<300KB) pour performance
 * Fallback sur PNG si WebP non supporté (navigateurs anciens)
 * Fallback sur placeholder SVG si image introuvable
 */
export function CourtBackgroundImage({
  sport,
  className = '',
  loading = 'lazy',
  usePlaceholder = false // Temporairement true en attendant les vraies images
}: CourtBackgroundImageProps) {
  const [imageError, setImageError] = useState(false);

  // Mapping sport → chemin image (organisé par dossier sport)
  const courtImages: Record<SportType, string> = {
    volleyball: 'volleyball/volleyball-court-dark',
    football: 'football/football-court-dark',
    tennis: 'tennis/tennis-court-dark',
    handball: 'handball/handball-court-dark',
    basketball: 'basketball/basketball-court-dark'
  };

  const imagePath = courtImages[sport];
  const webpPath = `/assets/courts/${imagePath}.webp`;
  const pngPath = `/assets/courts/${imagePath}.png`;

  // Si placeholder forcé OU erreur de chargement → afficher SVG
  if (usePlaceholder || imageError) {
    return <CourtPlaceholderSVG sport={sport} className={className} />;
  }

  return (
    <picture className={`absolute inset-0 ${className}`}>
      {/* Format WebP moderne (meilleur compression) */}
      <source srcSet={webpPath} type="image/webp" />

      {/* Fallback PNG pour anciens navigateurs */}
      <img
        src={pngPath}
        alt={`${sport} court background`}
        loading={loading}
        className="w-full h-full"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover', // cover pour remplir tout l'espace
          objectPosition: 'center center', // centré horizontalement et verticalement
          zIndex: 0,
          pointerEvents: 'none',
          userSelect: 'none'
        }}
        draggable={false}
        onError={() => setImageError(true)}
      />
    </picture>
  );
}

/**
 * Composant placeholder temporaire pendant chargement des vraies images
 * Utilise les couleurs du sportsConfig actuel pour cohérence
 */
export function CourtBackgroundPlaceholder({
  sport,
  className = ''
}: Omit<CourtBackgroundImageProps, 'loading'>) {

  // Couleurs de fallback (sportsConfig actuels)
  const placeholderColors: Record<SportType, string> = {
    volleyball: '#2d5016',
    football: '#2d5016',
    tennis: '#8b4513',
    handball: '#8b4513',
    basketball: '#8b4513'
  };

  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{
        backgroundColor: placeholderColors[sport],
        background: `linear-gradient(135deg, ${placeholderColors[sport]} 0%, #1e2731 100%)`,
        zIndex: 0
      }}
    />
  );
}
