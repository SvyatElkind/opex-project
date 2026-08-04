import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import HelpButton from '../Help/HelpButton';
import FieldHelp from './FieldHelp';
import { BulkProgress } from './BulkEditPopup';
import { parseCsvFile } from '../Utils/csvParser';
import { parseXlsxFile } from '../Utils/xlsxReader';
import { mapImportRows } from '../Utils/importMapper';
import {
    MAX_IMPORT_ROWS,
    PREVIEW_ROW_LIMIT,
    ROW_TYPE,
    WARN_IMPORT_ROWS,
    assignableColumns,
    exampleUrl,
    looksLikeExportTemplate,
} from '../Constants/importConstants';
import { IMPORT_UI } from '../Constants/Constants';
import './BulkEditPopup.css';
import './ImportPopup.css';

const fill = (template, values) =>
    Object.entries(values).reduce(
        (text, [key, value]) => text.replace(new RegExp(`\\{${key}\\}`, 'g'), value),
        template
    );

/**
 * Shared shell for the experimental CSV/Excel import: pick a file, see how its
 * columns were understood, check the preview, then run.
 *
 * Everything up to "run" happens in the browser — reading, decoding, mapping and
 * validating. The concrete popups (items / records) supply only `runImport`,
 * which turns approved rows into the same POSTs the manual forms make.
 */
