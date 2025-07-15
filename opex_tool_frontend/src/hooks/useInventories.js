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
      // Refresh the project data to include new inventory
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