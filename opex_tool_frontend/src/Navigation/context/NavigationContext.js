import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
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

  // Active tab/view state - specifies which tab should be active after navigation
  const [activeTab, setActiveTab] = useState(null);
  const activeTabRef = useRef(null); // Ref to persist across StrictMode double-mount

  // Project data state
  const [projectData, setProjectData] = useState(null);
  const [currentProjectId, setCurrentProjectId] = useState(null);

  // Refs to track current state without causing navigateTo to recreate
  const currentInventoryRef = useRef(currentInventory);
  const currentItemRef = useRef(currentItem);
  const currentRecordRef = useRef(currentRecord);

  // Keep refs in sync with state
  currentInventoryRef.current = currentInventory;
  currentItemRef.current = currentItem;
  currentRecordRef.current = currentRecord;

  // FIX: Enhanced navigation with inheritance-aware logic
  // options parameter can include: { tab: 'files' | 'metadata' | 'info' | null }
  const navigateTo = useCallback((type, id, parentId = null, itemId = null, options = null) => {
      // CRITICAL FIX: Handle if id is an object (wrong call pattern)
      if (typeof id === 'object' && id !== null) {
          console.warn('⚠️ navigateTo received object instead of ID. Extracting values...');
          const params = id;

          // Extract the actual values
          const actualId = params.id || params.recordId || params.itemId || params.inventoryId;
          const actualParentId = params.parentId || params.inventoryId;
          const actualItemId = params.itemId;

          // Recursively call with correct parameters
          return navigateTo(type, actualId, actualParentId, actualItemId, options);
      }

      console.log('NavigationContext: navigateTo called', { type, id, parentId, itemId, options });

      // Set active tab if specified in options
      if (options && options.tab) {
          setActiveTab(options.tab);
          activeTabRef.current = options.tab; // Also store in ref for persistence
          console.log('🔧 NavigationContext: Setting active tab to:', options.tab);
          console.log('🔧 NavigationContext: activeTabRef.current is now:', activeTabRef.current);
      } else {
          setActiveTab(null); // Reset to default view
          activeTabRef.current = null;
      }

      // Save current state to history using refs to avoid dependency issues
      setNavigationHistory(prev => [
        ...prev,
        {
          inventory: currentInventoryRef.current,
          item: currentItemRef.current,
          record: currentRecordRef.current,
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
          break;
          
        case 'record':
          console.log('Navigating to record:', id, 'in item:', itemId, 'in inventory:', parentId);
          
          // CRITICAL: Ensure id is a number, not an object
          const recordId = typeof id === 'number' ? id : parseInt(id);
          
          if (isNaN(recordId)) {
              console.error('❌ Invalid record ID:', id);
              return;
          }
          
          if (parentId) setCurrentInventory(parentId);
          if (itemId) setCurrentItem(itemId);
          setCurrentRecord(recordId); // Must be a number!
          
          console.log('✅ Record navigation complete. currentRecord set to:', recordId);
          break;
          
        default:
          console.warn('Unknown navigation type:', type);
          break;
      }
  },[]); // Empty deps - navigateTo is now stable and won't recreate

    // ENHANCED: Get item by ID with inventory context and inheritance info
  const getItemById = useCallback((itemId) => {
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
  },[projectData]);
    // ENHANCED: Get inventory by ID with inheritance info
  const getInventoryById = useCallback((inventoryId) => {
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
  },[projectData]);

  // FIX: Enhanced navigation back with inheritance awareness
  const navigateBack = useCallback(() => {
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
  },[navigationHistory]);

  // FIX: Smart navigation back with inheritance context
  const navigateBackSmart = useCallback(() => {
    if (currentRecord && currentItem) {
      const item = getItemById(currentItem);
      const inventory = getInventoryById(currentInventory);
      
      if (item && inventory) {
        const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);
        
        if (inheritanceInfo.isTextual) {
          console.log('Smart back: textual inventory -> item records view');
          setCurrentRecord(null);
          return true;
        }
        
        if (inheritanceInfo.isMedia) {
          console.log('Smart back: media inventory -> item overview');
          setCurrentRecord(null);
          return true;
        }
      }
    }
    
    if (currentItem && !currentRecord) {
      console.log('Smart back: item -> inventory');
      setCurrentItem(null);
      setCurrentRecord(null);
      return true;
    }
    
    if (currentInventory && !currentItem) {
      console.log('Smart back: inventory -> project');
      setCurrentInventory(null);
      return true;
    }
    
    return navigateBack();
  }, [currentRecord, currentItem, currentInventory, getItemById, getInventoryById, navigateBack]);


  // Project data functions
  const updateProjectData = useCallback((data, projectId) => {
    setProjectData(data);
    setCurrentProjectId(projectId);
  }, []);

  // ENHANCED: Get all items from project with inventory context and inheritance info
  const getAllItemsFromProject = useCallback(() => {
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
  },[projectData]);

  // ENHANCED: Get all records from project with full context and inheritance info
  const getAllRecordsFromProject = useCallback(() => {
    if (!projectData?.institution?.fond?.inventories) return [];
    
    const allRecords = [];
    
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
  }, [projectData]);

  // ENHANCED: Get record by ID with full inheritance context
  const getRecordById = useCallback((recordId) => {
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
  }, [projectData]);

  // ENHANCED: Get inventory number (keeping original function for backward compatibility)
  const getInventoryNumber = useCallback((inventoryId) => {
    const inventory = getInventoryById(inventoryId);
    return inventory?.number || null;
  }, [getInventoryById]);
  // ENHANCED: Get item number (keeping original function for backward compatibility)
  const getItemNumber = useCallback((itemId) => {
    const item = getItemById(itemId);
    return item?.number || null;
  }, []);

  // ENHANCED: Get record number/title with inheritance context
  const getRecordIdentifier = useCallback((recordId) => {
    const record = getRecordById(recordId);
    return record?.title || record?.reg_nr || `Record ${recordId}`;
  }, [getRecordById]);

  // ENHANCED: Navigation breadcrumb helpers with inheritance awareness
  const getCurrentBreadcrumbPath = useCallback(() => {
    const path = [];
    
    if (currentInventory) {
      const inventory = getInventoryById(currentInventory);
      if (inventory) {
        path.push({ type: 'inventory', id: currentInventory, label: `${inventory.type} ${inventory.number}` });
      }
    }
    
    if (currentItem) {
      const item = getItemById(currentItem);
      if (item) {
        path.push({ type: 'item', id: currentItem, label: `Item ${item.number}` });
      }
    }
    
    if (currentRecord) {
      const identifier = getRecordIdentifier(currentRecord);
      path.push({ type: 'record', id: currentRecord, label: identifier });
    }
    
    return path;
  }, [currentInventory, currentItem, currentRecord, getInventoryById, getItemById, getRecordIdentifier]);

  // ENHANCED: Get navigation stats with inheritance breakdown
  const getNavigationStats = useCallback(() => {
    return {
      totalItems: getAllItemsFromProject().length,
      totalRecords: getAllRecordsFromProject().length,
      currentLevel: currentRecord ? 'record' : currentItem ? 'item' : currentInventory ? 'inventory' : 'project',
      historyDepth: navigationHistory.length
    };
  }, [getAllItemsFromProject, getAllRecordsFromProject, currentRecord, currentItem, currentInventory, navigationHistory.length]);

  // FIX: New method to validate current navigation state
  const validateNavigationState = useCallback(() => {
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
  }, [currentRecord, currentItem, currentInventory, getRecordById, getItemById]);

  // Clear active tab (for use after component has consumed it)
  const clearActiveTab = useCallback(() => {
    console.log('🔄 NavigationContext: clearActiveTab called');
    setActiveTab(null);
    activeTabRef.current = null;
  }, []);

  // Get active tab from ref (useful for initial mount)
  const getActiveTab = useCallback(() => {
    return activeTabRef.current;
  }, []);

  // Provide the navigation state and functions
  const value = {
    // Navigation state
    currentInventory,
    currentItem,
    currentRecord,
    navigationHistory,

    // Active tab state - for controlling which tab/view to show
    activeTab,
    setActiveTab,
    clearActiveTab,
    getActiveTab,

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