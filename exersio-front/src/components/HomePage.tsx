import { Cloud, CloudOff } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useExercises } from '../contexts/ExercisesContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useSessions } from '../contexts/SessionsContext';
import { useUser } from '../contexts/UserContext';
import { useOffline } from '../hooks/useOffline';
import { OfflinePanel } from './OfflinePanel';
import { Badge } from './ui/badge';

// Fonctions de formatage simplifiées
const format = (date: Date, formatStr: string) => {
  if (formatStr === 'HH:mm') return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (formatStr === 'dd/MM') return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  if (formatStr === 'EEEE') return date.toLocaleDateString('fr-FR', { weekday: 'long' });
  return date.toLocaleDateString('fr-FR');
};

const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
const isTomorrow = (date: Date) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
};
const differenceInDays = (d1: Date, d2: Date) => Math.ceil((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));

export function HomePage() {
  const { t } = useTranslation();
  const { currentUser, currentClub } = useUser();
  const { sessions, actions } = useSessions();
  const { exercises } = useExercises();
  const { setCurrentPage, navigate } = useNavigation();
  const { state: offlineState } = useOffline();
  const [showOfflinePanel, setShowOfflinePanel] = useState(false);

  // Séances à venir aujourd'hui et prochaines
  const upcomingSessions = actions.getUpcomingSessions().slice(0, 3);
  const todaySessions = sessions.filter(s => {
    const sessionDate = new Date(s.date);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  });

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const thisMonthSessions = completedSessions.filter((s) => {
    const d = new Date(s.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalHoursThisMonth = thisMonthSessions.reduce((total, s) => total + s.duration, 0);
  const userExercises = exercises.filter((ex) => ex.createdBy === currentUser?.id);

  // Stats rapides
  const quickStats = [
    { number: todaySessions.length.toString(), label: t('home.today') },
    { number: thisMonthSessions.length.toString(), label: t('home.thisMonth') },
    { number: currentClub?.members?.length?.toString() || '18', label: t('home.players') },
    { number: `${Math.round(totalHoursThisMonth / 60 * 10) / 10}h`, label: t('home.time') },
  ];

  const achievements = [];
  if (completedSessions.length >= 20) achievements.push('Expert Coach');
  if (completedSessions.length >= 10) achievements.push('Coach Actif');
  if (userExercises.length >= 50) achievements.push("Créateur d'exercices");
  if (thisMonthSessions.length >= 10) achievements.push('Coach du mois');
  if (achievements.length === 0) achievements.push('Nouveau Coach');

  const progressPercentage = Math.min(Math.round((thisMonthSessions.length / 20) * 100), 100);

  const formatSessionTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSessionIntensity = (session: any) => {
    const sessionExercises = exercises.filter(ex => session.exercises?.includes(ex.id));
    if (!sessionExercises.length) return t('home.moderate');

    const intensityMap = { 'Faible': 1, 'Moyenne': 2, 'Élevée': 3, 'Très élevée': 4 };
    const avgIntensity = sessionExercises.reduce((sum, ex) => sum + (intensityMap[ex.intensity] || 2), 0) / sessionExercises.length;

    if (avgIntensity >= 3.5) return t('home.highIntensity');
    if (avgIntensity >= 2.5) return t('home.moderate');
    return t('home.light');
  };

  return (
    <div className="min-h-screen text-white relative pb-20">
      <div className="max-w-full mx-auto px-4 sm:px-5 py-4 sm:py-6 relative z-10">

        {/* Stats Rapides */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {quickStats.map((stat) => (
            <div key={stat.label} className="bg-glass-card p-3 sm:p-4 text-center hover:-translate-y-0.5 transition-all">
              <div className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent mb-1">
                {stat.number}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider font-semibold">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Actions Rapides */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 text-base sm:text-lg font-bold mb-3 sm:mb-4">
            ⚡ {t('home.quickActions')}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setCurrentPage('session-create')}
              className="bg-primary-btn p-4 sm:p-5"
            >
              <div className="text-xl sm:text-2xl mb-1">➕</div>
              <div className="text-xs sm:text-sm" dangerouslySetInnerHTML={{ __html: t('home.newSession').replace(' ', '<br />') }}></div>
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage('exercise-create')}
              className="bg-white/8 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 text-white text-xs sm:text-sm font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:border-blue-500/30 hover:bg-white/12 flex flex-col items-center gap-2 text-center"
            >
              <div className="text-xl sm:text-2xl mb-1">🎯</div>
              <div className="text-xs sm:text-sm" dangerouslySetInnerHTML={{ __html: t('home.createExercise').replace(' ', '<br />') }}></div>
            </button>
          </div>
        </div>
{/* Séances à venir */}
        <div className='mb-4 sm:mb-6'>
          <div className="flex items-center gap-2 text-base sm:text-lg font-bold mb-3 sm:mb-4">
            📅 {t('home.upcomingSessions')}
          </div>

          {upcomingSessions.length === 0 ? (
            <div className="bg-glass-card p-6 sm:p-8 text-center">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📅</div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">{t('home.noUpcomingSessions')}</h3>
              <p className="text-sm text-gray-400 mb-3 sm:mb-4">{t('home.noSessionsMessage')}</p>
              <button
                type="button"
                onClick={() => setCurrentPage('session-create')}
                className="bg-primary-btn text-white text-xs sm:text-sm px-4 py-2"
              >
                ➕ {t('home.createSession')}
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-glass-card p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:border-blue-500/30 cursor-pointer relative overflow-hidden"
                  onClick={() => navigate('session-detail', { sessionId: session.id })}
                >
                  {/* Bande colorée gauche */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-emerald-500 rounded-r"></div>

                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <div className="text-xs sm:text-sm font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg">
                      {formatSessionTime(session.date)}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-lg">
                      {session.duration || 90} min
                    </div>
                  </div>

                  <div className="text-sm sm:text-base font-bold text-white mb-2">{session.name}</div>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-400 mb-2 sm:mb-3">
                    <span className="flex items-center gap-1">
                      📍 {t('home.mainField')}
                    </span>
                    <span className="flex items-center gap-1">
                      👥 {currentClub?.members?.length || 18} {t('home.players').toLowerCase()}
                    </span>
                    <span className="flex items-center gap-1">
                      ⚡ {getSessionIntensity(session)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {session.ageCategory && (
                      <span className="bg-blue-500/20 border border-blue-500/30 text-blue-400 px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-semibold uppercase tracking-wide">
                        {session.ageCategory}
                      </span>
                    )}
                    {session.level && (
                      <span className="bg-blue-500/20 border border-blue-500/30 text-blue-400 px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-semibold uppercase tracking-wide">
                        {session.level}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Progression + Stats fusionnées */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 text-base sm:text-lg font-bold mb-3 sm:mb-4">
            📊 {t('home.progressionMonth')}
          </div>
          <div className="bg-glass-card p-4 sm:p-5">
            <div className="flex items-center gap-3 sm:gap-5">
              {/* Progression circulaire */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
                <svg className="w-14 h-14 sm:w-16 sm:h-16 transform -rotate-90" viewBox="0 0 64 64">
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#3b82f6' }} />
                      <stop offset="100%" style={{ stopColor: '#10b981' }} />
                    </linearGradient>
                  </defs>
                  <circle
                    className="fill-none stroke-white/10"
                    strokeWidth="4"
                    cx="32"
                    cy="32"
                    r="28"
                  />
                  <circle
                    className="fill-none stroke-current"
                    stroke="url(#progressGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${(progressPercentage * 176) / 100} 176`}
                    cx="32"
                    cy="32"
                    r="28"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-blue-400">
                  {progressPercentage}%
                </div>
              </div>

              {/* Infos progression */}
              <div className="flex-1 min-w-0">
                <div className="text-sm sm:text-base font-bold mb-1">{t('home.excellentWork')}</div>
                <div className="text-[10px] sm:text-xs text-gray-400 mb-2">{t('home.goalsOnTrack')}</div>
                <div className="flex gap-3 sm:gap-4 text-[10px] sm:text-xs">
                  <div className="text-center">
                    <div className="font-bold text-emerald-400">{userExercises.length}</div>
                    <div className="text-gray-400">{t('home.exercises')}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-emerald-400">+{Math.round(progressPercentage/5)}%</div>
                    <div className="text-gray-400">{t('home.activity')}</div>
                  </div>
                </div>
              </div>

              {/* Bouton offline */}
              <button
                type="button"
                onClick={() => setShowOfflinePanel(true)}
                className={`${
                  offlineState.isOnline
                    ? 'bg-gradient-to-r from-[#00d4aa] to-[#00b894]'
                    : 'bg-gray-600'
                } hover:opacity-90 p-2 rounded-lg transition-opacity flex-shrink-0`}
                title={offlineState.isOnline ? t('home.offlineMode') : t('home.offline')}
              >
                {offlineState.isOnline ? (
                  <Cloud className="w-5 h-5" />
                ) : (
                  <CloudOff className="w-5 h-5" />
                )}
                {(offlineState.pendingCount.exercises + offlineState.pendingCount.sessions) > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full">
                    {offlineState.pendingCount.exercises + offlineState.pendingCount.sessions}
                  </Badge>
                )}
              </button>
            </div>
          </div>
        </div>

        
      </div>

      {/* Panneau offline */}
      <OfflinePanel
        isOpen={showOfflinePanel}
        onClose={() => setShowOfflinePanel(false)}
      />
    </div>
  );
}
