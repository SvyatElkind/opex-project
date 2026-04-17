import { useState, useEffect, useRef } from 'react';

const useScrollDirection = (threshold = 100) => {
  const [scrollDirection, setScrollDirection] = useState('up');
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollYRef = useRef(0);
  const scrollDirectionRef = useRef('up');
  const isScrolledRef = useRef(false);
  const rafIdRef = useRef(null);

  useEffect(() => {
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;
      const scrolledDown = scrollY > threshold;

      if (scrolledDown !== isScrolledRef.current) {
        isScrolledRef.current = scrolledDown;
        setIsScrolled(scrolledDown);
      }

      if (scrolledDown) {
        const direction = scrollY > lastScrollYRef.current ? 'down' : 'up';
        if (direction !== scrollDirectionRef.current && Math.abs(scrollY - lastScrollYRef.current) > 5) {
          scrollDirectionRef.current = direction;
          setScrollDirection(direction);
        }
      } else {
        if (scrollDirectionRef.current !== 'up') {
          scrollDirectionRef.current = 'up';
          setScrollDirection('up');
        }
      }

      lastScrollYRef.current = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        rafIdRef.current = requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateScrollDirection();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [threshold]);

  return { scrollDirection, isScrolled };
};

export default useScrollDirection;
