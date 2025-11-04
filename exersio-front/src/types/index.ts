// Types basés sur le schema Prisma
export type Role = 'coach' | 'assistant' | 'admin';
export type SessionStatus = 'planned' | 'completed' | 'cancelled' | 'in-progress';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  clubId?: string | null;
  avatar?: string | null;
  preferredSportId?: string | null;
  preferredSport?: Sport | null;
  createdAt: Date | string;
}

export interface Club {
  id: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  ownerId: string;
  members?: User[]; // Users, not just IDs in the API response
  inviteCode?: string; // May not be included in all responses
  createdAt: Date | string;
}

export interface Sport {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  order: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ExerciseCategory {
  id: string;
  name: string;
  slug: string;
  color?: string;
  icon?: string;
  order: number;
  sportId: string;
  sport?: Sport;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AgeCategory {
  id: string;
  name: string;
  slug: string;
  minAge?: number | null;
  maxAge?: number | null;
  order: number;
  sportId: string;
  sport?: Sport;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: number; // en minutes

  // Nouvelles relations de catégories et sport
  categoryId?: string | null;
  categoryRef?: ExerciseCategory | null;
  ageCategoryId?: string | null;
  ageCategoryRef?: AgeCategory | null;
  sportId?: string | null;
  sportRef?: Sport | null;

  // Anciens champs pour rétrocompatibilité
  category: string;
  ageCategory: string;
  sport: string;
  instructions: string[]; // JSON array from Prisma
  fieldData?: any; // JSON field from Prisma
  createdById: string; // Field name from Prisma
  clubId?: string | null;
  isPublic: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  // Propriétés additionnelles du schema Prisma
  level?: string | null;
  intensity?: string | null;
  playersMin?: number | null;
  playersMax?: number | null;
  notes?: string | null;
  tags?: string[]; // JSON field from Prisma
  successCriteria?: string[]; // JSON field from Prisma
  // Deprecated - use instructions instead
  steps?: string[];
  material?: string;
  playerCount?: number;
  objectives?: string[];
  // Alias pour compatibilité
  createdBy?: string; // Alias for createdById
}

export interface FieldData {
  points: Point[];
  arrows: Arrow[];
  annotations: Annotation[];
  fieldType: 'volleyball' | 'basketball' | 'football' | 'tennis';
}

export interface Point {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  label?: string;
  type?: 'player' | 'opponent' | 'coach' | 'ball';
}

export interface Arrow {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  width: number;
  style?: 'solid' | 'dashed' | 'dotted';
  label?: string;
  actionType?: 'pass' | 'shot' | 'movement' | 'dribble' | 'defense'; // Type d'action pour styles visuels différenciés
  isCurved?: boolean; // Si la flèche utilise une courbe Bézier
  controlX?: number; // Point de contrôle X pour courbe Bézier
  controlY?: number; // Point de contrôle Y pour courbe Bézier
}

export interface Annotation {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  width?: number;
  height?: number;
  type?: 'text' | 'zone';
}

export interface Session {
  id: string;
  name: string;
  description?: string | null;
  date: Date | string;
  duration: number; // en minutes
  exercises: string[]; // exercise IDs via SessionExercise relation
  objectives?: any; // JSON field from Prisma
  createdById: string; // Field name from Prisma
  clubId?: string | null;
  sport?: string | null;
  ageCategory?: string | null;
  level?: string | null; // niveau de difficulté (débutant, intermédiaire, confirmé)
  status: SessionStatus;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  // Champs pour le système de draft
  originalId?: string; // ID de la session originale lors d'un draft de modification
  // Alias pour compatibilité
  createdBy?: string; // Alias for createdById
}

export interface Invitation {
  id: string;
  email: string;
  role: Role;
  status: InvitationStatus;
  clubId: string;
  club?: Club; // Populated from relation
  invitedById: string; // Field name from Prisma
  invitedBy?: User; // Populated from relation
  createdAt: Date | string;
  expiresAt: Date | string;
  // Computed/display fields
  clubName?: string;
  invitedByName?: string;
}

export type NavigationPage = 'home' | 'sessions' | 'exercises' | 'history' | 'profile' | 'session-detail' | 'exercise-detail' | 'session-create' | 'exercise-create';

export interface AppState {
  currentUser?: User;
  currentClub?: Club;
  currentPage: NavigationPage;
  selectedSessionId?: string; // Pour la vue détaillée de séance
  selectedExerciseId?: string; // Pour la vue détaillée d'exercice
  previousPage?: NavigationPage; // Pour gérer le retour
  isAuthenticated: boolean;
}