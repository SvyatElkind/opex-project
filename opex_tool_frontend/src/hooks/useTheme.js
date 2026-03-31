import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSettings } from '../Settings/context/SettingsContext';

export const useTheme = () => {
  const { settings } = useSettings();
  const theme = settings.theme || 'light';
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const handleMediaChange = useCallback((e) => {
    setSystemDark(e.matches);
  }, []);

  useEffect(() => {
    const applyTheme = (selectedTheme, prefersDark) => {
      document.documentElement.removeAttribute('data-theme');

      if (selectedTheme === 'auto') {
        if (prefersDark) {
          document.documentElement.setAttribute('data-theme', 'dark');
        }
      } else if (selectedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    };

    applyTheme(theme, systemDark);

    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', handleMediaChange);
      return () => mediaQuery.removeEventListener('change', handleMediaChange);
    }
  }, [theme, systemDark, handleMediaChange]);

  const { activeTheme, isDark } = useMemo(() => {
    const active = theme === 'auto' ? (systemDark ? 'dark' : 'light') : theme;
    return { activeTheme: active, isDark: active === 'dark' };
  }, [theme, systemDark]);

  return { theme, activeTheme, isDark };
};

export default useTheme;
