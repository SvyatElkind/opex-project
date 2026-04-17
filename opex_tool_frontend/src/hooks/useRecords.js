// src/hooks/useRecords.js
// Migrated to use apiClient for standardized error handling

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { get, post, put, del, apiRequest, ApiError } from '../services/apiClient';
import { QUERY_KEYS } from '../Constants/Constants';

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
        onSettled: (data, error, variables) => {
            if (data?.id) {
                invalidateRelatedQueries(queryClient, variables.projectId, data.id, variables.itemId);
            } else {
                invalidateRelatedQueries(queryClient, variables.projectId, null, variables.itemId);
            }
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
        },
        onSettled: (data, error, variables) => {
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
        },
        onSettled: (data, error, variables) => {
            invalidateRelatedQueries(queryClient, variables.projectId, variables.recordId);
        }
    });
}

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
                    headers: {}, // Let browser set Content-Type with boundary for FormData
                }
            );
            return data;
        },
        retry: false,
        onSettled: (data, error, variables) => {
            if (data?.id) {
                invalidateRelatedQueries(queryClient, variables.projectId, data.id, variables.itemId);
            } else {
                invalidateRelatedQueries(queryClient, variables.projectId, null, variables.itemId);
            }
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
        },
        onSettled: (data, error, variables) => {
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
        },
        onSettled: (data, error, variables) => {
            invalidateRelatedQueries(queryClient, variables.projectId, variables.recordId);
        }
    });
}

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

// Metadata hooks removed — use useCreateMetadata/useUpdateMetadata/useDeleteMetadata from hooks/useMetadata.js

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

            const successes = results.filter(r => r.status === 'fulfilled');
            const failures = results.filter(r => r.status === 'rejected');

            // Return both so caller knows which succeeded/failed
            const result = { successes: successes.length, failures: failures.length, total: recordIds.length };

            if (failures.length > 0 && successes.length === 0) {
                // All failed
                throw new ApiError(500, { error: `Neizdevās dzēst ${failures.length} ierakstus` });
            }

            if (failures.length > 0) {
                // Partial failure — return result but mark as partial
                result.partial = true;
                result.error = `${successes.length}/${recordIds.length} ieraksti dzēsti. ${failures.length} neizdevās.`;
            }

            return result;
        },
        onSettled: (data, error, variables) => {
            // Always invalidate — even on partial failure, some records were deleted
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.project(variables.projectId) });
        }
    });
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

export default {
    useRecord,
    useCreateRecord,
    useUpdateRecord,
    useDeleteRecord,
    useBatchDeleteRecords,
    useMediaRecord,
    useCreateMediaRecord,
    useUpdateMediaRecord,
    useDeleteMediaRecord,
    useMetadataMethods,
    useRecordValidation,
    usePrefetchRecord,
    useCachedRecord,
    useInvalidateRecordQueries
};
