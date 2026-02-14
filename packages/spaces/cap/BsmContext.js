/**
 * BsmContext - Business Service Management Studio Context
 *
 * Manages service artefacts, relationships, and state for the
 * BSM Studio workspace. Provides API-backed, project-scoped
 * data access with real-time state management.
 *
 * @module components/bsm/BsmContext
 *
 * @example
 * const { services, createArtefact, dependencyMap } = useBsm();
 */

import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { useDomains } from '../../DomainContext';
import {
  BSM_STAGES,
  BSM_WORKSPACE_MODULES,
  BSM_ALL_TYPES,
  BSM_TYPE_DEFS,
  BSM_RELATIONSHIP_TYPES,
  BSM_SERVICE_STATUS,
  BSM_SERVICE_CRITICALITY,
  BSM_CONSUMER_TYPE,
  BSM_DEFAULT_PROJECT_CONFIG,
  getTypeDefinition,
  isBsmType,
  getTypeColor,
  calculateServiceHealth,
} from '../../../lib/bsm-types';

// Re-export type definitions for components
export {
  BSM_STAGES,
  BSM_WORKSPACE_MODULES,
  BSM_ALL_TYPES,
  BSM_TYPE_DEFS,
  BSM_RELATIONSHIP_TYPES,
  BSM_SERVICE_STATUS,
  BSM_SERVICE_CRITICALITY,
  BSM_CONSUMER_TYPE,
  BSM_DEFAULT_PROJECT_CONFIG,
};

const BsmContext = createContext(null);

