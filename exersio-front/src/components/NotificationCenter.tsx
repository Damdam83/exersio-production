import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, BellOff, Check, CheckCheck, X, Settings, Clock, Users } from 'lucide-react';
import { notificationService, Notification } from '../services/notificationService';
import { useIsMobile } from '../hooks/useIsMobile';
import { useNavigation } from '../contexts/NavigationContext';
import { formatRelativeTime } from '../utils/i18nFormatters';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const isMobile = useIsMobile();
  const { setCurrentPage } = useNavigation();

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(showUnreadOnly, 50);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, showUnreadOnly]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      // L'événement est émis automatiquement dans le service
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // L'événement est émis automatiquement dans le service
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'session_reminder':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'exercise_added_to_club':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'member_joined_club':
        return <Users className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };


  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 ${isMobile ? '' : 'flex items-start justify-end p-4'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`
        relative bg-slate-800 rounded-lg shadow-xl text-white
        ${isMobile
          ? 'w-full h-full overflow-hidden'
          : 'w-96 max-h-[600px] mr-16 mt-16'
        }
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-white" />
            <h2 className="text-lg font-semibold text-white">{t('notifications.title')}</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`
                flex items-center px-3 py-1 rounded-full text-sm transition-colors
                ${showUnreadOnly
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }
              `}
            >
              {showUnreadOnly ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              <span className="ml-1">{showUnreadOnly ? t('notifications.unread') : t('notifications.all')}</span>
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-full text-sm hover:bg-green-700 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span>{t('notifications.markAllRead')}</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className={`
          overflow-y-auto
          ${isMobile ? 'flex-1' : 'max-h-96'}
        `}>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center p-8 text-gray-400">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p className="text-lg font-medium mb-2 text-gray-300">{t('notifications.noNotifications')}</p>
              <p className="text-sm">
                {showUnreadOnly ? t('notifications.allRead') : t('notifications.noNotificationsYet')}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    p-4 hover:bg-slate-700 transition-colors cursor-pointer relative
                    ${!notification.isRead ? 'bg-slate-700/50' : ''}
                  `}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 pt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-white truncate">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="ml-2 p-1 hover:bg-slate-600 rounded-full transition-colors"
                          >
                            <Check className="w-4 h-4 text-green-400" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 p-4">
          <button
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            onClick={() => {
              onClose();
              setCurrentPage('notification-settings');
            }}
          >
            <Settings className="w-4 h-4" />
            <span>{t('notifications.settings')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant Badge pour le compteur de notifications
interface NotificationBadgeProps {
  onClick: () => void;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ onClick, className = '' }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        // Mode silencieux pour éviter les popups de loading
        const data = await notificationService.getNotifications(true, 1, 0, true);
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    // Charger au montage
    loadUnreadCount();

    // S'abonner aux changements de notifications
    const unsubscribe = notificationService.onNotificationChange(() => {
      loadUnreadCount();
    });

    // Se désabonner au démontage
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <button
      onClick={onClick}
      className={`relative p-2 hover:bg-gray-100 rounded-full transition-colors ${className}`}
    >
      <Bell className="w-6 h-6 text-gray-600" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};