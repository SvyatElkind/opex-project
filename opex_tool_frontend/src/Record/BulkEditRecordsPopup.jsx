import React, { useMemo } from 'react';
import BulkEditPopup from '../components/BulkEditPopup';
import { bulkApi, useInvalidateAfterBulk } from '../hooks/useBulkOperations';
import { getRecordBulkFields } from '../Constants/bulkConstants';
import { getRecordUpdatePayload, validateTextRecordCreate } from '../Constants/recordConstants';
import { BULK_UI } from '../Constants/Constants';
import { useNotification } from '../components/Notification';

/**
 * Edit several records at once.
 *
 * `item` is the parent item — record dates are validated against its date
 * range (the backend enforces item.start_date ≤ date ≤ item.end_date), so it
 * has to be passed in even though it is never written.
 */
const BulkEditRecordsPopup = ({ records, item, projectId, onClose }) => {
    const invalidate = useInvalidateAfterBulk();
    const { notify } = useNotification();

    const fields = useMemo(() => getRecordBulkFields(), []);

    const handleFinished = (result) => {
        invalidate(projectId);
        const failed = result.results.filter(r => !r.ok).length;
        const ok = result.results.filter(r => r.ok).length;

        if (failed === 0 && !result.stopped) {
            notify.success(BULK_UI.RESULT_SUCCESS.replace('{count}', ok));
        } else if (ok > 0) {
            notify.warning(`${BULK_UI.RESULT_SUCCESS.replace('{count}', ok)}, ${BULK_UI.RESULT_FAILED.replace('{count}', failed)}`);
        } else {
            notify.error(BULK_UI.RESULT_FAILED.replace('{count}', failed));
        }
    };

    return (
        <BulkEditPopup
            title={BULK_UI.EDIT_TITLE_RECORDS.replace('{count}', records.length)}
            intro={BULK_UI.EDIT_INTRO_RECORDS}
            entities={records}
            entityLabel={(record) => record.reg_nr || record.title || `ID ${record.id}`}
            fields={fields}
            buildPayload={(record, overrides) => getRecordUpdatePayload(record, overrides)}
            validate={(payload) => validateTextRecordCreate(payload, item)}
            execute={(record, payload) => bulkApi.updateRecord(projectId, record.id, payload)}
            onClose={onClose}
            onFinished={handleFinished}
            helpChapterId="records"
            helpSectionId="batch-records"
            entityKind="records"
        />
    );
};

export default BulkEditRecordsPopup;
