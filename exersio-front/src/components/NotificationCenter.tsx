import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, CheckCheck, X, Settings, Clock, Users } from 'lucide-react';
import { notificationService, Notification } from '../services/notificationService';
import { useIsMobile } from '../hooks/useIsMobile';
import { useNavigation } from '../contexts/NavigationContext';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
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
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Il y a quelques minutes';
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString();
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
        relative bg-white rounded-lg shadow-xl
        ${isMobile 
          ? 'w-full h-full overflow-hidden' 
          : 'w-96 max-h-[600px] mr-16 mt-16'
        }
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`
                px-3 py-1 rounded-full text-sm transition-colors
                ${showUnreadOnly 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {showUnreadOnly ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              <span className="ml-1">{showUnreadOnly ? 'Non lues' : 'Toutes'}</span>
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Tout lire</span>
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
            <div className="text-center p-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Aucune notification</p>
              <p className="text-sm">
                {showUnreadOnly ? 'Toutes les notifications sont lues' : 'Vous n\'avez pas encore de notifications'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    p-4 hover:bg-gray-50 transition-colors cursor-pointer relative
                    ${!notification.isRead ? 'bg-blue-50' : ''}
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
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                          >
                            <Check className="w-4 h-4 text-green-500" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {formatTime(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
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
        <div className="border-t border-gray-200 p-4">
          <button 
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            onClick={() => {
              onClose();
              setCurrentPage('notification-settings');
            }}
          >
            <Settings className="w-4 h-4" />
            <span>Paramètres des notifications</span>
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
        const data = await notificationService.getNotifications(true, 1);
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadUnreadCount();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
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