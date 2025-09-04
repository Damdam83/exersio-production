import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(true); // Default true pour Capacitor

  useEffect(() => {
    const checkIsMobile = () => {
      console.log('🔍 Checking if mobile:', {
        protocol: window.location.protocol,
        width: window.innerWidth,
        userAgent: navigator.userAgent,
        touch: 'ontouchstart' in window
      });

      // Dans Capacitor, toujours mobile
      if (window.location.protocol === 'capacitor:') {
        console.log('✅ Capacitor detected - Mobile mode');
        return true;
      }
      
      // Détection taille d'écran
      if (window.innerWidth <= 768) {
        console.log('✅ Small screen detected - Mobile mode');
        return true;
      }
      
      // Détection User Agent
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      if (navigator.userAgent && mobileRegex.test(navigator.userAgent)) {
        console.log('✅ Mobile user agent detected - Mobile mode');
        return true;
      }
      
      console.log('❌ Desktop mode');
      return false;
    };

    const updateIsMobile = () => {
      const result = checkIsMobile();
      setIsMobile(result);
      console.log('📱 isMobile set to:', result);
    };

    // Check initial
    updateIsMobile();

    // Listen for resize
    window.addEventListener('resize', updateIsMobile);
    
    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

  return isMobile;
}