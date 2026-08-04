import React, { useCallback, useState } from 'react';
import ImportPopup from '../components/ImportPopup';
import { bulkApi, useBulkRunner, useInvalidateAfterBulk } from '../hooks/useBulkOperations';
import { IMPORT_UI } from '../Constants/Constants';
import { useNotification } from '../components/Notification';

/**
 * Import records from a spreadsheet into ONE item.
 *
 * Single-phase and much simpler than the inventory-level import: the parent
 * already exists, so no SAITE column is needed and every row goes to this item.
 * TIPS is ignored — in this context every data row is a record.
 */
const ImportRecordsPopup = ({ item, projectId, onClose }) => {
    const invalidate = useInvalidateAfterBulk();
    const { notify } = useNotification();
    const { state: runState, run, stop } = useBulkRunner();
    const [phase, setPhase] = useState(null);

    const runImport = useCallback(async ({ entries }) => {
        setPhase('records');

        const result = await run(entries.map(entry => ({
            label: entry.label,
            execute: () => bulkApi.createRecord(projectId, item.id, entry.payload),
        })));

        invalidate(projectId);
        setPhase('finished');

        const ok = result.results.filter(entry => entry.ok).length;
        const failed = result.results.filter(entry => !entry.ok).length;

        if (failed === 0 && !result.stopped) {
            notify.success(IMPORT_UI.RESULT_SUCCESS.replace('{count}', ok));
        } else if (ok > 0) {
            notify.warning(`${IMPORT_UI.RESULT_SUCCESS.replace('{count}', ok)}, ${IMPORT_UI.RESULT_FAILED.replace('{count}', failed)}`);
        } else {
            notify.error(IMPORT_UI.RESULT_FAILED.replace('{count}', failed));
        }
    }, [projectId, item, run, invalidate, notify]);

    return (
        <ImportPopup
            title={IMPORT_UI.TITLE_RECORDS}
            subtitle={`${IMPORT_UI.SUBTITLE_RECORDS} — GV ${item?.number ?? ''}`}
            item={item}
            recordsAllowed={true}
            runImport={runImport}
            runState={runState}
            stopRun={stop}
            phase={phase}
            interrupted={null}
            onClose={onClose}
            helpChapterId="records"
            helpSectionId="csv-import-records"
        />
    );
};

export default ImportRecordsPopup;
