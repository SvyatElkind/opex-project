import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CalendarComponent from '../Utils/CalendarComponent';
import FieldHelp from './FieldHelp';
import { parseDate, formatDate, DATEPICKER_FORMAT, DATE_PLACEHOLDER } from '../Utils/DateFormatter';
import { BULK_MODES, MIXED, languageToTags } from '../Constants/bulkConstants';
import { BULK_UI } from '../Constants/Constants';
import './BulkEditPopup.css';

/**
 * Renders one field descriptor from bulkConstants.js. Used by both the bulk
 * edit popup (wrapped in BulkFieldRow, with a "change this field" checkbox)
 * and the multi-create popup (bare, since every shared field applies).
 */
export const BulkFieldControl = ({ descriptor, values, onChange, disabled = false }) => {
    const key = descriptor.keys?.[0];
    const rawValue = values[key];
    const isMixed = rawValue === MIXED;
    const value = isMixed ? '' : (rawValue ?? '');

    const setValue = (next) => onChange({ [key]: next });

    switch (descriptor.type) {
        case 'itemDates':
            return (
                <CalendarComponent
                    onDateChange={(start, end, view) => onChange({
                        start_date: start ? formatDate(start) : '',
                        end_date: end ? formatDate(end) : '',
                        date_indicator: view,
                    })}
                    startDate={values.start_date === MIXED ? '' : (values.start_date || '')}
                    endDate={values.end_date === MIXED ? '' : (values.end_date || '')}
                    dateIndicator={values.date_indicator === MIXED ? 'day' : (values.date_indicator || 'day')}
                    hideLabels={true}
                    compactPlaceholders={true}
                    usePortal={true}
                />
            );

        case 'date':
            return (
                <DatePicker
                    selected={parseDate(value)}
                    onChange={(date) => setValue(date ? formatDate(date, 'YYYY-MM-DD') : '')}
                    dateFormat={DATEPICKER_FORMAT}
                    placeholderText={isMixed ? BULK_UI.MIXED_VALUES : DATE_PLACEHOLDER}
                    className="create-item-nav-input"
                    disabled={disabled}
                    isClearable={!disabled}
                    portalId="bulk-popup-datepicker-portal"
                    popperClassName="bulk-popup-datepicker-popper"
                />
            );

        case 'select':
            return (
                <select
                    className="create-item-nav-select"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={disabled}
                >
                    {isMixed && <option value="">{`— ${BULK_UI.MIXED_VALUES} —`}</option>}
                    {!isMixed && !descriptor.options.some(o => o.value === value) && (
                        <option value="">—</option>
                    )}
                    {descriptor.options.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            );

        case 'number':
            return (
                <input
                    type="number"
                    min="0"
                    className="create-item-nav-input"
                    value={value}
                    placeholder={isMixed ? BULK_UI.MIXED_VALUES : '0'}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={disabled}
                />
            );

        case 'textarea':
            return (
                <textarea
                    className="create-item-nav-textarea"
                    rows={descriptor.rows || 3}
                    value={value}
                    placeholder={isMixed ? BULK_UI.MIXED_VALUES : (descriptor.placeholder || '')}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={disabled}
                />
            );

        case 'languageTags':
            return (
                <LanguageTagsControl
                    tags={languageToTags(isMixed ? '' : rawValue)}
                    options={descriptor.options || []}
                    placeholder={isMixed ? BULK_UI.MIXED_VALUES : ''}
                    disabled={disabled}
                    onChange={(tags) => setValue(tags)}
                />
            );

        case 'text':
        default:
            return (
                <input
                    type="text"
                    className="create-item-nav-input"
                    value={value}
                    placeholder={isMixed ? BULK_UI.MIXED_VALUES : (descriptor.placeholder || '')}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={disabled}
                />
            );
    }
};

/** Tag editor matching the language pickers in the big create/edit forms. */
const LanguageTagsControl = ({ tags, options, onChange, placeholder, disabled }) => {
    const [search, setSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const filtered = options.filter(option =>
        !tags.some(tag => tag.toLowerCase() === option.toLowerCase()) &&
        option.toLowerCase().includes(search.toLowerCase())
    );

    const addTag = (tag) => {
        const trimmed = tag.trim();
        if (!trimmed) return;
        if (!tags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
            onChange([...tags, trimmed]);
        }
        setSearch('');
        setShowDropdown(false);
    };

    return (
        <div className="bulk-language-control">
            {tags.length > 0 && (
                <div className="create-item-nav-language-tags">
                    {tags.map(tag => (
                        <div key={tag} className="create-item-nav-language-tag">
                            <span className="language-tag-text">{tag}</span>
                            <button
                                type="button"
                                className="language-tag-remove"
                                onClick={() => onChange(tags.filter(t => t !== tag))}
                                disabled={disabled}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <input
                type="text"
                className="create-item-nav-input"
                value={search}
                placeholder={placeholder || 'Meklēt vai pievienot valodu'}
                disabled={disabled}
                onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                onKeyDown={(e) => {
                    if (e.key !== 'Enter') return;
                    e.preventDefault();
                    addTag(filtered.length > 0 ? filtered[0] : search);
                }}
            />
            {showDropdown && (filtered.length > 0 || search.trim()) && (
                <div className="create-item-nav-language-dropdown">
                    {filtered.slice(0, 8).map(option => (
                        <div
                            key={option}
                            className="create-item-nav-language-option"
                            onMouseDown={() => addTag(option)}
                        >
                            {option}
                        </div>
                    ))}
                    {filtered.length === 0 && search.trim() && (
                        <div className="create-item-nav-language-add-custom" onMouseDown={() => addTag(search)}>
                            <i className="fas fa-plus-circle"></i> {search.trim()}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/**
 * One row of the bulk edit form: the "change this field" checkbox, the label,
 * the mode selector, and the control(s).
 *
 * Nothing is written unless the checkbox is ticked — that is the whole safety
 * model of bulk editing, so the checkbox owns the row.
 */
const BulkFieldRow = ({ descriptor, values, modes, enabled, onToggle, onChange, onModeChange, mixedKeys }) => {
    const isEnabled = enabled.has(descriptor.id);
    const children = descriptor.type === 'group' ? descriptor.children : [descriptor];
    const availableModes = descriptor.modes || [];

    const showMixedHint = (child) =>
        (child.keys || []).some(key => mixedKeys.has(key));

    return (
        <div className={`bulk-field-row ${isEnabled ? 'bulk-field-row-active' : ''}`}>
            <label className="bulk-field-toggle">
                <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => onToggle(descriptor.id)}
                />
                <span className="bulk-field-toggle-label">{descriptor.label}</span>
                {/* Only real field explanations get a bubble — a generic
                    "tick to change this" on every row would be noise. */}
                {descriptor.helpEntity && descriptor.helpField && (
                    <FieldHelp entity={descriptor.helpEntity} field={descriptor.helpField} />
                )}
                {!isEnabled && showMixedHint(descriptor.type === 'group' ? descriptor.children[0] : descriptor) && (
                    <span className="bulk-field-mixed" title={BULK_UI.HINT_MIXED}>
                        ({BULK_UI.MIXED_VALUES})
                    </span>
                )}
            </label>

            {isEnabled && (
                <div className="bulk-field-body">
                    {availableModes.length > 1 && (
                        <ModeSelector
                            id={descriptor.id}
                            modes={availableModes}
                            value={modes[descriptor.id] || BULK_MODES.REPLACE}
                            onChange={onModeChange}
                        />
                    )}

                    {children.map(child => {
                        const childDisabled = child.disabledWhen ? child.disabledWhen(values) : false;
                        const childModes = child.modes || [];
                        return (
                            <div key={child.id} className="bulk-field-control">
                                {descriptor.type === 'group' && (
                                    <div className="bulk-field-sublabel">
                                        {child.label}
                                        {child.helpEntity && child.helpField && (
                                            <FieldHelp entity={child.helpEntity} field={child.helpField} />
                                        )}
                                        {showMixedHint(child) && (
                                            <span className="bulk-field-mixed">({BULK_UI.MIXED_VALUES})</span>
                                        )}
                                    </div>
                                )}
                                {childModes.length > 1 && descriptor.type === 'group' && (
                                    <ModeSelector
                                        id={child.id}
                                        modes={childModes}
                                        value={modes[child.id] || BULK_MODES.REPLACE}
                                        onChange={onModeChange}
                                    />
                                )}
                                {modes[child.id] !== BULK_MODES.CLEAR && modes[descriptor.id] !== BULK_MODES.CLEAR && (
                                    <BulkFieldControl
                                        descriptor={child}
                                        values={values}
                                        onChange={onChange}
                                        disabled={childDisabled}
                                    />
                                )}
                            </div>
                        );
                    })}

                    {descriptor.hint && <div className="field-hint">{descriptor.hint}</div>}
                </div>
            )}
        </div>
    );
};

const MODE_LABELS = {
    [BULK_MODES.REPLACE]: BULK_UI.MODE_REPLACE,
    [BULK_MODES.APPEND]: BULK_UI.MODE_APPEND,
    [BULK_MODES.CLEAR]: BULK_UI.MODE_CLEAR,
};

const ModeSelector = ({ id, modes, value, onChange }) => (
    <div className="bulk-mode-selector" title={BULK_UI.HINT_MODE}>
        {modes.map(mode => (
            <label key={mode} className="bulk-mode-option">
                <input
                    type="radio"
                    name={`bulk-mode-${id}`}
                    checked={value === mode}
                    onChange={() => onChange(id, mode)}
                />
                <span>{MODE_LABELS[mode]}</span>
            </label>
        ))}
    </div>
);

export default BulkFieldRow;
