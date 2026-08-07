import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useSettings } from '../Settings/context/SettingsContext';

const GuidanceContext = createContext();

export function useGuidance() {
  const context = useContext(GuidanceContext);
  if (!context) {
    throw new Error('useGuidance must be used within GuidanceProvider');
  }
  return context;
}

export function GuidanceProvider({ children }) {
  // Persisted guidance preferences (enabled / showMode / position) live in
  // SettingsContext under `opex_settings`, so they are editable from the
  // Settings modal and exported/imported with the rest of the settings.
  // This context only owns the throwaway session state: whether the user
  // hid or minimised the card for now.
  const { settings: appSettings } = useSettings();
  const settings = useMemo(() => appSettings.guidance || {}, [appSettings.guidance]);

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
    try { localStorage.setItem('dismissedGuidanceActions', JSON.stringify(dismissedActions)); } catch {}
  }, [dismissedActions]);

  const dismissAction = useCallback((actionId) => {
    setDismissedActions(prev => (prev.includes(actionId) ? prev : [...prev, actionId]));
  }, []);

  const undismissAction = useCallback((actionId) => {
    setDismissedActions(prev => prev.filter(id => id !== actionId));
  }, []);

  const resetDismissed = useCallback(() => {
    setDismissedActions([]);
  }, []);

  // Whether the card should be on screen at all, given the saved preferences
  // and whether the project currently has anything worth flagging.
  const shouldShowGuide = useCallback((hasIssues) => {
    if (settings.enabled === false) return false;
    if (settings.showMode === 'never') return false;
    if (settings.showMode === 'always') return true;
    // 'auto' mode: only surface the card when there is something to act on
    return Boolean(hasIssues);
  }, [settings.enabled, settings.showMode]);

  const value = useMemo(() => ({
    isVisible,
    setIsVisible,
    isMinimized,
    setIsMinimized,
    settings,
    dismissedActions,
    dismissAction,
    undismissAction,
    resetDismissed,
    shouldShowGuide
  }), [
    isVisible, isMinimized, settings, dismissedActions,
    dismissAction, undismissAction, resetDismissed, shouldShowGuide
  ]);

  return (
    <GuidanceContext.Provider value={value}>
      {children}
    </GuidanceContext.Provider>
  );
}

export default GuidanceContext;
