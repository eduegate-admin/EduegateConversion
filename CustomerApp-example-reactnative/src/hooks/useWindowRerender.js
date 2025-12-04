import { useEffect } from 'react';
import { Platform } from 'react-native';

export const useHardReloadOnResize = () => {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    let resizeTimeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        window.location.reload(); // 🔁 Force full reload
      }, 300);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
};
