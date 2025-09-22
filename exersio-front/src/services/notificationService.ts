import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { api } from './api';

export interface NotificationSettings {
  sessionReminders: boolean;
  exerciseNotifications: boolean;
  systemNotifications: boolean;
  reminderHours: number;
}

export interface Notification {
  id: string;
  type: 'session_reminder' | 'exercise_added_to_club' | 'system_notification';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

class NotificationService {
  private isInitialized = false;
  private pushToken: string | null = null;

  async initialize() {
    if (this.isInitialized || !Capacitor.isNativePlatform()) {
      return;
    }

    try {
      // Demander les permissions pour les notifications locales
      const localResult = await LocalNotifications.requestPermissions();
      console.log('Local notifications permission:', localResult.display);

      // TODO: Push notifications désactivées temporairement (problème Firebase)
      console.log('Push notifications disabled - using local notifications only');

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  private setupListeners() {
    // Push notifications désactivées temporairement
    console.log('Push notifications listeners disabled');
  }

  private async registerTokenOnServer(token: string) {
    try {
      const platform = Capacitor.getPlatform();
      await api.post('/notifications/push-token', {
        token,
        platform
      });
      console.log('Push token registered on server');
    } catch (error) {
      console.error('Error registering push token:', error);
    }
  }

  private handleNotificationTap(data: any) {
    // Router vers l'écran approprié
    if (data?.sessionId) {
      // Naviguer vers le détail de la séance
      window.location.href = `/session/${data.sessionId}`;
    } else if (data?.exerciseId) {
      // Naviguer vers le détail de l'exercice
      window.location.href = `/exercise/${data.exerciseId}`;
    }
  }

  // Créer une notification locale (pour test ou backup)
  async scheduleLocalNotification(title: string, body: string, delay = 0) {
    if (!Capacitor.isNativePlatform()) {
      // Fallback pour le web
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
      }
      return;
    }

    try {
      const date = new Date();
      date.setTime(date.getTime() + delay);

      await LocalNotifications.schedule({
        notifications: [{
          title,
          body,
          id: Date.now(),
          schedule: { at: date },
          sound: 'default',
          smallIcon: 'ic_stat_icon',
          iconColor: '#00d4aa'
        }]
      });
    } catch (error) {
      console.error('Error scheduling local notification:', error);
    }
  }

  // API calls pour les notifications
  async getNotifications(unreadOnly = false, limit = 20, offset = 0, silent = false) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ...(unreadOnly && { unreadOnly: 'true' })
      });

      const response = await api.get(`/notifications?${params}`, {
        // Mode silencieux pour éviter les spinners de loading
        skipGlobalLoading: silent
      });
      return response;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { notifications: [], totalCount: 0, unreadCount: 0 };
    }
  }

  async markAsRead(notificationId: string) {
    try {
      await api.put(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async markAllAsRead() {
    try {
      await api.put('/notifications/read-all');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const response = await api.get('/notifications/settings');
      return response;
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      return {
        sessionReminders: true,
        exerciseNotifications: true,
        systemNotifications: true,
        reminderHours: 24
      };
    }
  }

  async updateNotificationSettings(settings: Partial<NotificationSettings>) {
    try {
      const response = await api.put('/notifications/settings', settings);
      return response;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  // Test notifications (pour debug)
  async testSessionReminders() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Test session reminders not available on web');
      return;
    }

    try {
      await api.post('/notifications/test-session-reminders');
      console.log('Test session reminders triggered');
    } catch (error) {
      console.error('Error testing session reminders:', error);
    }
  }

  // Vérifier le statut des permissions
  async checkPermissions() {
    if (!Capacitor.isNativePlatform()) {
      return {
        local: Notification.permission,
        push: Notification.permission
      };
    }

    const localPerms = await LocalNotifications.checkPermissions();

    return {
      local: localPerms.display,
      push: 'disabled' // Push notifications temporairement désactivées
    };
  }

  // Getter pour le token push
  getPushToken() {
    return this.pushToken;
  }
}

export const notificationService = new NotificationService();