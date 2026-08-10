import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ITEM_SECURITY_LEVEL_LIST, ITEM_RESTRICTION_LIST } from '../../Constants/itemConstants';
import { RECORD_ACCESS_RESTRICTION_VALUES } from '../../Constants/recordConstants';

// Priekšiestatījumu lauki, kuru vērtībai jāsakrīt ar formu izvēlnēm.
const VALID_PRESET_VALUES = {
  securityLevel: ITEM_SECURITY_LEVEL_LIST,
  restriction: ITEM_RESTRICTION_LIST,
  accessRestriction: RECORD_ACCESS_RESTRICTION_VALUES,
};

// Iestatījumu izvēlnes kādreiz piedāvāja vērtības, kādu formās nekad nav bijis.
// Tās joprojām stāv lietotāju localStorage, un forma, saņēmusi vērtību, kas
// nesakrīt ne ar vienu opciju, rāda tukšu "—" noklusējuma vietā. Šeit tās tiek
// pārtulkotas uz to, kas bija domāts.
const LEGACY_PRESET_VALUES = {
  securityLevel: { 'Iekšējam lietojumam': 'Iekšējs' },
  restriction: { 'Konfidenciāla': 'Sensitīvi dati' },
  accessRestriction: { restricted: 'closed' },
};

/**
 * Nomaina priekšiestatījuma vērtības, kuras formas neatpazīst. Pilnīgi nezināma
 * vērtība tiek noņemta, lai forma paņem savu noklusējumu, nevis paliek tukša.
 * Atgriež to pašu objektu, ja nekas nav jālabo.
 */
const normalizePreset = (preset) => {
  if (!preset) return preset;

  const fixes = {};
  Object.entries(VALID_PRESET_VALUES).forEach(([field, validValues]) => {
    const value = preset[field];
    if (!value || validValues.includes(value)) return;
    // undefined => patērētājs liks savu noklusējumu ("Publisks" u.tml.).
    fixes[field] = LEGACY_PRESET_VALUES[field]?.[value];
  });

  return Object.keys(fixes).length > 0 ? { ...preset, ...fixes } : preset;
};

// Default settings
const DEFAULT_SETTINGS = {
  // General
  itemsPerPage: 25,

  // Form defaults
  defaultRecordLanguage: 'latviešu',
  defaultItemLanguage: 'latviešu',
  defaultAccessRestriction: 'open',
  defaultSecurityLevel: 'Publisks',

  // Display
  theme: 'auto', // 'light', 'dark', or 'auto'
  fontSize: 'medium',
  compactView: false,
  showBreadcrumbs: true,

  // Form Presets - User-defined preset configurations
  formPresets: [
    {
      id: 'default',
      name: 'Noklusējums',
      isDefault: true,
      itemLanguage: 'latviešu',
      recordLanguage: 'latviešu',
      accessRestriction: 'open',
      securityLevel: 'Publisks',
      restriction: 'Vispārēja',
      keyWords: '',
      notes: ''
    }
  ],
  activePresetId: 'default',

  // Experimental features - all OFF by default. While a flag is off, the
  // feature has no entry point in the UI at all.
  experimental: {
    spreadsheetImport: false, // CSV/Excel import of items and records
  },

  // Smart Guide (vadlīnijas) - the floating guidance card
  guidance: {
    enabled: true,              // Master toggle - hides the card entirely when off
    showMode: 'auto',           // 'always' | 'auto' (only when there are issues) | 'never'
    position: 'bottom-right',   // 'bottom-right' | 'top-right'
  },

  // Validation Warnings - Thresholds for file/media validation (warnings only, not hard limits)
  validation: {
    // Global enable/disable
    enabled: true, // Master toggle for all validation warnings

    // Specific warning toggles
    enableFileSizeWarnings: true,
    enableDurationWarnings: true,
    enableImageDimensionWarnings: true,
    enableOrientationWarnings: true,

    // File size warning thresholds in MB
    maxFileSize: 100,
    minFileSize: 0.01, // 10 KB minimum
    // Duration warning thresholds in seconds (for audio/video files)
    maxDuration: 3600, // 1 hour
    minDuration: 1, // 1 second minimum
    // Image dimensions warning thresholds in pixels
    maxImageWidth: 4000,
    maxImageHeight: 4000,
    minImageWidth: 800,
    minImageHeight: 600,
    // Preferred image orientation: 'any', 'horizontal', 'vertical', 'square'
    preferredOrientation: 'any'
  }
};

