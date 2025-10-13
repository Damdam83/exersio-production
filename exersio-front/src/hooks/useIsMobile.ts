import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(true); // Default true pour Capacitor

  useEffect(() => {
    const checkIsMobile = () => {
      // Dans Capacitor, toujours mobile
      if (window.location.protocol === 'capacitor:') {
        return true;
      }

      // Détection taille d'écran
      if (window.innerWidth <= 768) {
        return true;
      }

      // Détection User Agent
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      if (navigator.userAgent && mobileRegex.test(navigator.userAgent)) {
        return true;
      }

      return false;
    };

    const updateIsMobile = () => {
      const result = checkIsMobile();
      setIsMobile(result);
    };

    // Check initial
    updateIsMobile();

    // Listen for resize
    window.addEventListener('resize', updateIsMobile);
    
    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

  return isMobile;
}