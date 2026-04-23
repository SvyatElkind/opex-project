import React, { useState, useCallback } from 'react';
import CopyButton from './CopyButton';

/**
 * ThemeSwitcher — Live color scheme editor for DevAdmin
 *
 * Overrides CSS variables on :root in real-time.
 * Changes are NOT saved — they reset on page refresh.
 * Includes preset themes and a custom color picker.
 */

const PRESETS = {
  default: {
    name: 'Default (Current)',
    colors: {
      '--color-primary': '#596D69',
      '--color-secondary': '#6B7FA0',
      '--color-tertiary': '#B5A88E',
      '--color-error': '#744245',
      '--color-warning': '#E1B781',
      '--color-info': '#6ba3b8',
      '--color-background': '#ffffff',
      '--text-primary': '#59636e',
    }
  },
  ocean: {
    name: 'Ocean Blue',
    colors: {
      '--color-primary': '#1e6091',
      '--color-secondary': '#168aad',
      '--color-tertiary': '#76c893',
      '--color-error': '#9b2226',
      '--color-warning': '#ee9b00',
      '--color-info': '#48cae4',
      '--color-background': '#f8f9fa',
      '--text-primary': '#264653',
    }
  },
  forest: {
    name: 'Forest Green',
    colors: {
      '--color-primary': '#2d6a4f',
      '--color-secondary': '#40916c',
      '--color-tertiary': '#95d5b2',
      '--color-error': '#ae2012',
      '--color-warning': '#e9c46a',
      '--color-info': '#52b788',
      '--color-background': '#f5f7f5',
      '--text-primary': '#1b4332',
    }
  },
  sunset: {
    name: 'Sunset Warm',
    colors: {
      '--color-primary': '#9c6644',
      '--color-secondary': '#b07d62',
      '--color-tertiary': '#ddb892',
      '--color-error': '#ae2012',
      '--color-warning': '#ee9b00',
      '--color-info': '#ca6702',
      '--color-background': '#fefae0',
      '--text-primary': '#6b4226',
    }
  },
  nordic: {
    name: 'Nordic Ice',
    colors: {
      '--color-primary': '#5e6472',
      '--color-secondary': '#7c8594',
      '--color-tertiary': '#b8c0cc',
      '--color-error': '#8b3a3a',
      '--color-warning': '#c4a35a',
      '--color-info': '#6b9fbe',
      '--color-background': '#f0f2f5',
      '--text-primary': '#3d4250',
    }
  },
  royal: {
    name: 'Royal Purple',
    colors: {
      '--color-primary': '#6a4c93',
      '--color-secondary': '#8e7ab5',
      '--color-tertiary': '#b8a9c9',
      '--color-error': '#c1292e',
      '--color-warning': '#f4b942',
      '--color-info': '#8187dc',
      '--color-background': '#faf8ff',
      '--text-primary': '#4a3760',
    }
  },
  monochrome: {
    name: 'Monochrome',
    colors: {
      '--color-primary': '#4a4a4a',
      '--color-secondary': '#6a6a6a',
      '--color-tertiary': '#9a9a9a',
      '--color-error': '#8b0000',
      '--color-warning': '#b8860b',
      '--color-info': '#4682b4',
      '--color-background': '#fafafa',
      '--text-primary': '#333333',
    }
  },
  highContrast: {
    name: 'High Contrast',
    colors: {
      '--color-primary': '#000080',
      '--color-secondary': '#006400',
      '--color-tertiary': '#8b4513',
      '--color-error': '#cc0000',
      '--color-warning': '#cc8800',
      '--color-info': '#0066cc',
      '--color-background': '#ffffff',
      '--text-primary': '#000000',
    }
  },
};

// Derived variables that should update when base colors change
const DERIVED_MAP = {
  '--color-primary': [
    ['--color-primary-dark', -20],
    ['--color-primary-light', 20],
    ['--color-primary-rgb', 'rgb'],
  ],
  '--color-secondary': [
    ['--color-secondary-dark', -20],
    ['--color-secondary-light', 20],
    ['--color-secondary-rgb', 'rgb'],
  ],
  '--color-tertiary': [
    ['--color-tertiary-dark', -20],
    ['--color-tertiary-light', 20],
    ['--color-tertiary-rgb', 'rgb'],
  ],
  '--color-error': [
    ['--color-error-dark', -20],
    ['--color-error-light', 20],
    ['--color-error-rgb', 'rgb'],
  ],
  '--color-warning': [
    ['--color-warning-dark', -20],
    ['--color-warning-light', 20],
    ['--color-warning-rgb', 'rgb'],
  ],
  '--color-info': [
    ['--color-info-dark', -20],
    ['--color-info-light', 20],
    ['--color-info-rgb', 'rgb'],
  ],
};

