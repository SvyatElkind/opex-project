// src/hooks/useRecords.js
// FIXED: Proper API integration for record operations

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import Record_API from '../API/Record_API';
import { QUERY_KEYS } from '../Constants/Constants';

const recordAPI = Record_API();

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Invalidate related queries after record operations
 */
const invalidateRelatedQueries = (queryClient, projectId, recordId, itemId) => {
    // Invalidate project data to update record counts
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.project(projectId) });
    
    // Invalidate specific record data
    if (recordId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.record(projectId, recordId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mediaRecord(projectId, recordId) });
    }
    
    // Invalidate item records list
    if (itemId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.records(projectId, itemId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mediaRecords(projectId, itemId) });
    }
    
    // Invalidate metadata
    if (recordId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.metadata(projectId, recordId) });
    }
};

// ========================================
// STANDARD RECORD OPERATIONS
// ========================================

/**
 * Hook to fetch a single record with metadata
 */
export function useRecord(projectId, recordId) {
    return useQuery({
        queryKey: QUERY_KEYS.record(projectId, recordId),
        queryFn: async () => {
            const [success, response] = await recordAPI.getRecord(projectId, recordId);
            if (!success) {
                throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
            }
            return response;
        },
        enabled: !!projectId && !!recordId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 2
    });
}

/**
 * Hook to create a new standard record with optimistic updates
 */
export function useCreateRecord() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ recordData, projectId, itemId }) => {
            const [success, response] = await recordAPI.createRecord(recordData, projectId, itemId);
            if (!success) {
                throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
            }
            return response;
        },
        onSuccess: (data, variables) => {
            // Invalidate relevant queries
            invalidateRelatedQueries(queryClient, variables.projectId, data.id, variables.itemId);
        },
        onError: (error) => {
            console.error('Standard record creation failed:', error);
        }
    });
}

/**
 * Hook to update a standard record
 */
export function useUpdateRecord() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ recordData, projectId, recordId }) => {
            const [success, response] = await recordAPI.updateRecord(projectId, recordId, recordData);
            if (!success) {
                throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
            }
            return response;
        },
        onSuccess: (data, variables) => {
            // Update cache
            queryClient.setQueryData(QUERY_KEYS.record(variables.projectId, variables.recordId), data);
            
            // Invalidate related queries
            invalidateRelatedQueries(queryClient, variables.projectId, variables.recordId);
        }
    });
}

/**
 * Hook to delete a standard record
 */
export function useDeleteRecord() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ projectId, recordId }) => {
            const [success, response] = await recordAPI.deleteRecord(projectId, recordId);
            if (!success) {
                throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
            }
            return response;
        },
        onSuccess: (data, variables) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: QUERY_KEYS.record(variables.projectId, variables.recordId) });
            
            // Invalidate related queries
            invalidateRelatedQueries(queryClient, variables.projectId, variables.recordId);
        }
    });
}

// ========================================
// MEDIA RECORD OPERATIONS - FIXED
// ========================================

/**
 * Hook to fetch a media record
 */
export function useMediaRecord(projectId, recordId) {
    return useQuery({
        queryKey: QUERY_KEYS.mediaRecord(projectId, recordId),
        queryFn: async () => {
            const [success, response] = await recordAPI.getMediaRecord(projectId, recordId);
            if (!success) {
                throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
            }
            return response;
        },
        enabled: !!projectId && !!recordId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 2
    });
}

/**
 * FIXED: Hook to create a media record with file upload
 */
export function useCreateMediaRecord() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ file, projectId, itemId }) => {
            // FIXED: Use correct API method that exists in Record_API.js
            const [success, response] = await recordAPI.createMediaRecord(projectId, itemId, file);
            if (!success) {
                throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
            }
            return response;
        },
        onSuccess: (data, variables) => {
            // Invalidate relevant queries
            invalidateRelatedQueries(queryClient, variables.projectId, data.id, variables.itemId);
        },
        onError: (error) => {
            console.error('Media record creation failed:', error);
        }
    });
}

