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
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [clubs, setClubs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const isMobile = useIsMobile();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      // api.get() retourne DIRECTEMENT les données (pas { data: ... })
      // car apiRequest() fait déjà response.json().data
      const [clubsData, usersData] = await Promise.all([
        api.get<any[]>('/clubs'),
        api.get<any[]>('/users')
      ]);

      console.log('📊 Clubs received:', clubsData);
      console.log('👥 Users received:', usersData);

      setClubs(Array.isArray(clubsData) ? clubsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
    }
  };

  const loadStats = async () => {
    try {
      // api.get() retourne directement les données
      const statsData = await api.get<NotificationStats>('/notifications/admin/stats');
      console.log('📊 Stats received:', statsData);
      setStats(statsData);
    } catch (error: any) {
      console.error('❌ Error loading stats:', error);
    }
  };

  const loadRecentNotifications = async (page: number = currentPage) => {
    try {
      const offset = (page - 1) * itemsPerPage;
      // api.getRaw() retourne la réponse complète { success, data, total }
      const response = await api.getRaw<any>('/notifications/admin/recent', {
        limit: itemsPerPage,
        offset: offset
      });
      console.log('📬 Recent notifications response (page', page, '):', response);

      // Backend retourne { success: true, data: [...], total: 52 }
      // api.getRaw() retourne la structure complète avec total
      const notifications = response?.data || [];
      const total = (response as any)?.total || 0;

      console.log('✅ Parsed:', { notificationsCount: notifications.length, total });

      setRecentNotifications(Array.isArray(notifications) ? notifications : []);
      setTotalNotifications(total);
    } catch (error: any) {
      console.error('❌ Error loading recent notifications:', error);
      setRecentNotifications([]);
      setTotalNotifications(0);
    }
  };

  useEffect(() => {
    // Reset pagination when switching tabs
    setCurrentPage(1);

    if (activeTab === 'stats' && !stats) {
      loadStats();
    }
    if (activeTab === 'recent') {
      loadRecentNotifications(1);
    }
  }, [activeTab]);

  // Recharger quand la page change
  useEffect(() => {
    if (activeTab === 'recent') {
      loadRecentNotifications(currentPage);
    }
  }, [currentPage]);

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

      // api.post returns data directly (not wrapped in .data), and 201 is success
      if (response?.success || response?.success === undefined) {
        setFeedback({ type: 'success', message: 'Notification envoyée avec succès!' });
        setFormData({
          title: '',
          message: '',
          type: 'system_notification',
          recipientType: 'broadcast',
          clubId: '',
          selectedUsers: []
        });
        // Recharger les stats et notifications récentes
        loadStats();
        if (activeTab === 'recent') {
          loadRecentNotifications(currentPage);
        }
      } else {
        setFeedback({ type: 'error', message: response?.message || 'Erreur lors de l\'envoi' });
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
    <div className={`min-h-screen bg-[#0f172a] ${isMobile ? '' : 'max-w-6xl mx-auto'}`}>
      {isMobile ? (
        <MobileHeader
          title="Admin Notifications"
          onBack={onBack}
        />
      ) : (
        <div className="bg-[#1e293b] shadow-sm border-b border-slate-700 px-6 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-700 rounded-full transition-colors text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-white">Administration des Notifications</h1>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-[#1e293b] border-b border-slate-700">
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
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
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

            <div className="bg-[#1e293b] rounded-lg p-6 shadow-lg border border-slate-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-white">
                <Send className="w-5 h-5 mr-2" />
                Nouvelle notification
              </h2>

              <div className="space-y-4">
                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                    placeholder="Titre de la notification"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                    placeholder="Contenu de la notification"
                  />
                </div>

                {/* Destinataires */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Destinataires
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center text-slate-200 cursor-pointer hover:text-white transition-colors">
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

                    <label className="flex items-center text-slate-200 cursor-pointer hover:text-white transition-colors">
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
                        className="w-full mt-2 px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner un club</option>
                        {clubs.map(club => (
                          <option key={club.id} value={club.id}>{club.name}</option>
                        ))}
                      </select>
                    )}

                    <label className="flex items-center text-slate-200 cursor-pointer hover:text-white transition-colors">
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

                    {formData.recipientType === 'users' && (
                      <div className="mt-2 max-h-48 overflow-y-auto border border-slate-600 rounded-md bg-slate-700 p-2">
                        {users.length > 0 ? (
                          users.map(user => (
                            <label key={user.id} className="flex items-center text-slate-200 hover:bg-slate-600 px-2 py-1 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.selectedUsers.includes(user.id)}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setFormData(prev => ({
                                    ...prev,
                                    selectedUsers: checked
                                      ? [...prev.selectedUsers, user.id]
                                      : prev.selectedUsers.filter(id => id !== user.id)
                                  }));
                                }}
                                className="mr-2"
                              />
                              <span className="flex-1">{user.name}</span>
                              <span className="text-xs text-slate-400 ml-2">{user.email}</span>
                            </label>
                          ))
                        ) : (
                          <p className="text-slate-400 text-sm text-center py-4">Aucun utilisateur disponible</p>
                        )}
                      </div>
                    )}
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
                  <div className="bg-[#1e293b] border border-slate-700 p-4 rounded-lg shadow-lg">
                    <div className="flex items-center">
                      <Bell className="w-8 h-8 text-blue-400 mr-3" />
                      <div>
                        <p className="text-2xl font-bold text-white">{stats.total}</p>
                        <p className="text-sm text-slate-400">Total</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1e293b] border border-slate-700 p-4 rounded-lg shadow-lg">
                    <div className="flex items-center">
                      <AlertCircle className="w-8 h-8 text-red-400 mr-3" />
                      <div>
                        <p className="text-2xl font-bold text-white">{stats.unread}</p>
                        <p className="text-sm text-slate-400">Non lues</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1e293b] border border-slate-700 p-4 rounded-lg shadow-lg">
                    <div className="flex items-center">
                      <Activity className="w-8 h-8 text-green-400 mr-3" />
                      <div>
                        <p className="text-2xl font-bold text-white">{stats.last24Hours}</p>
                        <p className="text-sm text-slate-400">24h</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1e293b] border border-slate-700 p-4 rounded-lg shadow-lg">
                    <div className="flex items-center">
                      <Calendar className="w-8 h-8 text-orange-400 mr-3" />
                      <div>
                        <p className="text-2xl font-bold text-white">{stats.byType.session_reminder || 0}</p>
                        <p className="text-sm text-slate-400">Rappels</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1e293b] border border-slate-700 p-6 rounded-lg shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 text-white">Par type</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-slate-200">
                      <span>Rappels de séances</span>
                      <span className="font-semibold text-white">{stats.byType.session_reminder || 0}</span>
                    </div>
                    <div className="flex justify-between text-slate-200">
                      <span>Nouveaux exercices</span>
                      <span className="font-semibold text-white">{stats.byType.exercise_added_to_club || 0}</span>
                    </div>
                    <div className="flex justify-between text-slate-200">
                      <span>Nouveaux membres</span>
                      <span className="font-semibold text-white">{stats.byType.member_joined_club || 0}</span>
                    </div>
                    <div className="flex justify-between text-slate-200">
                      <span>Notifications système</span>
                      <span className="font-semibold text-white">{stats.byType.system_notification || 0}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
              </div>
            )}
          </div>
        )}

        {/* Onglet Récentes */}
        {activeTab === 'recent' && (
          <div className="space-y-4">
            {recentNotifications.length > 0 ? (
              <>
                {/* Liste paginée - pas de slice car le backend fait déjà la pagination */}
                {recentNotifications.map(notification => (
                    <div key={notification.id} className="bg-[#1e293b] border border-slate-700 rounded-lg p-4 shadow-lg">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 pt-1">
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-white truncate">
                              {notification.title}
                            </h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              notification.isRead
                                ? 'bg-slate-700 text-slate-300'
                                : 'bg-blue-600/30 text-blue-300'
                            }`}>
                              {notification.isRead ? 'Lue' : 'Non lue'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 mb-2">{notification.message}</p>
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Pour: {notification.user.name}</span>
                            <span>{formatTime(notification.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Pagination - Afficher toujours si on a des notifications */}
                {recentNotifications.length > 0 && (
                  <div className="flex items-center justify-between bg-[#1e293b] border border-slate-700 rounded-lg p-4">
                    <div className="text-sm text-slate-400">
                      Affichage {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, totalNotifications)} sur {totalNotifications} notifications
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-slate-700 text-white rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Précédent
                      </button>
                      <span className="text-slate-300 px-3">
                        Page {currentPage} / {Math.ceil(totalNotifications / itemsPerPage) || 1}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalNotifications / itemsPerPage) || 1, prev + 1))}
                        disabled={currentPage >= (Math.ceil(totalNotifications / itemsPerPage) || 1)}
                        className="px-3 py-1 bg-slate-700 text-white rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Suivant
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-8 text-slate-400">
                <Bell className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <p>Aucune notification récente</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};