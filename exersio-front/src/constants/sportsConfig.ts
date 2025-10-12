// Configuration des sports et leurs spécificités

export type SportType = 'volleyball' | 'football' | 'tennis' | 'handball' | 'basketball';

export interface SportConfig {
  id: SportType;
  name: string;
  emoji: string;
  description: string;
  fieldColor: string;
  fieldPattern?: string;
  playerRoles: Record<string, string>;
  roleColors: Record<string, string>;
  maxPlayers: number;
  minPlayers: number;
  fieldDimensions: {
    width: number;
    height: number;
    aspectRatio: number;
  };
  specificElements?: {
    goals?: boolean;
    net?: boolean;
    zones?: boolean;
    baskets?: boolean;
  };
}

export const SPORTS_CONFIG: Record<SportType, SportConfig> = {
  volleyball: {
    id: 'volleyball',
    name: 'Volleyball',
    emoji: '🏐',
    description: 'Terrain de volleyball avec filet et zones',
    fieldColor: '#2d5016',
    fieldPattern: 'parquet',
    playerRoles: {
      A: 'Attaquant',
      C: 'Central',
      R: 'Réceptionneur',
      L: 'Libéro',
      P: 'Passeur'
    },
    roleColors: {
      A: '#ef4444',
      C: '#3b82f6',
      R: '#f59e0b',
      L: '#8b5cf6',
      P: '#10b981'
    },
    maxPlayers: 6,
    minPlayers: 1,
    fieldDimensions: {
      width: 100,
      height: 60,
      aspectRatio: 1.67
    },
    specificElements: {
      net: true,
      zones: true
    }
  },

  football: {
    id: 'football',
    name: 'Football',
    emoji: '⚽',
    description: 'Terrain de football avec buts et zones',
    fieldColor: '#2d5016',
    fieldPattern: 'grass',
    playerRoles: {
      G: 'Gardien',
      DD: 'Défenseur droit',
      DG: 'Défenseur gauche',
      DC: 'Défenseur central',
      MDC: 'Milieu défensif',
      MC: 'Milieu central',
      MOC: 'Milieu offensif',
      MD: 'Milieu droit',
      MG: 'Milieu gauche',
      A: 'Attaquant',
      SA: 'Second attaquant',
      AL: 'Ailier'
    },
    roleColors: {
      G: '#ef4444',
      DD: '#3b82f6',
      DG: '#3b82f6',
      DC: '#1e3a8a',
      MDC: '#10b981',
      MC: '#059669',
      MOC: '#84cc16',
      MD: '#f59e0b',
      MG: '#f59e0b',
      A: '#dc2626',
      SA: '#f97316',
      AL: '#8b5cf6'
    },
    maxPlayers: 11,
    minPlayers: 1,
    fieldDimensions: {
      width: 120,
      height: 80,
      aspectRatio: 1.5
    },
    specificElements: {
      goals: true,
      zones: true
    }
  },

  tennis: {
    id: 'tennis',
    name: 'Tennis',
    emoji: '🎾',
    description: 'Court de tennis avec filet et lignes',
    fieldColor: '#8b4513',
    fieldPattern: 'clay',
    playerRoles: {
      S: 'Serveur',
      R: 'Retourneur',
      V: 'Volleyer (filet)',
      B: 'Baselineur',
      D: 'Joueur de double'
    },
    roleColors: {
      S: '#ef4444',
      R: '#3b82f6',
      V: '#10b981',
      B: '#f59e0b',
      D: '#8b5cf6'
    },
    maxPlayers: 4,
    minPlayers: 1,
    fieldDimensions: {
      width: 100,
      height: 50,
      aspectRatio: 2
    },
    specificElements: {
      net: true,
      zones: true
    }
  },

  handball: {
    id: 'handball',
    name: 'Handball',
    emoji: '🤾',
    description: 'Terrain de handball avec buts et zones',
    fieldColor: '#8b4513',
    fieldPattern: 'wood',
    playerRoles: {
      G: 'Gardien',
      AL: 'Ailier gauche',
      AR: 'Ailier droit',
      DC: 'Demi-centre (meneur)',
      AG: 'Arrière gauche',
      AD: 'Arrière droit',
      P: 'Pivot'
    },
    roleColors: {
      G: '#ef4444',
      AL: '#10b981',
      AR: '#3b82f6',
      DC: '#06b6d4',
      AG: '#8b5cf6',
      AD: '#f59e0b',
      P: '#f97316'
    },
    maxPlayers: 7,
    minPlayers: 1,
    fieldDimensions: {
      width: 100,
      height: 60,
      aspectRatio: 1.67
    },
    specificElements: {
      goals: true,
      zones: true
    }
  },

  basketball: {
    id: 'basketball',
    name: 'Basketball',
    emoji: '🏀',
    description: 'Terrain de basketball avec paniers et zones',
    fieldColor: '#8b4513',
    fieldPattern: 'parquet',
    playerRoles: {
      M: 'Meneur',
      A: 'Arrière',
      Ai: 'Ailier',
      AF: 'Ailier fort',
      P: 'Pivot'
    },
    roleColors: {
      M: '#3b82f6',
      A: '#10b981',
      Ai: '#f59e0b',
      AF: '#8b5cf6',
      P: '#ef4444'
    },
    maxPlayers: 5,
    minPlayers: 1,
    fieldDimensions: {
      width: 100,
      height: 60,
      aspectRatio: 1.67
    },
    specificElements: {
      baskets: true,
      zones: true
    }
  }
};

export const SPORT_CATEGORIES = [
  { value: 'volleyball', label: 'Volleyball', emoji: '🏐' },
  { value: 'football', label: 'Football', emoji: '⚽' },
  { value: 'tennis', label: 'Tennis', emoji: '🎾' },
  { value: 'handball', label: 'Handball', emoji: '🤾' },
  { value: 'basketball', label: 'Basketball', emoji: '🏀' }
] as const;