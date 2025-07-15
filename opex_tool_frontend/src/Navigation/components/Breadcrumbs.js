import React from 'react';
import { useNavigation } from '../context/NavigationContext';

const Breadcrumbs = ({ projectData }) => {
  const { currentInventory, currentItem, navigateTo } = useNavigation();
  
  // Build breadcrumb path based on current navigation state and project data
  const buildBreadcrumbPath = () => {
    const path = [];
    
    // We're always in a project context now, so add project information
    if (projectData) {
      path.push({ 
        label: projectData.name, 
        id: projectData.id, 
        type: 'project' 
      });
    }
    
    // Add inventory if selected
    if (currentInventory && projectData?.institution?.fond?.inventories) {
      const inventory = projectData.institution.fond.inventories.find(
        i => i.id === currentInventory
      );
      if (inventory) {
        path.push({ 
          label: ` Uzskaites Saraksts ${inventory.number}`, 
          id: inventory.id, 
          type: 'inventory' 
        });
      }
    }
    
    // Add item if selected
    if (currentItem && currentInventory && projectData?.institution?.fond?.inventories) {
      const inventory = projectData.institution.fond.inventories.find(
        i => i.id === currentInventory
      );
      if (inventory?.items) {
        const item = inventory.items.find(i => i.id === currentItem);
        if (item) {
          path.push({ 
            label: `Glabājamā Vienība ${item.number}`, 
            id: item.id, 
            type: 'item' 
          });
        }
      }
    }
    
    return path;
  };

  const breadcrumbPath = buildBreadcrumbPath();

  return (
    <div className="breadcrumbs">
      {breadcrumbPath.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="breadcrumb-separator">/</span>}
          <span 
            className={`breadcrumb-item ${index === breadcrumbPath.length - 1 ? 'active' : ''}`}
            onClick={() => navigateTo(item.type, item.id)}
          >
            {item.label}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumbs;