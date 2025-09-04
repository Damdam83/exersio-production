import React from "react";
import { useNavigation } from "../contexts/NavigationContext";

import { Navigation } from "./Navigation";
import { PageLayout } from "./PageLayout";
import { MobileLayout } from "./MobileLayout";
import { NotificationSettingsPage } from "./NotificationSettingsPage";
import { AdminNotificationsPage } from "./AdminNotificationsPage";
// Import des composants lazy pour optimisation du bundle
import {
  HomePage,
  SessionsPage,
  ExercisesPage,
  HistoryPage,
  ProfilePage,
  ExerciseCreatePage,
  SessionCreatePage,
  SessionDetailView,
  ExerciseDetailView
} from "../utils/lazyComponents";
import { useSessions } from "../contexts/SessionsContext";
import { useExercises } from "../contexts/ExercisesContext";

interface MainLayoutProps {
  isMobile: boolean;
  onLogout: () => void;
}

// Wrapper pour SessionDetailView avec gestion des données
function SessionDetailPageWrapper({ sessionId }: { sessionId?: string }) {
  const { setCurrentPage, navigate } = useNavigation();
  const { state: sessionsState, actions: sessionsActions } = useSessions();
  const { exercises } = useExercises();

  if (!sessionId) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
        <p>Session non trouvée</p>
        <button 
          onClick={() => setCurrentPage('sessions')}
          style={{ marginTop: '16px', padding: '8px 16px', background: 'none', border: '1px solid #3b82f6', color: '#3b82f6', borderRadius: '6px', cursor: 'pointer' }}
        >
          Retour aux séances
        </button>
      </div>
    );
  }

  const session = sessionsState.sessions.data?.find(s => s.id === sessionId);

  if (!session) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
        <p>Session non trouvée</p>
        <button 
          onClick={() => setCurrentPage('sessions')}
          style={{ marginTop: '16px', padding: '8px 16px', background: 'none', border: '1px solid #3b82f6', color: '#3b82f6', borderRadius: '6px', cursor: 'pointer' }}
        >
          Retour aux séances
        </button>
      </div>
    );
  }

  return (
    <SessionDetailView
      session={session}
      exercises={exercises}
      onBack={() => setCurrentPage('sessions')}
      onUpdateSession={sessionsActions.updateSession}
      onExportSession={(session) => {
        console.log('Export session:', session);
        // Ici on pourrait implémenter l'export
      }}
      onViewExercise={(exerciseId) => {
        navigate('exercise-detail', { 
          exerciseId,
          from: 'session-detail',
          fromId: sessionId,
          returnTo: 'session-detail',
          returnParams: { sessionId }
        });
      }}
      onEditSession={() => {
        navigate('session-create', { sessionId, mode: 'edit' });
      }}
      onAddExercise={() => {
        navigate('exercises');
      }}
    />
  );
}

