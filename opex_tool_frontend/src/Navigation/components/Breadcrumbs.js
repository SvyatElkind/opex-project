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
        type: 'project'
        // Removed icon
      });
      let fondArchTitle = projectData.institution.fond.arch_title;
      let fondNumber = projectData.institution.fond.fond_number;
      let fondtitle = projectData.institution.fond.fond_title;
      path.push({
        label:fondArchTitle + " F" + fondNumber + ' "' + fondtitle + '"',
        id:projectData.institution.fond.id,
        type: 'fond'
      })
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
          // Removed icon and color
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
            // Removed icon
            parentId: currentInventory
          });
        }
      }
    }
    
    // Add record if selected
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
              // Removed icon
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
      case 'fond':
        navigateTo('fond',item.id);
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
      'fond':'Fonds',
      'inventory': 'Uzskaites Saraksts',
      'item': 'Glabājamā Vienība', 
      'record': 'Ieraksts'
    };
    return titles[item.type] || '';
  };

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb navigation">
      {breadcrumbPath.map((item, index) => (
        <React.Fragment key={`${item.type}-${item.id}`}>
          {index > 0 && (
            <span className="breadcrumb-separator" aria-hidden="true">
              /
            </span>
          )}
          <button
            className={`breadcrumb-item ${index === breadcrumbPath.length - 1 ? 'active' : ''}`}
            onClick={() => handleNavigate(item)}
            title={`${getBreadcrumbTitle(item)}: ${item.label}`}
            aria-current={index === breadcrumbPath.length - 1 ? 'page' : undefined}
            type="button"
          >
            {/* Removed icon span completely */}
            <span className="breadcrumb-text">{item.label}</span>
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;