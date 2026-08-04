import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import HelpButton from '../Help/HelpButton';
import FieldHelp from './FieldHelp';
import BulkFieldRow from './BulkFieldRow';
import { useBulkRunner } from '../hooks/useBulkOperations';
import {
    BULK_MODES,
    BULK_SELECTION_WARN_THRESHOLD,
    MIXED,
    buildOverrides,
    commonValue,
    countAffected,
    descriptorKeys,
    findEmptyRequiredFields,
    flattenFields,
} from '../Constants/bulkConstants';
import { BULK_UI } from '../Constants/Constants';
import './BulkEditPopup.css';

const MAX_CHIPS = 10;

/**
 * Shared shell for editing MANY entities at once.
 *
 * The whole design rests on one backend fact: neither the item nor the record
 * endpoint supports partial updates, so every save is a full-object PUT. A
 * bulk edit therefore cannot send "just the changed field" — it must rebuild
 * each entity's complete payload from that entity's own current values plus
 * the ticked overrides. That is what `buildPayload` is for, and why unticked
 * fields are genuinely left alone rather than blanked.
 *
 * Because there is no batch endpoint and no transaction, the flow is:
 * validate everything first → then send one request per entity → then report
 * exactly what happened, including partial failure.
 */
const BulkEditPopup = ({
    title,
    intro,
    entities,
    entityLabel,
    fields,
    buildPayload,
    validate,
    execute,
    onClose,
    onFinished,
    helpChapterId,
    helpSectionId,
    entityKind = 'items',    // 'items' | 'records' — picks the plural wording
}) => {
    const [step, setStep] = useState('edit');   // edit | review | run
    const [enabled, setEnabled] = useState(new Set());
    const [modes, setModes] = useState({});
    const { state: runState, run, stop, reset } = useBulkRunner();

    const leafFields = useMemo(() => flattenFields(fields), [fields]);

    // Prefill every control with the value the selected entities share, and
    // remember which keys differ so the UI can say so instead of quietly
    // presenting the first entity's value as if it were common.
    const { initialValues, mixedKeys } = useMemo(() => {
        const values = {};
        const mixed = new Set();

        leafFields.forEach(descriptor => {
            (descriptor.keys || []).forEach(key => {
                const shared = commonValue(entities, key);
                if (shared === MIXED) {
                    mixed.add(key);
                    values[key] = MIXED;
                } else {
                    values[key] = shared;
                }
            });
        });

        return { initialValues: values, mixedKeys: mixed };
    }, [entities, leafFields]);

    const [values, setValues] = useState(initialValues);

    // Lock the page behind the popup, and allow Escape to cancel — but never
    // mid-batch, where closing would hide the result of work already done.
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

    const handleToggle = (id) => {
        setEnabled(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleChange = (patch) => setValues(prev => ({ ...prev, ...patch }));
    const handleModeChange = (id, mode) => setModes(prev => ({ ...prev, [id]: mode }));

    // ─── Review data ────────────────────────────────────────────────────────

    const review = useMemo(() => {
        // Only while reviewing: during the run this would re-validate every
        // entity on each progress tick, for nothing.
        if (step !== 'review') return null;

        const enabledFields = fields.filter(field => enabled.has(field.id));
        const emptyRequired = findEmptyRequiredFields(fields, values, enabled);

        const plans = entities.map(entity => {
            const overrides = buildOverrides(fields, entity, values, modes, enabled);
            const payload = buildPayload(entity, overrides);
            const validation = validate ? validate(payload, entity) : { isValid: true, errors: {} };
            const firstError = validation.isValid
                ? null
                : Object.values(validation.errors)[0];

            return {
                entity,
                label: entityLabel(entity),
                payload,
                ok: validation.isValid,
                message: firstError,
            };
        });

        const perField = enabledFields.map(field => ({
            id: field.id,
            label: field.label,
            affected: countAffected(entities, fields, values, modes, enabled, field),
            preview: describeChange(field, values, modes),
        }));

        return {
            emptyRequired,
            plans,
            valid: plans.filter(plan => plan.ok),
            skipped: plans.filter(plan => !plan.ok),
            perField,
        };
    }, [step, fields, values, modes, enabled, entities, buildPayload, validate, entityLabel]);

    // ─── Actions ────────────────────────────────────────────────────────────

    const handleSave = async () => {
        // Build the task list before switching step — `review` is recomputed
        // to null once we leave the review step.
        const tasks = review.valid.map(plan => ({
            label: plan.label,
            execute: () => execute(plan.entity, plan.payload),
        }));
        setStep('run');
        const result = await run(tasks);
        if (onFinished) onFinished(result);
    };

    const isRunning = runState.status === 'running';
    const isDone = runState.status === 'done';

    // ─── Render ─────────────────────────────────────────────────────────────

    return ReactDOM.createPortal(
        <div className="bulk-popup-overlay">
            <div className="bulk-popup-container">
                <div className="bulk-popup-header">
                    <div className="bulk-popup-header-main">
                        <h2 className="bulk-popup-title">
                            <i className="fas fa-edit"></i> {title}
                        </h2>
                        <EntityChips entities={entities} entityLabel={entityLabel} />
                    </div>
                    <HelpButton chapterId={helpChapterId} sectionId={helpSectionId} iconOnly={true} className="small" />
                </div>

                {/* One strip, carrying the rule rather than restating the
                    title — the header already says how many are being edited. */}
                {step === 'edit' && (
                    <div className="bulk-popup-mode-strip">
                        <i className="fas fa-layer-group"></i>
                        <span>{intro}</span>
                    </div>
                )}

                {step === 'edit' && (
                    <>
                        <div className="bulk-popup-body">
                            {/* Inside the body, so it sits on the body's
                                background with the same padding as the fields. */}
                            {entities.length > BULK_SELECTION_WARN_THRESHOLD && (
                                <div className="bulk-popup-warning">
                                    <i className="fas fa-exclamation-triangle"></i>{' '}
                                    {BULK_UI.WARNING_LARGE_SELECTION.replace(/\{count\}/g, entities.length)}
                                </div>
                            )}
                            {fields.map(field => (
                                <BulkFieldRow
                                    key={field.id}
                                    descriptor={field}
                                    values={values}
                                    modes={modes}
                                    enabled={enabled}
                                    mixedKeys={mixedKeys}
                                    onToggle={handleToggle}
                                    onChange={handleChange}
                                    onModeChange={handleModeChange}
                                />
                            ))}
                        </div>
                        <div className="bulk-popup-footer">
                            <span className="bulk-popup-footer-summary">
                                {enabled.size === 0 && BULK_UI.FOOTER_NOTHING_SELECTED}
                                {enabled.size === 1 && BULK_UI.FOOTER_FIELDS_SELECTED}
                                {enabled.size > 1 && BULK_UI.FOOTER_FIELDS_SELECTED_MANY.replace('{fields}', enabled.size)}
                            </span>
                            <div className="bulk-popup-footer-actions">
                                <button type="button" className="create-item-nav-btn create-item-nav-btn-cancel" onClick={onClose}>
                                    {BULK_UI.CANCEL_BTN}
                                </button>
                                <button
                                    type="button"
                                    className="create-item-nav-btn create-item-nav-btn-primary"
                                    disabled={enabled.size === 0}
                                    onClick={() => setStep('review')}
                                >
                                    {BULK_UI.REVIEW_NEXT_BTN}
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {step === 'review' && review && (
                    <>
                        <div className="bulk-popup-body">
                            <h3 className="bulk-review-title">
                                {BULK_UI.REVIEW_TITLE}
                                <FieldHelp text={BULK_UI.HINT_REVIEW} />
                            </h3>

                            <ul className="bulk-review-list">
                                {review.perField.map(field => (
                                    <li key={field.id} className="bulk-review-item">
                                        <span className="bulk-review-item-label">{field.label}</span>
                                        <span className="bulk-review-item-value">{field.preview}</span>
                                        <span className="bulk-review-item-count">
                                            {field.affected > 0
                                                ? BULK_UI.REVIEW_AFFECTED.replace('{count}', field.affected)
                                                : BULK_UI.REVIEW_AFFECTED_NONE}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {review.emptyRequired.length > 0 && (
                                <div className="bulk-popup-error">
                                    {review.emptyRequired.map(label => (
                                        <div key={label}>
                                            {BULK_UI.REVIEW_EMPTY_FIELD.replace('{label}', label)}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {review.skipped.length > 0 && (
                                <div className="bulk-popup-warning">
                                    <div className="bulk-popup-warning-title">
                                        <i className="fas fa-exclamation-triangle"></i>
                                        {(entityKind === 'records'
                                            ? BULK_UI.REVIEW_SKIPPED_TITLE_RECORDS
                                            : BULK_UI.REVIEW_SKIPPED_TITLE).replace('{count}', review.skipped.length)}
                                    </div>
                                    <ul className="bulk-skipped-list">
                                        {review.skipped.map(plan => (
                                            <li key={plan.label}>
                                                <strong>{plan.label}</strong> — {plan.message}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {review.valid.length === 0 && review.emptyRequired.length === 0 && (
                                <div className="bulk-popup-error">{BULK_UI.REVIEW_ALL_SKIPPED}</div>
                            )}

                            <div className="bulk-popup-note">
                                <i className="fas fa-info-circle"></i> {BULK_UI.WARNING_NOT_REVERSIBLE}
                            </div>
                        </div>

                        <div className="bulk-popup-footer">
                            <div className="bulk-popup-footer-actions">
                                <button type="button" className="create-item-nav-btn create-item-nav-btn-cancel" onClick={() => setStep('edit')}>
                                    {BULK_UI.REVIEW_BACK_BTN}
                                </button>
                                <button
                                    type="button"
                                    className="create-item-nav-btn create-item-nav-btn-primary"
                                    disabled={review.valid.length === 0 || review.emptyRequired.length > 0}
                                    onClick={handleSave}
                                >
                                    {BULK_UI.REVIEW_SAVE_BTN.replace('{count}', review.valid.length)}
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
                                labelTemplate={BULK_UI.PROGRESS_SAVING}
                                successTemplate={BULK_UI.RESULT_SUCCESS}
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
                                    <>
                                        {runState.results.some(r => !r.ok) && (
                                            <button
                                                type="button"
                                                className="create-item-nav-btn create-item-nav-btn-cancel"
                                                onClick={() => { reset(); setStep('edit'); }}
                                            >
                                                {BULK_UI.REVIEW_BACK_BTN}
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            className="create-item-nav-btn create-item-nav-btn-primary"
                                            onClick={onClose}
                                        >
                                            {BULK_UI.RESULT_CLOSE_BTN}
                                        </button>
                                    </>
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

/** GV/record chips in the popup header — the "you are editing these" signal. */
export const EntityChips = ({ entities, entityLabel }) => (
    <div className="bulk-popup-chips">
        {entities.slice(0, MAX_CHIPS).map((entity, index) => (
            <span key={entity.id ?? index} className="bulk-popup-chip">{entityLabel(entity)}</span>
        ))}
        {entities.length > MAX_CHIPS && (
            <span className="bulk-popup-chip bulk-popup-chip-more">
                {BULK_UI.SELECTION_MORE.replace('{count}', entities.length - MAX_CHIPS)}
            </span>
        )}
    </div>
);

/** Progress bar + honest result list, shared by bulk edit and multi create. */
export const BulkProgress = ({ state, labelTemplate, successTemplate }) => {
    const succeeded = state.results.filter(r => r.ok).length;
    const failed = state.results.filter(r => !r.ok);
    const percent = state.total > 0 ? Math.round((state.done / state.total) * 100) : 0;

    return (
        <div className="bulk-progress">
            <div className="bulk-progress-label">
                {labelTemplate.replace('{done}', state.done).replace('{total}', state.total)}
            </div>
            <div className="bulk-progress-track">
                <div className="bulk-progress-fill" style={{ width: `${percent}%` }} />
            </div>

            {state.status === 'done' && (
                <div className="bulk-progress-results">
                    <div className="bulk-progress-summary">
                        <span className="bulk-progress-ok">
                            <i className="fas fa-check-circle"></i>{' '}
                            {successTemplate.replace('{count}', succeeded)}
                        </span>
                        {failed.length > 0 && (
                            <span className="bulk-progress-fail">
                                <i className="fas fa-times-circle"></i>{' '}
                                {BULK_UI.RESULT_FAILED.replace('{count}', failed.length)}
                            </span>
                        )}
                    </div>

                    {state.stopped && <div className="bulk-popup-warning">{BULK_UI.RESULT_STOPPED}</div>}

                    {failed.length > 0 && (
                        <ul className="bulk-skipped-list">
                            {failed.map((result, index) => (
                                <li key={`${result.label}-${index}`}>
                                    <strong>{result.label}</strong> — {result.message}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

/** Human-readable "what this field becomes", for the review step. */
const describeChange = (field, values, modes) => {
    const keys = descriptorKeys(field);
    const mode = modes[field.id];

    if (mode === BULK_MODES.CLEAR) return `(${BULK_UI.MODE_CLEAR.toLowerCase()})`;

    const parts = keys
        .map(key => {
            const value = values[key];
            if (value === MIXED || value === undefined || value === null || value === '') return null;
            return Array.isArray(value) ? value.join(', ') : String(value);
        })
        .filter(Boolean);

    const text = parts.join(' / ') || '—';
    return mode === BULK_MODES.APPEND ? `+ ${text}` : text;
};

export default BulkEditPopup;
