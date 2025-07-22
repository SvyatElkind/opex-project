import { useMutation, useQueryClient } from '@tanstack/react-query';
import Item_API from '../API/Item_API';

const itemAPI = Item_API();

/**
 * Hook to create a new item with optimistic updates
 * @param {boolean} shouldInvalidate - Whether to invalidate queries on success
 */
export function useCreateItem(shouldInvalidate = true) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ itemData, projectId, inventoryId }) => {
      const [success, response] = await itemAPI.createItem(itemData, projectId, inventoryId);
      if (!success) {
        throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
      }
      return response;
    },
    onMutate: async ({ itemData, projectId, inventoryId }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(['project', 'detail', projectId]);

      // Snapshot the previous value
      const previousProject = queryClient.getQueryData(['project', 'detail', projectId]);

      // Optimistically update the cache
      if (previousProject) {
        queryClient.setQueryData(['project', 'detail', projectId], (old) => {
          if (!old) return old;
          
          // Create the new item with a temporary ID
          const newItem = {
            id: `temp_${Date.now()}`, // Temporary ID
            number: itemData.number,
            series_code: itemData.series_code,
            title: itemData.title,
            start_date: itemData.start_date,
            end_date: itemData.end_date,
            restriction: itemData.restriction,
            language: itemData.language,
            notes: itemData.notes,
            annotation: itemData.annotation,
            sistematisation: itemData.sistematisation,
            security_level: itemData.security_level,
            copy: itemData.copy,
            archival_history: itemData.archival_history,
            ...itemData,
            isOptimistic: true // Flag to identify optimistic updates
          };

          // Find the inventory and add the new item
          const updatedProject = { ...old };
          if (updatedProject.institution?.fond?.inventories) {
            updatedProject.institution.fond.inventories = updatedProject.institution.fond.inventories.map(inv => {
              if (inv.id === inventoryId) {
                return {
                  ...inv,
                  items: [...(inv.items || []), newItem],
                  items_per_period: (inv.items_per_period || 0) + 1,
                  last_gv: Math.max(inv.last_gv || 0, itemData.number)
                };
              }
              return inv;
            });
          }

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
    onSuccess: (data, variables, context) => {
      // Update the optimistic item with real data from server
      queryClient.setQueryData(['project', 'detail', variables.projectId], (old) => {
        if (!old) return old;

        const updatedProject = { ...old };
        if (updatedProject.institution?.fond?.inventories) {
          updatedProject.institution.fond.inventories = updatedProject.institution.fond.inventories.map(inv => {
            if (inv.id === variables.inventoryId) {
              return {
                ...inv,
                items: inv.items?.map(item => {
                  // Replace the optimistic item with real server data
                  if (item.isOptimistic && item.number === variables.itemData.number) {
                    return {
                      ...data,
                      isOptimistic: false
                    };
                  }
                  return item;
                }) || []
              };
            }
            return inv;
          });
        }

        return updatedProject;
      });

      // Only invalidate queries if explicitly requested (when popup closes)
      if (shouldInvalidate) {
        queryClient.invalidateQueries(['project', 'detail', variables.projectId]);
      }
    },
  });
}

/**
 * Hook to delete an item with optimistic updates
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
    onMutate: async ({ projectId, itemId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(['project', 'detail', projectId]);

      // Snapshot the previous value
      const previousProject = queryClient.getQueryData(['project', 'detail', projectId]);

      // Optimistically remove the item
      if (previousProject) {
        queryClient.setQueryData(['project', 'detail', projectId], (old) => {
          if (!old) return old;
          
          const updatedProject = { ...old };
          if (updatedProject.institution?.fond?.inventories) {
            updatedProject.institution.fond.inventories = updatedProject.institution.fond.inventories.map(inv => ({
              ...inv,
              items: inv.items?.filter(item => item.id !== itemId) || [],
              items_per_period: Math.max(0, (inv.items_per_period || 0) - 1)
            }));
          }

          return updatedProject;
        });
      }

      return { previousProject };
    },
    onError: (err, variables, context) => {
      // Roll back on error
      if (context?.previousProject) {
        queryClient.setQueryData(['project', 'detail', variables.projectId], context.previousProject);
      }
    },
    onSuccess: (data, variables) => {
      // Refresh the project data after deletion (always invalidate for deletes)
      queryClient.invalidateQueries(['project', 'detail', variables.projectId]);
    },
  });
}

/**
 * Manual function to invalidate project queries
 * Call this when you actually want to refresh from server
 */
export function useInvalidateProject() {
  const queryClient = useQueryClient();
  
  return (projectId) => {
    queryClient.invalidateQueries(['project', 'detail', projectId]);
  };
}