/**
 * FIXED: Hook to update a media record with required type parameter
 */
export function useUpdateMediaRecord() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ recordData, projectId, recordId, recordType }) => {
            // FIXED: Pass recordType as required by backend
            const [success, response] = await recordAPI.updateMediaRecord(projectId, recordId, recordData, recordType);
            if (!success) {
                throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
            }
            return response;
        },
        onSuccess: (data, variables) => {
            // Update cache
            queryClient.setQueryData(QUERY_KEYS.mediaRecord(variables.projectId, variables.recordId), data);
            
            // Invalidate related queries
            invalidateRelatedQueries(queryClient, variables.projectId, variables.recordId);
        }
    });
}

/**
 * FIXED: Hook to delete a media record with type parameter
 */
export function useDeleteMediaRecord() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ projectId, recordId, recordType }) => {
            // FIXED: Pass recordType as required by backend
            const [success, response] = await recordAPI.deleteMediaRecord(projectId, recordId, recordType);
            if (!success) {
                throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
            }
            return response;
        },
        onSuccess: (data, variables) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: QUERY_KEYS.mediaRecord(variables.projectId, variables.recordId) });
            
            // Invalidate related queries
            invalidateRelatedQueries(queryClient, variables.projectId, variables.recordId);
        }
    });
}

// ========================================
// FILE OPERATIONS
// ========================================

/**
 * Hook to upload multiple files to existing record
 */
export function useUploadFiles() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ files, projectId, recordId }) => {
            const [success, response] = await recordAPI.uploadMultipleFiles(projectId, recordId, files);
            if (!success) {
                throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
            }
            return response;
        },
        onSuccess: (data, variables) => {
            // Invalidate record data to show new files
            invalidateRelatedQueries(queryClient, variables.projectId, variables.recordId);
        }
    });
}

/**
 * Hook to delete a file from record
 */
export function useDeleteFile() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ projectId, fileId }) => {
            const [success, response] = await recordAPI.deleteFile(projectId, fileId);
            if (!success) {
                throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
            }
            return response;
        },
        onSuccess: (data, variables) => {
            // Invalidate queries to refresh record data
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.project(variables.projectId) });
        }
    });
}

// ========================================
// METADATA OPERATIONS
// ========================================

/**
 * Hook to fetch available metadata methods
 */
export function useMetadataMethods(projectId, recordId) {
    return useQuery({
        queryKey: QUERY_KEYS.metadataMethods(projectId, recordId),
        queryFn: async () => {
            const [success, response] = await recordAPI.getMetadataMethods(projectId, recordId);
            if (!success) {
                throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
            }
            return response;
        },
        enabled: !!projectId && !!recordId,
        staleTime: 15 * 60 * 1000, // 15 minutes - metadata methods don't change often
        gcTime: 30 * 60 * 1000, // 30 minutes
        retry: 2
    });
}

/**
 * Hook to add metadata to a record
 */
export function useAddMetadata() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ projectId, recordId, metadataClass, metadataData }) => {
            const [success, response] = await recordAPI.addMetadata(projectId, recordId, metadataData, metadataClass);
            if (!success) {
                throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
            }
            return response;
        },
        onSuccess: (data, variables) => {
            // Invalidate record and metadata queries
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.record(variables.projectId, variables.recordId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.metadata(variables.projectId, variables.recordId) });
        }
    });
}

/**
 * Hook to update metadata
 */
export function useUpdateMetadata() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ projectId, recordId, metadataClass, metadataId, metadataData }) => {
            const [success, response] = await recordAPI.updateMetadata(projectId, recordId, metadataData, metadataClass, metadataId);
            if (!success) {
                throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
            }
            return response;
        },
        onSuccess: (data, variables) => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.record(variables.projectId, variables.recordId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.metadata(variables.projectId, variables.recordId) });
        }
    });
}

