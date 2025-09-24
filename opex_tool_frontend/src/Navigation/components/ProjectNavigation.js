import React, { useEffect, useRef, useState } from 'react';
import Breadcrumbs from './Breadcrumbs';
import QuickJump from './QuickJump';
import './Navigation.css';

const ProjectNavigation = ({ 
  projectData, 
  selectedProject,
}) => {
  const navigationRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navigationHeight, setNavigationHeight] = useState(0);

  useEffect(() => {
    // Measure navigation height on mount
    if (navigationRef.current) {
      setNavigationHeight(navigationRef.current.offsetHeight);
    }

    const handleScroll = () => {
      const scrolled = window.scrollY > 10; // Increased threshold for better UX
      
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled);
        
        if (navigationRef.current) {
          if (scrolled) {
            navigationRef.current.classList.add('scrolled');
            // Add top padding to body to prevent content jump
            document.body.style.paddingTop = `${navigationHeight}px`;
          } else {
            navigationRef.current.classList.remove('scrolled');
            // Remove top padding
            document.body.style.paddingTop = '0px';
          }
        }
      }
    };

    // Throttled scroll handler for better performance
    let ticking = false;
    const throttledScrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    
    // Check initial scroll position
    handleScroll();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', throttledScrollHandler);
      // Clean up body padding
      document.body.style.paddingTop = '0px';
    };
  }, [isScrolled, navigationHeight]);
  return (
    <header ref={navigationRef} className="navigation-container">
      <div className="navigation-top">
        <Breadcrumbs projectData={projectData} />
        <QuickJump projectData={projectData} />
      </div>
    </header>
  );
};

export default ProjectNavigation;