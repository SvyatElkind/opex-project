import { useEffect } from 'react';
import { useSettings } from '../Settings/context/SettingsContext';

/**
 * useTheme Hook
 *
 * Manages application theme (light/dark/auto) and applies it to the document root.
 * Integrates with SettingsContext and listens to system color scheme preferences.
 *
 * Theme modes:
 * - 'light': Force light theme
 * - 'dark': Force dark theme
 * - 'auto': Follow system preference
 */
export const useTheme = () => {
  const { settings } = useSettings();
  const theme = settings.theme || 'light';

  useEffect(() => {
    const applyTheme = (selectedTheme) => {
      // Remove existing theme attribute
      document.documentElement.removeAttribute('data-theme');

      if (selectedTheme === 'auto') {
        // Detect system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const systemTheme = prefersDark ? 'dark' : 'light';

        if (systemTheme === 'dark') {
          document.documentElement.setAttribute('data-theme', 'dark');
        }
      } else if (selectedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
      // For 'light', we don't set attribute (uses :root defaults)
    };

    // Apply theme on mount and when setting changes
    applyTheme(theme);

    // Listen for system preference changes (only when in auto mode)
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = (e) => {
        const newTheme = e.matches ? 'dark' : 'light';
        if (newTheme === 'dark') {
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.removeAttribute('data-theme');
        }
      };

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
      // Legacy browsers
      else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    }
  }, [theme]);

  /**
   * Get the currently active theme (resolves 'auto' to actual theme)
   */
  const getActiveTheme = () => {
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    return theme;
  };

  /**
   * Check if dark mode is currently active
   */
  const isDark = () => {
    return getActiveTheme() === 'dark';
  };

  return {
    theme,
    activeTheme: getActiveTheme(),
    isDark: isDark()
  };
};

export default useTheme;
