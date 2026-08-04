import React from 'react';
import { IMPORT_UI } from '../../Constants/Constants';
import { exampleUrl } from '../../Constants/importConstants';

/**
 * Experimental features tab.
 *
 * Everything here is off by default and gated: while a toggle is off, the
 * feature has no entry point anywhere in the app. The warning is deliberately
 * blunt — an experimental feature must not be mistaken for the finished tool.
 */
const ExperimentalSettings = ({ settings, onChange }) => {
    const experimental = settings.experimental || {};

    const handleChange = (key, value) => {
        onChange('experimental', { ...experimental, [key]: value });
    };

    return (
        <div className="settings-section">
            <h3><i className="fas fa-flask"></i> {IMPORT_UI.EXPERIMENTAL_TITLE}</h3>

            <div className="settings-experimental-warning">
                <i className="fas fa-exclamation-triangle"></i>
                <span>{IMPORT_UI.EXPERIMENTAL_INTRO}</span>
            </div>

            <div className="settings-divider"></div>

            <div className="settings-field settings-checkbox">
                <label>
                    <input
                        type="checkbox"
                        checked={experimental.spreadsheetImport === true}
                        onChange={(e) => handleChange('spreadsheetImport', e.target.checked)}
                    />
                    <span>
                        {IMPORT_UI.EXPERIMENTAL_IMPORT_LABEL}
                        <span className="settings-experimental-badge">{IMPORT_UI.EXPERIMENTAL_BADGE}</span>
                    </span>
                </label>
                <small>{IMPORT_UI.EXPERIMENTAL_IMPORT_HELP}</small>
            </div>

            {experimental.spreadsheetImport === true && (
                <div className="settings-experimental-examples">
                    <h4>{IMPORT_UI.EXAMPLES_TITLE}</h4>
                    <p className="settings-description">{IMPORT_UI.EXAMPLES_HINT}</p>
                    <ul className="settings-example-list">
                        <li>
                            <a href={exampleUrl('xlsx')} download>
                                <i className="fas fa-file-excel"></i> {IMPORT_UI.EXAMPLE_XLSX}
                            </a>
                        </li>
                        <li>
                            <a href={exampleUrl('csv')} download>
                                <i className="fas fa-file-csv"></i> {IMPORT_UI.EXAMPLE_CSV}
                            </a>
                        </li>
                        <li>
                            <a href={exampleUrl('csvItems')} download>
                                <i className="fas fa-file-csv"></i> {IMPORT_UI.EXAMPLE_CSV_ITEMS}
                            </a>
                        </li>
                        <li>
                            <a href={exampleUrl('csvRecords')} download>
                                <i className="fas fa-file-csv"></i> {IMPORT_UI.EXAMPLE_CSV_RECORDS}
                            </a>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ExperimentalSettings;
