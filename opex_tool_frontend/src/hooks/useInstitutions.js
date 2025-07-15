import { useMutation, useQueryClient } from '@tanstack/react-query';
import Institution_API from '../API/Institution_API';

const institutionAPI = Institution_API();

/**
 * Hook to add signers to an institution
 */
export function useAddInstitutionSigners() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, institutionId, signersData }) => {
      const [success, response] = await institutionAPI.addSigners(projectId, institutionId, signersData);
      if (!success) {
        throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
      }
      return response;
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
      const [success, response] = await institutionAPI.updateSignerField(projectId, institutionId, updatedData);
      if (!success) {
        throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
      }
      return response;
    },
    onSuccess: (data, variables) => {
      // Refresh the project data
      queryClient.invalidateQueries(['project', 'detail', variables.projectId]);
    },
  });
}