const ImportPopup = ({
    title,
    subtitle,
    inventory,
    existingItems = [],
    item = null,
    recordsAllowed = true,
    runImport,             // ({ entries, onPhase }) => Promise<{ interrupted?: string }>
    runState,
    stopRun,
    phase,                 // null | 'items' | 'sync' | 'records' | 'finished'
    interrupted,
    onClose,
    helpChapterId,
    helpSectionId,
}) => {
    const [file, setFile] = useState(null);
    const [rawRows, setRawRows] = useState(null);
    const [fileInfo, setFileInfo] = useState(null);
    const [readError, setReadError] = useState(null);
    const [isReading, setIsReading] = useState(false);
    const [manualColumns, setManualColumns] = useState({});
    const [onlyErrors, setOnlyErrors] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef(null);

    const isRunning = phase !== null && phase !== 'finished';

    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = originalOverflow; };
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && !isRunning) onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose, isRunning]);

    // ─── File reading ───────────────────────────────────────────────────────

    const readFile = useCallback(async (chosen) => {
        setReadError(null);
        setRawRows(null);
        setFileInfo(null);
        setManualColumns({});
        setFile(chosen);

        const name = chosen.name || '';
        const isCsv = /\.csv$/i.test(name);
        const isXlsx = /\.xlsx$/i.test(name);

        if (!isCsv && !isXlsx) {
            setReadError(IMPORT_UI.ERROR_UNSUPPORTED);
            return;
        }

        setIsReading(true);
        try {
            if (isCsv) {
                const { rows, encoding, guessed, delimiter } = await parseCsvFile(chosen);
                setRawRows(rows);
                setFileInfo({
                    kind: 'CSV',
                    encoding,
                    guessed,
                    delimiter,
                    rows: Math.max(0, rows.length - 1),
                    text: fill(IMPORT_UI.FILE_INFO, {
                        name, kind: `CSV (${delimiter === '\t' ? 'TAB' : delimiter})`,
                        encoding, rows: Math.max(0, rows.length - 1),
                    }),
                });
            } else {
                const { rows, sheetName } = await parseXlsxFile(chosen);
                setRawRows(rows);
                setFileInfo({
                    kind: 'XLSX',
                    sheetName,
                    rows: Math.max(0, rows.length - 1),
                    text: fill(IMPORT_UI.FILE_INFO_XLSX, {
                        name, sheet: sheetName, rows: Math.max(0, rows.length - 1),
                    }),
                });
            }
        } catch (error) {
            setReadError(fill(IMPORT_UI.ERROR_READ_FAILED, { message: error.message || '' }));
        } finally {
            setIsReading(false);
        }
    }, []);

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);
        const dropped = event.dataTransfer?.files?.[0];
        if (dropped) readFile(dropped);
    };

    // ─── Mapping ────────────────────────────────────────────────────────────

    const isEmptyFile = Boolean(rawRows) && rawRows.length === 0;

    const mapped = useMemo(() => {
        if (!rawRows || rawRows.length === 0) return null;
        return mapImportRows({
            rows: rawRows,
            inventory,
            existingItems,
            item,
            recordsAllowed,
            manualColumns,
        });
    }, [rawRows, inventory, existingItems, item, recordsAllowed, manualColumns]);

    const tooManyRows = Boolean(mapped && mapped.entries.length > MAX_IMPORT_ROWS);
    const isTemplate = Boolean(rawRows && looksLikeExportTemplate(rawRows));

    const visibleEntries = useMemo(() => {
        if (!mapped) return [];
        const filtered = onlyErrors ? mapped.entries.filter(entry => !entry.ok) : mapped.entries;
        return filtered.slice(0, PREVIEW_ROW_LIMIT);
    }, [mapped, onlyErrors]);

    const assignable = useMemo(
        () => assignableColumns([ROW_TYPE.ITEM, ROW_TYPE.RECORD]),
        []
    );

    const canImport = Boolean(mapped) && mapped.validCount > 0 && !tooManyRows && !isRunning;

    const handleImport = () => {
        const approved = mapped.entries.filter(entry => entry.ok);
        runImport({ entries: approved, allEntries: mapped.entries });
    };

    // ─── Render ─────────────────────────────────────────────────────────────

    return ReactDOM.createPortal(
        <div className="bulk-popup-overlay">
            <div className="bulk-popup-container bulk-popup-container-wide">
                <div className="bulk-popup-header">
                    <div className="bulk-popup-header-main">
                        <h2 className="bulk-popup-title">
                            <span className="import-badge">{IMPORT_UI.EXPERIMENTAL_BADGE}</span>
                            <i className="fas fa-file-import"></i> {title}
                        </h2>
                        {subtitle && <div className="bulk-popup-subtitle">{subtitle}</div>}
                    </div>
                    <HelpButton chapterId={helpChapterId} sectionId={helpSectionId} iconOnly={true} className="small" />
                </div>

                {/* The experimental warning is not dismissible on purpose. */}
                <div className="import-warning-banner">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>{IMPORT_UI.WARNING_BANNER}</span>
                </div>

                {phase === null ? (
                    <>
                        <div className="bulk-popup-body">
                            {/* ── 1. File ── */}
                            <section className="bulk-popup-section">
                                <h3 className="bulk-popup-section-header">
                                    {IMPORT_UI.STEP_FILE}
                                    <FieldHelp text={IMPORT_UI.HINT_FILE} />
                                </h3>

                                <div
                                    className={`import-dropzone ${isDragging ? 'import-dropzone-active' : ''}`}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                >
                                    <button
                                        type="button"
                                        className="create-item-nav-btn create-item-nav-btn-primary"
                                        onClick={() => inputRef.current?.click()}
                                    >
                                        <i className="fas fa-folder-open"></i>{' '}
                                        {file ? IMPORT_UI.FILE_REPLACE : IMPORT_UI.FILE_CHOOSE}
                                    </button>
                                    <span className="import-dropzone-hint">{IMPORT_UI.FILE_DROP_HINT}</span>
                                    <span className="import-dropzone-accept">{IMPORT_UI.FILE_ACCEPT_HINT}</span>
                                    <input
                                        ref={inputRef}
                                        type="file"
                                        accept=".csv,.xlsx"
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            const chosen = e.target.files?.[0];
                                            e.target.value = '';
                                            if (chosen) readFile(chosen);
                                        }}
                                    />
                                </div>

                                <div className="import-example-links">
                                    <a href={exampleUrl('xlsx')} download>
                                        <i className="fas fa-download"></i> {IMPORT_UI.EXAMPLE_XLSX}
                                    </a>
                                    <a href={exampleUrl('csv')} download>
                                        <i className="fas fa-download"></i> {IMPORT_UI.EXAMPLE_CSV}
                                    </a>
                                </div>

                                {isReading && <div className="field-hint">{IMPORT_UI.FILE_READING}</div>}
                                {readError && <div className="bulk-popup-error">{readError}</div>}
                                {fileInfo && !readError && (
                                    <div className="import-file-info">
                                        <i className="fas fa-check-circle"></i> {fileInfo.text}
                                    </div>
                                )}
                                {fileInfo?.guessed && (
                                    <div className="bulk-popup-warning">
                                        {fill(IMPORT_UI.WARNING_ENCODING, { encoding: fileInfo.encoding })}
                                    </div>
                                )}
                                {isEmptyFile && (
                                    <div className="bulk-popup-error">{IMPORT_UI.ERROR_EMPTY_FILE}</div>
                                )}
                                {isTemplate && (
                                    <div className="bulk-popup-warning">{IMPORT_UI.WARNING_EXPORT_TEMPLATE}</div>
                                )}
                            </section>

                            {/* ── 2. Columns ── */}
                            {mapped && (
                                <section className="bulk-popup-section">
                                    <h3 className="bulk-popup-section-header">
                                        {IMPORT_UI.STEP_COLUMNS}
                                        <FieldHelp text={IMPORT_UI.HINT_COLUMNS} />
                                    </h3>

                                    {mapped.headerRowIndex < 0 ? (
                                        <div className="bulk-popup-error">{IMPORT_UI.COLUMNS_NO_HEADER}</div>
                                    ) : (
                                        <>
                                            <div className="import-note">
                                                {mapped.unknownColumns.length === 0
                                                    ? IMPORT_UI.COLUMNS_ALL_RECOGNISED
                                                    : fill(IMPORT_UI.COLUMNS_RECOGNISED, {
                                                        known: rawRows[mapped.headerRowIndex].filter((cell, index) =>
                                                            String(cell ?? '').trim() !== '' &&
                                                            !mapped.unknownColumns.some(unknown => unknown.index === index)).length,
                                                        total: rawRows[mapped.headerRowIndex].filter(cell => String(cell ?? '').trim() !== '').length,
                                                    })}
                                            </div>

                                            {mapped.unknownColumns.map(unknown => (
                                                <div key={unknown.index} className="import-unknown-column">
                                                    <span>
                                                        <i className="fas fa-exclamation-triangle"></i>{' '}
                                                        {fill(IMPORT_UI.COLUMNS_UNKNOWN, { name: unknown.name })}
                                                    </span>
                                                    <label>
                                                        {IMPORT_UI.COLUMNS_ASSIGN}
                                                        <select
                                                            className="create-item-nav-select"
                                                            value={manualColumns[unknown.index] || ''}
                                                            onChange={(e) => setManualColumns(prev => {
                                                                const next = { ...prev };
                                                                if (e.target.value) next[unknown.index] = e.target.value;
                                                                else delete next[unknown.index];
                                                                return next;
                                                            })}
                                                        >
                                                            <option value="">{IMPORT_UI.COLUMNS_ASSIGN_NONE}</option>
                                                            {assignable.map(name => (
                                                                <option key={name} value={name}>{name}</option>
                                                            ))}
                                                        </select>
                                                    </label>
                                                </div>
                                            ))}

                                            {mapped.missingForItems.length > 0 && (
                                                <div className="bulk-popup-warning">
                                                    {fill(IMPORT_UI.COLUMNS_MISSING_REQUIRED, {
                                                        names: mapped.missingForItems.join(', '),
                                                    })}
                                                </div>
                                            )}
                                            {mapped.missingForRecords.length > 0 && (
                                                <div className="bulk-popup-warning">
                                                    {fill(IMPORT_UI.COLUMNS_MISSING_REQUIRED, {
                                                        names: mapped.missingForRecords.join(', '),
                                                    })}
                                                </div>
                                            )}
                                            {!recordsAllowed && mapped.entries.some(entry => entry.type === ROW_TYPE.RECORD) && (
                                                <div className="bulk-popup-warning">
                                                    {IMPORT_UI.WARNING_RECORDS_NOT_SUPPORTED}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </section>
                            )}

                            {/* ── 3. Preview ── */}
                            {mapped && mapped.headerRowIndex >= 0 && (
                                <section className="bulk-popup-section">
                                    <h3 className="bulk-popup-section-header">
                                        {IMPORT_UI.STEP_PREVIEW}
                                        <FieldHelp text={IMPORT_UI.HINT_PREVIEW} />
                                        <span className="bulk-popup-section-hint">
                                            {mapped.entries.length > mapped.validCount
                                                ? fill(IMPORT_UI.PREVIEW_INVALID, {
                                                    invalid: mapped.entries.length - mapped.validCount,
                                                })
                                                : fill(IMPORT_UI.PREVIEW_ALL_VALID, { rows: mapped.entries.length })}
                                        </span>
                                    </h3>

                                    {mapped.entries.length === 0 ? (
                                        <div className="multi-create-empty">{IMPORT_UI.PREVIEW_EMPTY}</div>
                                    ) : (
                                        <>
                                            {mapped.entries.some(entry => !entry.ok) && (
                                                <button
                                                    type="button"
                                                    className="create-item-nav-btn create-item-nav-btn-cancel import-filter-btn"
                                                    onClick={() => setOnlyErrors(prev => !prev)}
                                                >
                                                    {onlyErrors ? IMPORT_UI.PREVIEW_SHOW_ALL : IMPORT_UI.PREVIEW_ONLY_ERRORS}
                                                </button>
                                            )}

                                            <div className="import-preview-table">
                                                <div className="import-preview-row import-preview-head">
                                                    <span className="import-cell-row">{IMPORT_UI.PREVIEW_COLUMN_ROW}</span>
                                                    <span className="import-cell-type">{IMPORT_UI.PREVIEW_COLUMN_TYPE}</span>
                                                    <span className="import-cell-title">{IMPORT_UI.PREVIEW_COLUMN_TITLE}</span>
                                                    <span className="import-cell-parent">
                                                        {IMPORT_UI.PREVIEW_COLUMN_PARENT}
                                                        <FieldHelp text={IMPORT_UI.HINT_PARENT} />
                                                    </span>
                                                    <span className="import-cell-status">{IMPORT_UI.PREVIEW_COLUMN_STATUS}</span>
                                                </div>

                                                {visibleEntries.map(entry => (
                                                    <div
                                                        key={entry.rowNumber}
                                                        className={`import-preview-row ${entry.ok ? '' : 'import-preview-row-invalid'}`}
                                                    >
                                                        <span className="import-cell-row">{entry.rowNumber}</span>
                                                        <span className="import-cell-type">
                                                            <span className={`import-type-tag import-type-${entry.type || 'none'}`}>
                                                                {entry.type === ROW_TYPE.ITEM
                                                                    ? IMPORT_UI.TYPE_ITEM
                                                                    : entry.type === ROW_TYPE.RECORD
                                                                        ? IMPORT_UI.TYPE_RECORD
                                                                        : '?'}
                                                            </span>
                                                        </span>
                                                        <span className="import-cell-title" title={entry.label}>{entry.label || '—'}</span>
                                                        <span className="import-cell-parent">{describeParent(entry)}</span>
                                                        <span className="import-cell-status">
                                                            {entry.ok
                                                                ? <i className="fas fa-check-circle multi-create-valid-icon"></i>
                                                                : <i className="fas fa-times-circle multi-create-invalid-icon"></i>}
                                                        </span>
                                                        {!entry.ok && entry.message && (
                                                            <span className="import-preview-error">{entry.message}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {(onlyErrors
                                                ? mapped.entries.filter(entry => !entry.ok).length
                                                : mapped.entries.length) > PREVIEW_ROW_LIMIT && (
                                                <div className="import-note">
                                                    {fill(IMPORT_UI.PREVIEW_TRUNCATED, {
                                                        shown: PREVIEW_ROW_LIMIT,
                                                        total: onlyErrors
                                                            ? mapped.entries.filter(entry => !entry.ok).length
                                                            : mapped.entries.length,
                                                    })}
                                                </div>
                                            )}

                                            {tooManyRows && (
                                                <div className="bulk-popup-error">
                                                    {fill(IMPORT_UI.ERROR_TOO_MANY_ROWS, {
                                                        rows: mapped.entries.length, max: MAX_IMPORT_ROWS,
                                                    })}
                                                </div>
                                            )}
                                            {!tooManyRows && mapped.entries.length > WARN_IMPORT_ROWS && (
                                                <div className="bulk-popup-warning">
                                                    {fill(IMPORT_UI.WARNING_MANY_ROWS, { rows: mapped.entries.length })}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </section>
                            )}
                        </div>

                        <div className="bulk-popup-footer">
                            <span className="bulk-popup-footer-summary">
                                {mapped && mapped.validCount > 0 && (
                                    item
                                        ? fill(IMPORT_UI.FOOTER_WILL_CREATE_RECORDS, { records: mapped.recordCount })
                                        : mapped.recordCount === 0
                                            ? fill(IMPORT_UI.FOOTER_WILL_CREATE_ITEMS, { items: mapped.itemCount })
                                            : fill(IMPORT_UI.FOOTER_WILL_CREATE, {
                                                items: mapped.itemCount, records: mapped.recordCount,
                                            })
                                )}
                            </span>
                            <div className="bulk-popup-footer-actions">
                                <button type="button" className="create-item-nav-btn create-item-nav-btn-cancel" onClick={onClose}>
                                    {IMPORT_UI.CANCEL_BTN}
                                </button>
                                <button
                                    type="button"
                                    className="create-item-nav-btn create-item-nav-btn-primary"
                                    disabled={!canImport}
                                    onClick={handleImport}
                                >
                                    {fill(IMPORT_UI.IMPORT_BTN, { count: mapped ? mapped.validCount : 0 })}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bulk-popup-body">
                            {phase !== 'finished' && (
                                <div className="import-note">
                                    {phase === 'items' && IMPORT_UI.PROGRESS_PHASE_ITEMS}
                                    {phase === 'sync' && IMPORT_UI.PROGRESS_PHASE_SYNC}
                                    {phase === 'records' && IMPORT_UI.PROGRESS_PHASE_RECORDS}
                                </div>
                            )}

                            <BulkProgress
                                state={phase === 'finished' ? runState : { ...runState, status: 'running' }}
                                labelTemplate={IMPORT_UI.PROGRESS_LABEL}
                                successTemplate={IMPORT_UI.RESULT_SUCCESS}
                            />

                            {interrupted && <div className="bulk-popup-error">{interrupted}</div>}
                        </div>

                        <div className="bulk-popup-footer">
                            <div className="bulk-popup-footer-actions">
                                {isRunning && (
                                    <button type="button" className="create-item-nav-btn create-item-nav-btn-cancel" onClick={stopRun}>
                                        <i className="fas fa-stop"></i> Apturēt
                                    </button>
                                )}
                                {phase === 'finished' && (
                                    <button
                                        type="button"
                                        className="create-item-nav-btn create-item-nav-btn-primary"
                                        onClick={onClose}
                                    >
                                        {IMPORT_UI.CLOSE_BTN}
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

/** "→ new GV (row 4)" / "→ existing GV 12" — makes implicit linking visible. */
const describeParent = (entry) => {
    if (entry.type !== ROW_TYPE.RECORD || !entry.parent) return '';
    const { parent } = entry;
    if (parent.kind === 'current') {
        return fill(IMPORT_UI.PARENT_CURRENT_ITEM, { number: parent.item.number });
    }
    if (parent.kind === 'existing') {
        return fill(IMPORT_UI.PARENT_EXISTING_ITEM, { number: parent.item.number });
    }
    return fill(IMPORT_UI.PARENT_NEW_ITEM, { row: parent.rowNumber });
};

export default ImportPopup;
