import React from 'react';
import { GUIDANCE_UI } from '../../Constants/guidanceConstants';
import { useNotification } from '../../components/Notification';

/**
 * Smart Guide (vadlīnijas) settings tab.
 *
 * `enabled` is the master switch — while it is off the guidance card is not
 * mounted at all (see Project.js), so nothing below it has any effect. The
 * sub-settings are therefore hidden while the master switch is off.
 *
 * All edits go into the local settings draft held by Settings.jsx and only
 * take effect once "Saglabāt izmaiņas" is pressed. The one exception is the
 * reset button — clearing dismissed warnings is an immediate action on
 * localStorage, not a setting, so it applies at once.
 */
const DISMISSED_WARNINGS_KEY = 'opex_dismissed_warnings';
const DISMISSED_ACTIONS_KEY = 'dismissedGuidanceActions';

const GuidanceSettings = ({ settings, onChange }) => {
  const { notify } = useNotification();
  const guidance = settings.guidance || {};

  const handleChange = (key, value) => {
    onChange('guidance', { ...guidance, [key]: value });
  };

  const handleResetDismissed = () => {
    try {
      localStorage.removeItem(DISMISSED_WARNINGS_KEY);
      localStorage.removeItem(DISMISSED_ACTIONS_KEY);
      notify.success(GUIDANCE_UI.SETTINGS_RESET_DONE);
    } catch {
      // localStorage unavailable — nothing to reset
    }
  };

  const isEnabled = guidance.enabled !== false;

  return (
    <div className="settings-section">
      <h3><i className="fas fa-compass"></i> {GUIDANCE_UI.SETTINGS_TITLE}</h3>
      <p className="settings-description">{GUIDANCE_UI.SETTINGS_DESCRIPTION}</p>

      <div className="settings-divider"></div>

      <div className="settings-field settings-checkbox">
        <label>
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => handleChange('enabled', e.target.checked)}
          />
          <span>{GUIDANCE_UI.SETTINGS_ENABLED}</span>
        </label>
        <small>{GUIDANCE_UI.SETTINGS_ENABLED_HELP}</small>
      </div>

      {isEnabled && (
        <>
          <div className="settings-field">
            <label htmlFor="guidance-show-mode">{GUIDANCE_UI.SETTINGS_SHOW_MODE}</label>
            <select
              id="guidance-show-mode"
              value={guidance.showMode || 'auto'}
              onChange={(e) => handleChange('showMode', e.target.value)}
            >
              <option value="always">{GUIDANCE_UI.SETTINGS_SHOW_ALWAYS}</option>
              <option value="auto">{GUIDANCE_UI.SETTINGS_SHOW_AUTO}</option>
              <option value="never">{GUIDANCE_UI.SETTINGS_SHOW_NEVER}</option>
            </select>
            <small>{GUIDANCE_UI.SETTINGS_SHOW_MODE_HELP}</small>
          </div>

          <div className="settings-field">
            <label htmlFor="guidance-position">{GUIDANCE_UI.SETTINGS_POSITION}</label>
            <select
              id="guidance-position"
              value={guidance.position || 'bottom-right'}
              onChange={(e) => handleChange('position', e.target.value)}
            >
              <option value="bottom-right">{GUIDANCE_UI.SETTINGS_POS_BOTTOM_RIGHT}</option>
              <option value="top-right">{GUIDANCE_UI.SETTINGS_POS_TOP_RIGHT}</option>
            </select>
            <small>{GUIDANCE_UI.SETTINGS_POSITION_HELP}</small>
          </div>

          <div className="settings-divider"></div>

          <div className="settings-field">
            <button
              type="button"
              className="settings-btn settings-btn-cancel"
              onClick={handleResetDismissed}
            >
              <i className="fas fa-undo"></i> {GUIDANCE_UI.SETTINGS_RESET}
            </button>
            <small>{GUIDANCE_UI.SETTINGS_RESET_HELP}</small>
          </div>
        </>
      )}
    </div>
  );
};

export default GuidanceSettings;