// Wrapper pour ExerciseDetailView avec gestion des données
function ExerciseDetailPageWrapper({ exerciseId }: { exerciseId?: string }) {
  const { setCurrentPage, navigate, goBack, params } = useNavigation();
  const { exercises } = useExercises();
  const { state: sessionsState } = useSessions();

  // Handle preview mode
  if (exerciseId === 'preview_temp' && params?.previewData) {
    const previewExercise = params.previewData as any;
    const contextInfo = params?.from ? {
      from: params.from,
      fromId: params.fromId,
      fromName: params.fromId && (params.from === 'session-create' || params.from === 'session-detail')
        ? sessionsState.sessions.data?.find(s => s.id === params.fromId)?.name
        : undefined
    } : undefined;

    return (
      <div>
        <div style={{
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(245, 158, 11, 0.1))',
          border: '1px solid rgba(249, 115, 22, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          color: '#f97316',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>👁️ Mode Aperçu</h3>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
            Cet aperçu vous permet de visualiser l'exercice avant publication
          </p>
        </div>
        
        <ExerciseDetailView
          exercise={previewExercise}
          onBack={() => navigate(params?.returnTo as any, params?.returnParams || null)}
          onEdit={() => navigate(params?.returnTo as any, params?.returnParams || null)}
          onAddToSession={() => {
            setCurrentPage('sessions');
          }}
          onToggleFavorite={() => {
            console.log('Preview mode: cannot toggle favorite');
          }}
          isFavorite={false}
          contextInfo={contextInfo}
        />
      </div>
    );
  }

  if (!exerciseId) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
        <p>Exercice non trouvé</p>
        <button 
          onClick={() => setCurrentPage('exercises')}
          style={{ marginTop: '16px', padding: '8px 16px', background: 'none', border: '1px solid #3b82f6', color: '#3b82f6', borderRadius: '6px', cursor: 'pointer' }}
        >
          Retour aux exercices
        </button>
      </div>
    );
  }

  const exercise = exercises.find(ex => ex.id === exerciseId);

  if (!exercise) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
        <p>Exercice non trouvé</p>
        <button 
          onClick={() => setCurrentPage('exercises')}
          style={{ marginTop: '16px', padding: '8px 16px', background: 'none', border: '1px solid #3b82f6', color: '#3b82f6', borderRadius: '6px', cursor: 'pointer' }}
        >
          Retour aux exercices
        </button>
      </div>
    );
  }

  // Construire les informations de contexte
  const contextInfo = params?.from ? {
    from: params.from,
    fromId: params.fromId,
    fromName: params.fromId && (params.from === 'session-create' || params.from === 'session-detail')
      ? sessionsState.sessions.data?.find(s => s.id === params.fromId)?.name
      : undefined
  } : undefined;

  return (
    <ExerciseDetailView
      exercise={exercise}
      onBack={params?.returnTo ? goBack : () => setCurrentPage('exercises')}
      onEdit={() => navigate('exercise-edit', { exerciseId })}
      onAddToSession={() => {
        // Pour l'instant, rediriger vers les séances
        setCurrentPage('sessions');
      }}
      onToggleFavorite={() => {
        console.log('Toggle favorite for exercise:', exerciseId);
      }}
      isFavorite={false}
      contextInfo={contextInfo}
    />
  );
}

// Wrapper pour NotificationSettingsPage avec gestion de navigation
function NotificationSettingsPageWrapper() {
  const { goBack, setCurrentPage } = useNavigation();

  return (
    <NotificationSettingsPage
      onBack={() => goBack() || setCurrentPage('profile')}
    />
  );
}

// Wrapper pour AdminNotificationsPage avec gestion de navigation
function AdminNotificationsPageWrapper() {
  const { goBack, setCurrentPage } = useNavigation();

  return (
    <AdminNotificationsPage
      onBack={() => goBack() || setCurrentPage('profile')}
    />
  );
}

function MainLayoutContent({ isMobile, onLogout }: MainLayoutProps) {
  const { currentPage, params } = useNavigation();

  const renderPage = () => {
    switch (currentPage) {
      case "sessions":
        return <SessionsPage key="sessions-page" />;
      case "exercises":
        return <ExercisesPage key="exercises-page" />;
      case "history":
        return <HistoryPage key="history-page" />;
      case "profile":
        return <ProfilePage key="profile-page" />;
      case "exercise-create":
      case "exercise-edit":
        return <ExerciseCreatePage key="exercise-create-page" />;
      case "session-create":
        return <SessionCreatePage key="session-create-page" />;
      case "session-detail":
        return <SessionDetailPageWrapper key="session-detail-page" sessionId={params?.sessionId} />;
      case "exercise-detail":
        return <ExerciseDetailPageWrapper key="exercise-detail-page" exerciseId={params?.exerciseId} />;
      case "notification-settings":
        return <NotificationSettingsPageWrapper key="notification-settings-page" />;
      case "admin-notifications":
        return <AdminNotificationsPageWrapper key="admin-notifications-page" />;
      default:
        return <HomePage key="home-page" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation isMobile={isMobile} onLogout={onLogout} />
      {isMobile ? (
        <MobileLayout>{renderPage()}</MobileLayout>
      ) : (
        <PageLayout>{renderPage()}</PageLayout>
      )}
    </div>
  );
}

export function MainLayout(props: MainLayoutProps) {
  return <MainLayoutContent {...props} />;
}
