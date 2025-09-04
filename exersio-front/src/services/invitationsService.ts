import { api, paginatedRequest, type PaginatedResponse } from './api';
import type { Invitation, InvitationStatus, Role } from '../types';

export interface CreateInvitationData {
  email: string;
  role: Role;
  clubId: string;
}

export interface UpdateInvitationStatusData {
  status: InvitationStatus;
}

export interface InvitationFilters {
  email?: string;
  status?: InvitationStatus;
  role?: Role;
  clubId?: string;
  invitedById?: string;
}

export class InvitationsService {
  
  /**
   * Lister les invitations avec pagination et filtres
   */
  async list(
    page: number = 1,
    limit: number = 10,
    filters: InvitationFilters = {}
  ): Promise<PaginatedResponse<Invitation>> {
    try {
      return await paginatedRequest<Invitation>('/invitations', page, limit, filters);
    } catch (error) {
      console.error('List invitations error:', error);
      throw error;
    }
  }

  /**
   * Créer une nouvelle invitation
   */
  async create(data: CreateInvitationData): Promise<Invitation> {
    try {
      return await api.post<Invitation>('/invitations', data);
    } catch (error) {
      console.error('Create invitation error:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le statut d'une invitation
   */
  async updateStatus(id: string, status: InvitationStatus): Promise<Invitation> {
    try {
      return await api.patch<Invitation>(`/invitations/${id}/status`, { status });
    } catch (error) {
      console.error('Update invitation status error:', error);
      throw error;
    }
  }

  /**
   * Répondre à une invitation
   */
  async respond(id: string, data: UpdateInvitationStatusData): Promise<Invitation> {
    try {
      return await api.patch<Invitation>(`/invitations/${id}/respond`, data);
    } catch (error) {
      console.error('Respond to invitation error:', error);
      throw error;
    }
  }

  /**
   * Accepter une invitation
   */
  async accept(id: string): Promise<Invitation> {
    try {
      return await this.updateStatus(id, 'accepted');
    } catch (error) {
      console.error('Accept invitation error:', error);
      throw error;
    }
  }

  /**
   * Refuser une invitation
   */
  async decline(id: string): Promise<Invitation> {
    try {
      return await this.updateStatus(id, 'declined');
    } catch (error) {
      console.error('Decline invitation error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les invitations en attente
   */
  async getPending(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Invitation>> {
    try {
      return await this.list(page, limit, { status: 'pending' });
    } catch (error) {
      console.error('Get pending invitations error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les invitations acceptées
   */
  async getAccepted(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Invitation>> {
    try {
      return await this.list(page, limit, { status: 'accepted' });
    } catch (error) {
      console.error('Get accepted invitations error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les invitations refusées
   */
  async getDeclined(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Invitation>> {
    try {
      return await this.list(page, limit, { status: 'declined' });
    } catch (error) {
      console.error('Get declined invitations error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les invitations expirées
   */
  async getExpired(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Invitation>> {
    try {
      return await this.list(page, limit, { status: 'expired' });
    } catch (error) {
      console.error('Get expired invitations error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les invitations d'un club
   */
  async getByClub(
    clubId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Invitation>> {
    try {
      return await this.list(page, limit, { clubId });
    } catch (error) {
      console.error('Get club invitations error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les invitations envoyées par un utilisateur
   */
  async getBySender(
    invitedById: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Invitation>> {
    try {
      return await this.list(page, limit, { invitedById });
    } catch (error) {
      console.error('Get invitations by sender error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les invitations par email
   */
  async getByEmail(
    email: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Invitation>> {
    try {
      return await this.list(page, limit, { email });
    } catch (error) {
      console.error('Get invitations by email error:', error);
      throw error;
    }
  }

  /**
   * Récupérer les invitations par rôle
   */
  async getByRole(
    role: Role,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Invitation>> {
    try {
      return await this.list(page, limit, { role });
    } catch (error) {
      console.error('Get invitations by role error:', error);
      throw error;
    }
  }

  /**
   * Inviter un utilisateur dans un club
   */
  async inviteToClub(clubId: string, email: string, role: Role = 'coach'): Promise<Invitation> {
    try {
      return await this.create({ email, role, clubId });
    } catch (error) {
      console.error('Invite to club error:', error);
      throw error;
    }
  }

  /**
   * Inviter plusieurs utilisateurs dans un club
   */
  async inviteMultipleToClub(
    clubId: string,
    invitations: Array<{ email: string; role: Role }>
  ): Promise<Invitation[]> {
    try {
      const promises = invitations.map(({ email, role }) =>
        this.create({ email, role, clubId })
      );
      return await Promise.all(promises);
    } catch (error) {
      console.error('Invite multiple to club error:', error);
      throw error;
    }
  }
}

// Instance singleton
export const invitationsService = new InvitationsService();
export default invitationsService;