const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
};

const adjustColor = (hex, amount) => {
  const clamp = (n) => Math.max(0, Math.min(255, n));
  const r = clamp(parseInt(hex.slice(1, 3), 16) + amount);
  const g = clamp(parseInt(hex.slice(3, 5), 16) + amount);
  const b = clamp(parseInt(hex.slice(5, 7), 16) + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const EDITABLE_VARS = [
  { key: '--color-primary', label: 'Primary' },
  { key: '--color-secondary', label: 'Secondary' },
  { key: '--color-tertiary', label: 'Tertiary' },
  { key: '--color-error', label: 'Error' },
  { key: '--color-warning', label: 'Warning' },
  { key: '--color-info', label: 'Info' },
  { key: '--color-background', label: 'Background' },
  { key: '--text-primary', label: 'Text' },
];

const ThemeSwitcher = () => {
  const [activePreset, setActivePreset] = useState('default');
  const [customColors, setCustomColors] = useState({ ...PRESETS.default.colors });

  const applyColors = useCallback((colors) => {
    const root = document.documentElement;
    Object.entries(colors).forEach(([varName, value]) => {
      root.style.setProperty(varName, value);

      // Update derived variables
      const derived = DERIVED_MAP[varName];
      if (derived && value.startsWith('#')) {
        derived.forEach(([derivedVar, adjustment]) => {
          if (adjustment === 'rgb') {
            root.style.setProperty(derivedVar, hexToRgb(value));
          } else {
            root.style.setProperty(derivedVar, adjustColor(value, adjustment));
          }
        });
      }
    });
  }, []);

  const handlePresetChange = (presetKey) => {
    setActivePreset(presetKey);
    const colors = PRESETS[presetKey].colors;
    setCustomColors({ ...colors });
    applyColors(colors);
  };

  const handleColorChange = (varName, value) => {
    const updated = { ...customColors, [varName]: value };
    setCustomColors(updated);
    setActivePreset('custom');
    applyColors({ [varName]: value });
  };

  const handleReset = () => {
    // Remove all inline overrides
    const root = document.documentElement;
    Object.keys(customColors).forEach(varName => {
      root.style.removeProperty(varName);
      const derived = DERIVED_MAP[varName];
      if (derived) {
        derived.forEach(([dv]) => root.style.removeProperty(dv));
      }
    });
    setActivePreset('default');
    setCustomColors({ ...PRESETS.default.colors });
  };

  const exportTheme = () => {
    const lines = [':root {'];
    Object.entries(customColors).forEach(([key, val]) => {
      lines.push(`  ${key}: ${val};`);
      const derived = DERIVED_MAP[key];
      if (derived && val.startsWith('#')) {
        derived.forEach(([dv, adj]) => {
          if (adj === 'rgb') {
            lines.push(`  ${dv}: ${hexToRgb(val)};`);
          } else {
            lines.push(`  ${dv}: ${adjustColor(val, adj)};`);
          }
        });
      }
    });
    lines.push('}');
    return lines.join('\n');
  };

  return (
    <div className="dev-panel-section">
      <div className="dev-panel-header">
        <h3>Theme Switcher</h3>
        <div className="dev-panel-actions">
          <span style={{ color: '#9ca3af', fontSize: 11 }}>
            {activePreset === 'custom' ? 'Custom' : PRESETS[activePreset]?.name}
          </span>
        </div>
      </div>

      {/* Presets */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ color: '#9ca3af', fontSize: 11, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
          Presets
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              className={`dev-btn ${activePreset === key ? 'primary' : ''}`}
              onClick={() => handlePresetChange(key)}
              style={{ padding: '4px 10px', fontSize: 11 }}
            >
              <span style={{
                display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                background: preset.colors['--color-primary'], marginRight: 4, border: '1px solid #fff3'
              }}></span>
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Color Pickers */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ color: '#9ca3af', fontSize: 11, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
          Colors
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {EDITABLE_VARS.map(({ key, label }) => (
            <div key={key} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#111827', padding: '6px 8px', borderRadius: 4
            }}>
              <input
                type="color"
                value={customColors[key]}
                onChange={(e) => handleColorChange(key, e.target.value)}
                style={{ width: 24, height: 24, border: 'none', cursor: 'pointer', borderRadius: 3, padding: 0 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#d1d5db', fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: 10, color: '#6b7280', fontFamily: 'monospace' }}>{customColors[key]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 4 }}>
        <button className="dev-btn" onClick={handleReset}>
          <i className="fas fa-undo"></i>
          <span>Reset</span>
        </button>
        <CopyButton
          getText={exportTheme}
          label="Copy CSS"
        />
      </div>
    </div>
  );
};

export default ThemeSwitcher;
