import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from './notifications.service';
import { PushNotificationService } from './push-notification.service';
import { CustomLoggerService } from '../../common/logger/logger.service';

@Injectable()
export class NotificationSchedulerService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private pushService: PushNotificationService,
    private logger: CustomLoggerService
  ) {}

  // Exécute toutes les 30 minutes pour vérifier les rappels de séances
  @Cron(CronExpression.EVERY_30_MINUTES)
  async checkSessionReminders() {
    this.logger.log('Checking for session reminders...', 'NotificationScheduler');
    
    const now = new Date();
    const in24Hours = new Date(now.getTime() + (24 * 60 * 60 * 1000));

    try {
      // Trouver les séances dans les prochaines 24h qui n'ont pas encore de rappel
      const upcomingSessions = await this.prisma.session.findMany({
        where: {
          date: {
            gte: now,
            lte: in24Hours
          },
          status: 'planned'
        },
        include: {
          createdBy: true,
          club: {
            include: {
              users: true
            }
          }
        }
      });

      let remindersCreated = 0;
      let pushNotificationsSent = 0;

      for (const session of upcomingSessions) {
        const sessionDate = new Date(session.date);
        const hoursUntilSession = Math.floor((sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        
        // Déterminer s'il faut envoyer un rappel
        let shouldSendReminder = false;
        let reminderType = '';

        if (hoursUntilSession <= 24) {
          shouldSendReminder = true;
          reminderType = '24 heures';
        }

        if (shouldSendReminder) {
          // Vérifier si un rappel n'a pas déjà été envoyé récemment
          const existingReminder = await this.prisma.notification.findFirst({
            where: {
              type: 'session_reminder',
              data: {
                path: ['sessionId'],
                equals: session.id
              },
              createdAt: {
                gte: new Date(now.getTime() - (2 * 60 * 60 * 1000)) // Pas de rappel dans les 2 dernières heures
              }
            }
          });

          if (!existingReminder) {
            // Créer les notifications en base
            const notifications = await this.notificationsService.createSessionReminderNotification(
              session.id, 
              Math.ceil(hoursUntilSession)
            );

            if (notifications && notifications.length > 0) {
              remindersCreated += notifications.length;

              // Envoyer les push notifications
              for (const notification of notifications) {
                const user = notification.user;
                const userTokens = await this.notificationsService.getUserPushTokens(user.id);
                
                if (userTokens.length > 0) {
                  await this.pushService.sendToUser(
                    user.id,
                    userTokens,
                    notification.title,
                    notification.message,
                    notification.data
                  );
                  
                  // Marquer la notification comme envoyée
                  await this.prisma.notification.update({
                    where: { id: notification.id },
                    data: { isSent: true, sentAt: new Date() }
                  });
                  
                  pushNotificationsSent++;
                }
              }

              this.logger.log(`Created ${notifications.length} reminders for session "${session.name}" (${reminderType} avant)`, 'NotificationScheduler');
            }
          }
        }
      }

      if (remindersCreated > 0) {
        this.logger.log(`Session reminder check completed: ${remindersCreated} notifications created, ${pushNotificationsSent} push notifications sent`, 'NotificationScheduler');
      }

    } catch (error) {
      this.logger.error('Error in session reminder scheduler', (error as Error).message || String(error), 'NotificationScheduler');
    }
  }

  // Méthode manuelle pour tester les rappels
  async triggerSessionRemindersCheck() {
    this.logger.log('Manual trigger for session reminders check', 'NotificationScheduler');
    await this.checkSessionReminders();
  }

  // Nettoyage des anciennes notifications (une fois par jour)
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupOldNotifications() {
    this.logger.log('Cleaning up old notifications...', 'NotificationScheduler');
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const deleted = await this.prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          },
          isRead: true
        }
      });

      this.logger.log(`Deleted ${deleted.count} old read notifications`, 'NotificationScheduler');
    } catch (error) {
      this.logger.error('Error cleaning up notifications', (error as Error).message || String(error), 'NotificationScheduler');
    }
  }

  // Nettoyage des tokens push inactifs
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupInactivePushTokens() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
      const deleted = await this.prisma.userPushToken.deleteMany({
        where: {
          isActive: false,
          updatedAt: {
            lt: sevenDaysAgo
          }
        }
      });

      this.logger.log(`Deleted ${deleted.count} inactive push tokens`, 'NotificationScheduler');
    } catch (error) {
      this.logger.error('Error cleaning up push tokens', (error as Error).message || String(error), 'NotificationScheduler');
    }
  }
}