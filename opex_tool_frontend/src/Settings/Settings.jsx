import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useSettings } from './context/SettingsContext';
import { useNotification } from '../components/Notification';
import FormDefaults from './components/FormDefaults';
import DisplaySettings from './components/DisplaySettings';
import ValidationSettings from './components/ValidationSettings';
import ExperimentalSettings from './components/ExperimentalSettings';
import { IMPORT_UI } from '../Constants/Constants';
import './Settings.css';

const Settings = ({ onClose }) => {
  const { settings, updateMultipleSettings } = useSettings();
  const { notify, showConfirm } = useNotification();
  const [activeTab, setActiveTab] = useState('display');
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const tabs = [
    { id: 'display', label: 'Attēlošana', icon: 'fa-palette' },
    { id: 'forms', label: 'Formas', icon: 'fa-file-alt' },
    { id: 'validation', label: 'Validācija', icon: 'fa-exclamation-triangle' },
    { id: 'experimental', label: IMPORT_UI.EXPERIMENTAL_TAB, icon: 'fa-flask' },
  ];

  const handleLocalChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMultipleSettings(localSettings);
    setHasChanges(false);
    notify.success('Iestatījumi saglabāti!');
  };

  const handleCancel = async () => {
    if (hasChanges) {
      const ok = await showConfirm({
        title: 'Nesaglabātas izmaiņas',
        message: 'Ir nesaglabātas izmaiņas. Vai tiešām aizvērt?',
        confirmText: 'Aizvērt',
        cancelText: 'Palikt',
        variant: 'warning'
      });
      if (ok) onClose();
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
            {activeTab === 'display' && (
              <DisplaySettings settings={localSettings} onChange={handleLocalChange} />
            )}
            {activeTab === 'forms' && (
              <FormDefaults />
            )}
            {activeTab === 'validation' && (
              <ValidationSettings settings={localSettings} onChange={handleLocalChange} />
            )}
            {activeTab === 'experimental' && (
              <ExperimentalSettings settings={localSettings} onChange={handleLocalChange} />
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
