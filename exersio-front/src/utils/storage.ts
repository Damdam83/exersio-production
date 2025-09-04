import { User, Club, Exercise, Session, Invitation } from '../types';

const STORAGE_KEYS = {
  USER: 'exersio_user',
  CLUB: 'exersio_club',
  EXERCISES: 'exersio_exercises',
  SESSIONS: 'exersio_sessions',
  INVITATIONS: 'exersio_invitations',
  APP_STATE: 'exersio_app_state',
} as const;

// Utilitaires de stockage local
export const storage = {
  // Utilisateur
  saveUser: (user: User) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  
  getUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },
  
  // Club
  saveClub: (club: Club) => {
    localStorage.setItem(STORAGE_KEYS.CLUB, JSON.stringify(club));
  },
  
  getClub: (): Club | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CLUB);
    return data ? JSON.parse(data) : null;
  },
  
  // Exercices
  saveExercises: (exercises: Exercise[]) => {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
  },
  
  getExercises: (): Exercise[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EXERCISES);
    return data ? JSON.parse(data) : [];
  },
  
  addExercise: (exercise: Exercise) => {
    const exercises = storage.getExercises();
    exercises.push(exercise);
    storage.saveExercises(exercises);
  },
  
  updateExercise: (exerciseId: string, updates: Partial<Exercise>) => {
    const exercises = storage.getExercises();
    const index = exercises.findIndex(e => e.id === exerciseId);
    if (index !== -1) {
      exercises[index] = { ...exercises[index], ...updates, updatedAt: new Date() };
      storage.saveExercises(exercises);
    }
  },
  
  deleteExercise: (exerciseId: string) => {
    const exercises = storage.getExercises().filter(e => e.id !== exerciseId);
    storage.saveExercises(exercises);
  },
  
  // Séances
  saveSessions: (sessions: Session[]) => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  },
  
  getSessions: (): Session[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  },
  
  addSession: (session: Session) => {
    const sessions = storage.getSessions();
    sessions.push(session);
    storage.saveSessions(sessions);
  },
  
  updateSession: (sessionId: string, updates: Partial<Session>) => {
    const sessions = storage.getSessions();
    const index = sessions.findIndex(s => s.id === sessionId);
    if (index !== -1) {
      sessions[index] = { ...sessions[index], ...updates, updatedAt: new Date() };
      storage.saveSessions(sessions);
    }
  },
  
  deleteSession: (sessionId: string) => {
    const sessions = storage.getSessions().filter(s => s.id !== sessionId);
    storage.saveSessions(sessions);
  },
  
  // Invitations
  saveInvitations: (invitations: Invitation[]) => {
    localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(invitations));
  },
  
  getInvitations: (): Invitation[] => {
    const data = localStorage.getItem(STORAGE_KEYS.INVITATIONS);
    return data ? JSON.parse(data) : [];
  },
  
  // Nettoyage
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};

