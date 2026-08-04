// src/hooks/useBulkOperations.js
//
// Sequential runner for bulk create/update, plus the API calls the bulk popups
// need.
//
// Why sequential and not Promise.all:
//   Item.add_item() assigns item.number = inventory.last_gv + 1 server-side
//   (items/models.py), so parallel creates would race for the same GV number.
//   Updates are sequential too, simply so the progress counter is truthful and
//   a stopped run leaves a known state.
//
// Why these hooks and not useCreateItem/useUpdateItem:
//   Those carry optimistic cache updates keyed on the client-supplied number
//   (which the server overwrites) and invalidate the whole project query on
//   every single call. For a batch of 30 that is 30 invalidations and a cache
//   that briefly disagrees with the server. Here we touch the cache exactly
//   once, when the whole batch is done.

import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { get, post, put, apiRequest } from '../services/apiClient';
import { QUERY_KEYS } from '../Constants/Constants';

const initialState = {
    status: 'idle',      // idle | running | done
    done: 0,
    total: 0,
    results: [],         // { label, ok, message }
    stopped: false,
};

/**
 * Run tasks one after another, reporting progress and never throwing.
 *
 * A task is { label, execute }. A failing task is recorded and the run
 * continues — the caller shows the full picture at the end, exactly like
 * useBatchDeleteRecords already reports partial failures.
 */
export function useBulkRunner() {
    const [state, setState] = useState(initialState);
    const stopRef = useRef(false);
    // Mirror of `state` so an appended run can pick up where the previous one
    // finished without waiting for a re-render.
    const stateRef = useRef(initialState);

    const publish = useCallback((next) => {
        stateRef.current = next;
        setState(next);
    }, []);

    const stop = useCallback(() => {
        stopRef.current = true;
    }, []);

    const reset = useCallback(() => {
        stopRef.current = false;
        publish(initialState);
    }, [publish]);

    /**
     * @param {Array} tasks
     * @param {object} [options]
     * @param {boolean} [options.append] keep the previous run's results and
     *        counters — used by the CSV import, which runs items, then a data
     *        refresh, then records, but shows one progress bar.
     * @param {number} [options.expectedTotal] total to display from the start,
     *        when later phases are already known but not yet queued.
     */
    const run = useCallback(async (tasks, { append = false, expectedTotal = null } = {}) => {
        stopRef.current = false;

        const previous = append ? stateRef.current : initialState;
        const baseResults = append ? [...previous.results] : [];
        const baseDone = append ? previous.done : 0;
        const total = expectedTotal
            ?? (append ? Math.max(previous.total, baseDone + tasks.length) : tasks.length);

        publish({ status: 'running', done: baseDone, total, results: baseResults, stopped: false });

        const results = [...baseResults];

        for (let index = 0; index < tasks.length; index++) {
            if (stopRef.current) break;

            const task = tasks[index];
            try {
                await task.execute();
                results.push({ label: task.label, ok: true });
            } catch (error) {
                results.push({
                    label: task.label,
                    ok: false,
                    message: extractMessage(error),
                });
            }

            publish({
                ...stateRef.current,
                done: baseDone + index + 1,
                results: [...results],
            });
        }

        const finalState = {
            status: 'done',
            done: results.length,
            total: Math.max(total, results.length),
            results,
            stopped: stopRef.current,
        };
        publish(finalState);
        return finalState;
    }, [publish]);

    return { state, run, stop, reset };
}

/** Pull the most useful message out of an ApiError / Error. */
const extractMessage = (error) => {
    if (!error) return 'Nezināma kļūda';

    // ApiError exposes per-field messages — the first one is far more useful
    // than the generic "API Error".
    const fieldErrors = error.fieldErrors;
    if (fieldErrors && typeof fieldErrors === 'object') {
        const firstKey = Object.keys(fieldErrors)[0];
        if (firstKey) {
            const value = fieldErrors[firstKey];
            return Array.isArray(value) ? value[0] : String(value);
        }
    }

    return error.message || 'Nezināma kļūda';
};

// ─── API calls used by the bulk popups ──────────────────────────────────────

export const bulkApi = {
    /**
     * Re-read the whole project. Needed by the CSV import between its two
     * phases: the item POST response carries `number` but not `id`, and a
     * record needs its parent's id.
     */
    getProject: (projectId) => get(`/project/${projectId}/`),

    updateItem: (projectId, itemId, payload) =>
        put(`/project/${projectId}/item/${itemId}/`, payload),

    createItem: (projectId, inventoryId, payload) =>
        post(`/project/${projectId}/item/?inventory_id=${inventoryId}`, payload),

    updateRecord: (projectId, recordId, payload) =>
        put(`/project/${projectId}/record/${recordId}/`, payload),

    createRecord: (projectId, itemId, payload) =>
        post(`/project/${projectId}/record/?item_id=${itemId}`, payload),

    uploadRecordFiles: (projectId, recordId, files) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        return apiRequest(
            `/project/${projectId}/record/${recordId}/multiple_files/`,
            { method: 'POST', body: formData, headers: {} }
        );
    },
};

/**
 * Refresh project data once, after a whole batch — not per request.
 */
export function useInvalidateAfterBulk() {
    const queryClient = useQueryClient();

    return useCallback((projectId) => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.project(projectId) });
        queryClient.invalidateQueries({ queryKey: ['project', 'detail', projectId] });
    }, [queryClient]);
}

const bulkOperations = { useBulkRunner, useInvalidateAfterBulk, bulkApi };

export default bulkOperations;
