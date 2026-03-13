// src/hooks/useRecords.js
// Migrated to use apiClient for standardized error handling

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { get, post, put, del, apiRequest, ApiError } from '../services/apiClient';
import { QUERY_KEYS } from '../Constants/Constants';

// ========================================
// API ENDPOINTS
// ========================================

const API_ENDPOINTS = {
    // Standard record operations
    record: (projectId, recordId = null) => {
        const base = `/project/${projectId}/record/`;
        return recordId ? `${base}${recordId}/` : base;
    },

    // Media record operations
    mediaRecord: (projectId, recordId = null, recordType = null) => {
        const base = `/project/${projectId}/media_record/`;
        const url = recordId ? `${base}${recordId}/` : base;
        return recordType ? `${url}?type=${recordType}` : url;
    },

    // File operations
    file: (projectId, fileId) => {
        return `/project/${projectId}/file/${fileId}/`;
    },

    // Multiple file uploads (textual records only)
    multipleFiles: (projectId, recordId) => {
        return `/project/${projectId}/record/${recordId}/multiple_files/`;
    },

    // Metadata operations
    additionalMetadata: (projectId, recordId, metadataClass) => {
        return `/project/${projectId}/record/${recordId}/additional_metadata/?class=${metadataClass}`;
    },

    metadataMethods: (projectId, recordId, metadataClass, metadataId) => {
        return `/project/${projectId}/record/${recordId}/additional_metadata/methods/?class=${metadataClass}&id=${metadataId}`;
    }
};

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

/**
 * Validate media record metadata based on type
 */
const validateMediaRecordData = (recordData, recordType) => {
    const errors = [];

    switch (recordType) {
        case 'Foto':
            if (recordData.color && !['color', 'grayscale'].includes(recordData.color)) {
                errors.push('Color must be "color" or "grayscale"');
            }
            if (recordData.horizontal_resolution && !Number.isInteger(recordData.horizontal_resolution)) {
                errors.push('Horizontal resolution must be an integer');
            }
            if (recordData.vertical_resolution && !Number.isInteger(recordData.vertical_resolution)) {
                errors.push('Vertical resolution must be an integer');
            }
            break;

        case 'Video':
            if (recordData.color && !['color', 'grayscale'].includes(recordData.color)) {
                errors.push('Color must be "color" or "grayscale"');
            }
            if (recordData.duration && !/^\d{2}:\d{2}:\d{2}$/.test(recordData.duration)) {
                errors.push('Duration must be in HH:MM:SS format');
            }
            if (recordData.horizontal_resolution && !Number.isInteger(recordData.horizontal_resolution)) {
                errors.push('Horizontal resolution must be an integer');
            }
            if (recordData.vertical_resolution && !Number.isInteger(recordData.vertical_resolution)) {
                errors.push('Vertical resolution must be an integer');
            }
            break;

        case 'Audio':
            if (recordData.duration && !/^\d{2}:\d{2}:\d{2}$/.test(recordData.duration)) {
                errors.push('Duration must be in HH:MM:SS format');
            }
            break;

        default:
            errors.push(`Unknown record type: ${recordType}`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
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
            const { data } = await get(API_ENDPOINTS.record(projectId, recordId));
            return data;
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
            const { data } = await post(
                `${API_ENDPOINTS.record(projectId)}?item_id=${itemId}`,
                recordData
            );
            return data;
        },
        onSuccess: (data, variables) => {
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
            const { data } = await put(
                API_ENDPOINTS.record(projectId, recordId),
                recordData
            );
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.setQueryData(QUERY_KEYS.record(variables.projectId, variables.recordId), data);
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
            const { data } = await del(API_ENDPOINTS.record(projectId, recordId));
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.removeQueries({ queryKey: QUERY_KEYS.record(variables.projectId, variables.recordId) });
            invalidateRelatedQueries(queryClient, variables.projectId, variables.recordId);
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
            const { data } = await get(API_ENDPOINTS.mediaRecord(projectId, recordId));
            return data;
        },
        enabled: !!projectId && !!recordId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 2
    });
}

/**
 * Hook to create a media record with file upload
 * Supports optional metadata to be sent along with the file (for manual entry when file type is not recognized)
 */