// Générateur d'ID unique
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Données par défaut pour le développement
export const defaultExercises: Exercise[] = [
  {
    id: 'ex1',
    name: 'Échauffement - Passes en diagonale',
    description: 'Exercice d\'échauffement avec passes en diagonale pour améliorer la précision et la communication entre joueurs.',
    duration: 15,
    category: 'échauffement',
    ageCategory: 'tous',
    sport: 'volleyball',
    level: 'débutant',
    intensity: 'faible',
    playersMin: 6,
    playersMax: 12,
    material: 'Ballons de volleyball\nCônes de marquage',
    objectives: [
      'Améliorer la précision des passes',
      'Développer la communication',
      'Échauffement progressif'
    ],
    instructions: [
      'Former deux groupes en diagonale sur le terrain',
      'Passer le ballon à la personne en face avec précision',
      'Se déplacer vers la queue de l\'autre groupe après chaque passe',
      'Augmenter progressivement l\'intensité',
      'Répéter pendant 15 minutes en variant les types de passes'
    ],
    tags: ['échauffement', 'passes', 'communication'],
    createdBy: 'system',
    isPublic: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    fieldData: {
      fieldType: 'volleyball',
      points: [
        {
          id: 'player1',
          x: 25,
          y: 30,
          type: 'player',
          color: '#00d4aa',
          size: 8,
          label: 'J1'
        },
        {
          id: 'player2',
          x: 75,
          y: 70,
          type: 'player',
          color: '#00d4aa',
          size: 8,
          label: 'J2'
        },
        {
          id: 'player3',
          x: 25,
          y: 50,
          type: 'player',
          color: '#4834d4',
          size: 8,
          label: 'J3'
        },
        {
          id: 'player4',
          x: 75,
          y: 50,
          type: 'player',
          color: '#4834d4',
          size: 8,
          label: 'J4'
        },
        {
          id: 'ball1',
          x: 50,
          y: 40,
          type: 'ball',
          color: '#ffbe76',
          size: 6,
          label: '🏐'
        }
      ],
      arrows: [
        {
          id: 'arrow1',
          startX: 25,
          startY: 30,
          endX: 75,
          endY: 70,
          color: '#00d4aa',
          width: 3,
          style: 'solid',
          label: 'Passe 1'
        },
        {
          id: 'arrow2',
          startX: 75,
          startY: 70,
          endX: 25,
          endY: 50,
          color: '#ff6b7a',
          width: 3,
          style: 'solid',
          label: 'Passe 2'
        }
      ],
      annotations: [
        {
          id: 'zone1',
          type: 'zone',
          x: 20,
          y: 25,
          width: 15,
          height: 30,
          color: '#00d4aa',
          text: 'Groupe A',
          fontSize: 12
        },
        {
          id: 'zone2',
          type: 'zone',
          x: 70,
          y: 45,
          width: 15,
          height: 30,
          color: '#4834d4',
          text: 'Groupe B',
          fontSize: 12
        }
      ]
    }
  },
  {
    id: 'ex2',
    name: 'Attaque - Smash en ligne',
    description: 'Exercice d\'attaque avec smash en ligne pour travailler la puissance et la précision des attaques.',
    duration: 20,
    category: 'attaque',
    ageCategory: 'seniors',
    sport: 'volleyball',
    level: 'intermédiaire',
    intensity: 'élevée',
    playersMin: 4,
    playersMax: 8,
    material: 'Ballons de volleyball\nFilet réglementaire',
    objectives: [
      'Améliorer la puissance d\'attaque',
      'Travailler la précision des smashs',
      'Coordination passeur-attaquant'
    ],
    instructions: [
      'Positionnement du passeur au poste 3 (centre)',
      'Attaquants positionnés aux postes 2 et 4',
      'Le passeur effectue une passe haute vers l\'attaquant choisi',
      'L\'attaquant réalise un smash croisé ou le long de la ligne',
      'Rotation des rôles toutes les 5 attaques',
      'Insister sur le timing et la coordination'
    ],
    tags: ['attaque', 'smash', 'coordination'],
    createdBy: 'system',
    isPublic: true,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    fieldData: {
      fieldType: 'volleyball',
      points: [
        {
          id: 'setter',
          x: 50,
          y: 60,
          type: 'player',
          color: '#00d4aa',
          size: 10,
          label: 'P'
        },
        {
          id: 'attacker1',
          x: 75,
          y: 45,
          type: 'player',
          color: '#ff6b7a',
          size: 9,
          label: 'A1'
        },
        {
          id: 'attacker2',
          x: 25,
          y: 45,
          type: 'player',
          color: '#ff6b7a',
          size: 9,
          label: 'A2'
        },
        {
          id: 'ball',
          x: 50,
          y: 45,
          type: 'ball',
          color: '#ffbe76',
          size: 7,
          label: '🏐'
        }
      ],
      arrows: [
        {
          id: 'pass1',
          startX: 50,
          startY: 60,
          endX: 75,
          endY: 45,
          color: '#00d4aa',
          width: 4,
          style: 'solid',
          label: 'Passe haute'
        },
        {
          id: 'attack1',
          startX: 75,
          startY: 45,
          endX: 85,
          endY: 25,
          color: '#ff6b7a',
          width: 5,
          style: 'solid',
          label: 'Smash'
        },
        {
          id: 'pass2',
          startX: 50,
          startY: 60,
          endX: 25,
          endY: 45,
          color: '#00d4aa',
          width: 4,
          style: 'solid',
          label: 'Alternative'
        }
      ],
      annotations: [
        {
          id: 'net',
          type: 'zone',
          x: 45,
          y: 40,
          width: 10,
          height: 2,
          color: '#ffffff',
          text: 'Filet',
          fontSize: 10
        }
      ]
    }
  }
];

export const defaultSessions: Session[] = [
  {
    id: 'session1',
    name: 'Entraînement complet - Équipe sénior',
    description: 'Séance d\'entraînement complète avec échauffement, technique et match',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Demain
    duration: 120,
    objectives: ['Améliorer la technique d\'attaque', 'Renforcer la défense', 'Travail tactique'],
    exercises: ['ex1', 'ex2'],
    status: 'planned' as const,
    createdBy: 'system',
    clubId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'session2',
    name: 'Échauffement et technique',
    description: 'Séance courte axée sur la technique de base',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Dans 3 jours
    duration: 90,
    objectives: ['Révision des fondamentaux', 'Échauffement complet'],
    exercises: ['ex1'],
    status: 'planned' as const,
    createdBy: 'system',
    clubId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Initialiser les données par défaut
export const initializeDefaultData = () => {
  if (storage.getExercises().length === 0) {
    storage.saveExercises(defaultExercises);
  }
  if (storage.getSessions().length === 0) {
    storage.saveSessions(defaultSessions);
  }
};

// Exports directs pour la compatibilité avec les nouveaux contexts
export const saveExercises = storage.saveExercises;
export const getExercises = storage.getExercises;
export const loadExercises = storage.getExercises; // Alias pour loadExercises
export const saveSessions = storage.saveSessions;
export const getSessions = storage.getSessions;
export const loadSessions = storage.getSessions; // Alias pour loadSessions
export const saveUser = storage.saveUser;
export const getUser = storage.getUser;
export const saveClub = storage.saveClub;
export const getClub = storage.getClub;