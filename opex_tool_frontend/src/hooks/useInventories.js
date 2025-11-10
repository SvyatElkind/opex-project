import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Inventory_API from '../API/Inventory_API';

const inventoryAPI = Inventory_API();

// Query keys for inventory operations
const inventoryKeys = {
  all: ['inventories'],
  lists: (projectId) => [...inventoryKeys.all, { projectId }],
  detail: (projectId, inventoryId) => [...inventoryKeys.all, { projectId, inventoryId }],
};

/**
 * Hook to create new inventory
 */
export function useCreateInventory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, fondId, inventoryData }) => {
      const [success, response] = await inventoryAPI.createInventory(projectId, fondId, inventoryData);
      if (!success) {
        throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
      }
      return response;
    },
    onSuccess: (data, variables) => {
      console.log(variables);
      // Refresh the project data to include new inventory
      queryClient.invalidateQueries(['project', 'detail', variables.projectId]);
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
      const [success, response] = await inventoryAPI.updateInventory(projectId, inventoryId, inventoryData);
      if (!success) {
        throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
      }
      return response;
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries(['project', 'detail', variables.projectId]);

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
    onSuccess: (data, variables) => {
      console.log('Updated inventory:', variables);
      // Refresh the project data to get the latest state from server
      queryClient.invalidateQueries(['project', 'detail', variables.projectId]);
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
      const [success, response] = await inventoryAPI.deleteInventory(projectId, inventoryId);
      if (!success) {
        throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
      }
      return response;
    },
    onSuccess: (data, variables) => {
      // Refresh the project data after deletion
      queryClient.invalidateQueries(['project', 'detail', variables.projectId]);
    },
  });
}