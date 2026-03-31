import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * RoadmapContext - Manages multiple project routes/roadmaps per project
 * Stores routes as arrays per project in localStorage
 */
const RoadmapContext = createContext();

export const useRoadmap = () => {
  const context = useContext(RoadmapContext);
  if (!context) {
    throw new Error('useRoadmap must be used within RoadmapProvider');
  }
  return context;
};

const STORAGE_KEY = 'opex_project_roadmaps';

const ROUTE_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ARCHIVED: 'archived'
};

const generateRouteId = () => `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Migrate legacy single-roadmap format to array format
 */
const migrateData = (stored) => {
  const migrated = {};
  for (const [projectId, data] of Object.entries(stored)) {
    if (Array.isArray(data)) {
      migrated[projectId] = data;
    } else if (data && typeof data === 'object' && data.mode) {
      // Legacy single roadmap — wrap in array
      migrated[projectId] = [{
        ...data,
        id: data.id || generateRouteId(),
        status: data.completed ? ROUTE_STATUS.COMPLETED : ROUTE_STATUS.IN_PROGRESS,
        inventoryName: data.inventoryName || null
      }];
    } else {
      migrated[projectId] = [];
    }
  }
  return migrated;
};

export const RoadmapProvider = ({ children }) => {
  const [roadmaps, setRoadmaps] = useState({});

  // Load roadmaps from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRoadmaps(migrateData(parsed));
      }
    } catch (error) {
      // Ignore corrupted localStorage data
    }
  }, []);

  // Save roadmaps to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(roadmaps));
    } catch (error) {
      // Ignore storage write failures
    }
  }, [roadmaps]);

  /**
   * Get all routes for a project
   */
  const getRoadmaps = useCallback((projectId) => {
    if (!projectId) return [];
    return roadmaps[projectId] || [];
  }, [roadmaps]);

  /**
   * Get a single route by ID (backwards-compatible: returns first route if no routeId)
   */
  const getRoadmap = useCallback((projectId, routeId) => {
    if (!projectId) return null;
    const routes = roadmaps[projectId] || [];
    if (routeId) {
      return routes.find(r => r.id === routeId) || null;
    }
    return routes[0] || null;
  }, [roadmaps]);

  /**
   * Add a new route to a project
   */
  const addRoute = useCallback((projectId, routeData) => {
    if (!projectId) return;

    const newRoute = {
      ...routeData,
      id: generateRouteId(),
      status: ROUTE_STATUS.IN_PROGRESS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setRoadmaps(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), newRoute]
    }));

    return newRoute.id;
  }, []);

  /**
   * Update an existing route
   */
  const updateRoute = useCallback((projectId, routeId, data) => {
    if (!projectId || !routeId) return;

    setRoadmaps(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).map(route =>
        route.id === routeId
          ? { ...route, ...data, updatedAt: new Date().toISOString() }
          : route
      )
    }));
  }, []);

  /**
   * Delete a single route
   */
  const deleteRoute = useCallback((projectId, routeId) => {
    if (!projectId || !routeId) return;

    setRoadmaps(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).filter(r => r.id !== routeId)
    }));
  }, []);

  /**
   * Update route status
   */
  const updateRouteStatus = useCallback((projectId, routeId, status) => {
    if (!projectId || !routeId) return;

    setRoadmaps(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).map(route =>
        route.id === routeId
          ? {
            ...route,
            status,
            updatedAt: new Date().toISOString(),
            ...(status === ROUTE_STATUS.COMPLETED ? { completedAt: new Date().toISOString() } : {})
          }
          : route
      )
    }));
  }, []);

  /**
   * Check if project has any routes
   */
  const hasRoadmap = useCallback((projectId) => {
    return projectId && (roadmaps[projectId] || []).length > 0;
  }, [roadmaps]);

  /**
   * Legacy compatibility: set a single roadmap (replaces first or adds)
   */
  const setRoadmap = useCallback((projectId, roadmapData) => {
    if (!projectId) return;

    const routes = roadmaps[projectId] || [];
    if (routes.length > 0) {
      // Update first route
      setRoadmaps(prev => ({
        ...prev,
        [projectId]: prev[projectId].map((route, i) =>
          i === 0
            ? { ...route, ...roadmapData, updatedAt: new Date().toISOString() }
            : route
        )
      }));
    } else {
      addRoute(projectId, roadmapData);
    }
  }, [roadmaps, addRoute]);

  /**
   * Legacy compatibility: complete roadmap
   */
  const completeRoadmap = useCallback((projectId) => {
    const routes = roadmaps[projectId] || [];
    if (routes.length > 0) {
      updateRouteStatus(projectId, routes[0].id, ROUTE_STATUS.COMPLETED);
    }
  }, [roadmaps, updateRouteStatus]);

  /**
   * Legacy compatibility: delete all roadmaps for a project
   */
  const deleteRoadmap = useCallback((projectId) => {
    if (!projectId) return;
    setRoadmaps(prev => {
      const newRoadmaps = { ...prev };
      delete newRoadmaps[projectId];
      return newRoadmaps;
    });
  }, []);

  /**
   * Calculate progress based on project data and a single route
   */
  const calculateProgress = useCallback((projectData, route) => {
    if (!route || !projectData) {
      return {
        items: { current: 0, target: 0, percentage: 0 },
        records: { current: 0, target: 0, percentage: 0 },
        files: { current: 0, target: 0, percentage: 0 },
        overall: 0
      };
    }

    const inventories = projectData.institution?.fond?.inventories || [];
    const targetInventories = route.inventoryNumber
      ? inventories.filter(inv => inv.number === route.inventoryNumber)
      : inventories;

    let itemCount = 0;
    let recordCount = 0;
    let fileCount = 0;

    targetInventories.forEach(inventory => {
      itemCount += inventory.items?.length || 0;
      inventory.items?.forEach(item => {
        // Textual records
        recordCount += item.records?.length || 0;
        item.records?.forEach(record => {
          fileCount += record.files?.length || 0;
        });
        // Media records (photo/video/audio) — count as both record AND file
        ['photo_records', 'video_records', 'audio_records'].forEach(key => {
          const mediaCount = item[key]?.length || 0;
          recordCount += mediaCount;
          fileCount += mediaCount;
        });
      });
    });

    const itemTarget = route.goals?.totalItems || 0;
    const recordTarget = route.goals?.totalRecords || 0;
    const fileTarget = route.goals?.totalFiles || 0;

    const itemPercentage = itemTarget > 0 ? Math.min(100, Math.round((itemCount / itemTarget) * 100)) : 0;
    const recordPercentage = recordTarget > 0 ? Math.min(100, Math.round((recordCount / recordTarget) * 100)) : 0;
    const filePercentage = fileTarget > 0 ? Math.min(100, Math.round((fileCount / fileTarget) * 100)) : 0;

    const metricsWithTargets = [
      itemTarget > 0 ? itemPercentage : null,
      recordTarget > 0 ? recordPercentage : null,
      fileTarget > 0 ? filePercentage : null
    ].filter(p => p !== null);

    const overall = metricsWithTargets.length > 0
      ? Math.round(metricsWithTargets.reduce((sum, p) => sum + p, 0) / metricsWithTargets.length)
      : 0;

    return {
      items: { current: itemCount, target: itemTarget, percentage: itemPercentage },
      records: { current: recordCount, target: recordTarget, percentage: recordPercentage },
      files: { current: fileCount, target: fileTarget, percentage: filePercentage },
      overall
    };
  }, []);

  const value = {
    roadmaps,
    getRoadmaps,
    getRoadmap,
    addRoute,
    updateRoute,
    deleteRoute,
    updateRouteStatus,
    hasRoadmap,
    calculateProgress,
    // Legacy compatibility
    setRoadmap,
    completeRoadmap,
    deleteRoadmap,
    ROUTE_STATUS
  };

  return (
    <RoadmapContext.Provider value={value}>
      {children}
    </RoadmapContext.Provider>
  );
};

export { ROUTE_STATUS };
export default RoadmapContext;
