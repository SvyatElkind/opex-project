/**
 * Binds the plan executor to the real API through devDataFactory.
 *
 * Kept apart from executor.js so the executor stays free of network code and
 * the tests can hand it a fake with the same shape.
 */

import {
  createInventoryWithPayload,
  createItemWithPayload,
  resolveItemIds,
  createRecordWithPayload,
  createMediaRecordFromFile,
  uploadFile,
  addMetadataPayload,
  updateMediaRecord,
  setSigners,
} from '../devDataFactory';

export const createFactoryApi = () => ({
  createInventory: (projectId, fondId, payload) => createInventoryWithPayload(projectId, fondId, payload),
  // The executor resolves ids once per inventory itself.
  createItem: (projectId, inventoryId, payload) => createItemWithPayload(projectId, inventoryId, payload, { resolveId: false }),
  resolveItemIds,
  createRecord: (projectId, itemId, payload) => createRecordWithPayload(projectId, itemId, payload),
  createMediaRecord: (projectId, itemId, mediaType) => createMediaRecordFromFile(projectId, itemId, mediaType),
  uploadFile,
  addMetadata: (projectId, recordId, cls, payload) => addMetadataPayload(projectId, recordId, cls, payload),
  updateMediaRecord,
  setSigners,
});

export default createFactoryApi;
