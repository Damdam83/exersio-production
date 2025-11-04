import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CustomLoggerService } from '../../common/logger/logger.service';

@Injectable()
export class InvitationsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private logger: CustomLoggerService
  ) {}

  async list(query: any, page = 1, limit = 10, userEmail?: string) {
    const where: any = {};
    if (query.clubId) where.clubId = String(query.clubId);

    // IMPORTANT: Filtrer uniquement les invitations pour l'email de l'utilisateur connecté
    if (userEmail) {
      where.email = userEmail;
    }

    const skip = (page - 1) * limit;
    const [total, items] = await Promise.all([
      this.prisma.invitation.count({ where }),
      this.prisma.invitation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { club: true, invitedBy: true },
      }),
    ]);
    const data = items.map((i) => ({
      id: i.id,
      clubId: i.clubId,
      clubName: i.club.name,
      invitedBy: i.invitedById,
      invitedByName: i.invitedBy.name,
      email: i.email,
      role: i.role,
      status: i.status,
      createdAt: i.createdAt,
      expiresAt: i.expiresAt,
    }));
    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
    return { success: true, data, pagination };
  }

  async create(userId: string, data: any) {
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    return this.prisma.invitation.create({
      data: { ...data, invitedById: userId, expiresAt },
    });
  }

  async updateStatus(id: string, status: 'pending' | 'accepted' | 'declined', userEmail?: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id },
      include: { club: true }
    });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    // Mettre à jour le statut de l'invitation
    const updatedInvitation = await this.prisma.invitation.update({
      where: { id },
      data: { status }
    });

    // Si l'invitation est acceptée, ajouter l'utilisateur au club
    if (status === 'accepted' && userEmail) {
      this.logger.log(`Invitation accepted for ${userEmail} to join club ${invitation.clubId}`, 'InvitationsService');

      // Trouver l'utilisateur par email
      const user = await this.prisma.user.findUnique({
        where: { email: userEmail }
      });

      if (user) {
        // Créer la notification "nouveau membre" AVANT d'ajouter l'utilisateur
        // Cela permet de récupérer les membres existants sans inclure le nouveau
        await this.notificationsService.createMemberJoinedNotification(user.id, invitation.clubId);

        // Ajouter l'utilisateur au club APRÈS avoir créé les notifications
        await this.prisma.user.update({
          where: { id: user.id },
          data: { clubId: invitation.clubId }
        });

        this.logger.log(`User ${user.id} added to club ${invitation.clubId}`, 'InvitationsService');
      } else {
        this.logger.warn(`User with email ${userEmail} not found`, 'InvitationsService');
      }
    }

    return updatedInvitation;
  }
}
