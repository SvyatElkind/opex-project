import { useMutation, useQueryClient } from '@tanstack/react-query';
import Item_API from '../API/Item_API';

const itemAPI = Item_API();

/**
 * Hook to create a new item
 */
export function useCreateItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ itemData, projectId, inventoryId }) => {
      const [success, response] = await itemAPI.createItem(itemData, projectId, inventoryId);
      if (!success) {
        throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
      }
      return response;
    },
    onSuccess: (data, variables) => {
      // Refresh the project data to include new item
      queryClient.invalidateQueries(['project', 'detail', variables.projectId]);
    },
  });
}

/**
 * Hook to delete an item
 */
export function useDeleteItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, itemId }) => {
      const [success, response] = await itemAPI.deleteItem(projectId, itemId);
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