// src/hooks/useRecords.js
// Updated hooks for record operations with proper API integration

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import Record_API from '../API/Record_API';
import { QUERY_KEYS } from '../Constants/Constnats';

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
 * Hook to create a new record with optimistic updates
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
        onMutate: async ({ recordData, projectId, itemId }) => {
            // Cancel any outgoing refetches for optimistic update
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.project(projectId) });
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.records(projectId, itemId) });

            // Snapshot the previous value
            const previousProject = queryClient.getQueryData(QUERY_KEYS.project(projectId));
            const previousRecords = queryClient.getQueryData(QUERY_KEYS.records(projectId, itemId));

            // Optimistically update the cache
            if (previousProject) {
                queryClient.setQueryData(QUERY_KEYS.project(projectId), (old) => {
                    if (!old) return old;
                    
                    // Create the new record with a temporary ID
                    const newRecord = {
                        id: `temp_${Date.now()}`,
                        title: recordData.title,
                        date: recordData.date,
                        created_date: recordData.created_date,
                        sent_date: recordData.sent_date,
                        language: recordData.language,
                        reg_nr: recordData.reg_nr,
                        nomenclature_nr: recordData.nomenclature_nr,
                        access_restriction: recordData.access_restriction || 'open',
                        ...recordData,
                        isOptimistic: true,
                        files: [],
                        actions: [],
                        addressees: [],
                        read_status: []
                    };

                    // Find the item and add the new record
                    const updatedProject = { ...old };
                    if (updatedProject.institution?.fond?.inventories) {
                        updatedProject.institution.fond.inventories.forEach(inventory => {
                            inventory.items?.forEach(item => {
                                if (item.id === itemId) {
                                    item.records = [...(item.records || []), newRecord];
                                }
                            });
                        });
                    }
                    
                    return updatedProject;
                });
            }

            return { previousProject, previousRecords };
        },
        onError: (err, variables, context) => {
            // Rollback optimistic update on error
            if (context?.previousProject) {
                queryClient.setQueryData(QUERY_KEYS.project(variables.projectId), context.previousProject);
            }
            if (context?.previousRecords) {
                queryClient.setQueryData(QUERY_KEYS.records(variables.projectId, variables.itemId), context.previousRecords);
            }
        },
        onSuccess: (data, variables) => {
            // Invalidate and refetch
            invalidateRelatedQueries(queryClient, variables.projectId, data.id, variables.itemId);
        }
    });
}

/**
 * Hook to update a record
 */
export function useUpdateRecord() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ recordData, projectId, recordId }) => {
            const [success, response] = await recordAPI.updateRecord(recordData, projectId, recordId);
            if (!success) {
                throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
            }
            return response;
        },
        onSuccess: (data, variables) => {
            // Update the specific record in cache
            queryClient.setQueryData(QUERY_KEYS.record(variables.projectId, variables.recordId), data);
            
            // Invalidate related queries
            invalidateRelatedQueries(queryClient, variables.projectId, variables.recordId);
        }
    });
}

/**
 * Hook to delete a record
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

/**
 * Hook for batch delete operations
 */
export function useBatchDeleteRecords() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ projectId, recordIds }) => {
            const [success, response] = await recordAPI.batchDeleteRecords(projectId, recordIds);
            if (!success) {
                throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
            }
            return response;
        },
        onSuccess: (data, variables) => {
            // Remove deleted records from cache
            variables.recordIds.forEach(recordId => {
                queryClient.removeQueries({ queryKey: QUERY_KEYS.record(variables.projectId, recordId) });
            });
            
            // Invalidate related queries
            invalidateRelatedQueries(queryClient, variables.projectId);
        }
    });
}

// ========================================
// MEDIA RECORD OPERATIONS
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
 * Hook to create a media record with file upload
 */
export function useCreateMediaRecord() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ file, projectId, itemId }) => {
            const [success, response] = await recordAPI.uploadMediaFile(projectId, itemId, file);
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
 * Hook to update a media record
 */
export function useUpdateMediaRecord() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ recordData, projectId, recordId }) => {
            const [success, response] = await recordAPI.updateMediaRecord(projectId, recordId, recordData);
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
 * Hook to delete a media record
 */
export function useDeleteMediaRecord() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ projectId, recordId }) => {
            const [success, response] = await recordAPI.deleteMediaRecord(projectId, recordId);
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
            const [success, response] = await recordAPI.addMetadata(projectId, recordId, metadataClass, metadataData);
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
            const [success, response] = await recordAPI.updateMetadata(projectId, recordId, metadataClass, metadataId, metadataData);
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
            // Invalidate record and metadata queries
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.record(variables.projectId, variables.recordId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.metadata(variables.projectId, variables.recordId) });
        }
    });
}

// ========================================
// FILE OPERATIONS
// ========================================

/**
 * Hook to upload files to a record
 */
export function useUploadFiles() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ projectId, recordId, files, onProgress }) => {
            // If onProgress callback provided, we could implement progress tracking here
            const [success, response] = await recordAPI.uploadFiles(projectId, recordId, files);
            if (!success) {
                throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
            }
            return response;
        },
        onSuccess: (data, variables) => {
            // Invalidate record to update file list
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.record(variables.projectId, variables.recordId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.files(variables.projectId, variables.recordId) });
        }
    });
}

/**
 * Hook to delete a file
 */
export function useDeleteFile() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ projectId, fileId, recordId }) => {
            const [success, response] = await recordAPI.deleteFile(projectId, fileId);
            if (!success) {
                throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
            }
            return response;
        },
        onSuccess: (data, variables) => {
            // Invalidate record to update file list
            if (variables.recordId) {
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.record(variables.projectId, variables.recordId) });
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.files(variables.projectId, variables.recordId) });
            }
        }
    });
}

// ========================================
// UTILITY HOOKS
// ========================================

/**
 * Hook to validate record data before submission
 */
export function useRecordValidation() {
    return useMutation({
        mutationFn: async ({ recordData, recordType }) => {
            const errors = recordAPI.validateRecordData(recordData, recordType);
            if (errors) {
                throw new Error('Validation failed', { cause: errors });
            }
            return { valid: true };
        }
    });
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