import React, { useMemo } from 'react';
import BulkEditPopup from '../components/BulkEditPopup';
import { bulkApi, useInvalidateAfterBulk } from '../hooks/useBulkOperations';
import { getItemBulkFields } from '../Constants/bulkConstants';
import { getItemUpdatePayload, validateItemUpdate } from '../Constants/itemConstants';
import { BULK_UI } from '../Constants/Constants';
import { useNotification } from '../components/Notification';

/**
 * Edit several items at once.
 *
 * The payload for each item is rebuilt with getItemUpdatePayload() from that
 * item's own values — the item PUT has no partial support, so anything missing
 * from the payload would be overwritten (and a missing related_item_list would
 * wipe its relation links outright). Only the ticked fields become overrides.
 */
const BulkEditItemsPopup = ({ items, inventory, projectId, onClose }) => {
    const invalidate = useInvalidateAfterBulk();
    const { notify } = useNotification();

    const fields = useMemo(() => getItemBulkFields(inventory), [inventory]);

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
            title={BULK_UI.EDIT_TITLE_ITEMS.replace('{count}', items.length)}
            intro={BULK_UI.EDIT_INTRO}
            entities={items}
            entityLabel={(item) => `GV ${item.number}`}
            fields={fields}
            buildPayload={(item, overrides) => getItemUpdatePayload(item, inventory, overrides)}
            validate={(payload) => validateItemUpdate(payload, inventory)}
            execute={(item, payload) => bulkApi.updateItem(projectId, item.id, payload)}
            onClose={onClose}
            onFinished={handleFinished}
            helpChapterId="items"
            helpSectionId="batch-operations"
            entityKind="items"
        />
    );
};

export default BulkEditItemsPopup;
