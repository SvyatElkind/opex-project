import { useEffect } from 'react';
import { useSettings } from '../Settings/context/SettingsContext';

/**
 * useAppSettings Hook
 *
 * Applies application-wide settings like fontSize and compactView to the document root.
 * This hook ensures that user preferences are reflected throughout the entire application.
 *
 * Settings applied:
 * - fontSize: small, medium, large
 * - compactView: true/false (compact spacing)
 * - showBreadcrumbs: true/false (stored but used by Navigation components)
 */
export const useAppSettings = () => {
  const { settings } = useSettings();

  useEffect(() => {
    const root = document.documentElement;

    // Apply font size setting
    if (settings.fontSize) {
      // Remove existing font size classes
      root.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
      // Add current font size class
      root.classList.add(`font-size-${settings.fontSize}`);
    }

    // Apply compact view setting
    if (settings.compactView) {
      root.classList.add('compact-view');
    } else {
      root.classList.remove('compact-view');
    }
  }, [settings.fontSize, settings.compactView]);

  return {
    fontSize: settings.fontSize,
    compactView: settings.compactView,
    showBreadcrumbs: settings.showBreadcrumbs
  };
};

export default useAppSettings;
