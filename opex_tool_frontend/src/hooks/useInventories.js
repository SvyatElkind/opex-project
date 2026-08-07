import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post, put, del } from '../services/apiClient';

const API_BASE_URL = '/project/';
export function useCreateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, fondId, inventoryData }) => {
      const { data } = await post(`${API_BASE_URL}${projectId}/inventory/?fond_id=${fondId}`, inventoryData);
      return data;
    },
    onSettled: (data, error, variables) => {
      // Refresh project data whether create succeeded or failed
      queryClient.invalidateQueries({ queryKey: ['project', 'detail', variables.projectId] });
    },
  });
}
/**
 * Hook to update existing inventory
 */
export function useUpdateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, inventoryId, inventoryData }) => {
      const { data } = await put(`${API_BASE_URL}${projectId}/inventory/${inventoryId}/`, inventoryData);
      return data;
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['project', 'detail', variables.projectId] });

      // Snapshot the previous value
      const previousProject = queryClient.getQueryData(['project', 'detail', variables.projectId]);

      // Optimistically update the inventory data
      if (previousProject) {
        queryClient.setQueryData(['project', 'detail', variables.projectId], (old) => {
          if (!old?.institution?.fond?.inventories) return old;

          const updatedProject = { ...old };
          updatedProject.institution.fond.inventories = updatedProject.institution.fond.inventories.map(inv => {
            if (inv.id === variables.inventoryId) {
              return {
                ...inv,
                ...variables.inventoryData,
                // Keep fields that shouldn't be changed
                id: inv.id,
                number: inv.number
              };
            }
            return inv;
          });

          return updatedProject;
        });
      }

      // Return a context object with the snapshotted value
      return { previousProject };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProject) {
        queryClient.setQueryData(['project', 'detail', variables.projectId], context.previousProject);
      }
    },
    onSettled: (data, error, variables) => {
      // Refresh project data to get latest state (whether update succeeded or not)
      queryClient.invalidateQueries({ queryKey: ['project', 'detail', variables.projectId] });
    },
  });
}


/**
 * Hook to delete inventory
 */
export function useDeleteInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, inventoryId }) => {
      const { data } = await del(`${API_BASE_URL}${projectId}/inventory/${inventoryId}/`);
      return data;
    },
    onSettled: (data, error, variables) => {
      // Refresh project data after deletion (or failed deletion)
      queryClient.invalidateQueries({ queryKey: ['project', 'detail', variables.projectId] });
    },
  });
}