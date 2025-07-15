import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Project_API from '../API/Project_API';

// Create API instances
const projectAPI = Project_API();

// Query key factory for better organization
const projectKeys = {
  all: ['projects'],
  lists: () => [...projectKeys.all, 'list'],
  list: (filters) => [...projectKeys.lists(), { filters }],
  details: () => [...projectKeys.all, 'detail'],
  detail: (id) => [...projectKeys.details(), id],
};

/**
 * Hook to fetch all projects
 */
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: async () => {
      const [success, response] = await projectAPI.connect_api();
      if (!success) {
        throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
      }
      return response || [];
    },
    staleTime: 30000, // 30 seconds of fresh data
  });
}

/**
 * Hook to fetch a specific project
 */
export function useProject(projectId) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: async () => {
      if (!projectId) return null;
      
      const [success, response] = await projectAPI.get_project(projectId);
      if (!success) {
        throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
      }
      return response;
    },
    enabled: !!projectId, // Only run query if projectId exists
    retry: (failureCount, error) => {
      // Don't retry for missing report errors - that's an expected state
      if (error?.message?.includes("Nav importēta VVAIS atskaite")) {
        return false;
      }
      return failureCount < 2; // Otherwise retry once
    },
  });
}

/**
 * Hook to create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (projectData) => {
      const [success, response] = await projectAPI.create_project(projectData);
      if (!success) {
        throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
      }
      return response;
    },
    onSuccess: () => {
      // Invalidate projects list to refetch after creation
      queryClient.invalidateQueries(projectKeys.lists());
    },
  });
}

/**
 * Hook to rename a project
 */
export function useRenameProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, newName }) => {
      const [success, response] = await projectAPI.rename_project(projectId, { name: newName });
      if (!success) {
        throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
      }
      return response;
    },
    onSuccess: (data, variables) => {
      // Update both the list and the specific project
      queryClient.invalidateQueries(projectKeys.lists());
      queryClient.invalidateQueries(projectKeys.detail(variables.projectId));
    },
  });
}

/**
 * Hook to delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (projectId) => {
      const [success, response] = await projectAPI.delete_project(projectId);
      if (!success) {
        throw new Error(typeof response === 'string' ? response : JSON.stringify(response));
      }
      return response;
    },
    onSuccess: (data, variables) => {
      // Remove from cache and refresh list
      queryClient.removeQueries(projectKeys.detail(variables));
      queryClient.invalidateQueries(projectKeys.lists());
    },
  });
}

/**
 * Hook to upload a report to a project
 */
export function useUploadReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, file }) => {
      try {
        const [success, result] = await projectAPI.uploadFileAsAttachment(projectId, file);
        if (!success) {
          throw new Error(typeof result === 'string' ? result : JSON.stringify(result));
        }
        return result;
      } catch (error) {
        throw new Error(error.message || "Failed to upload report");
      }
    },
    onSuccess: (data, variables) => {
      // Refetch the project to get updated data
      queryClient.invalidateQueries(projectKeys.detail(variables.projectId));
    },
  });
}