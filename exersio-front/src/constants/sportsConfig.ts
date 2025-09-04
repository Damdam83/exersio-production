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
      attaque: 'A',
      central: 'C', 
      passe: 'P',
      reception: 'R',
      libero: 'L',
      neutre: 'N'
    },
    roleColors: {
      attaque: '#ef4444',
      central: '#3b82f6',
      passe: '#10b981',
      reception: '#f59e0b',
      libero: '#8b5cf6',
      neutre: '#6b7280'
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
      gardien: 'G',
      defenseur: 'D',
      milieu: 'M',
      attaquant: 'A',
      ailier: 'AL',
      neutre: 'N'
    },
    roleColors: {
      gardien: '#ef4444',
      defenseur: '#3b82f6',
      milieu: '#10b981',
      attaquant: '#f59e0b',
      ailier: '#8b5cf6',
      neutre: '#6b7280'
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
      joueur1: '1',
      joueur2: '2',
      arbitre: 'A',
      neutre: 'N'
    },
    roleColors: {
      joueur1: '#3b82f6',
      joueur2: '#ef4444',
      arbitre: '#6b7280',
      neutre: '#94a3b8'
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
      gardien: 'G',
      ailier_droit: 'AD',
      ailier_gauche: 'AG',
      arriere_droit: 'ARD',
      arriere_gauche: 'ARG',
      demi_centre: 'DC',
      pivot: 'P',
      neutre: 'N'
    },
    roleColors: {
      gardien: '#ef4444',
      ailier_droit: '#3b82f6',
      ailier_gauche: '#10b981',
      arriere_droit: '#f59e0b',
      arriere_gauche: '#8b5cf6',
      demi_centre: '#06b6d4',
      pivot: '#f97316',
      neutre: '#6b7280'
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
      meneur: 'M',
      arriere: 'AR',
      ailier: 'AL',
      ailier_fort: 'AF',
      pivot: 'P',
      neutre: 'N'
    },
    roleColors: {
      meneur: '#3b82f6',
      arriere: '#10b981',
      ailier: '#f59e0b',
      ailier_fort: '#8b5cf6',
      pivot: '#ef4444',
      neutre: '#6b7280'
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