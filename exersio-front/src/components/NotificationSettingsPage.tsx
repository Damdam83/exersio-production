import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, BellOff, Clock, Users, Settings, Smartphone, Check, AlertCircle } from 'lucide-react';
import { MobileHeader } from './MobileHeader';
import { notificationService, NotificationSettings } from '../services/notificationService';
import { useIsMobile } from '../hooks/useIsMobile';

interface NotificationSettingsPageProps {
  onBack: () => void;
}

export const NotificationSettingsPage: React.FC<NotificationSettingsPageProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    sessionReminders: true,
    exerciseNotifications: true,
    systemNotifications: true,
    reminderHours: 24
  });
  const [originalSettings, setOriginalSettings] = useState<NotificationSettings>({
    sessionReminders: true,
    exerciseNotifications: true,
    systemNotifications: true,
    reminderHours: 24
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState({ local: 'prompt', push: 'prompt' });
  const [pushToken, setPushToken] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [userSettings, perms] = await Promise.all([
        notificationService.getNotificationSettings(),
        notificationService.checkPermissions()
      ]);
      
      setSettings(userSettings);
      setOriginalSettings(userSettings);
      setPermissions(perms);
      setPushToken(notificationService.getPushToken());
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const hasChanges = () => {
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  };

  const handleSave = async () => {
    if (!hasChanges()) return;

    setSaving(true);
    try {
      await notificationService.updateNotificationSettings(settings);
      setOriginalSettings({ ...settings });
    } catch (error) {
      console.error('Error saving notification settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({ ...originalSettings });
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleReminderHoursChange = (hours: number) => {
    setSettings(prev => ({
      ...prev,
      reminderHours: hours
    }));
  };

  const getPermissionStatus = (permission: string) => {
    switch (permission) {
      case 'granted': 
        return { icon: Check, color: 'text-green-500', text: 'Accordées' };
      case 'denied': 
        return { icon: AlertCircle, color: 'text-red-500', text: 'Refusées' };
      default: 
        return { icon: AlertCircle, color: 'text-yellow-500', text: 'En attente' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-900 ${isMobile ? '' : 'max-w-2xl mx-auto'}`}>
      {isMobile ? (
        <MobileHeader
          title="Paramètres notifications"
          onBack={onBack}
          actions={[
            hasChanges() && {
              icon: Check,
              onClick: handleSave,
              disabled: saving,
              className: 'text-green-600'
            }
          ].filter(Boolean)}
        />
      ) : (
        <div className="bg-slate-800 shadow-sm border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-slate-700 rounded-full transition-colors text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-white">Paramètres des notifications</h1>
            </div>
            {hasChanges() && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-gray-300 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-4 space-y-6">
        {/* Permissions Status */}
        <div className="bg-slate-800 rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-medium mb-4 flex items-center text-white">
            <Smartphone className="w-5 h-5 mr-2" />
            État des permissions
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Notifications locales</span>
              <div className="flex items-center space-x-2">
                {(() => {
                  const status = getPermissionStatus(permissions.local);
                  return (
                    <>
                      <status.icon className={`w-4 h-4 ${status.color}`} />
                      <span className={`text-sm ${status.color}`}>{status.text}</span>
                    </>
                  );
                })()}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Notifications push</span>
              <div className="flex items-center space-x-2">
                {(() => {
                  const status = getPermissionStatus(permissions.push);
                  return (
                    <>
                      <status.icon className={`w-4 h-4 ${status.color}`} />
                      <span className={`text-sm ${status.color}`}>{status.text}</span>
                    </>
                  );
                })()}
              </div>
            </div>

            {pushToken && (
              <div className="pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">Token push enregistré</span>
              </div>
            )}
          </div>
        </div>

        {/* Notification Types */}
        <div className="bg-slate-800 rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Types de notifications
          </h2>
          
          <div className="space-y-4">
            {/* Session Reminders */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <h3 className="font-medium">Rappels de séances</h3>
                  <p className="text-sm text-gray-500">Notifications avant vos séances planifiées</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('sessionReminders')}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${settings.sessionReminders ? 'bg-blue-500' : 'bg-gray-300'}
                `}
              >
                <span className={`
                  inline-block h-4 w-4 transform rounded-full bg-slate-800 transition-transform
                  ${settings.sessionReminders ? 'translate-x-6' : 'translate-x-1'}
                `} />
              </button>
            </div>

            {/* Exercise Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-green-500" />
                <div>
                  <h3 className="font-medium">Nouveaux exercices</h3>
                  <p className="text-sm text-gray-500">Quand un exercice est ajouté au club</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('exerciseNotifications')}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${settings.exerciseNotifications ? 'bg-blue-500' : 'bg-gray-300'}
                `}
              >
                <span className={`
                  inline-block h-4 w-4 transform rounded-full bg-slate-800 transition-transform
                  ${settings.exerciseNotifications ? 'translate-x-6' : 'translate-x-1'}
                `} />
              </button>
            </div>

            {/* System Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-gray-500" />
                <div>
                  <h3 className="font-medium">Notifications système</h3>
                  <p className="text-sm text-gray-500">Mises à jour et informations importantes</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('systemNotifications')}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${settings.systemNotifications ? 'bg-blue-500' : 'bg-gray-300'}
                `}
              >
                <span className={`
                  inline-block h-4 w-4 transform rounded-full bg-slate-800 transition-transform
                  ${settings.systemNotifications ? 'translate-x-6' : 'translate-x-1'}
                `} />
              </button>
            </div>
          </div>
        </div>

        {/* Reminder Timing */}
        {settings.sessionReminders && (
          <div className="bg-slate-800 rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Délai des rappels
            </h2>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-300">
                Recevoir un rappel avant les séances planifiées :
              </p>
              
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 6, 12, 24, 48].map((hours) => (
                  <button
                    key={hours}
                    onClick={() => handleReminderHoursChange(hours)}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${settings.reminderHours === hours
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {hours === 1 ? '1h' : `${hours}h`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Test Section - TEMPORAIRE pour tester EventEmitter */}
        <div className="bg-slate-800 rounded-lg shadow p-6 border border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Test Notifications (DEV)</h2>
          </div>
          <p className="text-sm text-gray-300 mb-4">
            Créer des notifications de test pour vérifier le système EventEmitter
          </p>
          <div className="space-y-3">
            <button
              onClick={async () => {
                try {
                  await fetch('http://localhost:3000/api/notifications/admin/send-notification', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    },
                    body: JSON.stringify({
                      title: 'Test notification',
                      message: 'Ceci est une notification de test pour vérifier le système EventEmitter',
                      type: 'system_notification'
                    })
                  });
                  alert('Notification créée ! Ouvre le centre de notifications pour la voir.');
                } catch (error) {
                  alert('Erreur: ' + error);
                }
              }}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Créer 1 notification de test
            </button>
            <button
              onClick={async () => {
                try {
                  for (let i = 1; i <= 5; i++) {
                    await fetch('http://localhost:3000/api/notifications/admin/send-notification', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                      },
                      body: JSON.stringify({
                        title: `Test notification ${i}`,
                        message: `Notification de test numéro ${i} pour vérifier le badge`,
                        type: 'system_notification'
                      })
                    });
                  }
                  alert('5 notifications créées ! Ouvre le centre de notifications.');
                } catch (error) {
                  alert('Erreur: ' + error);
                }
              }}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Créer 5 notifications de test
            </button>
          </div>
        </div>

        {hasChanges() && isMobile && (
          <div className="pb-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};