import React, { createContext, useContext, useState } from 'react';
import InheritanceUtils from '../../Utils/InheritanceUtils';

/*
  Navigation Context: 
                      Holds States: 
                                    Inventory, Item, Record, Navigation History(NAVIGATION STATES)
                                    Project Data ,  CurrentProject ID (PROJECT STATES)
*/

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

  // FIX: Enhanced navigation with inheritance-aware logic
  const navigateTo = (type, id, parentId = null, itemId = null) => {
    console.log('NavigationContext: navigateTo called', { type, id, parentId, itemId });
    
    // Save current state to history before changing
    setNavigationHistory(prev => [
      ...prev, 
      { 
        inventory: currentInventory, 
        item: currentItem,
        record: currentRecord,
        timestamp: Date.now()
      }
    ]);

    // Update current state based on navigation type
    switch(type) {
      case 'project':
        console.log('Navigating to project:', id);
        setCurrentInventory(null);
        setCurrentItem(null);
        setCurrentRecord(null);
        break;
        
      case 'inventory':
        console.log('Navigating to inventory:', id);
        setCurrentInventory(id);
        setCurrentItem(null);
        setCurrentRecord(null);
        break;
        
      case 'item':
        console.log('Navigating to item:', id, 'in inventory:', parentId);
        if (parentId) setCurrentInventory(parentId);
        setCurrentItem(id);
        setCurrentRecord(null);
        
        // FIX: Apply inheritance-based auto-navigation
        if (projectData) {
          const item = getItemById(id);
          const inventory = getInventoryById(parentId || currentInventory);
          
          if (item && inventory) {
            const navigationBehavior = InheritanceUtils.getNavigationBehavior(inventory, item);
            console.log('Auto-navigation behavior:', navigationBehavior);
            
            // For media inventories with exactly one record, auto-navigate to record
            if (navigationBehavior.action === 'navigateToRecord' && navigationBehavior.targetRecordId) {
              console.log('Auto-navigating to record:', navigationBehavior.targetRecordId);
              setTimeout(() => {
                setCurrentRecord(navigationBehavior.targetRecordId);
              }, 100); // Small delay to allow item navigation to complete
            }
          }
        }
        break;
        
      case 'record':
        console.log('Navigating to record:', id, 'in item:', itemId, 'in inventory:', parentId);
        if (parentId) setCurrentInventory(parentId);
        if (itemId) setCurrentItem(itemId);
        setCurrentRecord(id);
        break;
        
      default:
        console.warn('Unknown navigation type:', type);
        break;
    }
  };

  // FIX: Enhanced navigation back with inheritance awareness
  const navigateBack = () => {
    if (navigationHistory.length > 0) {
      const prevState = navigationHistory[navigationHistory.length - 1];
      console.log('Navigating back to:', prevState);
      
      setCurrentInventory(prevState.inventory);
      setCurrentItem(prevState.item);
      setCurrentRecord(prevState.record);
      
      // Remove the used history entry
      setNavigationHistory(prev => prev.slice(0, -1));
      
      return true;
    }
    return false;
  };

  // FIX: Smart navigation back with inheritance context
  const navigateBackSmart = () => {
    // If we're at record level, determine where to go based on inheritance
    if (currentRecord && currentItem) {
      const item = getItemById(currentItem);
      const inventory = getInventoryById(currentInventory);
      
      if (item && inventory) {
        const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
        
        // For textual inventories, go back to records table
        if (inheritanceInfo.isTextual) {
          console.log('Smart back: textual inventory -> item records view');
          setCurrentRecord(null);
          return true;
        }
        
        // For media inventories, go back to item overview
        if (inheritanceInfo.isMedia) {
          console.log('Smart back: media inventory -> item overview');
          setCurrentRecord(null);
          return true;
        }
      }
    }
    
    // If we're at item level, go back to inventory
    if (currentItem && !currentRecord) {
      console.log('Smart back: item -> inventory');
      setCurrentItem(null);
      setCurrentRecord(null);
      return true;
    }
    
    // If we're at inventory level, go back to project
    if (currentInventory && !currentItem) {
      console.log('Smart back: inventory -> project');
      setCurrentInventory(null);
      return true;
    }
    
    // Fall back to regular navigation back
    return navigateBack();
  };

  // Project data functions
  const updateProjectData = (data, projectId) => {
    setProjectData(data);
    setCurrentProjectId(projectId);
  };

  // ENHANCED: Get all items from project with inventory context and inheritance info
  const getAllItemsFromProject = () => {
    if (!projectData?.institution?.fond?.inventories) return [];
    
    const allItems = [];
    
    // Flatten all items from all inventories with inheritance context
    projectData.institution.fond.inventories.forEach(inventory => {
      if (inventory.items && Array.isArray(inventory.items)) {
        const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
        
        inventory.items.forEach(item => {
          const navigationBehavior = InheritanceUtils.getNavigationBehavior(inventory, item);
          const attentionStatus = InheritanceUtils.getItemAttentionStatus(inventory, item);
          
          allItems.push({
            ...item,
            inventoryId: inventory.id,
            inventoryNumber: inventory.number,
            inventoryType: inventory.type,
            // Add inheritance metadata
            inheritanceInfo,
            navigationBehavior,
            attentionStatus,
            recordCount: item.records?.length || 0,
            constraintCompliant: attentionStatus.isCompliant
          });
        });
      }
    });
    
    return allItems;
  };

  // ENHANCED: Get all records from project with full context and inheritance info
  const getAllRecordsFromProject = () => {
    if (!projectData?.institution?.fond?.inventories) return [];
    
    const allRecords = [];
    
    // Flatten all records from all items with full context
    projectData.institution.fond.inventories.forEach(inventory => {
      if (inventory.items && Array.isArray(inventory.items)) {
        const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
        
        inventory.items.forEach(item => {
          if (item.records && Array.isArray(item.records)) {
            item.records.forEach(record => {
              allRecords.push({
                ...record,
                inventoryId: inventory.id,
                inventoryNumber: inventory.number,
                inventoryType: inventory.type,
                itemId: item.id,
                itemNumber: item.number,
                itemTitle: item.title,
                // Add inheritance context
                inheritanceInfo,
                isMediaRecord: inheritanceInfo.isMedia,
                isTextualRecord: inheritanceInfo.isTextual,
                navigationPath: `${inventory.type} ${inventory.number} → Item ${item.number} → ${record.title || record.reg_nr || 'Record'}`
              });
            });
          }
        });
      }
    });
    
    return allRecords;
  };

  // ENHANCED: Get record by ID with full inheritance context
  const getRecordById = (recordId) => {
    if (!projectData?.institution?.fond?.inventories || !recordId) return null;
    
    for (const inventory of projectData.institution.fond.inventories) {
      if (inventory.items) {
        const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
        
        for (const item of inventory.items) {
          if (item.records) {
            const record = item.records.find(r => r.id === recordId);
            if (record) {
              const navigationBehavior = InheritanceUtils.getNavigationBehavior(inventory, item);
              
              return {
                ...record,
                inventoryId: inventory.id,
                inventoryNumber: inventory.number,
                inventoryType: inventory.type,
                itemId: item.id,
                itemNumber: item.number,
                itemTitle: item.title,
                // Add inheritance context
                inheritanceInfo,
                navigationBehavior,
                isMediaRecord: inheritanceInfo.isMedia,
                isTextualRecord: inheritanceInfo.isTextual
              };
            }
          }
        }
      }
    }
    
    return null;
  };

  // ENHANCED: Get item by ID with inventory context and inheritance info
  const getItemById = (itemId) => {
    if (!projectData?.institution?.fond?.inventories || !itemId) return null;
    
    for (const inventory of projectData.institution.fond.inventories) {
      if (inventory.items) {
        const item = inventory.items.find(i => i.id === itemId);
        if (item) {
          const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
          const navigationBehavior = InheritanceUtils.getNavigationBehavior(inventory, item);
          const attentionStatus = InheritanceUtils.getItemAttentionStatus(inventory, item);
          
          return {
            ...item,
            inventoryId: inventory.id,
            inventoryNumber: inventory.number,
            inventoryType: inventory.type,
            // Add inheritance metadata
            inheritanceInfo,
            navigationBehavior,
            attentionStatus,
            recordCount: item.records?.length || 0
          };
        }
      }
    }
    
    return null;
  };

  // ENHANCED: Get inventory by ID with inheritance info
  const getInventoryById = (inventoryId) => {
    if (!projectData?.institution?.fond?.inventories || !inventoryId) return null;
    
    const inventory = projectData.institution.fond.inventories.find(inv => inv.id === inventoryId);
    if (inventory) {
      const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
      const statistics = InheritanceUtils.getRecordStatistics(inventory);
      
      return {
        ...inventory,
        inheritanceInfo,
        statistics
      };
    }
    
    return null;
  };

  // ENHANCED: Get inventory number (keeping original function for backward compatibility)
  const getInventoryNumber = (inventoryId) => {
    const inventory = getInventoryById(inventoryId);
    return inventory ? inventory.number : null;
  };

  // ENHANCED: Get item number (keeping original function for backward compatibility)
  const getItemNumber = (itemId) => {
    const item = getItemById(itemId);
    return item ? item.number : null;
  };

  // ENHANCED: Get record number/title with inheritance context
  const getRecordIdentifier = (recordId) => {
    const record = getRecordById(recordId);
    if (!record) return null;
    
    // For media records, include the media type in identifier
    if (record.isMediaRecord) {
      return `${record.inventoryType}: ${record.reg_nr || record.title || `Record ${recordId}`}`;
    }
    
    return record.reg_nr || record.title || `Record ${recordId}`;
  };

  // ENHANCED: Navigation breadcrumb helpers with inheritance awareness
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
    
    // Add inventory with inheritance info
    if (currentInventory) {
      const inventory = getInventoryById(currentInventory);
      if (inventory) {
        path.push({
          type: 'inventory',
          id: inventory.id,
          label: `${inventory.type} Saraksts ${inventory.number}`,
          icon: inventory.inheritanceInfo?.icon || '📋',
          color: inventory.inheritanceInfo?.color,
          subtitle: inventory.inheritanceInfo?.displayText
        });
      }
    }
    
    // Add item with inheritance context
    if (currentItem) {
      const item = getItemById(currentItem);
      if (item) {
        path.push({
          type: 'item',
          id: item.id,
          label: `Glabājamā Vienība ${item.number}`,
          subtitle: item.title,
          icon: '📦',
          recordCount: item.recordCount,
          attentionLevel: item.attentionStatus?.level
        });
      }
    }
    
    // Add record with media/textual context
    if (currentRecord) {
      const record = getRecordById(currentRecord);
      if (record) {
        const icon = record.isMediaRecord ? record.inheritanceInfo?.icon : '📄';
        path.push({
          type: 'record',
          id: record.id,
          label: `${record.isMediaRecord ? record.inventoryType + ' ' : ''}Ieraksts`,
          subtitle: record.reg_nr || record.title || 'Nav nosaukuma',
          icon: icon
        });
      }
    }
    
    return path;
  };

  // ENHANCED: Get navigation stats with inheritance breakdown
  const getNavigationStats = () => {
    if (!projectData) return { inventories: 0, items: 0, records: 0 };
    
    const inventories = projectData.institution?.fond?.inventories || [];
    let itemCount = 0;
    let recordCount = 0;
    
    // Stats by inheritance type
    const statsByType = {
      textual: { inventories: 0, items: 0, records: 0 },
      media: { inventories: 0, items: 0, records: 0 }
    };
    
    inventories.forEach(inv => {
      const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inv);
      const category = inheritanceInfo.isTextual ? 'textual' : 'media';
      
      statsByType[category].inventories++;
      
      if (inv.items) {
        itemCount += inv.items.length;
        statsByType[category].items += inv.items.length;
        
        inv.items.forEach(item => {
          if (item.records) {
            recordCount += item.records.length;
            statsByType[category].records += item.records.length;
          }
        });
      }
    });
    
    return {
      inventories: inventories.length,
      items: itemCount,
      records: recordCount,
      breakdown: statsByType,
      constraintViolations: inventories.reduce((acc, inv) => {
        const stats = InheritanceUtils.getRecordStatistics(inv);
        return acc + (stats.constraintViolations?.hasViolations ? 1 : 0);
      }, 0)
    };
  };

  // FIX: New method to validate current navigation state
  const validateNavigationState = () => {
    const issues = [];
    
    if (currentRecord && !currentItem) {
      issues.push({
        type: 'error',
        message: 'Record selected without item context',
        fix: () => setCurrentRecord(null)
      });
    }
    
    if (currentItem && !currentInventory) {
      issues.push({
        type: 'error', 
        message: 'Item selected without inventory context',
        fix: () => setCurrentItem(null)
      });
    }
    
    // Check inheritance constraints
    if (currentRecord && currentItem) {
      const record = getRecordById(currentRecord);
      const item = getItemById(currentItem);
      
      if (record && item && record.itemId !== item.id) {
        issues.push({
          type: 'error',
          message: 'Record does not belong to current item',
          fix: () => setCurrentRecord(null)
        });
      }
    }
    
    return {
      valid: issues.length === 0,
      issues,
      autoFix: () => issues.forEach(issue => issue.fix && issue.fix())
    };
  };

  // Provide the navigation state and functions
  const value = {
    // Navigation state
    currentInventory,
    currentItem,
    currentRecord,
    navigationHistory,
    
    // Navigation functions
    navigateTo,
    navigateBack,
    navigateBackSmart,
    
    // Project data state and functions
    projectData,
    currentProjectId,
    updateProjectData,
    
    // Enhanced data access functions with inheritance support
    getAllItemsFromProject,
    getAllRecordsFromProject,
    getRecordById,
    getItemById,
    getInventoryById,
    
    // Backward compatibility functions
    getInventoryNumber,
    getItemNumber,
    
    // Enhanced helper functions
    getRecordIdentifier,
    getCurrentBreadcrumbPath,
    getNavigationStats,
    
    // New validation and utility functions
    validateNavigationState
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