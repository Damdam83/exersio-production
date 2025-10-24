import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Users, 
  Radio, 
  BarChart3,
  Bell,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';
import { MobileHeader } from './MobileHeader';
import { useIsMobile } from '../hooks/useIsMobile';
import { api } from '../services/api';

interface AdminNotificationsPageProps {
  onBack: () => void;
}

interface NotificationStats {
  total: number;
  unread: number;
  byType: {
    session_reminder?: number;
    exercise_added_to_club?: number;
    member_joined_club?: number;
    system_notification?: number;
  };
  last24Hours: number;
}

interface RecentNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const AdminNotificationsPage: React.FC<AdminNotificationsPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'send' | 'stats' | 'recent'>('send');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [recentNotifications, setRecentNotifications] = useState<RecentNotification[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const isMobile = useIsMobile();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'system_notification' as const,
    recipientType: 'broadcast' as 'broadcast' | 'club' | 'users',
    clubId: '',
    selectedUsers: [] as string[]
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Charger les clubs et utilisateurs pour les formulaires
      const [clubsRes, usersRes] = await Promise.all([
        api.get('/clubs'),
        api.get('/users')
      ]);
      
      if (clubsRes.data.success) setClubs(clubsRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/notifications/admin/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRecentNotifications = async () => {
    try {
      const response = await api.get('/notifications/admin/recent');
      if (response.data.success) {
        setRecentNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Error loading recent notifications:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'stats' && !stats) {
      loadStats();
    }
    if (activeTab === 'recent' && recentNotifications.length === 0) {
      loadRecentNotifications();
    }
  }, [activeTab]);

  const handleSendNotification = async () => {
    if (!formData.title || !formData.message) {
      setFeedback({ type: 'error', message: 'Titre et message requis' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const payload: any = {
        title: formData.title,
        message: formData.message,
        type: formData.type
      };

      if (formData.recipientType === 'club' && formData.clubId) {
        payload.clubId = formData.clubId;
      } else if (formData.recipientType === 'users' && formData.selectedUsers.length > 0) {
        payload.recipientIds = formData.selectedUsers;
      }

      const response = await api.post('/notifications/admin/send-notification', payload);
      
      if (response.data.success) {
        setFeedback({ type: 'success', message: 'Notification envoyée avec succès!' });
        setFormData({
          title: '',
          message: '',
          type: 'system_notification',
          recipientType: 'broadcast',
          clubId: '',
          selectedUsers: []
        });
      } else {
        setFeedback({ type: 'error', message: response.data.message || 'Erreur lors de l\'envoi' });
      }
    } catch (error: any) {
      setFeedback({ 
        type: 'error', 
        message: error.response?.data?.message || 'Erreur de connexion' 
      });
    } finally {
      setLoading(false);
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'session_reminder': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'exercise_added_to_club': return <Users className="w-4 h-4 text-green-500" />;
      case 'member_joined_club': return <User className="w-4 h-4 text-purple-500" />;
      case 'system_notification': return <Bell className="w-4 h-4 text-orange-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? '' : 'max-w-6xl mx-auto'}`}>
      {isMobile ? (
        <MobileHeader
          title="Admin Notifications"
          onBack={onBack}
        />
      ) : (
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">Administration des Notifications</h1>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex space-x-8 px-4">
          {[
            { id: 'send', label: 'Envoyer', icon: Send },
            { id: 'stats', label: 'Statistiques', icon: BarChart3 },
            { id: 'recent', label: 'Récentes', icon: Clock }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {/* Onglet Envoyer */}
        {activeTab === 'send' && (
          <div className="space-y-6">
            {feedback && (
              <div className={`p-4 rounded-lg flex items-center space-x-2 ${
                feedback.type === 'success' 
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {feedback.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Send className="w-5 h-5 mr-2" />
                Nouvelle notification
              </h2>

              <div className="space-y-4">
                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Titre de la notification"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contenu de la notification"
                  />
                </div>

                {/* Destinataires */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destinataires
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="recipientType"
                        value="broadcast"
                        checked={formData.recipientType === 'broadcast'}
                        onChange={(e) => setFormData(prev => ({ ...prev, recipientType: e.target.value as any }))}
                        className="mr-2"
                      />
                      <Radio className="w-4 h-4 mr-2" />
                      Tous les utilisateurs
                    </label>

                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="recipientType"
                        value="club"
                        checked={formData.recipientType === 'club'}
                        onChange={(e) => setFormData(prev => ({ ...prev, recipientType: e.target.value as any }))}
                        className="mr-2"
                      />
                      <Users className="w-4 h-4 mr-2" />
                      Membres d'un club
                    </label>

                    {formData.recipientType === 'club' && (
                      <select
                        value={formData.clubId}
                        onChange={(e) => setFormData(prev => ({ ...prev, clubId: e.target.value }))}
                        className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner un club</option>
                        {clubs.map(club => (
                          <option key={club.id} value={club.id}>{club.name}</option>
                        ))}
                      </select>
                    )}

                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="recipientType"
                        value="users"
                        checked={formData.recipientType === 'users'}
                        onChange={(e) => setFormData(prev => ({ ...prev, recipientType: e.target.value as any }))}
                        className="mr-2"
                      />
                      <User className="w-4 h-4 mr-2" />
                      Utilisateurs spécifiques
                    </label>
                  </div>
                </div>

                {/* Bouton d'envoi */}
                <div className="pt-4">
                  <button
                    onClick={handleSendNotification}
                    disabled={loading || !formData.title || !formData.message}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>{loading ? 'Envoi...' : 'Envoyer la notification'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Statistiques */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {stats ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <Bell className="w-8 h-8 text-blue-500 mr-3" />
                      <div>
                        <p className="text-2xl font-bold">{stats.total}</p>
                        <p className="text-sm text-gray-600">Total</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
                      <div>
                        <p className="text-2xl font-bold">{stats.unread}</p>
                        <p className="text-sm text-gray-600">Non lues</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <Activity className="w-8 h-8 text-green-500 mr-3" />
                      <div>
                        <p className="text-2xl font-bold">{stats.last24Hours}</p>
                        <p className="text-sm text-gray-600">24h</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <Calendar className="w-8 h-8 text-orange-500 mr-3" />
                      <div>
                        <p className="text-2xl font-bold">{stats.byType.session_reminder || 0}</p>
                        <p className="text-sm text-gray-600">Rappels</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Par type</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Rappels de séances</span>
                      <span className="font-semibold">{stats.byType.session_reminder || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nouveaux exercices</span>
                      <span className="font-semibold">{stats.byType.exercise_added_to_club || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nouveaux membres</span>
                      <span className="font-semibold">{stats.byType.member_joined_club || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Notifications système</span>
                      <span className="font-semibold">{stats.byType.system_notification || 0}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            )}
          </div>
        )}

        {/* Onglet Récentes */}
        {activeTab === 'recent' && (
          <div className="space-y-4">
            {recentNotifications.length > 0 ? (
              recentNotifications.map(notification => (
                <div key={notification.id} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 pt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          notification.isRead 
                            ? 'bg-gray-100 text-gray-600' 
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {notification.isRead ? 'Lue' : 'Non lue'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Pour: {notification.user.name}</span>
                        <span>{formatTime(notification.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune notification récente</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};