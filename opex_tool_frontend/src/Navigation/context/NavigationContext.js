import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  // Navigation state
  const [currentInventory, setCurrentInventory] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [navigationHistory, setNavigationHistory] = useState([]);
  
  // Project data state
  const [projectData, setProjectData] = useState(null);
  const [currentProjectId, setCurrentProjectId] = useState(null);

  // Navigation functions - ENHANCED for record level
  const navigateTo = (type, id, parentId = null, itemId = null) => {
    // Save current state to history before changing
    setNavigationHistory(prev => [
      ...prev, 
      { 
        inventory: currentInventory, 
        item: currentItem,
        record: currentRecord 
      }
    ]);

    // Update current state based on navigation type
    switch(type) {
      case 'project':
        setCurrentInventory(null);
        setCurrentItem(null);
        setCurrentRecord(null);
        break;
      case 'inventory':
        setCurrentInventory(id);
        setCurrentItem(null);
        setCurrentRecord(null);
        break;
      case 'item':
        if (parentId) setCurrentInventory(parentId);
        setCurrentItem(id);
        setCurrentRecord(null);
        break;
      case 'record':
        // NEW: Enhanced record navigation
        if (parentId) setCurrentInventory(parentId);
        if (itemId) setCurrentItem(itemId);
        setCurrentRecord(id);
        break;
      default:
        break;
    }
  };

  // Go back in navigation history
  const navigateBack = () => {
    if (navigationHistory.length > 0) {
      const prevState = navigationHistory[navigationHistory.length - 1];
      setCurrentInventory(prevState.inventory);
      setCurrentItem(prevState.item);
      setCurrentRecord(prevState.record);
      
      // Remove the used history entry
      setNavigationHistory(prev => prev.slice(0, -1));
    }
  };

  // Project data functions
  const updateProjectData = (data, projectId) => {
    setProjectData(data);
    setCurrentProjectId(projectId);
  };

  // ENHANCED: Get all items from project with inventory context
  const getAllItemsFromProject = () => {
    if (!projectData?.institution?.fond?.inventories) return [];
    
    const allItems = [];
    
    // Flatten all items from all inventories
    projectData.institution.fond.inventories.forEach(inventory => {
      if (inventory.items && Array.isArray(inventory.items)) {
        inventory.items.forEach(item => {
          allItems.push({
            ...item,
            inventoryId: inventory.id,
            inventoryNumber: inventory.number // Add inventory number for display
          });
        });
      }
    });
    
    return allItems;
  };

  // ENHANCED: Get all records from project with full context
  const getAllRecordsFromProject = () => {
    if (!projectData?.institution?.fond?.inventories) return [];
    
    const allRecords = [];
    
    // Flatten all records from all items
    projectData.institution.fond.inventories.forEach(inventory => {
      if (inventory.items && Array.isArray(inventory.items)) {
        inventory.items.forEach(item => {
          if (item.records && Array.isArray(item.records)) {
            item.records.forEach(record => {
              allRecords.push({
                ...record,
                inventoryId: inventory.id,
                inventoryNumber: inventory.number,
                itemId: item.id,
                itemNumber: item.number,
                itemTitle: item.title
              });
            });
          }
        });
      }
    });
    
    return allRecords;
  };

  // NEW: Get record by ID with full context
  const getRecordById = (recordId) => {
    if (!projectData?.institution?.fond?.inventories || !recordId) return null;
    
    for (const inventory of projectData.institution.fond.inventories) {
      if (inventory.items) {
        for (const item of inventory.items) {
          if (item.records) {
            const record = item.records.find(r => r.id === recordId);
            if (record) {
              return {
                ...record,
                inventoryId: inventory.id,
                inventoryNumber: inventory.number,
                itemId: item.id,
                itemNumber: item.number,
                itemTitle: item.title
              };
            }
          }
        }
      }
    }
    
    return null;
  };

  // NEW: Get item by ID with inventory context
  const getItemById = (itemId) => {
    if (!projectData?.institution?.fond?.inventories || !itemId) return null;
    
    for (const inventory of projectData.institution.fond.inventories) {
      if (inventory.items) {
        const item = inventory.items.find(i => i.id === itemId);
        if (item) {
          return {
            ...item,
            inventoryId: inventory.id,
            inventoryNumber: inventory.number
          };
        }
      }
    }
    
    return null;
  };

  // NEW: Get inventory by ID
  const getInventoryById = (inventoryId) => {
    if (!projectData?.institution?.fond?.inventories || !inventoryId) return null;
    
    return projectData.institution.fond.inventories.find(inv => inv.id === inventoryId);
  };

  // ENHANCED: Get inventory number (keeping original function for backward compatibility)
  const getInventoryNumber = (inventoryId) => {
    if (!projectData?.institution?.fond?.inventories) return null;
    
    const inventory = projectData.institution.fond.inventories.find(inv => inv.id === inventoryId);
    return inventory ? inventory.number : null;
  };

  // ENHANCED: Get item number (keeping original function for backward compatibility)
  const getItemNumber = (itemId) => {
    if (!projectData?.institution?.fond?.inventories) return null;
    
    for (const inventory of projectData.institution.fond.inventories) {
      if (inventory.items) {
        const item = inventory.items.find(item => item.id === itemId);
        if (item) {
          return item.number;
        }
      }
    }
    return null;
  };

  // NEW: Get record number/title
  const getRecordIdentifier = (recordId) => {
    const record = getRecordById(recordId);
    return record ? (record.reg_nr || record.title || `Record ${recordId}`) : null;
  };

  // NEW: Navigation breadcrumb helpers
  const getCurrentBreadcrumbPath = () => {
    const path = [];
    
    // Add project
    if (projectData) {
      path.push({
        type: 'project',
        id: currentProjectId,
        label: projectData.name,
        icon: '🏛️'
      });
    }
    
    // Add inventory
    if (currentInventory) {
      const inventory = getInventoryById(currentInventory);
      if (inventory) {
        path.push({
          type: 'inventory',
          id: inventory.id,
          label: `Uzskaites Saraksts ${inventory.number}`,
          icon: '📋'
        });
      }
    }
    
    // Add item
    if (currentItem) {
      const item = getItemById(currentItem);
      if (item) {
        path.push({
          type: 'item',
          id: item.id,
          label: `Glabājamā Vienība ${item.number}`,
          icon: '📦'
        });
      }
    }
    
    // Add record
    if (currentRecord) {
      const record = getRecordById(currentRecord);
      if (record) {
        path.push({
          type: 'record',
          id: record.id,
          label: `Ieraksts: ${record.reg_nr || record.title || 'Nav nosaukuma'}`,
          icon: '📄'
        });
      }
    }
    
    return path;
  };

  // NEW: Get navigation stats for display
  const getNavigationStats = () => {
    if (!projectData) return { inventories: 0, items: 0, records: 0 };
    
    const inventories = projectData.institution?.fond?.inventories || [];
    let itemCount = 0;
    let recordCount = 0;
    
    inventories.forEach(inv => {
      if (inv.items) {
        itemCount += inv.items.length;
        inv.items.forEach(item => {
          if (item.records) {
            recordCount += item.records.length;
          }
        });
      }
    });
    
    return {
      inventories: inventories.length,
      items: itemCount,
      records: recordCount
    };
  };

  // Provide the navigation state and functions
  const value = {
    // Navigation state
    currentInventory,
    currentItem,
    currentRecord,
    navigateTo,
    navigateBack,
    
    // Project data state and functions
    projectData,
    currentProjectId,
    updateProjectData,
    
    // Enhanced data access functions
    getAllItemsFromProject,
    getAllRecordsFromProject,
    getRecordById,
    getItemById,
    getInventoryById,
    
    // Backward compatibility functions
    getInventoryNumber,
    getItemNumber,
    
    // New helper functions
    getRecordIdentifier,
    getCurrentBreadcrumbPath,
    getNavigationStats
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

// Custom hook to use the navigation context
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};