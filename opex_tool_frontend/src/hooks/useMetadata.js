// src/hooks/useMetadata.js
// React Query hooks for metadata CRUD operations

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../Constants/Constnats';

// Base API URL
const API_BASE = '/api/v1/project';

// ========================================
// API FUNCTIONS
// ========================================

/**
 * Create metadata
 * POST /api/v1/project/<project_id>/record/<record_id>/additional_metadata/?class=<type>
 */
const createMetadata = async (projectId, recordId, metadataType, data) => {
    const response = await fetch(
        `${API_BASE}/${projectId}/record/${recordId}/additional_metadata/?class=${metadataType}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || 'Failed to create metadata');
    }

    return response.json();
};

/**
 * Update metadata
 * PUT /api/v1/project/<project_id>/record/<record_id>/additional_metadata/methods/?class=<type>&id=<id>
 */
const updateMetadata = async (projectId, recordId, metadataType, metadataId, data) => {
    const response = await fetch(
        `${API_BASE}/${projectId}/record/${recordId}/additional_metadata/methods/?class=${metadataType}&id=${metadataId}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || 'Failed to update metadata');
    }

    return response.json();
};

/**
 * Delete metadata
 * DELETE /api/v1/project/<project_id>/record/<record_id>/additional_metadata/methods/?class=<type>&id=<id>
 */
const deleteMetadata = async (projectId, recordId, metadataType, metadataId) => {
    const response = await fetch(
        `${API_BASE}/${projectId}/record/${recordId}/additional_metadata/methods/?class=${metadataType}&id=${metadataId}`,
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        }
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || 'Failed to delete metadata');
    }

    return response.json();
};

// ========================================
// REACT QUERY HOOKS
// ========================================

/**
 * Hook to create metadata
 */
export function useCreateMetadata() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ projectId, recordId, metadataType, data }) => {
            return await createMetadata(projectId, recordId, metadataType, data);
        },
        onSuccess: (data, variables) => {
            // Invalidate project data to refresh everything
            queryClient.invalidateQueries({ 
                queryKey: QUERY_KEYS.project(variables.projectId) 
            });
            
            // Invalidate record data
            queryClient.invalidateQueries({ 
                queryKey: QUERY_KEYS.record(variables.projectId, variables.recordId) 
            });
        },
        onError: (error) => {
            console.error('Create metadata error:', error);
        }
    });
}

/**
 * Hook to update metadata
 */
export function useUpdateMetadata() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ projectId, recordId, metadataType, metadataId, data }) => {
            return await updateMetadata(projectId, recordId, metadataType, metadataId, data);
        },
        onSuccess: (data, variables) => {
            // Invalidate project data to refresh everything
            queryClient.invalidateQueries({ 
                queryKey: QUERY_KEYS.project(variables.projectId) 
            });
            
            // Invalidate record data
            queryClient.invalidateQueries({ 
                queryKey: QUERY_KEYS.record(variables.projectId, variables.recordId) 
            });
        },
        onError: (error) => {
            console.error('Update metadata error:', error);
        }
    });
}

/**
 * Hook to delete metadata
 */
export function useDeleteMetadata() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ projectId, recordId, metadataType, metadataId }) => {
            return await deleteMetadata(projectId, recordId, metadataType, metadataId);
        },
        onSuccess: (data, variables) => {
            // Invalidate project data to refresh everything
            queryClient.invalidateQueries({ 
                queryKey: QUERY_KEYS.project(variables.projectId) 
            });
            
            // Invalidate record data
            queryClient.invalidateQueries({ 
                queryKey: QUERY_KEYS.record(variables.projectId, variables.recordId) 
            });
        },
        onError: (error) => {
            console.error('Delete metadata error:', error);
        }
    });
}