// src/hooks/useFiles.js
// React Query hooks for file upload and delete operations

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../Constants/Constants';

// Base API URL
const API_BASE = '/api/v1/project';

// ========================================
// API FUNCTIONS
// ========================================

/**
 * Upload multiple files
 * POST /api/v1/project/<project_id>/record/<record_id>/multiple_files/
 */
const uploadFiles = async (projectId, recordId, files, onProgress) => {
    const formData = new FormData();
    
    // Append all files to form data
    files.forEach((file, index) => {
        formData.append('files', file);
    });

    const response = await fetch(
        `${API_BASE}/${projectId}/record/${recordId}/multiple_files/`,
        {
            method: 'POST',
            body: formData,
            // Note: Don't set Content-Type header - browser will set it with boundary
        }
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || 'Failed to upload files');
    }

    return response.json();
};

/**
 * Delete file
 * DELETE /api/v1/project/<project_id>/file/<file_id>/
 */
const deleteFile = async (projectId, fileId) => {
    const response = await fetch(
        `${API_BASE}/${projectId}/file/${fileId}/`,
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        }
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || 'Failed to delete file');
    }

    return response.json();
};

// ========================================
// REACT QUERY HOOKS
// ========================================

/**
 * Hook to upload files
 */
export function useUploadFiles() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ projectId, recordId, files, onProgress }) => {
            return await uploadFiles(projectId, recordId, files, onProgress);
        },
        onSuccess: (data, variables) => {
            console.log('Files uploaded successfully:', data);
            
            // Invalidate project data to refresh everything
            queryClient.invalidateQueries({ 
                queryKey: QUERY_KEYS.project(variables.projectId) 
            });
            
            // Invalidate record data to show new files
            queryClient.invalidateQueries({ 
                queryKey: QUERY_KEYS.record(variables.projectId, variables.recordId) 
            });
            
            // Invalidate files query if you have one
            queryClient.invalidateQueries({ 
                queryKey: QUERY_KEYS.files(variables.projectId, variables.recordId) 
            });
        },
        onError: (error) => {
            console.error('Upload files error:', error);
        }
    });
}

/**
 * Hook to delete file
 */
export function useDeleteFile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ projectId, fileId }) => {
            return await deleteFile(projectId, fileId);
        },
        onSuccess: (data, variables) => {
            console.log('File deleted successfully:', data);
            
            // Invalidate project data to refresh everything
            queryClient.invalidateQueries({ 
                queryKey: QUERY_KEYS.project(variables.projectId) 
            });
            
            // Invalidate all file-related queries
            queryClient.invalidateQueries({ 
                queryKey: ['files'] 
            });
        },
        onError: (error) => {
            console.error('Delete file error:', error);
        }
    });
}