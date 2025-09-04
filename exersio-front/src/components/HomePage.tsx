import React, { useState } from 'react';
import { Calendar, Zap, TrendingUp, Trophy, BarChart3, Clock, Users, Target, Plus, Dumbbell, BookOpen, Play, Pause, CheckCircle, Cloud, CloudOff } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ExersioLogo } from './ExersioLogo';
import { useUser } from '../contexts/UserContext';
import { useSessions } from '../contexts/SessionsContext';
import { useExercises } from '../contexts/ExercisesContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { useOffline } from '../hooks/useOffline';
import { OfflinePanel } from './OfflinePanel';

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
  const { currentUser, currentClub } = useUser();
  const { sessions, actions } = useSessions();
  const { exercises } = useExercises();
  const { setCurrentPage, navigate } = useNavigation();
  const isMobile = useIsMobile();
  const { state: offlineState } = useOffline();
  const [showOfflinePanel, setShowOfflinePanel] = useState(false);

  // Séances à venir (seulement les futures)
  const upcomingSessions = actions.getUpcomingSessions().slice(0, 4);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const thisMonthSessions = completedSessions.filter((s) => {
    const d = new Date(s.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalHoursThisMonth = thisMonthSessions.reduce((total, s) => total + s.duration, 0);
  const userExercises = exercises.filter((ex) => ex.createdBy === currentUser?.id);

  const stats = [
    { number: thisMonthSessions.length.toString(), label: 'Séances ce mois', page: 'sessions' },
    { number: userExercises.length.toString(), label: 'Exercices créés', page: 'exercises' },
    { number: currentClub?.members?.length?.toString() || '0', label: 'Membres actifs', page: 'profile' },
    { number: `${Math.round(totalHoursThisMonth / 60 * 10) / 10}h`, label: 'Temps total', page: 'history' },
  ];

  const achievements = [];
  if (completedSessions.length >= 20) achievements.push('Expert Coach');
  if (completedSessions.length >= 10) achievements.push('Coach Actif');
  if (userExercises.length >= 50) achievements.push("Créateur d'exercices");
  if (thisMonthSessions.length >= 10) achievements.push('Coach du mois');
  if (achievements.length === 0) achievements.push('Nouveau Coach');

  const lastMonth = new Date(currentYear, currentMonth - 1);
  const lastMonthSessions = completedSessions.filter((s) => {
    const d = new Date(s.date);
    return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
  });

  const sessionGrowth = lastMonthSessions.length > 0
    ? Math.round(((thisMonthSessions.length - lastMonthSessions.length) / lastMonthSessions.length) * 100)
    : thisMonthSessions.length > 0 ? 100 : 0;

  const trends = [
    {
      icon: sessionGrowth > 0 ? 'up' : sessionGrowth < 0 ? 'down' : 'stable',
      text: `${sessionGrowth > 0 ? '+' : ''}${sessionGrowth}% de séances`,
      color: sessionGrowth > 0 ? 'text-emerald-400' : sessionGrowth < 0 ? 'text-red-400' : 'text-blue-400',
    },
    { icon: 'stable', text: `${exercises.length} exercices`, color: 'text-blue-400' },
    { icon: upcomingSessions.length > 0 ? 'up' : 'stable', text: `${upcomingSessions.length} séances planifiées`, color: upcomingSessions.length > 0 ? 'text-emerald-400' : 'text-gray-400' },
  ];

  const formatSessionDate = (d: string) => {
    const date = new Date(d);
    if (isToday(date)) return 'Aujourd’hui';
    if (isTomorrow(date)) return 'Demain';
    const diff = differenceInDays(date, new Date());
    if (diff <= 7 && diff > 0) return format(date, 'EEEE');
    return format(date, 'dd/MM');
  };

  const getSessionExercises = (ids: string[]) => exercises.filter((ex) => ids.includes(ex.id));
  const getIntensityFromExercises = (ids: string[]) => {
    const sesEx = getSessionExercises(ids);
    if (!sesEx.length) return 50;
    const map = { Faible: 25, Moyenne: 50, Élevée: 75, 'Très élevée': 90 };
    return Math.round(sesEx.reduce((sum, ex) => sum + (map[ex.intensity || 'Moyenne'] || 50), 0) / sesEx.length);
  };

  const getIntensityColor = (val: number) => val >= 80 ? 'from-red-500 to-orange-500' : val >= 60 ? 'from-orange-500 to-yellow-500' : val >= 40 ? 'from-yellow-500 to-emerald-500' : 'from-emerald-500 to-green-500';
  const getIntensityLabel = (val: number) => val >= 80 ? 'Haute intensité' : val >= 60 ? 'Intensité modérée' : val >= 40 ? 'Intensité faible' : 'Récupération';
  const getSessionStatusIcon = (s: any) => s.status === 'completed' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : s.status === 'planned' ? <Play className="w-4 h-4 text-blue-400" /> : <Pause className="w-4 h-4 text-gray-400" />;

  const progressPercentage = Math.min(Math.round((thisMonthSessions.length / 20) * 100), 100);

  return (
    <div style={{ 
      minHeight: '100vh',
      color: '#ffffff',
      position: 'relative'
    }}>
      {/* Background effects */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 15% 85%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 85% 15%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
        zIndex: -1
      }}></div>

      <div style={{ 
        maxWidth: isMobile ? '100%' : '1400px', 
        margin: '0 auto', 
        padding: isMobile ? '8px' : '20px', 
        position: 'relative', 
        zIndex: 1 
      }}>
        
        {/* Header avec bouton offline */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <ExersioLogo size={isMobile ? 32 : 40} />
            <div>
              <h1 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'} text-white`}>
                Tableau de bord
              </h1>
              {currentUser && (
                <p className="text-gray-400 text-sm">
                  Bienvenue, {currentUser.name}
                </p>
              )}
            </div>
          </div>
          
          {/* Bouton mode offline */}
          <Button
            onClick={() => setShowOfflinePanel(true)}
            className={`${
              offlineState.isOnline 
                ? 'bg-gradient-to-r from-[#00d4aa] to-[#00b894]' 
                : 'bg-gray-600'
            } hover:opacity-90 ${isMobile ? 'px-3 py-2' : 'px-4 py-2'}`}
            title={offlineState.isOnline ? 'Mode hors connexion' : 'Hors ligne'}
          >
            {offlineState.isOnline ? (
              <Cloud className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-2`} />
            ) : (
              <CloudOff className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-2`} />
            )}
            {!isMobile && (offlineState.isOnline ? 'En ligne' : 'Hors ligne')}
            {(offlineState.pendingCount.exercises + offlineState.pendingCount.sessions) > 0 && (
              <Badge className="ml-2 bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs px-1.5 py-0.5">
                {offlineState.pendingCount.exercises + offlineState.pendingCount.sessions}
              </Badge>
            )}
          </Button>
        </div>

        {/* Séances à venir */}
        <div className={isMobile ? "space-y-4" : "grid lg:grid-cols-3 gap-8"}>
          <div className={isMobile ? "w-full" : "lg:col-span-2"} style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            padding: isMobile ? '16px' : '32px'
          }}>
            <div className={`flex items-center justify-between ${isMobile ? 'mb-4' : 'mb-8'}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold">Séances à venir</h2>
              </div>
              {upcomingSessions.length > 0 && (
                <Badge className="bg-[#00d4aa]/20 text-[#00d4aa] border-[#00d4aa]/30">
                  {upcomingSessions.length} planifiée(s)
                </Badge>
              )}
            </div>

            {upcomingSessions.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Aucune séance planifiée</h3>
                <Button onClick={() => setCurrentPage('session-create')} className="bg-gradient-to-r from-[#00d4aa] to-[#00b894]">Créer une séance</Button>
              </div>
            ) : (
              <div className="relative pl-10">
                <div className="absolute left-4 top-0 bottom-5 w-1 bg-gradient-to-b from-[#00d4aa] via-blue-500 to-purple-500 rounded-full" />
                {upcomingSessions.map((session) => {
                  const sessionExercises = getSessionExercises(session.exercises);
                  const intensity = getIntensityFromExercises(session.exercises);
                  return (
                    <div 
                      key={session.id} 
                      className="relative mb-8 p-6 cursor-pointer hover:bg-white/10 transition-colors" 
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px'
                      }}
                      onClick={() => navigate('session-detail', { sessionId: session.id })}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3 text-[#00d4aa] font-bold">
                          <Clock className="w-4 h-4" /> {format(new Date(session.date), 'HH:mm')}
                        </div>
                        <div className="text-sm text-gray-400">
                          {formatSessionDate(session.date)} - {format(new Date(session.date), 'dd/MM')}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">{session.name}</h3>
                        {getSessionStatusIcon(session)}
                      </div>
                      {sessionExercises.length > 0 && (
                        <>
                          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                            <div className={`bg-gradient-to-r ${getIntensityColor(intensity)} h-2 rounded-full`} style={{ width: `${intensity}%` }} />
                          </div>
                          <p className="text-sm text-gray-300">{getIntensityLabel(intensity)}</p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Stats & Actions */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            padding: isMobile ? '16px' : '32px'
          }}>
            <Button onClick={() => setCurrentPage('session-create')} className="w-full mb-4 bg-gradient-to-r from-[#00d4aa] to-[#00b894]">
              <Plus className="w-4 h-4 mr-2" /> Nouvelle séance
            </Button>
            <Button onClick={() => setCurrentPage('exercise-create')} className="w-full mb-4" style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white'
            }}>
              <Dumbbell className="w-4 h-4 mr-2" /> Créer exercice
            </Button>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s) => (
                <div key={s.label} onClick={() => setCurrentPage(s.page as any)} className="p-4 text-center cursor-pointer" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px'
                }}>
                  <div className="text-2xl font-bold text-[#00d4aa]">{s.number}</div>
                  <div className="text-xs text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tendances & Réussites */}
        <div className={isMobile ? "space-y-4 mt-4" : "grid lg:grid-cols-3 gap-8 mt-8"}>
          <div className="text-center" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            padding: isMobile ? '16px' : '24px'
          }}>
            <BarChart3 className="mx-auto mb-2 text-[#00d4aa]" size={32} />
            <p className="text-xl font-bold">{progressPercentage}%</p>
            <p className="text-sm text-gray-400">{thisMonthSessions.length}/20 séances réalisées</p>
          </div>
          <div className="text-center" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            padding: isMobile ? '16px' : '24px'
          }}>
            <Trophy className="mx-auto mb-2 text-orange-400" size={32} />
            {achievements.map((a) => <p key={a} className="text-sm text-gray-200">{a}</p>)}
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            padding: isMobile ? '16px' : '24px'
          }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 bg-gradient-to-br from-[#00d4aa] to-[#00b894] rounded-md flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold">Tendances</h3>
            </div>
            {trends.map((t, i) => (
              <p key={i} className={`text-sm mb-2 ${t.color}`}>{t.text}</p>
            ))}
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
