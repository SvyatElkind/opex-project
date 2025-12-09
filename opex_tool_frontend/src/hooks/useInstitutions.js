import { useMutation, useQueryClient } from '@tanstack/react-query';
import { put } from '../services/apiClient';

const API_BASE_URL = '/project/';

/**
 * Hook to add signers to an institution
 */
export function useAddInstitutionSigners() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, institutionId, signersData }) => {
      const { data } = await put(`${API_BASE_URL}${projectId}/institution/${institutionId}/`, signersData);
      return data;
    },
    onSuccess: (data, variables) => {
      // Refresh the project data
      queryClient.invalidateQueries(['project', 'detail', variables.projectId]);
    },
  });
}

/**
 * Hook to update institution signer fields
 */
export function useUpdateInstitutionSignerField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, institutionId, updatedData }) => {
      const updateData = {
        creator: updatedData.creator,
        creator_position: updatedData.creator_position,
        signer: updatedData.signer,
        signer_position: updatedData.signer_position
      };
      const { data } = await put(`${API_BASE_URL}${projectId}/institution/${institutionId}/`, updateData);
      return data;
    },
    onSuccess: (data, variables) => {
      // Refresh the project data
      queryClient.invalidateQueries(['project', 'detail', variables.projectId]);
    },
  });
}