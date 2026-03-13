import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useSettings } from './context/SettingsContext';
import GeneralSettings from './components/GeneralSettings';
import FormDefaults from './components/FormDefaults';
import DisplaySettings from './components/DisplaySettings';
import ValidationSettings from './components/ValidationSettings';
import HelpSettings from './components/HelpSettings';
import './Settings.css';

const Settings = ({ onClose }) => {
  const { settings, updateMultipleSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('general');
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const tabs = [
    { id: 'general', label: 'Vispārīgie', icon: 'fa-cog' },
    { id: 'forms', label: 'Formas', icon: 'fa-file-alt' },
    { id: 'display', label: 'Attēlošana', icon: 'fa-palette' },
    { id: 'validation', label: 'Validācija', icon: 'fa-exclamation-triangle' },
    { id: 'help', label: 'Palīdzība', icon: 'fa-question-circle' }
  ];

  const handleLocalChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMultipleSettings(localSettings);
    setHasChanges(false);
    alert('✅ Iestatījumi saglabāti!');
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('Ir nesaglabātas izmaiņas. Vai tiešām aizvērt?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div className="settings-overlay" onClick={handleCancel}>
      <div className="settings-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-header">
          <h2><i className="fas fa-cog"></i> Iestatījumi</h2>
          <button onClick={handleCancel} className="settings-close">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Body */}
        <div className="settings-body">
          {/* Sidebar Tabs */}
          <div className="settings-sidebar">
            {tabs.map(tab => (
              <div
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={`fas ${tab.icon}`}></i>
                <span>{tab.label}</span>
              </div>
            ))}
          </div>

          {/* Content Area */}
          <div className="settings-content">
            {activeTab === 'general' && (
              <GeneralSettings settings={localSettings} onChange={handleLocalChange} />
            )}
            {activeTab === 'forms' && (
              <FormDefaults />
            )}
            {activeTab === 'display' && (
              <DisplaySettings settings={localSettings} onChange={handleLocalChange} />
            )}
            {activeTab === 'validation' && (
              <ValidationSettings settings={localSettings} onChange={handleLocalChange} />
            )}
            {activeTab === 'help' && (
              <HelpSettings />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="settings-footer">
          {hasChanges && (
            <span className="settings-changes-indicator">
              <i className="fas fa-exclamation-circle"></i>
              Ir nesaglabātas izmaiņas
            </span>
          )}
          <button onClick={handleCancel} className="settings-btn settings-btn-cancel">
            Atcelt
          </button>
          <button
            onClick={handleSave}
            className="settings-btn settings-btn-save"
            disabled={!hasChanges}
          >
            <i className="fas fa-save"></i> Saglabāt izmaiņas
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Settings;
