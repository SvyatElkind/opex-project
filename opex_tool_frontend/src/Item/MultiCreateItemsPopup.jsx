import React, { useCallback, useMemo, useRef } from 'react';
import MultiCreatePopup from '../components/MultiCreatePopup';
import { bulkApi, useInvalidateAfterBulk } from '../hooks/useBulkOperations';
import { getItemSharedCreateFields, languageToTags } from '../Constants/bulkConstants';
import { validateItemCreate } from '../Constants/itemConstants';
import { BULK_UI, ITEM_CREATE_FORM_UI } from '../Constants/Constants';
import { useSettings } from '../Settings/context/SettingsContext';
import { useNotification } from '../components/Notification';

/**
 * Create several items at once: shared fields once, one row per title.
 *
 * GV numbers are NOT sent — Item.add_item() overwrites whatever the client
 * supplies with inventory.last_gv + 1. That is also why MultiCreatePopup runs
 * the rows strictly one at a time.
 */
const MultiCreateItemsPopup = ({ inventory, projectId, inventoryId, onClose }) => {
    const invalidate = useInvalidateAfterBulk();
    const { notify } = useNotification();
    const { getActivePreset } = useSettings();
    const rowKeyRef = useRef(0);

    const activePreset = getActivePreset();
    const sharedFields = useMemo(() => getItemSharedCreateFields(inventory), [inventory]);

    const initialSharedValues = useMemo(() => ({
        series_code: '',
        start_date: '',
        end_date: '',
        date_indicator: 'day',
        date_note: '',
        size: 0,
        unit_of_measure: ITEM_CREATE_FORM_UI.OPTIONS_APJOMA_MĒRVIENĪBA.LAPAS,
        language: activePreset?.itemLanguage
            ? [activePreset.itemLanguage]
            : [ITEM_CREATE_FORM_UI.LANGUAGES[0]],
        annotation: '',
        notes: activePreset?.notes || '',
        sistematisation: '',
        copy: '',
        archival_history: '',
        restriction: activePreset?.restriction || ITEM_CREATE_FORM_UI.OPTIONS_PIEEJAMĪBA.VISPĀRĒJA,
        restriction_note: '',
        security_level: activePreset?.securityLevel || ITEM_CREATE_FORM_UI.OPTIONS_SLEPENĪBA.PUBLISKS,
        security_level_note: '',
    }), [activePreset]);

    const buildPayload = useCallback((row, shared) => ({
        series_code: shared.series_code || '',
        title: row.title || '',
        start_date: shared.start_date || '',
        end_date: shared.end_date || '',
        date_indicator: shared.date_indicator || 'day',
        date_note: shared.date_note || '',
        size: Number(shared.size) || 0,
        unit_of_measure: shared.unit_of_measure || ITEM_CREATE_FORM_UI.OPTIONS_APJOMA_MĒRVIENĪBA.LAPAS,
        notes: shared.notes || '',
        annotation: shared.annotation || '',
        sistematisation: shared.sistematisation || '',
        language: languageToTags(shared.language).join(', '),
        restriction: shared.restriction || '',
        restriction_note: shared.restriction_note || '',
        security_level: shared.security_level || '',
        security_level_note: shared.security_level_note || '',
        copy: shared.copy || '',
        archival_history: shared.archival_history || '',
        related_item_list: [],
        inventory: inventory?.number,
    }), [inventory]);

    const buildRow = useCallback((values = {}) => {
        rowKeyRef.current += 1;
        return { key: `row_${rowKeyRef.current}`, title: values.title || '' };
    }, []);

    const validateRow = useCallback((row, shared) => {
        const validation = validateItemCreate(buildPayload(row, shared), inventory);
        return validation.isValid ? null : Object.values(validation.errors)[0];
    }, [buildPayload, inventory]);

    const execute = useCallback(
        (row, shared) => bulkApi.createItem(projectId, inventoryId, buildPayload(row, shared)),
        [buildPayload, projectId, inventoryId]
    );

    const handleFinished = (result) => {
        invalidate(projectId);
        const ok = result.results.filter(r => r.ok).length;
        const failed = result.results.filter(r => !r.ok).length;

        if (failed === 0 && !result.stopped) {
            notify.success(BULK_UI.RESULT_SUCCESS_CREATE.replace('{count}', ok));
        } else if (ok > 0) {
            notify.warning(`${BULK_UI.RESULT_SUCCESS_CREATE.replace('{count}', ok)}, ${BULK_UI.RESULT_FAILED.replace('{count}', failed)}`);
        } else {
            notify.error(BULK_UI.RESULT_FAILED.replace('{count}', failed));
        }
    };

    return (
        <MultiCreatePopup
            title={BULK_UI.CREATE_TITLE_ITEMS}
            entityKind="items"
            sharedFields={sharedFields}
            initialSharedValues={initialSharedValues}
            columns={[{
                key: 'title',
                label: ITEM_CREATE_FORM_UI.FIELD_NOSAUKUMS,
                required: true,
                placeholder: ITEM_CREATE_FORM_UI.PLACEHOLDER_NOSAUKUMS,
                width: 4,
                helpEntity: 'item',
                helpField: 'title',
            }]}
            buildRow={buildRow}
            validateRow={validateRow}
            execute={execute}
            rowLabel={(row, index) => row.title || `#${index + 1}`}
            numberHint={BULK_UI.CREATE_NUMBER_HINT}
            onClose={onClose}
            onFinished={handleFinished}
            helpChapterId="items"
            helpSectionId="batch-operations"
        />
    );
};

export default MultiCreateItemsPopup;
