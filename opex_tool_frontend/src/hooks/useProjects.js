import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del, apiRequest } from '../services/apiClient';

const API_BASE_URL = '/project/';

// Query key factory — MUST match QUERY_KEYS in Constants.js
// QUERY_KEYS.project(id) = ['project', 'detail', id]
const projectKeys = {
  all: ['project'],
  lists: () => ['projects'],
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
      try {
        const { data } = await get(API_BASE_URL);
        return data || [];
      } catch {
        // Uvicorn crashes on 204 No Content responses (h11 Content-Length bug).
        // When no projects exist, the backend returns 204 which uvicorn can't
        // send, causing a network error. Treat this as an empty list.
        return [];
      }
    },
    staleTime: 30000,
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
      const { data } = await get(`${API_BASE_URL}${projectId}/`);
      return data;
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
      const { data } = await post(API_BASE_URL, projectData);
      return data;
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
      const { data } = await put(`${API_BASE_URL}${projectId}/`, { name: newName });
      return data;
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
      const { data } = await del(`${API_BASE_URL}${projectId}/`);
      return data;
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
      // Read file as ArrayBuffer (no size limit — users may upload reports of any size)
      const binaryData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
      });

      const { data } = await apiRequest(`${API_BASE_URL}${projectId}/add_report/`, {
        method: 'POST',
        body: binaryData,
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${file.name}"`
        }
      });
      return data;
    },
    onSuccess: (data, variables) => {
      // Refetch the project to get updated data
      queryClient.invalidateQueries(projectKeys.detail(variables.projectId));
    },
  });
}

/**
 * Backend returns {success: [textMsg, savedPath]} — pull out the path.
 */
const extractExportPath = (data) => {
  const success = data?.success;
  if (Array.isArray(success) && success.length >= 2) return success[1];
  if (typeof success === 'string') return success;
  return null;
};

/**
 * Hook to export inventory list (Uzskaites saraksts).
 * Backend writes the XLSX into the project folder; the response carries the saved path.
 */
export function useExportInventoryList() {
  return useMutation({
    mutationFn: async (projectId) => {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      const { data } = await get(`${API_BASE_URL}${projectId}/export/inventories/`);
      return { success: true, path: extractExportPath(data) };
    },
  });
}

/**
 * Hook to export acceptance report (PN akts).
 * Backend writes the DOCX into the project folder; the response carries the saved path.
 */
export function useExportAcceptanceReport() {
  return useMutation({
    mutationFn: async ({ projectId, electronic = true }) => {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      const { data } = await get(`${API_BASE_URL}${projectId}/export/acceptance_report/?electronic=${electronic}`);
      return { success: true, path: extractExportPath(data) };
    },
  });
}

/**
 * Hook to generate OPEX package
 */
export function useExportOpex() {
  const pendingRef = { current: false };
  return useMutation({
    mutationFn: async ({ projectId, includeLongTerm = false }) => {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      if (pendingRef.current) {
        return { alreadyRunning: true };
      }
      pendingRef.current = true;
      try {
        await get(`${API_BASE_URL}${projectId}/export/opex_package/?long=${includeLongTerm}`);
        return { started: true };
      } catch (error) {
        throw error;
      } finally {
        pendingRef.current = false;
      }
    },
  });
}