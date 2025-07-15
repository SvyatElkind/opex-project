import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  // We only need inventory and item now since project is handled by the parent component
  const [currentInventory, setCurrentInventory] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [navigationHistory, setNavigationHistory] = useState([]);

  // Navigation functions
  const navigateTo = (type, id, parentId = null) => {
    // Save current state to history
    setNavigationHistory(prev => [
      ...prev, 
      { inventory: currentInventory, item: currentItem }
    ]);

    // Update current state based on navigation type
    switch(type) {
      case 'project':
        // Just clear other selections when navigating to project
        setCurrentInventory(null);
        setCurrentItem(null);
        break;
      case 'inventory':
        setCurrentInventory(id);
        setCurrentItem(null);
        break;
      case 'item':
        if (parentId) setCurrentInventory(parentId);
        setCurrentItem(id);
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
      
      // Remove the used history entry
      setNavigationHistory(prev => prev.slice(0, -1));
    }
  };

  // Provide the navigation state and functions
  const value = {
    currentInventory,
    currentItem,
    navigateTo,
    navigateBack
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