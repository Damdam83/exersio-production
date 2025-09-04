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

  const testNotification = async () => {
    try {
      await notificationService.scheduleLocalNotification(
        '🎯 Test Notification',
        'Les notifications fonctionnent correctement !',
        5000 // 5 secondes
      );
    } catch (error) {
      console.error('Error testing notification:', error);
    }
  };

  const testSessionReminders = async () => {
    try {
      await notificationService.testSessionReminders();
    } catch (error) {
      console.error('Error testing session reminders:', error);
    }
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
    <div className={`min-h-screen bg-gray-50 ${isMobile ? '' : 'max-w-2xl mx-auto'}`}>
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
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold">Paramètres des notifications</h1>
            </div>
            {hasChanges() && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
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
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <Smartphone className="w-5 h-5 mr-2" />
            État des permissions
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Notifications locales</span>
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
              <span className="text-gray-600">Notifications push</span>
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
        <div className="bg-white rounded-lg p-4 shadow-sm">
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
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
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
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
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
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${settings.systemNotifications ? 'translate-x-6' : 'translate-x-1'}
                `} />
              </button>
            </div>
          </div>
        </div>

        {/* Reminder Timing */}
        {settings.sessionReminders && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Délai des rappels
            </h2>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
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

        {/* Test Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Tests et diagnostic
          </h2>
          
          <div className="space-y-3">
            <button
              onClick={testNotification}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span>Tester une notification locale</span>
            </button>
            
            <button
              onClick={testSessionReminders}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <Clock className="w-4 h-4" />
              <span>Tester les rappels de séances</span>
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              Les tests permettent de vérifier que les notifications fonctionnent correctement sur votre appareil.
              La notification locale apparaîtra dans 5 secondes, les rappels de séances sont envoyés immédiatement pour les séances planifiées.
            </p>
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