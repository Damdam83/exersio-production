// Constants et types pour l'éditeur d'exercice
export interface Player {
  id: string;
  role: 'attaque' | 'central' | 'passe' | 'reception' | 'libero' | 'neutre';
  position: { x: number; y: number };
  variant?: string; // For positions like P', P'', etc.
  label: string;
  displayMode?: 'role' | 'number';
  playerNumber?: number; // For number display mode
}

export interface Arrow {
  id: string;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  step?: number;
  type: 'movement' | 'ball' | 'action';
  actionType?: 'pass' | 'shot' | 'movement' | 'dribble' | 'defense';
  isCurved?: boolean;
  controlX?: number;
  controlY?: number;
}

export interface Ball {
  id: string;
  position: { x: number; y: number };
}

export interface Zone {
  id: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  label: string;
  color: string;
}

export const roleColors = {
  attaque: '#ef4444',     // Rouge pour attaque
  central: '#3b82f6',     // Bleu pour central 
  passe: '#10b981',       // Vert pour passe
  reception: '#f59e0b',   // Orange pour réception
  libero: '#8b5cf6',      // Violet pour libéro
  neutre: '#6b7280'       // Gris pour neutre
};

export const roleLabels = { 
  attaque: 'A',     // Attaquant
  central: 'C',     // Central
  passe: 'P',       // Passeur
  reception: 'R',   // Réceptionneur
  libero: 'L',      // Libéro
  neutre: 'N'       // Neutre
};

// Support for multiple positions (P, P', P'', etc.)
export const positionVariants = ['', "'", "''", "'''"];
export const getVariantLabel = (role: string, variant?: string) => {
  const baseLabel = roleLabels[role as keyof typeof roleLabels];
  return variant ? `${baseLabel}${variant}` : baseLabel;
};

// Display modes
export type PlayerDisplayMode = 'role' | 'number';
export const displayModes = [
  { value: 'role' as const, label: 'Rôles (A, D, P...)', icon: '🏷️' },
  { value: 'number' as const, label: 'Numéros (1, 2, 3...)', icon: '🔢' }
];

export const FIELD_CATEGORIES = [
  { value: 'attaque', label: 'Attaque' },
  { value: 'defense', label: 'Défense' },
  { value: 'service', label: 'Service' },
  { value: 'reception', label: 'Réception' },
  { value: 'contre', label: 'Contre' },
  { value: 'echauffement', label: 'Échauffement' }
];

export const FIELD_AGE_CATEGORIES = [
  { value: 'tous', label: 'Tous niveaux' },
  { value: 'enfants', label: 'Enfants' },
  { value: 'minimes', label: 'Minimes' },
  { value: 'seniors', label: 'Seniors' }
];

export const FIELD_INTENSITIES = [
  { value: 'faible', label: 'Faible' },
  { value: 'moyenne', label: 'Moyenne' },
  { value: 'haute', label: 'Haute' }
];

// Suggestions de tags pour maintenir la cohérence
export const TAG_SUGGESTIONS = [
  // Catégories techniques
  'attaque', 'défense', 'service', 'réception', 'contre', 'passe',
  // Niveaux
  'débutant', 'intermédiaire', 'avancé', 'expert',
  // Types d'exercices
  'échauffement', 'technique', 'tactique', 'physique', 'coordination',
  // Spécificités
  'individuel', 'collectif', 'duo', 'trio',
  // Matériel
  'avec-ballon', 'sans-ballon', 'avec-filet', 'sans-filet',
  // Situations
  'match', 'entraînement', 'compétition', 'préparation',
  // Catégories d'âge
  'enfants', 'minimes', 'cadets', 'juniors', 'seniors', 'vétérans'
];