const STORAGE_KEY = 'opex_settings';

/**
 * Merge stored settings over the defaults.
 *
 * A plain `{ ...DEFAULT_SETTINGS, ...stored }` is not enough: for nested groups
 * (`validation`, `experimental`, `guidance`) the stored object REPLACES the
 * default wholesale, so any key added to a group in a later version stays
 * `undefined` for every user who already has settings saved. Merging one level
 * deep keeps new sub-keys reaching existing users.
 */
const NESTED_GROUPS = ['validation', 'experimental', 'guidance'];

const mergeWithDefaults = (stored) => {
  const merged = { ...DEFAULT_SETTINGS, ...stored };

  NESTED_GROUPS.forEach(group => {
    merged[group] = {
      ...DEFAULT_SETTINGS[group],
      ...(stored?.[group] || {})
    };
  });

  return merged;
};

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    // Load from localStorage on init
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return mergeWithDefaults(JSON.parse(stored));
      }
    } catch (error) {
      // Settings load failed, will use defaults
    }
    return mergeWithDefaults(null);
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      // Settings save failed silently
    }
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateMultipleSettings = (updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    setSettings(mergeWithDefaults(null));
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `opex-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          setSettings(mergeWithDefaults(imported));
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // Preset Management Functions
  const createPreset = (presetData) => {
    const newPreset = {
      id: `preset_${Date.now()}`,
      name: presetData.name || 'Jauns Priekšiestatījums',
      isDefault: false,
      ...presetData
    };
    setSettings(prev => ({
      ...prev,
      formPresets: [...prev.formPresets, newPreset]
    }));
    return newPreset.id;
  };

  const updatePreset = (presetId, updates) => {
    setSettings(prev => ({
      ...prev,
      formPresets: prev.formPresets.map(preset =>
        preset.id === presetId ? { ...preset, ...updates } : preset
      )
    }));
  };

  const deletePreset = (presetId) => {
    setSettings(prev => {
      const preset = prev.formPresets.find(p => p.id === presetId);
      if (preset?.isDefault) {
        throw new Error('Nevar dzēst noklusējuma priekšiestatījumu');
      }
      return {
        ...prev,
        formPresets: prev.formPresets.filter(p => p.id !== presetId),
        activePresetId: prev.activePresetId === presetId ? 'default' : prev.activePresetId
      };
    });
  };

  const duplicatePreset = (presetId) => {
    const preset = settings.formPresets.find(p => p.id === presetId);
    if (!preset) return null;

    const newPreset = {
      ...preset,
      id: `preset_${Date.now()}`,
      name: `${preset.name} (kopija)`,
      isDefault: false
    };
    setSettings(prev => ({
      ...prev,
      formPresets: [...prev.formPresets, newPreset]
    }));
    return newPreset.id;
  };

  const setActivePreset = (presetId) => {
    setSettings(prev => ({ ...prev, activePresetId: presetId }));
  };

  // Memoizēts, lai atsauce nemainītos katrā renderī — patērētāji to lieto kā
  // useMemo/useEffect atkarību.
  const activePreset = useMemo(() => {
    const presets = settings.formPresets || [];
    return normalizePreset(presets.find(p => p.id === settings.activePresetId) || presets[0]);
  }, [settings.formPresets, settings.activePresetId]);

  const getActivePreset = useCallback(() => activePreset, [activePreset]);

  const value = {
    settings,
    updateSetting,
    updateMultipleSettings,
    resetSettings,
    exportSettings,
    importSettings,
    DEFAULT_SETTINGS,
    // Preset management
    createPreset,
    updatePreset,
    deletePreset,
    duplicatePreset,
    setActivePreset,
    getActivePreset
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

export default SettingsContext;
