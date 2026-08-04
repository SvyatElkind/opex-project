import React, { useCallback, useMemo, useRef } from 'react';
import MultiCreatePopup from '../components/MultiCreatePopup';
import { bulkApi, useInvalidateAfterBulk } from '../hooks/useBulkOperations';
import {
    fileNameToTitle,
    getRecordSharedCreateFields,
    languageToTags,
} from '../Constants/bulkConstants';
import { getRecordCreatePayload, validateTextRecordCreate } from '../Constants/recordConstants';
import { BULK_UI, RECORD_CREATE_FORM_UI } from '../Constants/Constants';
import { useSettings } from '../Settings/context/SettingsContext';
import { useNotification } from '../components/Notification';

/**
 * Create several records at once for one item.
 *
 * Besides pasting and patterns, this popup supports the flow that saves the
 * most time on electronic documents: pick N files and get N records, each
 * named after its file and each with the file attached (create the record,
 * then POST the file to .../multiple_files/).
 *
 * created_date and sent_date are shared fields rather than optional extras
 * because both are blank=False on the Record model — DRF rejects a create
 * without them.
 */
const MultiCreateRecordsPopup = ({ item, projectId, onClose }) => {
    const invalidate = useInvalidateAfterBulk();
    const { notify } = useNotification();
    const { getActivePreset } = useSettings();
    const rowKeyRef = useRef(0);

    const activePreset = getActivePreset();
    const sharedFields = useMemo(() => getRecordSharedCreateFields(), []);

    const initialSharedValues = useMemo(() => ({
        date: '',
        created_date: '',
        sent_date: '',
        language: activePreset?.recordLanguage
            ? [activePreset.recordLanguage]
            : [RECORD_CREATE_FORM_UI.DEFAULT_LANGUAGE],
        group: '',
        nomenclature_nr: '',
        sent_reg_nr: '',
        key_words: activePreset?.keyWords || '',
        annotation: '',
        notes: activePreset?.notes || '',
        tech_info: '',
        access_restriction: activePreset?.accessRestriction || 'open',
        access_restriction_date: '',
        access_restriction_notes: '',
        user_restriction_notes: '',
    }), [activePreset]);

    const buildPayload = useCallback((row, shared) => getRecordCreatePayload({
        ...shared,
        language: languageToTags(shared.language).join(', '),
        title: row.title,
        reg_nr: row.reg_nr,
    }), []);

    const buildRow = useCallback((values = {}) => {
        rowKeyRef.current += 1;
        const file = values.file || null;
        return {
            key: `row_${rowKeyRef.current}`,
            title: values.title || (file ? fileNameToTitle(file.name) : ''),
            reg_nr: values.reg_nr || '',
            file,
        };
    }, []);

    const validateRow = useCallback((row, shared) => {
        // Fields the shared block owns but validateTextRecordCreate does not
        // check — without these the failure would only surface as a backend
        // 400 halfway through the batch.
        if (!shared.created_date) return 'Izveidošanas datums ir obligāts.';
        if (!shared.sent_date) return 'Nosūtīšanas datums ir obligāts.';
        if (!shared.access_restriction) return 'Pieejamība ir obligāta.';
        if (!shared.nomenclature_nr) return 'Lietas Nr. ir obligāts.';

        const validation = validateTextRecordCreate(buildPayload(row, shared), item);
        return validation.isValid ? null : Object.values(validation.errors)[0];
    }, [buildPayload, item]);

    const execute = useCallback(async (row, shared) => {
        const { data } = await bulkApi.createRecord(projectId, item.id, buildPayload(row, shared));
        if (row.file && data?.id) {
            await bulkApi.uploadRecordFiles(projectId, data.id, [row.file]);
        }
        return data;
    }, [buildPayload, projectId, item]);

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
            title={BULK_UI.CREATE_TITLE_RECORDS}
            entityKind="records"
            sharedFields={sharedFields}
            initialSharedValues={initialSharedValues}
            columns={[
                {
                    key: 'title',
                    label: RECORD_CREATE_FORM_UI.FIELD_NOSAUKUMS,
                    required: true,
                    placeholder: RECORD_CREATE_FORM_UI.PLACEHOLDER_NOSAUKUMS,
                    width: 4,
                    helpEntity: 'record',
                    helpField: 'title',
                },
                {
                    key: 'reg_nr',
                    label: RECORD_CREATE_FORM_UI.FIELD_REĢISTRĀCIJAS_NR,
                    required: true,
                    placeholder: RECORD_CREATE_FORM_UI.PLACEHOLDER_REG_NR_EXAMPLE,
                    width: 2,
                    helpEntity: 'record',
                    helpField: 'reg_nr',
                },
            ]}
            buildRow={buildRow}
            validateRow={validateRow}
            execute={execute}
            rowLabel={(row, index) => row.reg_nr || row.title || `#${index + 1}`}
            supportsFiles={true}
            onClose={onClose}
            onFinished={handleFinished}
            helpChapterId="records"
            helpSectionId="batch-records"
        />
    );
};

export default MultiCreateRecordsPopup;
