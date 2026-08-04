import React, { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import ImportPopup from '../components/ImportPopup';
import { bulkApi, useBulkRunner, useInvalidateAfterBulk } from '../hooks/useBulkOperations';
import { ROW_TYPE } from '../Constants/importConstants';
import { IMPORT_UI, QUERY_KEYS } from '../Constants/Constants';
import { useNotification } from '../components/Notification';
import InheritanceUtils from '../Utils/InheritanceUtils';

const fill = (template, values) =>
    Object.entries(values).reduce(
        (text, [key, value]) => text.replace(new RegExp(`\\{${key}\\}`, 'g'), value),
        template
    );

/**
 * Import items — and optionally their records — into one inventory.
 *
 * Two phases, because the item POST response does not include `id` (only
 * `number`), and a record needs its parent's id:
 *
 *   1. create items sequentially, remembering each returned `number`
 *   2. re-read the project (awaited — invalidate alone would leave a stale cache)
 *      and build a number → id map for this inventory
 *   3. create records, resolving each parent through that map
 *
 * The backend is not touched: this uses the same two endpoints the manual forms
 * use. If step 2 fails, the import stops and says so plainly rather than
 * attaching records to the wrong item.
 */
const ImportItemsPopup = ({ inventory, items = [], projectId, inventoryId, onClose }) => {
    const queryClient = useQueryClient();
    const invalidate = useInvalidateAfterBulk();
    const { notify } = useNotification();
    const { state: runState, run, stop } = useBulkRunner();

    const [phase, setPhase] = useState(null);            // null | items | sync | records | finished
    const [interrupted, setInterrupted] = useState(null);

    const inheritanceInfo = inventory ? InheritanceUtils.getInheritanceInfo(inventory) : null;
    const recordsAllowed = Boolean(inheritanceInfo?.isElectronicDocuments);

    const runImport = useCallback(async ({ entries }) => {
        const itemEntries = entries.filter(entry => entry.type === ROW_TYPE.ITEM);
        const recordEntries = entries.filter(entry => entry.type === ROW_TYPE.RECORD);
        const total = itemEntries.length + recordEntries.length;

        // Row number → GV number assigned by the server.
        const numberByRow = new Map();

        // ── Phase 1: items
        setPhase('items');
        const itemsResult = await run(
            itemEntries.map(entry => ({
                label: `${IMPORT_UI.TYPE_ITEM} · ${entry.label}`,
                execute: async () => {
                    const { data } = await bulkApi.createItem(projectId, inventoryId, entry.payload);
                    if (data?.number !== undefined) numberByRow.set(entry.rowNumber, data.number);
                },
            })),
            { expectedTotal: total }
        );

        if (recordEntries.length === 0 || itemsResult.stopped) {
            invalidate(projectId);
            setPhase('finished');
            report(itemsResult, notify);
            return;
        }

        // ── Barrier: re-read the project so new items can be found by number
        let idByNumber = new Map();
        if (itemEntries.length > 0) {
            setPhase('sync');
            try {
                const project = await queryClient.fetchQuery({
                    queryKey: QUERY_KEYS.project(projectId),
                    queryFn: async () => (await bulkApi.getProject(projectId)).data,
                    staleTime: 0,
                });
                const target = project?.institution?.fond?.inventories
                    ?.find(candidate => candidate.id === inventoryId);
                idByNumber = new Map((target?.items || []).map(item => [Number(item.number), item.id]));
            } catch {
                setPhase('finished');
                setInterrupted(fill(IMPORT_UI.SYNC_FAILED, {
                    count: itemsResult.results.filter(result => result.ok).length,
                }));
                invalidate(projectId);
                notify.warning(IMPORT_UI.SYNC_FAILED.replace('{count}',
                    itemsResult.results.filter(result => result.ok).length));
                return;
            }
        }

        // ── Phase 2: records
        setPhase('records');
        const finalResult = await run(
            recordEntries.map(entry => ({
                label: `${IMPORT_UI.TYPE_RECORD} · ${entry.label}`,
                execute: async () => {
                    const parentId = resolveParentId(entry, idByNumber, numberByRow);
                    if (!parentId) {
                        // The parent row failed in phase 1, or its number never
                        // came back — either way, do not guess a parent.
                        throw new Error(
                            numberByRow.has(entry.parent?.rowNumber)
                                ? IMPORT_UI.ROW_ERROR_PARENT_ID_MISSING
                                : IMPORT_UI.ROW_SKIPPED_PARENT_FAILED
                        );
                    }
                    await bulkApi.createRecord(projectId, parentId, entry.payload);
                },
            })),
            { append: true, expectedTotal: total }
        );

        invalidate(projectId);
        setPhase('finished');
        report(finalResult, notify);
    }, [projectId, inventoryId, run, invalidate, queryClient, notify]);

    return (
        <ImportPopup
            title={IMPORT_UI.TITLE_ITEMS}
            inventory={inventory}
            existingItems={items}
            recordsAllowed={recordsAllowed}
            runImport={runImport}
            runState={runState}
            stopRun={stop}
            phase={phase}
            interrupted={interrupted}
            onClose={onClose}
            helpChapterId="items"
            helpSectionId="csv-import"
        />
    );
};

/** Parent item id for a record row: an existing item, or one just created. */
const resolveParentId = (entry, idByNumber, numberByRow) => {
    const parent = entry.parent;
    if (!parent) return null;
    if (parent.kind === 'existing' || parent.kind === 'current') return parent.item.id;

    const number = numberByRow.get(parent.rowNumber);
    if (number === undefined) return null;
    return idByNumber.get(Number(number)) || null;
};

const report = (result, notify) => {
    const ok = result.results.filter(entry => entry.ok).length;
    const failed = result.results.filter(entry => !entry.ok).length;

    if (failed === 0 && !result.stopped) {
        notify.success(IMPORT_UI.RESULT_SUCCESS.replace('{count}', ok));
    } else if (ok > 0) {
        notify.warning(`${IMPORT_UI.RESULT_SUCCESS.replace('{count}', ok)}, ${IMPORT_UI.RESULT_FAILED.replace('{count}', failed)}`);
    } else {
        notify.error(IMPORT_UI.RESULT_FAILED.replace('{count}', failed));
    }
};

export default ImportItemsPopup;
