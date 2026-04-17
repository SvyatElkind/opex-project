// src/hooks/useMetadata.js
// React Query hooks for metadata CRUD operations

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../Constants/Constants';
import { post, put, del } from '../services/apiClient';

/**
 * Map plural metadata type keys to singular API class names
 */
const mapMetadataTypeToClass = (metadataType) => {
    const mapping = {
        'actions': 'action',
        'addressees': 'addressee',
        'visas': 'visa',
        'read_status': 'read_status'
    };
    return mapping[metadataType] || metadataType;
};

/**
 * Invalidate queries affected by metadata changes
 */
const invalidateMetadataQueries = (queryClient, projectId, recordId) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.project(projectId) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.record(projectId, recordId) });
};

/**
 * Hook to create metadata
 * POST /project/<projectId>/record/<recordId>/additional_metadata/?class=<type>
 */
export function useCreateMetadata() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ projectId, recordId, metadataType, data }) => {
            const apiClass = mapMetadataTypeToClass(metadataType);
            const { data: responseData } = await post(
                `/project/${projectId}/record/${recordId}/additional_metadata/?class=${apiClass}`,
                data
            );
            return responseData;
        },
        onSettled: (data, error, variables) => {
            invalidateMetadataQueries(queryClient, variables.projectId, variables.recordId);
        }
    });
}

/**
 * Hook to update metadata
 * PUT /project/<projectId>/record/<recordId>/additional_metadata/methods/?class=<type>&id=<id>
 */
export function useUpdateMetadata() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ projectId, recordId, metadataType, metadataId, data }) => {
            const apiClass = mapMetadataTypeToClass(metadataType);
            const { data: responseData } = await put(
                `/project/${projectId}/record/${recordId}/additional_metadata/methods/?class=${apiClass}&id=${metadataId}`,
                data
            );
            return responseData;
        },
        onSettled: (data, error, variables) => {
            invalidateMetadataQueries(queryClient, variables.projectId, variables.recordId);
        }
    });
}

/**
 * Hook to delete metadata
 * DELETE /project/<projectId>/record/<recordId>/additional_metadata/methods/?class=<type>&id=<id>
 */
export function useDeleteMetadata() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ projectId, recordId, metadataType, metadataId }) => {
            const apiClass = mapMetadataTypeToClass(metadataType);
            const { data: responseData } = await del(
                `/project/${projectId}/record/${recordId}/additional_metadata/methods/?class=${apiClass}&id=${metadataId}`
            );
            return responseData;
        },
        onSettled: (data, error, variables) => {
            invalidateMetadataQueries(queryClient, variables.projectId, variables.recordId);
        }
    });
}
