import React, { useEffect, useRef } from 'react';
import Breadcrumbs from './Breadcrumbs';
import QuickJump from './QuickJump';
import './Navigation.css';

const ProjectNavigation = ({ 
  projectData, 
  selectedProject,
  activeDataVisible,
  onToggleDetails,
  onRenameProject,
  onDeleteProject 
}) => {
  const navigationRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (navigationRef.current) {
        const scrolled = window.scrollY > 10;
        if (scrolled) {
          navigationRef.current.classList.add('scrolled');
        } else {
          navigationRef.current.classList.remove('scrolled');
        }
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Check initial scroll position
    handleScroll();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Don't render project actions if no project is selected
  const showProjectActions = selectedProject && projectData;

  return (
    <div ref={navigationRef} className="navigation-container">
      <div className="navigation-top">
        <Breadcrumbs projectData={projectData} />
        
        {/* Project Actions Section */}
        {showProjectActions && (
          <div className="project-actions">
            <button 
              className="action-btn primary" 
              onClick={onToggleDetails}
              title={activeDataVisible ? "Paslēpt Projectka Detaļas" : "Parādīt Projeckta Detaļas"}
              type="button"
            >
              <i className={`fas ${activeDataVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              <span>{activeDataVisible ? 'Paslēpt' : 'Parādīt'} Details</span>
            </button>
            
            <button 
              className="action-btn secondary" 
              onClick={() => onRenameProject(selectedProject)}
              title="Pārdēvēt šo Projecktu"
              type="button"
            >
              <i className="fas fa-edit"></i>
              <span>Pārdēvēt</span>
            </button>
            
            <button 
              className="action-btn danger" 
              onClick={() => onDeleteProject(selectedProject)}
              title="Dzēst šo Projecktu"
              type="button"
            >
              <i className="fas fa-trash"></i>
              <span>Dzēst</span>
            </button>
          </div>
        )}
        
        <QuickJump projectData={projectData} />
      </div>
    </div>
  );
};

export default ProjectNavigation;