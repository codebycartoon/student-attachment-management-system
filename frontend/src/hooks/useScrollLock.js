import { useEffect } from 'react';

/**
 * Custom hook to prevent body scroll when mobile menu is open
 * Improves UX by preventing background scroll on mobile devices
 */
export default function useScrollLock(isLocked) {
  useEffect(() => {
    if (isLocked) {
      // Store original overflow value
      const originalOverflow = document.body.style.overflow;
      
      // Prevent scroll
      document.body.style.overflow = 'hidden';
      
      // Add padding to prevent layout shift from scrollbar removal
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      
      // Cleanup function
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = '';
      };
    }
  }, [isLocked]);
}