/**
 * BsmProvider - Context provider for Business Service Management Studio
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export function BsmProvider({ children }) {
  const { user, role } = useAuth();
  const { activeDomain } = useDomains();

  // Auth headers for API calls
  const authHeaders = useMemo(() => ({
    'x-user': user || '',
    'x-role': role || '',
  }), [user, role]);

  // Core state
  const [artefacts, setArtefacts] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [stats, setStats] = useState(null);
  const [dependencyMap, setDependencyMap] = useState({ nodes: [], edges: [] });

  // UI state
  const [selectedId, setSelectedId] = useState(null);
  const [activeView, setActiveView] = useState('list');
  const [activeStage, setActiveStage] = useState(null);
  const [activeModule, setActiveModule] = useState('overview');

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  /**
   * Fetch all artefacts for current domain
   */
  const fetchArtefacts = useCallback(async (filters = {}) => {
    if (!user || !activeDomain) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        domainId: activeDomain,
        ...filters,
      });

      const res = await fetch(`/api/bsm/artefacts?${params}`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('BSM artefacts API returned error status:', res.status);
        setArtefacts([]);
        return null;
      }

      const data = await res.json();
      setArtefacts(data.artefacts || []);
      return data;
    } catch (err) {
      console.error('Error fetching BSM artefacts:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, activeDomain, authHeaders]);

  /**
   * Fetch dependency map
   */
  const fetchDependencyMap = useCallback(async () => {
    if (!user || !activeDomain) return;

    try {
      const res = await fetch(`/api/bsm/dependency-map?domainId=${activeDomain}`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('BSM dependency map API returned error status:', res.status);
        setDependencyMap({ nodes: [], edges: [] });
        return null;
      }

      const data = await res.json();
      setDependencyMap(data);
      return data;
    } catch (err) {
      console.error('Error fetching dependency map:', err);
      setDependencyMap({ nodes: [], edges: [] });
      return null;
    }
  }, [user, activeDomain, authHeaders]);

  /**
   * Fetch stats for current domain
   */
  const fetchStats = useCallback(async () => {
    if (!user || !activeDomain) return;

    try {
      const res = await fetch(`/api/bsm/stats?domainId=${activeDomain}`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('BSM stats API returned error status:', res.status);
        return null;
      }

      const data = await res.json();
      setStats(data);
      return data;
    } catch (err) {
      console.error('Error fetching BSM stats:', err);
      return null;
    }
  }, [user, activeDomain, authHeaders]);

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async () => {
    if (!user) return;
    await Promise.all([
      fetchArtefacts(),
      fetchDependencyMap(),
      fetchStats(),
    ]);
  }, [user, fetchArtefacts, fetchDependencyMap, fetchStats]);

  // Load data when domain changes
  useEffect(() => {
    if (user && activeDomain) {
      refreshData();
    } else {
      setArtefacts([]);
      setDependencyMap({ nodes: [], edges: [] });
      setStats(null);
    }
  }, [user, activeDomain, refreshData]);

  // ============================================================================
  // ARTEFACT CRUD OPERATIONS
  // ============================================================================

  /**
   * Create a new BSM artefact
   */
  const createArtefact = useCallback(async (type, data = {}) => {
    if (!activeDomain) {
      setError('No domain selected');
      return null;
    }

    if (!isBsmType(type)) {
      setError(`Invalid BSM type: ${type}`);
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/bsm/artefacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          domainId: activeDomain,
          artefactType: type,
          name: data.name || `New ${getTypeDefinition(type)?.name || 'Item'}`,
          description: data.description || '',
          ...data,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create artefact');
      }

      const newArtefact = await res.json();

      // Update local state
      setArtefacts(prev => [newArtefact, ...prev]);
      setSelectedId(newArtefact.id);

      // Refresh dependency map and stats
      fetchDependencyMap();
      fetchStats();

      return newArtefact;
    } catch (err) {
      console.error('Error creating BSM artefact:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [activeDomain, fetchDependencyMap, fetchStats, authHeaders]);

  /**
   * Update an existing artefact
   */
  const updateArtefact = useCallback(async (id, updates) => {
    if (!id) return null;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/bsm/artefacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update artefact');
      }

      const updated = await res.json();

      // Update local state
      setArtefacts(prev => prev.map(a => a.id === id ? updated : a));

      // Refresh dependency map if service-related
      if (updates.source_service || updates.target_service) {
        fetchDependencyMap();
      }

      // Refresh stats if status/criticality changed
      if (updates.status || updates.criticality) {
        fetchStats();
      }

      return updated;
    } catch (err) {
      console.error('Error updating BSM artefact:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [fetchDependencyMap, fetchStats, authHeaders]);

  /**
   * Delete an artefact
   */
  const deleteArtefact = useCallback(async (id) => {
    if (!id) return false;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/bsm/artefacts/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete artefact');
      }

      // Update local state
      setArtefacts(prev => prev.filter(a => a.id !== id));

      if (selectedId === id) {
        setSelectedId(null);
      }

      // Refresh dependency map and stats
      fetchDependencyMap();
      fetchStats();

      return true;
    } catch (err) {
      console.error('Error deleting BSM artefact:', err);
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [selectedId, fetchDependencyMap, fetchStats, authHeaders]);

  /**
   * Get single artefact by ID (from local state)
   */
  const getArtefact = useCallback((id) => {
    return artefacts.find(a => a.id === id) || null;
  }, [artefacts]);

  /**
   * Get artefact with full details from API
   */
  const getArtefactDetails = useCallback(async (id) => {
    if (!id) return null;

    try {
      const res = await fetch(`/api/bsm/artefacts/${id}`, { headers: authHeaders });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch artefact');
      }
      return await res.json();
    } catch (err) {
      console.error('Error fetching artefact details:', err);
      return null;
    }
  }, [authHeaders]);

  // ============================================================================
  // FILTERING & GROUPING
  // ============================================================================

  /**
   * Get artefacts by type
   */
  const getArtefactsByType = useCallback((type) => {
    return artefacts.filter(a => a.artefact_type === type);
  }, [artefacts]);

  /**
   * Get artefacts by stage
   */
  const getArtefactsByStage = useCallback((stageId) => {
    const stage = BSM_STAGES[stageId];
    if (!stage) return [];
    return artefacts.filter(a => stage.types.includes(a.artefact_type));
  }, [artefacts]);

  /**
   * Get artefacts by module
   */
  const getArtefactsByModule = useCallback((moduleId) => {
    const module = BSM_WORKSPACE_MODULES[moduleId];
    if (!module) return [];
    return artefacts.filter(a => module.types.includes(a.artefact_type));
  }, [artefacts]);

  /**
   * Get services only
   */
  const services = useMemo(() => {
    return artefacts.filter(a => a.artefact_type === 'bsm_service');
  }, [artefacts]);

  /**
   * Get service categories
   */
  const serviceCategories = useMemo(() => {
    return artefacts.filter(a => a.artefact_type === 'bsm_service_category');
  }, [artefacts]);

  /**
   * Get consumers
   */
  const consumers = useMemo(() => {
    return artefacts.filter(a => a.artefact_type === 'bsm_consumer');
  }, [artefacts]);

  /**
   * Get service levels
   */
  const serviceLevels = useMemo(() => {
    return artefacts.filter(a => a.artefact_type === 'bsm_service_level');
  }, [artefacts]);

  /**
   * Get SLAs
   */
  const slas = useMemo(() => {
    return artefacts.filter(a => a.artefact_type === 'bsm_sla');
  }, [artefacts]);

  /**
   * Get dependencies
   */
  const dependencies = useMemo(() => {
    return artefacts.filter(a => a.artefact_type === 'bsm_dependency');
  }, [artefacts]);

  /**
   * Get integrations
   */
  const integrations = useMemo(() => {
    return artefacts.filter(a => a.artefact_type === 'bsm_integration');
  }, [artefacts]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value = useMemo(() => ({
    // Data
    artefacts,
    services,
    serviceCategories,
    consumers,
    serviceLevels,
    slas,
    dependencies,
    integrations,
    dependencyMap,
    stats,

    // UI state
    selectedId,
    setSelectedId,
    activeView,
    setActiveView,
    activeStage,
    setActiveStage,
    activeModule,
    setActiveModule,

    // Loading states
    loading,
    error,
    saving,
    setError,

    // Data operations
    refreshData,
    fetchArtefacts,
    fetchDependencyMap,
    fetchStats,

    // CRUD
    createArtefact,
    updateArtefact,
    deleteArtefact,
    getArtefact,
    getArtefactDetails,

    // Filtering
    getArtefactsByType,
    getArtefactsByStage,
    getArtefactsByModule,

    // Type utilities
    getTypeDefinition,
    isBsmType,
    getTypeColor,
    calculateServiceHealth,

    // Constants
    BSM_STAGES,
    BSM_WORKSPACE_MODULES,
    BSM_ALL_TYPES,
    BSM_TYPE_DEFS,
    BSM_RELATIONSHIP_TYPES,
    BSM_SERVICE_STATUS,
    BSM_SERVICE_CRITICALITY,
    BSM_CONSUMER_TYPE,
  }), [
    artefacts,
    services,
    serviceCategories,
    consumers,
    serviceLevels,
    slas,
    dependencies,
    integrations,
    dependencyMap,
    stats,
    selectedId,
    activeView,
    activeStage,
    activeModule,
    loading,
    error,
    saving,
    refreshData,
    fetchArtefacts,
    fetchDependencyMap,
    fetchStats,
    createArtefact,
    updateArtefact,
    deleteArtefact,
    getArtefact,
    getArtefactDetails,
    getArtefactsByType,
    getArtefactsByStage,
    getArtefactsByModule,
  ]);

  return (
    <BsmContext.Provider value={value}>
      {children}
    </BsmContext.Provider>
  );
}

/**
 * useBsm - Hook to access Business Service Management Studio context
 *
 * @returns {BsmContextValue}
 * @throws {Error} If used outside BsmProvider
 */
export function useBsm() {
  const ctx = useContext(BsmContext);
  if (!ctx) throw new Error('useBsm must be used inside BsmProvider');
  return ctx;
}
