import { useEffect, useState } from 'react';

type OrientationType = 'portrait' | 'landscape';

export function useOrientation() {
  const [orientation, setOrientation] = useState<OrientationType>(() => {
    if (typeof window === 'undefined') return 'portrait';
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  });

  useEffect(() => {
    const handleOrientationChange = () => {
      const newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      setOrientation(newOrientation);
    };

    // Listen to resize events (covers orientation changes)
    window.addEventListener('resize', handleOrientationChange);
    
    // Also listen to orientation change events if available
    if ('screen' in window && 'orientation' in window.screen) {
      window.screen.orientation.addEventListener('change', handleOrientationChange);
    } else if ('orientation' in window) {
      window.addEventListener('orientationchange', handleOrientationChange);
    }

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      if ('screen' in window && 'orientation' in window.screen) {
        window.screen.orientation.removeEventListener('change', handleOrientationChange);
      } else if ('orientation' in window) {
        window.removeEventListener('orientationchange', handleOrientationChange);
      }
    };
  }, []);

  return {
    orientation,
    isLandscape: orientation === 'landscape',
    isPortrait: orientation === 'portrait'
  };
}