export function useCreateMediaRecord() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ file, projectId, itemId, metadata = null, skipFileValidation = false }) => {
            if (!file) {
                throw new ApiError(400, { error: 'No file provided' });
            }

            const singleFile = Array.isArray(file) ? file[0] : file;
            const formData = new FormData();
            formData.append('files', singleFile);

            // If metadata is provided, append it to the form data
            if (metadata) {
                if (metadata.color) formData.append('color', metadata.color);
                if (metadata.horizontal_resolution) formData.append('horizontal_resolution', metadata.horizontal_resolution);
                if (metadata.vertical_resolution) formData.append('vertical_resolution', metadata.vertical_resolution);
                if (metadata.duration) formData.append('duration', metadata.duration);
            }

            // Flag to skip file type validation (for manual metadata entry)
            if (skipFileValidation) {
                formData.append('skip_file_validation', 'true');
            }

            const { data } = await apiRequest(
                `${API_ENDPOINTS.mediaRecord(projectId)}?item_id=${itemId}`,
                {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Content-Type': undefined  // Remove Content-Type to let browser set it for FormData
                    },
                }
            );
            return data;
        },
        retry: false, // Don't retry on failure - we handle 400 errors manually
        onSuccess: (data, variables) => {
            invalidateRelatedQueries(queryClient, variables.projectId, data.id, variables.itemId);
        },
        onError: (error) => {
            console.error('Media record creation failed:', error);
        }
    });
}

/**
 * Hook to update a media record with required type parameter
 */
export function useUpdateMediaRecord() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ recordData, projectId, recordId, recordType }) => {
            if (!recordType) {
                throw new ApiError(400, { error: 'Record type is required (Foto, Video, or Audio)' });
            }

            const validation = validateMediaRecordData(recordData, recordType);
            if (!validation.isValid) {
                throw new ApiError(400, { error: validation.errors.join(', ') });
            }

            const { data } = await put(
                API_ENDPOINTS.mediaRecord(projectId, recordId, recordType),
                recordData
            );
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.setQueryData(QUERY_KEYS.mediaRecord(variables.projectId, variables.recordId), data);
            invalidateRelatedQueries(queryClient, variables.projectId, variables.recordId);
        }
    });
}

/**
 * Hook to delete a media record with type parameter
 */
export function useDeleteMediaRecord() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ projectId, recordId, recordType }) => {
            if (!recordType) {
                throw new ApiError(400, { error: 'Record type is required' });
            }

            const { data } = await del(API_ENDPOINTS.mediaRecord(projectId, recordId, recordType));
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.removeQueries({ queryKey: QUERY_KEYS.mediaRecord(variables.projectId, variables.recordId) });
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
            if (!files || files.length === 0) {
                throw new ApiError(400, { error: 'No files provided' });
            }

            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });

            const { data } = await apiRequest(
                API_ENDPOINTS.multipleFiles(projectId, recordId),
                {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Content-Type': undefined  // Remove Content-Type to let browser set it for FormData
                    },
                }
            );
            return data;
        },
        onSuccess: (data, variables) => {
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
            const { data } = await del(API_ENDPOINTS.file(projectId, fileId));
            return data;
        },
        onSuccess: (data, variables) => {
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
            const { data } = await get(API_ENDPOINTS.additionalMetadata(projectId, recordId, 'methods'));
            return data;
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
            if (!metadataClass) {
                throw new ApiError(400, { error: 'Metadata class is required' });
            }

            const { data } = await post(
                API_ENDPOINTS.additionalMetadata(projectId, recordId, metadataClass),
                metadataData
            );
            return data;
        },
        onSuccess: (data, variables) => {
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
            if (!metadataClass || !metadataId) {
                throw new ApiError(400, { error: 'Metadata class and ID are required' });
            }

            const { data } = await put(
                API_ENDPOINTS.metadataMethods(projectId, recordId, metadataClass, metadataId),
                metadataData
            );
            return data;
        },
        onSuccess: (data, variables) => {
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
            if (!metadataClass || !metadataId) {
                throw new ApiError(400, { error: 'Metadata class and ID are required' });
            }

            const { data } = await del(
                API_ENDPOINTS.metadataMethods(projectId, recordId, metadataClass, metadataId)
            );
            return data;
        },
        onSuccess: (data, variables) => {
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
        mutationFn: async ({ recordIds, projectId, isMediaRecords = false, recordType = null }) => {
            const deletePromises = recordIds.map(recordId => {
                if (isMediaRecords) {
                    return del(API_ENDPOINTS.mediaRecord(projectId, recordId, recordType));
                } else {
                    return del(API_ENDPOINTS.record(projectId, recordId));
                }
            });

            const results = await Promise.allSettled(deletePromises);

            const failures = results.filter(result => result.status === 'rejected');
            if (failures.length > 0) {
                throw new ApiError(500, { error: `Failed to delete ${failures.length} records` });
            }

            return results;
        },
        onSuccess: (data, variables) => {
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
            if (recordType) {
                return validateMediaRecordData(recordData, recordType);
            }
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
                const { data } = await get(API_ENDPOINTS.record(projectId, recordId));
                return data;
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
