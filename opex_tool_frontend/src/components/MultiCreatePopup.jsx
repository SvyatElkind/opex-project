import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import HelpButton from '../Help/HelpButton';
import FieldHelp from './FieldHelp';
import { BulkFieldControl } from './BulkFieldRow';
import { BulkProgress } from './BulkEditPopup';
import { useBulkRunner } from '../hooks/useBulkOperations';
import {
    BULK_SELECTION_WARN_THRESHOLD,
    expandPattern,
    parsePastedRows,
} from '../Constants/bulkConstants';
import { BULK_UI } from '../Constants/Constants';
import './BulkEditPopup.css';
import './MultiCreatePopup.css';

/**
 * Shared shell for creating MANY entities at once: shared fields on top, a row
 * grid for the unique ones below.
 *
 * Rows are filled by pasting a column out of a spreadsheet, by expanding a
 * `{n}` pattern, by picking files (one file = one record), or by hand — the
 * repetitive typing this whole feature exists to remove.
 *
 * Creation is strictly sequential: Item.add_item() derives the GV number from
 * inventory.last_gv server-side, so parallel POSTs would race for the same
 * number. Rows are validated before anything is sent, and the result list
 * reports partial failure honestly instead of claiming success.
 */
const MultiCreatePopup = ({
    title,
    entityKind = 'items',            // 'items' | 'records'
    sharedFields,
    columns,                         // [{ key, label, required, placeholder, width }]
    buildRow,                        // (values) => row object
    validateRow,                     // (row, sharedValues) => error string | null
    execute,                         // (row, sharedValues, index) => Promise
    rowLabel,                        // (row, index) => string, for the result list
    supportsFiles = false,
    numberHint = null,
    onClose,
    onFinished,
    helpChapterId,
    helpSectionId,
    initialSharedValues = {},
}) => {
    const [sharedValues, setSharedValues] = useState(initialSharedValues);
    const [rows, setRows] = useState([]);
    const [helper, setHelper] = useState(null);   // 'paste' | 'pattern' | null
    const [step, setStep] = useState('edit');     // edit | run
    const { state: runState, run, stop } = useBulkRunner();

    // Lock the page behind the popup, and allow Escape to cancel — but never
    // mid-batch, where closing would hide what was already created.
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = originalOverflow; };
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && runState.status !== 'running') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose, runState.status]);

    const primaryColumn = columns[0].key;

    const rowErrors = useMemo(
        () => rows.map(row => validateRow(row, sharedValues)),
        [rows, sharedValues, validateRow]
    );

    const validRowCount = rowErrors.filter(error => !error).length;

    // ─── Row helpers ────────────────────────────────────────────────────────

    const addRow = (values = {}) => setRows(prev => [...prev, buildRow(values)]);

    const updateRow = (index, patch) => {
        setRows(prev => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    };

    const removeRow = (index) => setRows(prev => prev.filter((_, i) => i !== index));

    const applyPaste = (text) => {
        const parsed = parsePastedRows(text, columns.map(column => column.key));
        setRows(prev => [...prev, ...parsed.map(values => buildRow(values))]);
        setHelper(null);
    };

    const applyPattern = ({ pattern, start, count }) => {
        const values = expandPattern(pattern, start, count);
        setRows(prev => [...prev, ...values.map(value => buildRow({ [primaryColumn]: value }))]);
        setHelper(null);
    };

    const applyFiles = (fileList) => {
        const files = Array.from(fileList || []);
        setRows(prev => [...prev, ...files.map(file => buildRow({ file }))]);
    };

    // ─── Run ────────────────────────────────────────────────────────────────

    const handleCreate = async () => {
        setStep('run');
        const tasks = rows
            .map((row, index) => ({ row, index }))
            .filter(({ index }) => !rowErrors[index])
            .map(({ row, index }) => ({
                label: rowLabel(row, index),
                execute: () => execute(row, sharedValues, index),
            }));

        const result = await run(tasks);
        if (onFinished) onFinished(result);
    };

    const isRunning = runState.status === 'running';
    const isDone = runState.status === 'done';

    // ─── Render ─────────────────────────────────────────────────────────────

    return ReactDOM.createPortal(
        <div className="bulk-popup-overlay">
            <div className="bulk-popup-container bulk-popup-container-wide">
                <div className="bulk-popup-header">
                    <div className="bulk-popup-header-main">
                        <h2 className="bulk-popup-title">
                            <i className="fas fa-plus-circle"></i> {title}
                        </h2>
                    </div>
                    <HelpButton chapterId={helpChapterId} sectionId={helpSectionId} iconOnly={true} className="small" />
                </div>

                {step === 'edit' && (
                    <>
                        <div className="bulk-popup-body">
                            {/* 1. Shared fields */}
                            <section className="bulk-popup-section">
                                <h3 className="bulk-popup-section-header">
                                    {BULK_UI.CREATE_STEP_SHARED}
                                    <span className="bulk-popup-section-hint">
                                        {entityKind === 'records'
                                            ? BULK_UI.CREATE_STEP_SHARED_HINT_RECORDS
                                            : BULK_UI.CREATE_STEP_SHARED_HINT}
                                    </span>
                                </h3>

                                <div className="multi-create-shared-grid">
                                    {sharedFields.map(field => (
                                        <SharedField
                                            key={field.id}
                                            descriptor={field}
                                            values={sharedValues}
                                            onChange={(patch) => setSharedValues(prev => ({ ...prev, ...patch }))}
                                        />
                                    ))}
                                </div>
                            </section>

                            {/* 2. Row grid */}
                            <section className="bulk-popup-section">
                                <h3 className="bulk-popup-section-header">
                                    {entityKind === 'records'
                                        ? BULK_UI.CREATE_STEP_ROWS_RECORDS
                                        : BULK_UI.CREATE_STEP_ROWS}
                                    <span className="bulk-popup-section-hint">
                                        {numberHint && <>{numberHint} · </>}
                                        {BULK_UI.CREATE_ROW_COUNT.replace('{count}', rows.length)}
                                    </span>
                                </h3>

                                <div className="multi-create-toolbar">
                                    <button type="button" className="create-item-nav-btn create-item-nav-btn-cancel" onClick={() => setHelper('paste')}>
                                        <i className="fas fa-paste"></i> {BULK_UI.CREATE_PASTE_BTN}
                                    </button>
                                    <button type="button" className="create-item-nav-btn create-item-nav-btn-cancel" onClick={() => setHelper('pattern')}>
                                        <i className="fas fa-magic"></i> {BULK_UI.CREATE_PATTERN_BTN}
                                    </button>
                                    {supportsFiles && (
                                        <label
                                            className="create-item-nav-btn create-item-nav-btn-cancel multi-create-file-btn"
                                            title={BULK_UI.HINT_FILES}
                                        >
                                            <i className="fas fa-file-upload"></i> {BULK_UI.CREATE_FILES_BTN}
                                            <input
                                                type="file"
                                                multiple
                                                onChange={(e) => { applyFiles(e.target.files); e.target.value = ''; }}
                                            />
                                        </label>
                                    )}
                                    <button type="button" className="create-item-nav-btn create-item-nav-btn-cancel" onClick={() => addRow()}>
                                        {BULK_UI.CREATE_ADD_ROW_BTN}
                                    </button>
                                    {rows.length > 0 && (
                                        <button type="button" className="create-item-nav-btn create-item-nav-btn-cancel" onClick={() => setRows([])}>
                                            {BULK_UI.CREATE_CLEAR_ROWS_BTN}
                                        </button>
                                    )}
                                </div>

                                {helper === 'paste' && (
                                    <PasteHelper
                                        hint={entityKind === 'records' ? BULK_UI.PASTE_HINT_RECORDS : BULK_UI.PASTE_HINT}
                                        onApply={applyPaste}
                                        onCancel={() => setHelper(null)}
                                    />
                                )}

                                {helper === 'pattern' && (
                                    <PatternHelper onApply={applyPattern} onCancel={() => setHelper(null)} />
                                )}

                                {rows.length === 0 ? (
                                    <div className="multi-create-empty">{BULK_UI.CREATE_NO_ROWS}</div>
                                ) : (
                                    <div className="multi-create-table">
                                        <div className="multi-create-row multi-create-row-header">
                                            <span className="multi-create-cell-nr">{BULK_UI.COLUMN_ROW_NR}</span>
                                            {columns.map(column => (
                                                <span key={column.key} style={{ flex: column.width || 1 }}>
                                                    {column.label}{column.required ? ' *' : ''}
                                                    {column.helpEntity && column.helpField && (
                                                        <FieldHelp entity={column.helpEntity} field={column.helpField} />
                                                    )}
                                                </span>
                                            ))}
                                            <span className="multi-create-cell-status">{BULK_UI.COLUMN_STATUS}</span>
                                            <span className="multi-create-cell-remove"></span>
                                        </div>

                                        {rows.map((row, index) => (
                                            <div
                                                key={row.key}
                                                className={`multi-create-row ${rowErrors[index] ? 'multi-create-row-invalid' : ''}`}
                                            >
                                                <span className="multi-create-cell-nr">{index + 1}</span>

                                                {columns.map(column => (
                                                    <span key={column.key} style={{ flex: column.width || 1 }}>
                                                        <input
                                                            type="text"
                                                            className="create-item-nav-input"
                                                            value={row[column.key] || ''}
                                                            placeholder={column.placeholder || ''}
                                                            onChange={(e) => updateRow(index, { [column.key]: e.target.value })}
                                                        />
                                                    </span>
                                                ))}

                                                <span className="multi-create-cell-status" title={rowErrors[index] || BULK_UI.ROW_VALID}>
                                                    {rowErrors[index]
                                                        ? <i className="fas fa-times-circle multi-create-invalid-icon"></i>
                                                        : <i className="fas fa-check-circle multi-create-valid-icon"></i>}
                                                </span>

                                                <span className="multi-create-cell-remove">
                                                    <button
                                                        type="button"
                                                        className="multi-create-remove-btn"
                                                        title={BULK_UI.CREATE_REMOVE_ROW}
                                                        onClick={() => removeRow(index)}
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </span>

                                                {row.file && (
                                                    <span className="multi-create-file-name">
                                                        {BULK_UI.FILES_ATTACHED.replace('{name}', row.file.name)}
                                                    </span>
                                                )}
                                                {rowErrors[index] && (
                                                    <span className="multi-create-row-error">{rowErrors[index]}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {rows.length > BULK_SELECTION_WARN_THRESHOLD && (
                                    <div className="bulk-popup-warning">
                                        <i className="fas fa-exclamation-triangle"></i>{' '}
                                        {BULK_UI.WARNING_LARGE_CREATE.replace('{count}', rows.length)}
                                    </div>
                                )}
                            </section>
                        </div>

                        <div className="bulk-popup-footer">
                            <span className="bulk-popup-footer-summary">
                                {rows.length > 0 && rowErrors.some(Boolean)
                                    ? `${validRowCount} / ${rows.length}`
                                    : ''}
                            </span>
                            <div className="bulk-popup-footer-actions">
                                <button type="button" className="create-item-nav-btn create-item-nav-btn-cancel" onClick={onClose}>
                                    {BULK_UI.CANCEL_BTN}
                                </button>
                                <button
                                    type="button"
                                    className="create-item-nav-btn create-item-nav-btn-primary"
                                    disabled={validRowCount === 0}
                                    onClick={handleCreate}
                                >
                                    {BULK_UI.CREATE_SUBMIT_BTN.replace('{count}', validRowCount)}
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {step === 'run' && (
                    <>
                        <div className="bulk-popup-body">
                            <BulkProgress
                                state={runState}
                                labelTemplate={BULK_UI.PROGRESS_CREATING}
                                successTemplate={BULK_UI.RESULT_SUCCESS_CREATE}
                            />
                        </div>
                        <div className="bulk-popup-footer">
                            <div className="bulk-popup-footer-actions">
                                {isRunning && (
                                    <button type="button" className="create-item-nav-btn create-item-nav-btn-cancel" onClick={stop}>
                                        {BULK_UI.PROGRESS_STOP_BTN}
                                    </button>
                                )}
                                {isDone && (
                                    <button
                                        type="button"
                                        className="create-item-nav-btn create-item-nav-btn-primary"
                                        onClick={onClose}
                                    >
                                        {BULK_UI.RESULT_CLOSE_BTN}
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
};

/**
 * A shared field: same control as bulk edit, without the opt-in checkbox.
 * Labels carry the same "?" help bubble as the single-entity forms, so the
 * field explanations are identical wherever the field appears.
 */
const SharedField = ({ descriptor, values, onChange }) => {
    const children = descriptor.type === 'group' ? descriptor.children : [descriptor];
    const single = descriptor.type !== 'group' ? descriptor : null;

    return (
        <div className="multi-create-shared-field">
            <div className="create-item-nav-field-label">
                {descriptor.label}
                {single?.helpEntity && single?.helpField && (
                    <FieldHelp entity={single.helpEntity} field={single.helpField} />
                )}
            </div>

            {children.map(child => (
                <div key={child.id} className="bulk-field-control">
                    {descriptor.type === 'group' && (
                        <div className="bulk-field-sublabel">
                            {child.label}
                            {child.helpEntity && child.helpField && (
                                <FieldHelp entity={child.helpEntity} field={child.helpField} />
                            )}
                        </div>
                    )}
                    <BulkFieldControl
                        descriptor={child}
                        values={values}
                        onChange={onChange}
                        disabled={child.disabledWhen ? child.disabledWhen(values) : false}
                    />
                </div>
            ))}

            {descriptor.hint && <div className="field-hint">{descriptor.hint}</div>}
        </div>
    );
};

const PasteHelper = ({ hint, onApply, onCancel }) => {
    const [text, setText] = useState('');

    return (
        <div className="multi-create-helper">
            <div className="multi-create-helper-title">
                {BULK_UI.PASTE_TITLE}
                <FieldHelp text={BULK_UI.HINT_PASTE} />
            </div>
            <div className="field-hint">{hint}</div>
            <textarea
                className="create-item-nav-textarea"
                rows="6"
                value={text}
                placeholder={BULK_UI.PASTE_PLACEHOLDER}
                onChange={(e) => setText(e.target.value)}
                autoFocus
            />
            <div className="multi-create-helper-actions">
                <button type="button" className="create-item-nav-btn create-item-nav-btn-cancel" onClick={onCancel}>
                    {BULK_UI.PASTE_CANCEL_BTN}
                </button>
                <button
                    type="button"
                    className="create-item-nav-btn create-item-nav-btn-primary"
                    disabled={!text.trim()}
                    onClick={() => onApply(text)}
                >
                    {BULK_UI.PASTE_APPLY_BTN}
                </button>
            </div>
        </div>
    );
};

const PatternHelper = ({ onApply, onCancel }) => {
    const [pattern, setPattern] = useState('');
    const [start, setStart] = useState(1);
    const [count, setCount] = useState(5);

    return (
        <div className="multi-create-helper">
            <div className="multi-create-helper-title">
                {BULK_UI.PATTERN_TITLE}
                <FieldHelp text={BULK_UI.HINT_PATTERN} />
            </div>
            <div className="field-hint">{BULK_UI.PATTERN_HINT}</div>

            <div className="multi-create-helper-row">
                <label className="multi-create-helper-field">
                    <span>{BULK_UI.PATTERN_FIELD}</span>
                    <input
                        type="text"
                        className="create-item-nav-input"
                        value={pattern}
                        placeholder={BULK_UI.PATTERN_PLACEHOLDER}
                        onChange={(e) => setPattern(e.target.value)}
                        autoFocus
                    />
                </label>
                <label className="multi-create-helper-field multi-create-helper-field-narrow">
                    <span>{BULK_UI.PATTERN_START}</span>
                    <input
                        type="number"
                        className="create-item-nav-input"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                    />
                </label>
                <label className="multi-create-helper-field multi-create-helper-field-narrow">
                    <span>{BULK_UI.PATTERN_COUNT}</span>
                    <input
                        type="number"
                        min="1"
                        className="create-item-nav-input"
                        value={count}
                        onChange={(e) => setCount(e.target.value)}
                    />
                </label>
            </div>

            <div className="multi-create-helper-actions">
                <button type="button" className="create-item-nav-btn create-item-nav-btn-cancel" onClick={onCancel}>
                    {BULK_UI.PASTE_CANCEL_BTN}
                </button>
                <button
                    type="button"
                    className="create-item-nav-btn create-item-nav-btn-primary"
                    disabled={!pattern.trim() || Number(count) < 1}
                    onClick={() => onApply({ pattern, start, count })}
                >
                    {BULK_UI.PATTERN_APPLY_BTN}
                </button>
            </div>
        </div>
    );
};

export default MultiCreatePopup;
