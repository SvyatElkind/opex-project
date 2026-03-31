import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { NAVIGATION_ADDITIONAL_UI } from '../../Constants/Constants';

const Breadcrumbs = ({ projectData }) => {
  const { currentInventory, currentItem, currentRecord, navigateTo } = useNavigation();
  
  // Build breadcrumb path based on current navigation state and project data
  const buildBreadcrumbPath = () => {
    const path = [];
    
    // We're always in a project context now, so add project information
    if (projectData) {
      path.push({
        label: projectData.name,
        value: projectData.name,
        id: projectData.id,
        type: 'project'
      });
      const fond = projectData?.institution?.fond;
      if (fond) {
        path.push({
          label: `${fond.arch_abbreviation} F${fond.fond_number} "${fond.fond_title}"`,
          value: `${fond.arch_title} F${fond.fond_number} "${fond.fond_title}"`,
          id: fond.id,
          type: 'fond'
        });
      }
    }
    
    // Add inventory if selected
    if (currentInventory && projectData?.institution?.fond?.inventories) {
      const inventory = projectData.institution.fond.inventories.find(
        i => i.id === currentInventory
      );
      if (inventory) {
        // Include postfix if exists (postfix already includes the period)
        const invNumber = inventory.postfix
          ? `${inventory.number}${inventory.postfix}`
          : `${inventory.number}`;
        path.push({
          label: `US ${invNumber}`,
          value: invNumber,
          id: inventory.id,
          type: 'inventory',
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
            label: `GV ${item.number} : "${item.title}"`,
            value: `${item.number} : "${item.title}"`, 
            id: item.id, 
            type: 'item',
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
              label: `Dok: ${record.title || record.reg_nr}`,
              value:  `${record.title || record.reg_nr}`,
              id: record.id, 
              type: 'record',
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
        navigateTo('fond', item.id);
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
      'project': NAVIGATION_ADDITIONAL_UI.BREADCRUMB_PROJEKTS,
      'fond': NAVIGATION_ADDITIONAL_UI.BREADCRUMB_FONDS,
      'inventory': NAVIGATION_ADDITIONAL_UI.BREADCRUMB_UZSKAITES_SARAKSTS,
      'item': NAVIGATION_ADDITIONAL_UI.BREADCRUMB_GLABĀJAMĀ_VIENĪBA,
      'record': NAVIGATION_ADDITIONAL_UI.BREADCRUMB_DOKUMENTS
    };
    return titles[item.type] || '';
  };

  return (
    <nav className="breadcrumbs" aria-label={NAVIGATION_ADDITIONAL_UI.BREADCRUMB_ARIA_LABEL}>
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
            title={`${getBreadcrumbTitle(item)} ${item.value}`}
            aria-current={index === breadcrumbPath.length - 1 ? 'page' : undefined}
            type="button"
          >
            <span className="breadcrumb-text">{item.label}</span>
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;