import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomLoggerService } from '../../common/logger/logger.service';
import { 
  CreateNotificationDto, 
  RegisterPushTokenDto, 
  UpdateNotificationSettingsDto,
  NotificationQueryDto 
} from './dto/notification.dto';
import { NotificationType, Prisma } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private logger: CustomLoggerService
  ) {}

  // ===== GESTION DES NOTIFICATIONS =====
  
  async createNotification(dto: CreateNotificationDto) {
    this.logger.log(`Creating notification for user ${dto.userId}: ${dto.type}`, 'NotificationsService');
    
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        data: dto.data || {},
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return notification;
  }

  async getUserNotifications(userId: string, query: NotificationQueryDto) {
    const whereClause: Prisma.NotificationWhereInput = {
      userId,
      ...(query.unreadOnly && { isRead: false }),
      ...(query.type && { type: query.type }),
    };

    const [notifications, totalCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.notification.count({ where: whereClause })
    ]);

    return {
      notifications,
      totalCount,
      unreadCount: await this.prisma.notification.count({
        where: { userId, isRead: false }
      })
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId }
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    this.logger.log(`Marked ${result.count} notifications as read for user ${userId}`, 'NotificationsService');
    return result;
  }

  // ===== GESTION DES PUSH TOKENS =====

  async registerPushToken(userId: string, dto: RegisterPushTokenDto) {
    this.logger.log(`Registering push token for user ${userId} on ${dto.platform}`, 'NotificationsService');
    
    // Désactiver les anciens tokens pour cette plateforme
    await this.prisma.userPushToken.updateMany({
      where: { userId, platform: dto.platform },
      data: { isActive: false }
    });

    // Créer ou réactiver le token
    const token = await this.prisma.userPushToken.upsert({
      where: {
        userId_platform: {
          userId,
          platform: dto.platform
        }
      },
      create: {
        userId,
        token: dto.token,
        platform: dto.platform,
        isActive: true
      },
      update: {
        token: dto.token,
        isActive: true,
        updatedAt: new Date()
      }
    });

    return token;
  }

  async getUserPushTokens(userId: string) {
    return await this.prisma.userPushToken.findMany({
      where: { userId, isActive: true }
    });
  }

  // ===== PARAMÈTRES NOTIFICATIONS =====

  async getUserNotificationSettings(userId: string) {
    let settings = await this.prisma.userNotificationSettings.findUnique({
      where: { userId }
    });

    // Créer les paramètres par défaut s'ils n'existent pas
    if (!settings) {
      settings = await this.prisma.userNotificationSettings.create({
        data: { userId }
      });
    }

    return settings;
  }

  async updateNotificationSettings(userId: string, dto: UpdateNotificationSettingsDto) {
    const settings = await this.prisma.userNotificationSettings.upsert({
      where: { userId },
      create: {
        userId,
        ...dto
      },
      update: dto
    });

    this.logger.log(`Updated notification settings for user ${userId}`, 'NotificationsService');
    return settings;
  }

  // ===== NOTIFICATIONS SPÉCIFIQUES =====

  async createSessionReminderNotification(sessionId: string, hoursBeforeSession: number) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        createdBy: true,
        club: {
          include: {
            users: {
              include: {
                notificationSettings: true
              }
            }
          }
        }
      }
    });

    if (!session) {
      this.logger.warn(`Session ${sessionId} not found for reminder`, 'NotificationsService');
      return;
    }

    const notifications = [];
    const targetUsers = session.club ? session.club.users : [session.createdBy];

    for (const user of targetUsers) {
      // Récupérer les paramètres de l'utilisateur  
      const userSettings = await this.getUserNotificationSettings(user.id);
      const settings = userSettings || { sessionReminders: true, reminderHours: 24 };
      
      if (settings.sessionReminders && hoursBeforeSession <= settings.reminderHours) {
        const notification = await this.createNotification({
          userId: user.id,
          type: NotificationType.session_reminder,
          title: `📅 Rappel séance: ${session.name}`,
          message: `Votre séance "${session.name}" commence dans ${hoursBeforeSession}h`,
          data: {
            sessionId: session.id,
            sessionName: session.name,
            sessionDate: session.date.toISOString(),
            hoursBeforeSession
          }
        });

        notifications.push(notification);
      }
    }

    this.logger.log(`Created ${notifications.length} session reminder notifications for session ${sessionId}`, 'NotificationsService');
    return notifications;
  }

  async createExerciseAddedNotification(exerciseId: string, clubId?: string) {
    if (!clubId) {
      this.logger.log(`Exercise ${exerciseId} has no club, no notifications to send`, 'NotificationsService');
      return [];
    }

    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        createdBy: true,
        club: {
          include: {
            users: {
              include: {
                notificationSettings: true
              }
            }
          }
        }
      }
    });

    if (!exercise || !exercise.club) {
      this.logger.warn(`Exercise ${exerciseId} or club not found for notification`, 'NotificationsService');
      return [];
    }

    const notifications = [];
    const clubMembers = exercise.club.users.filter((user: any) => user.id !== exercise.createdById);

    for (const member of clubMembers) {
      // Récupérer les paramètres de l'utilisateur
      const userSettings = await this.getUserNotificationSettings(member.id);
      const settings = userSettings || { exerciseNotifications: true };

      if (settings.exerciseNotifications) {
        const notification = await this.createNotification({
          userId: member.id,
          type: NotificationType.exercise_added_to_club,
          title: `💪 Nouvel exercice: ${exercise.name}`,
          message: `${exercise.createdBy.name} a ajouté "${exercise.name}" au club ${exercise.club.name}`,
          data: {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            clubId: exercise.club.id,
            clubName: exercise.club.name,
            creatorName: exercise.createdBy.name
          }
        });

        notifications.push(notification);
      }
    }

    this.logger.log(`Created ${notifications.length} exercise notifications for exercise ${exerciseId}`, 'NotificationsService');
    return notifications;
  }

  async createMemberJoinedNotification(userId: string, clubId: string) {
    this.logger.log(`Creating member joined notification for user ${userId} joining club ${clubId}`, 'NotificationsService');

    const [newMember, club] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true }
      }),
      this.prisma.club.findUnique({
        where: { id: clubId },
        include: {
          users: {
            include: {
              notificationSettings: true
            }
          }
        }
      })
    ]);

    if (!newMember || !club) {
      this.logger.warn(`User ${userId} or club ${clubId} not found for member joined notification`, 'NotificationsService');
      return [];
    }

    const notifications = [];
    // Notifier tous les membres existants (sauf le nouveau membre)
    const existingMembers = club.users.filter((user: any) => user.id !== userId);

    for (const member of existingMembers) {
      // Récupérer les paramètres de l'utilisateur
      const userSettings = await this.getUserNotificationSettings(member.id);
      const settings = userSettings || { systemNotifications: true };

      if (settings.systemNotifications) {
        const notification = await this.createNotification({
          userId: member.id,
          type: NotificationType.member_joined_club,
          title: `👋 Nouveau membre: ${newMember.name}`,
          message: `${newMember.name} a rejoint le club ${club.name}`,
          data: {
            userId: newMember.id,
            userName: newMember.name,
            clubId: club.id,
            clubName: club.name
          }
        });

        notifications.push(notification);
      }
    }

    this.logger.log(`Created ${notifications.length} member joined notifications for club ${clubId}`, 'NotificationsService');
    return notifications;
  }

  // ===== MÉTHODES ADMIN =====

  async createNotificationForClubMembers(
    clubId: string,
    type: NotificationType,
    title: string,
    message: string
  ): Promise<void> {
    try {
      // Récupérer tous les membres du club
      const clubMembers = await this.prisma.user.findMany({
        where: { clubId: clubId }
      });

      // Créer une notification pour chaque membre
      for (const member of clubMembers) {
        await this.createNotification({
          userId: member.id,
          type,
          title,
          message,
        });
      }

      this.logger.log(`Created notifications for ${clubMembers.length} club members`, 'NotificationsService');
    } catch (error) {
      this.logger.error(`Failed to create club notifications: ${error instanceof Error ? error.message : 'Unknown error'}`, 'NotificationsService');
      throw error;
    }
  }

  async createBroadcastNotification(
    type: NotificationType,
    title: string,
    message: string
  ): Promise<void> {
    try {
      // Récupérer tous les utilisateurs actifs
      const users = await this.prisma.user.findMany();

      // Créer une notification pour chaque utilisateur
      for (const user of users) {
        await this.createNotification({
          userId: user.id,
          type,
          title,
          message,
        });
      }

      this.logger.log(`Created broadcast notifications for ${users.length} users`, 'NotificationsService');
    } catch (error) {
      this.logger.error(`Failed to create broadcast notifications: ${error instanceof Error ? error.message : 'Unknown error'}`, 'NotificationsService');
      throw error;
    }
  }

  async getNotificationStats(): Promise<any> {
    try {
      const [
        totalNotifications,
        unreadNotifications,
        notificationsByType,
        recentActivity
      ] = await Promise.all([
        this.prisma.notification.count(),
        this.prisma.notification.count({ where: { isRead: false } }),
        this.prisma.notification.groupBy({
          by: ['type'],
          _count: { id: true }
        }),
        this.prisma.notification.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Dernières 24h
            }
          }
        })
      ]);

      return {
        total: totalNotifications,
        unread: unreadNotifications,
        byType: notificationsByType.reduce((acc, item) => {
          acc[item.type] = item._count.id;
          return acc;
        }, {} as Record<string, number>),
        last24Hours: recentActivity
      };
    } catch (error) {
      this.logger.error(`Failed to get notification stats: ${error instanceof Error ? error.message : 'Unknown error'}`, 'NotificationsService');
      throw error;
    }
  }

  async getRecentNotifications(limit: number = 50, offset: number = 0): Promise<{ notifications: any[], total: number }> {
    try {
      const [notifications, total] = await Promise.all([
        this.prisma.notification.findMany({
          take: limit,
          skip: offset,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }),
        this.prisma.notification.count()
      ]);

      return { notifications, total };
    } catch (error) {
      this.logger.error(`Failed to get recent notifications: ${error instanceof Error ? error.message : 'Unknown error'}`, 'NotificationsService');
      throw error;
    }
  }
}