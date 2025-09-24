// hooks/useScrollDirection.js
import { useState, useEffect, useCallback } from 'react';

const useScrollDirection = (threshold = 100) => {
  const [scrollDirection, setScrollDirection] = useState('up');
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    let lastScrollY = window.pageYOffset;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;
      const scrolledDown = scrollY > threshold;
      
      // Update scroll status
      if (scrolledDown !== isScrolled) {
        setIsScrolled(scrolledDown);
      }

      // Only update direction if we've scrolled past threshold
      if (scrolledDown) {
        const direction = scrollY > lastScrollY ? 'down' : 'up';
        
        if (direction !== scrollDirection && Math.abs(scrollY - lastScrollY) > 5) {
          setScrollDirection(direction);
        }
      } else {
        // Always show when at top
        if (scrollDirection !== 'up') {
          setScrollDirection('up');
        }
      }
      
      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    const onScroll = () => requestTick();

    // Add scroll event listener with passive option for better performance
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Check initial position
    updateScrollDirection();

    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollDirection, threshold, isScrolled]);

  return { scrollDirection, isScrolled };
};

export default useScrollDirection;