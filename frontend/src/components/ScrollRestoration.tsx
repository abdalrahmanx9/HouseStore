import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollRestoration() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const scrollPositions = useRef<Record<string, number>>({});

  useEffect(() => {
    // If we're pushing a new route or replacing it, scroll to top
    if (navigationType !== 'POP') {
      window.scrollTo(0, 0);
    } else {
      // If we are popping (using the back button), try to restore the saved scroll position
      const savedPosition = scrollPositions.current[pathname];
      if (savedPosition !== undefined) {
        // Small delay to ensure the DOM is painted (especially with react-query cached data rendering)
        requestAnimationFrame(() => {
          window.scrollTo(0, savedPosition);
        });
        
        // Safety fallback in case layout takes a bit to settle
        setTimeout(() => {
            window.scrollTo(0, savedPosition);
        }, 100);
      }
    }
    
    // Track scroll positions for the current path
    const handleScroll = () => {
      scrollPositions.current[pathname] = window.scrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname, navigationType]);

  return null;
}
