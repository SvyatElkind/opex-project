import React from 'react';
import { useNavigation } from '../context/NavigationContext';

const Breadcrumbs = ({ projectData }) => {
  const { currentInventory, currentItem, currentRecord, navigateTo } = useNavigation();
  
  // Build breadcrumb path based on current navigation state and project data
  const buildBreadcrumbPath = () => {
    const path = [];
    
    // We're always in a project context now, so add project information
    if (projectData) {
      path.push({ 
        label: projectData.name, 
        id: projectData.id, 
        type: 'project',
        icon: '🏛️'
      });
    }
    
    // Add inventory if selected
    if (currentInventory && projectData?.institution?.fond?.inventories) {
      const inventory = projectData.institution.fond.inventories.find(
        i => i.id === currentInventory
      );
      if (inventory) {
        path.push({ 
          label: `Uzskaites Saraksts ${inventory.number}`, 
          id: inventory.id, 
          type: 'inventory',
          icon: '📋',
          parentId: projectData.id
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
            type: 'item',
            icon: '📦',
            parentId: currentInventory
          });
        }
      }
    }
    
    // Add record if selected - NEW FUNCTIONALITY
    if (currentRecord && currentItem && currentInventory && projectData?.institution?.fond?.inventories) {
      const inventory = projectData.institution.fond.inventories.find(
        i => i.id === currentInventory
      );
      if (inventory?.items) {
        const item = inventory.items.find(i => i.id === currentItem);
        if (item?.records) {
          const record = item.records.find(r => r.id === currentRecord);
          if (record) {
            path.push({ 
              label: `Ieraksts: ${record.title || record.reg_nr}`, 
              id: record.id, 
              type: 'record',
              icon: '📄',
              parentId: currentItem,
              itemId: currentItem
            });
          }
        }
      }
    }
    
    return path;
  };

  const breadcrumbPath = buildBreadcrumbPath();

  const handleNavigate = (item) => {
    switch (item.type) {
      case 'project':
        navigateTo('project', item.id);
        break;
      case 'inventory':
        navigateTo('inventory', item.id);
        break;
      case 'item':
        navigateTo('item', item.id, item.parentId);
        break;
      case 'record':
        navigateTo('record', item.id, item.parentId, item.itemId);
        break;
      default:
        break;
    }
  };

  const getBreadcrumbTitle = (item) => {
    const titles = {
      'project': 'Projekts',
      'inventory': 'Uzskaites Saraksts',
      'item': 'Glabājamā Vienība', 
      'record': 'Ieraksts'
    };
    return titles[item.type] || '';
  };

  return (
    <div className="breadcrumbs">
      {breadcrumbPath.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="breadcrumb-separator">/</span>}
          <span 
            className={`breadcrumb-item ${index === breadcrumbPath.length - 1 ? 'active' : ''}`}
            onClick={() => handleNavigate(item)}
            title={`${getBreadcrumbTitle(item)}: ${item.label}`}
          >
            {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
            <span className="breadcrumb-text">{item.label}</span>
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumbs;