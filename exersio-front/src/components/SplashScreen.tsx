/**
 * Splash Screen avec animation de chargement
 * Affiché au démarrage de l'application pendant la vérification de version
 */

import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  isVisible: boolean;
  onComplete?: () => void;
  minDuration?: number; // Durée minimale d'affichage en ms
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  isVisible,
  onComplete,
  minDuration = 1500
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setFadeOut(false);
    } else {
      // Attendre la durée minimale avant de commencer le fade out
      const timer = setTimeout(() => {
        setFadeOut(true);
        // Attendre la fin de l'animation avant de démonter
        setTimeout(() => {
          setShouldRender(false);
          onComplete?.();
        }, 500); // Durée de l'animation de fade out
      }, minDuration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, minDuration, onComplete]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Image splash screen en plein écran */}
      <img
        src="/assets/splash.png"
        alt="Exersio Splash Screen"
        className="w-full h-full object-cover"
      />

      {/* Loading indicator superposé */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-4">
        {/* Barre de progression indéterminée */}
        <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full animate-loading-bar shadow-lg"></div>
        </div>

        {/* Texte de chargement */}
        <span className="text-white/80 text-xs animate-pulse font-medium">
          Chargement...
        </span>
      </div>

      {/* Version en bas à droite */}
      <div className="absolute bottom-4 right-4 text-white/60 text-xs">
        v1.0.0
      </div>
    </div>
  );
};

// Composant wrapper pour gérer le splash natif Capacitor
export const SplashScreenManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Cacher le splash natif Capacitor après que React soit prêt
    const hideSplash = async () => {
      try {
        // @capacitor/splash-screen sera importé dynamiquement si disponible
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await SplashScreen.hide({ fadeOutDuration: 300 });
      } catch (error) {
        // Plugin non disponible (mode web), pas grave
        console.debug('Capacitor SplashScreen not available');
      }
    };

    // Attendre que le DOM soit complètement chargé
    if (document.readyState === 'complete') {
      hideSplash();
    } else {
      window.addEventListener('load', hideSplash);
      return () => window.removeEventListener('load', hideSplash);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <>
      <SplashScreen
        isVisible={showSplash}
        onComplete={handleSplashComplete}
        minDuration={1500}
      />
      {!showSplash && children}
    </>
  );
};

