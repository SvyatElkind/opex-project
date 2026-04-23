import React, { createContext, useContext, useState, useEffect } from 'react';

const GuidanceContext = createContext();

export function useGuidance() {
  const context = useContext(GuidanceContext);
  if (!context) {
    throw new Error('useGuidance must be used within GuidanceProvider');
  }
  return context;
}

export function GuidanceProvider({ children }) {
  // Visibility state
  const [isVisible, setIsVisible] = useState(() => {
    try {
      const saved = localStorage.getItem('guidanceVisible');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [isMinimized, setIsMinimized] = useState(() => {
    try {
      const saved = localStorage.getItem('guidanceMinimized');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('guidanceSettings');
      return saved ? JSON.parse(saved) : {
        showMode: 'auto',
        position: 'bottom-right',
        showCriticalErrors: true,
        showMissingData: true,
        showEmptyContainers: true,
        showOptimizations: false
      };
    } catch {
      return {
        showMode: 'auto',
        position: 'bottom-right',
        showCriticalErrors: true,
        showMissingData: true,
        showEmptyContainers: true,
        showOptimizations: false
      };
    }
  });

  const [dismissedActions, setDismissedActions] = useState(() => {
    try {
      const saved = localStorage.getItem('dismissedGuidanceActions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try { localStorage.setItem('guidanceVisible', JSON.stringify(isVisible)); } catch {}
  }, [isVisible]);

  useEffect(() => {
    try { localStorage.setItem('guidanceMinimized', JSON.stringify(isMinimized)); } catch {}
  }, [isMinimized]);

  useEffect(() => {
    try { localStorage.setItem('guidanceSettings', JSON.stringify(settings)); } catch {}
  }, [settings]);

  useEffect(() => {
    try { localStorage.setItem('dismissedGuidanceActions', JSON.stringify(dismissedActions)); } catch {}
  }, [dismissedActions]);

  const dismissAction = (actionId) => {
    setDismissedActions(prev => {
      if (prev.includes(actionId)) return prev;
      return [...prev, actionId];
    });
  };

  const undismissAction = (actionId) => {
    setDismissedActions(prev => prev.filter(id => id !== actionId));
  };

  const resetDismissed = () => {
    setDismissedActions([]);
  };

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Determine if guide should be shown based on settings
  const shouldShowGuide = (hasErrors) => {
    if (settings.showMode === 'never') return false;
    if (settings.showMode === 'always') return true;
    // 'auto' mode: show if there are errors or warnings
    return hasErrors;
  };

  const value = {
    isVisible,
    setIsVisible,
    isMinimized,
    setIsMinimized,
    settings,
    updateSettings,
    dismissedActions,
    dismissAction,
    undismissAction,
    resetDismissed,
    shouldShowGuide
  };

  return (
    <GuidanceContext.Provider value={value}>
      {children}
    </GuidanceContext.Provider>
  );
}

export default GuidanceContext;
