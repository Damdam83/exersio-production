import { useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";
import { useSessions } from "./contexts/SessionsContext";
import { useError } from "./contexts/ErrorContext";
import { useLoading } from "./contexts/LoadingContext";
import { useIsMobile } from "./hooks/useIsMobile";
import { useSwipeBack } from "./hooks/useSwipeBack";
import { useVersionCheck } from "./hooks/useVersionCheck";
import { MainLayout } from "./components/MainLayout";
import { AuthForm } from "./components/AuthForm";
import { UpdateModal, MaintenanceModal } from "./components/UpdateModal";
import { SplashScreen } from "./components/SplashScreen";
import { PrivacyPolicyPage } from "./components/PrivacyPolicyPage";
import { TermsOfServicePage } from "./components/TermsOfServicePage";
import { Toaster } from "./components/ui/sonner";
import { AppProvider } from "./contexts/AppProvider";
import ErrorNotifications from "./components/ErrorNotifications";
import DynamicLoader from "./components/DynamicLoader";
import { setGlobalErrorHandler, setGlobalLoadingHandler } from "./services/apiInterceptor";
import { notificationService } from "./services/notificationService";
import { offlineStorage } from "./services/offlineStorage";

function AppContent() {
  const { state: auth, actions: authActions } = useAuth();
  const { actions: sesActions } = useSessions();
  const { showError } = useError();
  const { startLoading, stopLoading } = useLoading();
  const isMobile = useIsMobile();
  
  // Version checking
  const {
    isChecking,
    showUpdateModal,
    showMaintenanceModal,
    updateInfo,
    maintenanceInfo,
    hasChecked,
    handleUpdateNow,
    handleUpdateLater,
    closeUpdateModal
  } = useVersionCheck();
  
  // Enable global swipe back navigation on mobile
  const { swipeRef } = useSwipeBack({
    enabled: isMobile && auth.isAuthenticated,
    minDistance: 80,
    maxVertical: 150
  });

  useEffect(() => {
    // Note: initializeDefaultData() removed - no longer needed with real backend API

    // Configurer les gestionnaires globaux
    setGlobalErrorHandler(showError);
    setGlobalLoadingHandler({
      start: startLoading,
      stop: stopLoading
    });

    // Initialiser le système offline
    offlineStorage.init().catch(error => {
      console.error('Error initializing offline storage:', error);
    });

    // Initialiser l'analyse de performance (uniquement en dev)
    if (import.meta.env.DEV) {
      // L'analyseur est automatiquement initialisé via son constructeur
    }
  }, [showError, startLoading, stopLoading]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      // Ne charger que les sessions automatiquement
      // Les exercices et favoris seront chargés seulement quand l'utilisateur navigue vers la page exercices
      sesActions.loadSessions();

      // Initialiser les notifications (seulement locales, pas de Firebase)
      notificationService.initialize().catch(error => {
        console.error('Error initializing notifications:', error);
      });
    }
  }, [auth.isAuthenticated]);

  // Vérifier si l'URL contient des paramètres d'authentification spéciaux
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('token');
  const urlAction = urlParams.get('action');
  const isAuthAction = urlToken && (urlAction === 'reset-password' || urlAction === 'confirm-email');

  // Si l'utilisateur a un lien d'action auth (reset password, confirm email) et est connecté,
  // le déconnecter pour afficher le formulaire approprié
  useEffect(() => {
    if (isAuthAction && auth.isAuthenticated) {
      authActions.logout();
    }
  }, [isAuthAction, auth.isAuthenticated]);

  // Routes publiques (accessibles sans authentification)
  const pathname = window.location.pathname;

  if (pathname === '/privacy') {
    return <PrivacyPolicyPage onBack={() => window.history.back()} />;
  }

  if (pathname === '/terms') {
    return <TermsOfServicePage onBack={() => window.history.back()} />;
  }

  // Afficher le splash screen pendant l'initialisation ou la vérification de version
  if (!auth.isInitialized || (isChecking && !hasChecked)) {
    return (
      <>
        <SplashScreen isVisible={true} minDuration={1500} />
        <Toaster />
      </>
    );
  }

  // Si en maintenance, afficher la modal de maintenance
  if (showMaintenanceModal && maintenanceInfo) {
    return (
      <>
        <MaintenanceModal
          isOpen={true}
          message={maintenanceInfo.message}
          estimatedDuration={maintenanceInfo.estimatedDuration}
        />
        <Toaster />
      </>
    );
  }

  if (!auth.isAuthenticated || isAuthAction) {
    return (
      <>
        <AuthForm
          onLogin={async (credentials) => {
            // Nettoyer les erreurs précédentes avant de tenter
            if (auth.loginState.error) {
              authActions.clearLoginError();
            }
            return authActions.login(credentials);
          }}
          onRegister={async (data) => {
            // Nettoyer les erreurs précédentes avant de tenter
            if (auth.loginState.error) {
              authActions.clearLoginError();
            }
            return authActions.register(data);
          }}
          isLoading={auth.loginState.isSubmitting}
          error={auth.loginState.error}
        />
        <Toaster />
      </>
    );
  }

  return (
    <div ref={swipeRef}>
      <MainLayout
        isMobile={isMobile}
        onLogout={authActions.logout}
      />
      <ErrorNotifications />
      <DynamicLoader />
      <Toaster />
      
      {/* Modal de mise à jour */}
      {showUpdateModal && updateInfo && (
        <UpdateModal
          isOpen={true}
          updateInfo={updateInfo}
          onClose={closeUpdateModal}
          onUpdate={handleUpdateNow}
          onLater={handleUpdateLater}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

