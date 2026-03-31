import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import InheritanceUtils from '../../Utils/InheritanceUtils';

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const [currentInventory, setCurrentInventory] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [navigationHistory, setNavigationHistory] = useState([]);

  const [activeTab, setActiveTab] = useState(null);
  const activeTabRef = useRef(null);

  const [projectData, setProjectData] = useState(null);
  const [currentProjectId, setCurrentProjectId] = useState(null);

  const currentInventoryRef = useRef(currentInventory);
  const currentItemRef = useRef(currentItem);
  const currentRecordRef = useRef(currentRecord);

  currentInventoryRef.current = currentInventory;
  currentItemRef.current = currentItem;
  currentRecordRef.current = currentRecord;

  const navigateTo = useCallback((type, id, parentId = null, itemId = null, options = null) => {
      if (typeof id === 'object' && id !== null) {
          const params = id;
          const actualId = params.id || params.recordId || params.itemId || params.inventoryId;
          const actualParentId = params.parentId || params.inventoryId;
          const actualItemId = params.itemId;
          return navigateTo(type, actualId, actualParentId, actualItemId, options);
      }

      if (options && options.tab) {
          setActiveTab(options.tab);
          activeTabRef.current = options.tab;
      } else {
          const isNavigatingBackFromRecord = type === 'item' && currentRecordRef.current;
          if (!isNavigatingBackFromRecord) {
              setActiveTab(null);
              activeTabRef.current = null;
          }
      }

      setNavigationHistory(prev => [
        ...prev,
        {
          inventory: currentInventoryRef.current,
          item: currentItemRef.current,
          record: currentRecordRef.current,
          timestamp: Date.now()
        }
      ]);

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
          const recordId = typeof id === 'number' ? id : parseInt(id, 10);
          if (isNaN(recordId)) return;

          if (parentId) setCurrentInventory(parentId);
          if (itemId) setCurrentItem(itemId);
          setCurrentRecord(recordId);
          break;

        default:
          break;
      }
  },[]);

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

  const navigateBack = useCallback(() => {
    if (navigationHistory.length > 0) {
      const prevState = navigationHistory[navigationHistory.length - 1];

      setCurrentInventory(prevState.inventory);
      setCurrentItem(prevState.item);
      setCurrentRecord(prevState.record);
      
      setNavigationHistory(prev => prev.slice(0, -1));
      
      return true;
    }
    return false;
  },[navigationHistory]);

  const navigateBackSmart = useCallback(() => {
    if (currentRecord && currentItem) {
      const item = getItemById(currentItem);
      const inventory = getInventoryById(currentInventory);

      if (item && inventory) {
        const inheritanceInfo = InheritanceUtils.getInheritanceInfo(inventory);

        if (inheritanceInfo.isTextual || inheritanceInfo.isMedia) {
          setCurrentRecord(null);
          return true;
        }
      }
    }

    if (currentItem && !currentRecord) {
      setCurrentItem(null);
      setCurrentRecord(null);
      return true;
    }

    if (currentInventory && !currentItem) {
      setCurrentInventory(null);
      return true;
    }

    return navigateBack();
  }, [currentRecord, currentItem, currentInventory, getItemById, getInventoryById, navigateBack]);


  const updateProjectData = useCallback((data, projectId) => {
    setProjectData(data);
    setCurrentProjectId(projectId);
  }, []);

  const getAllItemsFromProject = useCallback(() => {
    if (!projectData?.institution?.fond?.inventories) return [];
    
    const allItems = [];
    
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

  const getInventoryNumber = useCallback((inventoryId) => {
    const inventory = getInventoryById(inventoryId);
    return inventory?.number || null;
  }, [getInventoryById]);

  const getItemNumber = useCallback((itemId) => {
    const item = getItemById(itemId);
    return item?.number || null;
  }, [getItemById]);

  const getRecordIdentifier = useCallback((recordId) => {
    const record = getRecordById(recordId);
    return record?.title || record?.reg_nr || `Record ${recordId}`;
  }, [getRecordById]);

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

  const getNavigationStats = useCallback(() => {
    return {
      totalItems: getAllItemsFromProject().length,
      totalRecords: getAllRecordsFromProject().length,
      currentLevel: currentRecord ? 'record' : currentItem ? 'item' : currentInventory ? 'inventory' : 'project',
      historyDepth: navigationHistory.length
    };
  }, [getAllItemsFromProject, getAllRecordsFromProject, currentRecord, currentItem, currentInventory, navigationHistory.length]);

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

  const clearActiveTab = useCallback(() => {
    setActiveTab(null);
    activeTabRef.current = null;
  }, []);

  const getActiveTab = useCallback(() => {
    return activeTabRef.current;
  }, []);

  const value = {
    currentInventory,
    currentItem,
    currentRecord,
    navigationHistory,

    activeTab,
    setActiveTab,
    clearActiveTab,
    getActiveTab,

    navigateTo,
    navigateBack,
    navigateBackSmart,

    projectData,
    currentProjectId,
    updateProjectData,

    getAllItemsFromProject,
    getAllRecordsFromProject,
    getRecordById,
    getItemById,
    getInventoryById,

    getInventoryNumber,
    getItemNumber,

    getRecordIdentifier,
    getCurrentBreadcrumbPath,
    getNavigationStats,

    validateNavigationState
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};