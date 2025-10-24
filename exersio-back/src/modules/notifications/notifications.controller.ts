import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  Param,
  UseGuards,
  Request
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/auth/roles.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { NotificationsService } from './notifications.service';
import { NotificationSchedulerService } from './notification-scheduler.service';
import {
  RegisterPushTokenDto,
  UpdateNotificationSettingsDto,
  NotificationQueryDto
} from './dto/notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private notificationsService: NotificationsService,
    private schedulerService: NotificationSchedulerService
  ) {}

  // ===== GESTION DES NOTIFICATIONS =====

  @Get()
  async getUserNotifications(@Request() req: any, @Query() query: NotificationQueryDto) {
    return await this.notificationsService.getUserNotifications(req.user.userId, query);
  }

  @Put(':id/read')
  async markAsRead(@Request() req: any, @Param('id') notificationId: string) {
    return await this.notificationsService.markAsRead(req.user.userId, notificationId);
  }

  @Put('read-all')
  async markAllAsRead(@Request() req: any) {
    return await this.notificationsService.markAllAsRead(req.user.userId);
  }

  // ===== GESTION DES PUSH TOKENS =====

  @Post('push-token')
  async registerPushToken(@Request() req: any, @Body() dto: RegisterPushTokenDto) {
    return await this.notificationsService.registerPushToken(req.user.userId, dto);
  }

  @Get('push-tokens')
  async getUserPushTokens(@Request() req: any) {
    return await this.notificationsService.getUserPushTokens(req.user.userId);
  }

  // ===== PARAMÈTRES NOTIFICATIONS =====

  @Get('settings')
  async getNotificationSettings(@Request() req: any) {
    return await this.notificationsService.getUserNotificationSettings(req.user.userId);
  }

  @Put('settings')
  async updateNotificationSettings(@Request() req: any, @Body() dto: UpdateNotificationSettingsDto) {
    return await this.notificationsService.updateNotificationSettings(req.user.userId, dto);
  }

  // ===== ENDPOINTS ADMIN/DEBUG =====

  @Post('test-session-reminders')
  async testSessionReminders() {
    // Endpoint pour tester manuellement les rappels de séances
    await this.schedulerService.triggerSessionRemindersCheck();
    return { message: 'Session reminders check triggered' };
  }

  // ===== ENDPOINTS ADMIN =====

  @Post('admin/send-notification')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async sendAdminNotification(
    @Request() req: any,
    @Body() body: {
      title: string;
      message: string;
      type: 'system_notification';
      recipientIds?: string[];
      clubId?: string;
    }
  ) {
    try {
      const userId = req.user.userId;
      
      if (body.recipientIds && body.recipientIds.length > 0) {
        // Envoyer à des utilisateurs spécifiques
        for (const recipientId of body.recipientIds) {
          await this.notificationsService.createNotification({
            userId: recipientId,
            type: body.type,
            title: body.title,
            message: body.message,
          });
        }
      } else if (body.clubId) {
        // Envoyer à tous les membres du club
        await this.notificationsService.createNotificationForClubMembers(
          body.clubId,
          body.type,
          body.title,
          body.message
        );
      } else {
        // Envoyer à tous les utilisateurs (broadcast)
        await this.notificationsService.createBroadcastNotification(
          body.type,
          body.title,
          body.message
        );
      }

      return { success: true, message: 'Notification sent successfully' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Get('admin/stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getNotificationStats(@Request() req: any) {
    try {
      const stats = await this.notificationsService.getNotificationStats();
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Get('admin/recent')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getRecentNotifications(@Request() req: any) {
    try {
      const notifications = await this.notificationsService.getRecentNotifications(50);
      return { success: true, data: notifications };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}