/**
 * Hook to delete metadata
 */
export function useDeleteMetadata() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ projectId, recordId, metadataClass, metadataId }) => {
            const [success, response] = await recordAPI.deleteMetadata(projectId, recordId, metadataClass, metadataId);
            if (!success) {
                throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
            }
            return response;
        },
        onSuccess: (data, variables) => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.record(variables.projectId, variables.recordId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.metadata(variables.projectId, variables.recordId) });
        }
    });
}

// ========================================
// BATCH OPERATIONS
// ========================================

/**
 * Hook to delete multiple records at once
 */
export function useBatchDeleteRecords() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ recordIds, projectId, isMediaRecords = false }) => {
            const deletePromises = recordIds.map(recordId => {
                if (isMediaRecords) {
                    return recordAPI.deleteMediaRecord(projectId, recordId);
                } else {
                    return recordAPI.deleteRecord(projectId, recordId);
                }
            });
            
            const results = await Promise.allSettled(deletePromises);
            
            // Check for failures
            const failures = results.filter(result => result.status === 'rejected');
            if (failures.length > 0) {
                throw new Error(`Failed to delete ${failures.length} records`);
            }
            
            return results;
        },
        onSuccess: (data, variables) => {
            // Invalidate project queries to refresh all data
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.project(variables.projectId) });
        }
    });
}

// ========================================
// UTILITY HOOKS
// ========================================

/**
 * Hook to get cached record data without fetching
 */
export function useCachedRecord(projectId, recordId) {
    const queryClient = useQueryClient();
    
    return queryClient.getQueryData(QUERY_KEYS.record(projectId, recordId));
}

/**
 * Hook to manually invalidate record queries
 */
export function useInvalidateRecordQueries() {
    const queryClient = useQueryClient();
    
    return (projectId, recordId, itemId) => {
        invalidateRelatedQueries(queryClient, projectId, recordId, itemId);
    };
}

/**
 * Hook to check if any record operation is loading
 */
export function useRecordOperationsStatus() {
    const queryClient = useQueryClient();
    
    const isMutating = queryClient.isMutating({
        predicate: (mutation) => {
            return mutation.options.mutationKey?.includes('record') ||
                   mutation.options.mutationKey?.includes('media') ||
                   mutation.options.mutationKey?.includes('file');
        }
    });
    
    return {
        isLoading: isMutating > 0,
        operationsCount: isMutating
    };
}

/**
 * Hook for record validation before submission
 */
export function useRecordValidation() {
    return {
        validateRecord: (recordData, recordType) => {
            // Implementation would use validation utils
            return { isValid: true, errors: [] };
        }
    };
}

/**
 * Hook to prefetch record data
 */
export function usePrefetchRecord() {
    const queryClient = useQueryClient();
    
    return (projectId, recordId) => {
        queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.record(projectId, recordId),
            queryFn: async () => {
                const [success, response] = await recordAPI.getRecord(projectId, recordId);
                if (!success) {
                    throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
                }
                return response;
            },
            staleTime: 5 * 60 * 1000
        });
    };
}

// Export all hooks
export default {
    // Standard record operations
    useRecord,
    useCreateRecord,
    useUpdateRecord,
    useDeleteRecord,
    useBatchDeleteRecords,
    
    // Media record operations
    useMediaRecord,
    useCreateMediaRecord,
    useUpdateMediaRecord,
    useDeleteMediaRecord,
    
    // Metadata operations
    useMetadataMethods,
    useAddMetadata,
    useUpdateMetadata,
    useDeleteMetadata,
    
    // File operations
    useUploadFiles,
    useDeleteFile,
    
    // Utility hooks
    useRecordValidation,
    usePrefetchRecord,
    useCachedRecord,
    useInvalidateRecordQueries,
    useRecordOperationsStatus
};