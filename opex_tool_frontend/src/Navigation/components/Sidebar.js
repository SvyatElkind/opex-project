import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useProjects, useProject } from '../../hooks/useProjects';

const Sidebar = () => {
  const { 
    currentProject, 
    currentInventory, 
    currentItem, 
    sidebarOpen, 
    navigateTo 
  } = useNavigation();
  
  const { data: projectsListData = [] } = useProjects();
  const { data: activeProjectData } = useProject(currentProject);
  
  if (!sidebarOpen) return null;
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Project Navigator</h3>
      </div>
      
      <div className="sidebar-content">
        {projectsListData.map(project => (
          <div 
            key={project.id}
            className={`sidebar-project ${project.id === currentProject ? 'active' : ''}`}
            onClick={() => navigateTo('project', project.id)}
          >
            <span className="project-name">{project.name}</span>
            
            {/* Show fond and inventories if this is current project */}
            {project.id === currentProject && activeProjectData?.institution?.fond && (
              <div className="sidebar-fond">
                <div className="fond-header">
                  {`Fond ${activeProjectData.institution.fond.fond_number}`}
                </div>
                
                {activeProjectData.institution.fond.inventories && (
                  <div className="sidebar-inventories">
                    {activeProjectData.institution.fond.inventories.map(inv => (
                      <div 
                        key={inv.id}
                        className={`sidebar-inventory ${inv.id === currentInventory ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateTo('inventory', inv.id);
                        }}
                      >
                        <span className="inventory-name">{`Inventory ${inv.number}`}</span>
                        
                        {/* Show items if this is current inventory */}
                        {inv.id === currentInventory && inv.items && (
                          <div className="sidebar-items">
                            {inv.items.map(item => (
                              <div 
                                key={item.id}
                                className={`sidebar-item ${item.id === currentItem ? 'active' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigateTo('item', item.id, inv.id);
                                }}
                              >
                                <span className="item-name">{`Item ${item.number}`}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;