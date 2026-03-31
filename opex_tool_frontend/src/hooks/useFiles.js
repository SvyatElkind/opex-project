import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../Constants/Constants';
import { postFormData, del } from '../services/apiClient';

/**
 * Upload multiple files to a textual record
 * POST /project/<projectId>/record/<recordId>/multiple_files/
 */
export function useUploadFiles() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ projectId, recordId, files }) => {
            const formData = new FormData();
            files.forEach((file) => {
                formData.append('files', file);
            });

            const { data } = await postFormData(
                `/project/${projectId}/record/${recordId}/multiple_files/`,
                formData
            );
            return data;
        },
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.project(variables.projectId)
            });
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.record(variables.projectId, variables.recordId)
            });
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.files(variables.projectId, variables.recordId)
            });
        },
    });
}

/**
 * Delete a file
 * DELETE /project/<projectId>/file/<fileId>/
 */
export function useDeleteFile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ projectId, fileId, recordId }) => {
            const { data } = await del(`/project/${projectId}/file/${fileId}/`);
            return data;
        },
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.project(variables.projectId)
            });
            if (variables.recordId) {
                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.record(variables.projectId, variables.recordId)
                });
            }
        },
    });
}
