import { api } from './api';

export interface Sport {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Récupère la liste de tous les sports disponibles
 */
export const getSports = async (): Promise<Sport[]> => {
  return api.get<Sport[]>('/sports');
};

/**
 * Récupère un sport par son slug
 */
export const getSportBySlug = async (slug: string): Promise<Sport> => {
  return api.get<Sport>(`/sports/slug/${slug}`);
};

/**
 * Récupère un sport par son ID
 */
export const getSportById = async (id: string): Promise<Sport> => {
  return api.get<Sport>(`/sports/${id}`);
};
