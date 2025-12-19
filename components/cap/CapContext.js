/**
 * CapContext - Capability and Operating Model Studio Context
 *
 * Manages capability artefacts, relationships, and state for the
 * Capability Studio workspace. Provides API-backed, project-scoped
 * data access with real-time state management.
 *
 * @module components/cap/CapContext
 *
 * @example
 * const { capabilities, createArtefact, buildTree } = useCap();
 *
 * @typedef {Object} CapContextValue
 * @property {Array} artefacts - All capability artefacts
 * @property {Array} capabilities - Capability artefacts only
 * @property {Array} relationships - Artefact relationships
 * @property {Object} stats - Statistics and health metrics
 * @property {Function} createArtefact - Create new artefact
 * @property {Function} updateArtefact - Update existing artefact
 * @property {Function} deleteArtefact - Delete artefact
 */

import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useDomains } from '../DomainContext';
import {
  CAP_STAGES,
  CAP_WORKSPACE_MODULES,
  CAP_ALL_TYPES,
  CAP_TYPE_DEFS,
  CAP_RELATIONSHIP_TYPES,
  CAP_STATUS_OPTIONS,
  CAP_MATURITY_LEVELS,
  CAP_STRATEGIC_IMPORTANCE,
  CAP_INVESTMENT_LEVEL,
  CAP_DEFAULT_PROJECT_CONFIG,
  getTypeDefinition,
  isCapType,
  getTypeColor,
  calculateCapabilityCompleteness,
  calculateMaturitySummary,
} from '../../lib/cap-types';

// Re-export type definitions for components
export {
  CAP_STAGES,
  CAP_WORKSPACE_MODULES,
  CAP_ALL_TYPES,
  CAP_TYPE_DEFS,
  CAP_RELATIONSHIP_TYPES,
  CAP_STATUS_OPTIONS,
  CAP_MATURITY_LEVELS,
  CAP_STRATEGIC_IMPORTANCE,
  CAP_INVESTMENT_LEVEL,
  CAP_DEFAULT_PROJECT_CONFIG,
};

const CapContext = createContext(null);

/**
 * CapProvider - Context provider for Capability Studio
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export function CapProvider({ children }) {
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
  const [capabilityTree, setCapabilityTree] = useState([]);

  // UI state
  const [selectedId, setSelectedId] = useState(null);
  const [activeView, setActiveView] = useState('map');
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

      const res = await fetch(`/api/cap/artefacts?${params}`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('CAP artefacts API returned error status:', res.status);
        setArtefacts([]);
        return null;
      }

      const data = await res.json();
      setArtefacts(data.artefacts || []);
      return data;
    } catch (err) {
      console.error('Error fetching capability artefacts:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, activeDomain, authHeaders]);

  /**
   * Fetch capability tree structure
   */
  const fetchCapabilityTree = useCallback(async () => {
    if (!user || !activeDomain) return;

    try {
      const res = await fetch(`/api/cap/capabilities?domainId=${activeDomain}`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('CAP capabilities tree API returned error status:', res.status);
        setCapabilityTree([]);
        return null;
      }

      const data = await res.json();
      setCapabilityTree(data.tree || []);
      return data;
    } catch (err) {
      console.error('Error fetching capability tree:', err);
      setCapabilityTree([]);
      return null;
    }
  }, [user, activeDomain, authHeaders]);

  /**
   * Fetch relationships for current domain
   */
  const fetchRelationships = useCallback(async () => {
    if (!user || !activeDomain) return;

    try {
      const res = await fetch(`/api/cap/relationships?domainId=${activeDomain}`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('CAP relationships API returned error status:', res.status);
        setRelationships([]);
        return null;
      }

      const data = await res.json();
      setRelationships(data.relationships || []);
      return data;
    } catch (err) {
      console.error('Error fetching capability relationships:', err);
      setRelationships([]);
      return null;
    }
  }, [user, activeDomain, authHeaders]);

  /**
   * Fetch stats for current domain
   */
  const fetchStats = useCallback(async () => {
    if (!user || !activeDomain) return;

    try {
      const res = await fetch(`/api/cap/stats?domainId=${activeDomain}`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('CAP stats API returned error status:', res.status);
        return null;
      }

      const data = await res.json();
      setStats(data);
      return data;
    } catch (err) {
      console.error('Error fetching capability stats:', err);
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
      fetchCapabilityTree(),
      fetchRelationships(),
      fetchStats(),
    ]);
  }, [user, fetchArtefacts, fetchCapabilityTree, fetchRelationships, fetchStats]);

  // Load data when domain changes
  useEffect(() => {
    if (user && activeDomain) {
      refreshData();
    } else {
      setArtefacts([]);
      setCapabilityTree([]);
      setRelationships([]);
      setStats(null);
    }
  }, [user, activeDomain, refreshData]);

  // ============================================================================
  // ARTEFACT CRUD OPERATIONS
  // ============================================================================

  /**
   * Create a new capability artefact
   */
  const createArtefact = useCallback(async (type, data = {}) => {
    if (!activeDomain) {
      setError('No domain selected');
      return null;
    }

    if (!isCapType(type)) {
      setError(`Invalid capability type: ${type}`);
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/cap/artefacts', {
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
        const errorMsg = errData.details
          ? `${errData.error}: ${errData.details}${errData.dbDetail ? ` (${errData.dbDetail})` : ''}`
          : errData.error || 'Failed to create artefact';
        throw new Error(errorMsg);
      }

      const newArtefact = await res.json();

      // Update local state
      setArtefacts(prev => [newArtefact, ...prev]);
      setSelectedId(newArtefact.id);

      // Refresh tree and stats sequentially to avoid deadlock
      // Use setTimeout to ensure UI updates first and reduce contention
      setTimeout(() => {
        fetchCapabilityTree();
        // Small delay between fetches to reduce lock contention
        setTimeout(() => fetchStats(), 100);
      }, 50);

      return newArtefact;
    } catch (err) {
      console.error('Error creating capability artefact:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [activeDomain, fetchCapabilityTree, fetchStats, authHeaders]);

  /**
   * Update an existing artefact
   */
  const updateArtefact = useCallback(async (id, updates) => {
    if (!id) return null;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/cap/artefacts/${id}`, {
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

      // Refresh tree and stats with delay to avoid lock contention
      setTimeout(() => {
        // Refresh tree if parent changed
        if (updates.parent_id !== undefined) {
          fetchCapabilityTree();
        }

        // Refresh stats if maturity/status changed
        if (updates.maturity || updates.cap_status || updates.status) {
          setTimeout(() => fetchStats(), 100);
        }
      }, 50);

      return updated;
    } catch (err) {
      console.error('Error updating capability artefact:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [fetchCapabilityTree, fetchStats, authHeaders]);

  /**
   * Delete an artefact
   */
  const deleteArtefact = useCallback(async (id) => {
    if (!id) return false;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/cap/artefacts/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete artefact');
      }

      // Update local state
      setArtefacts(prev => prev.filter(a => a.id !== id));
      setRelationships(prev => prev.filter(r =>
        r.from_artefact_id !== id && r.to_artefact_id !== id
      ));

      if (selectedId === id) {
        setSelectedId(null);
      }

      // Refresh tree and stats
      fetchCapabilityTree();
      fetchStats();

      return true;
    } catch (err) {
      console.error('Error deleting capability artefact:', err);
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [selectedId, fetchCapabilityTree, fetchStats, authHeaders]);

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
      const res = await fetch(`/api/cap/artefacts/${id}`, { headers: authHeaders });
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
  // RELATIONSHIP OPERATIONS
  // ============================================================================

  /**
   * Create a relationship between artefacts
   */
  const createRelationship = useCallback(async (fromId, toId, type, description = null) => {
    if (!fromId || !toId || !type) {
      setError('Missing relationship parameters');
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/cap/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          fromArtefactId: fromId,
          toArtefactId: toId,
          relationshipType: type,
          description,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create relationship');
      }

      const newRel = await res.json();

      // Update local state
      setRelationships(prev => [...prev, newRel]);

      return newRel;
    } catch (err) {
      console.error('Error creating capability relationship:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [authHeaders]);

  /**
   * Delete a relationship
   */
  const deleteRelationship = useCallback(async (id) => {
    if (!id) return false;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/cap/relationships?id=${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete relationship');
      }

      // Update local state
      setRelationships(prev => prev.filter(r => r.id !== id));

      return true;
    } catch (err) {
      console.error('Error deleting capability relationship:', err);
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [authHeaders]);

  /**
   * Get relationships for an artefact
   */
  const getRelated = useCallback((id, direction = 'both') => {
    return relationships.filter(rel => {
      if (direction === 'out') return rel.from_artefact_id === id;
      if (direction === 'in') return rel.to_artefact_id === id;
      return rel.from_artefact_id === id || rel.to_artefact_id === id;
    });
  }, [relationships]);

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
    const stage = CAP_STAGES[stageId];
    if (!stage) return [];
    return artefacts.filter(a => stage.types.includes(a.artefact_type));
  }, [artefacts]);

  /**
   * Get artefacts by module
   */
  const getArtefactsByModule = useCallback((moduleId) => {
    const module = CAP_WORKSPACE_MODULES[moduleId];
    if (!module) return [];
    return artefacts.filter(a => module.types.includes(a.artefact_type));
  }, [artefacts]);

  /**
   * Get capabilities only
   */
  const capabilities = useMemo(() => {
    return artefacts.filter(a => a.artefact_type === 'cap_capability');
  }, [artefacts]);

  /**
   * Get capability groups
   */
  const capabilityGroups = useMemo(() => {
    return artefacts.filter(a => a.artefact_type === 'cap_capability_group');
  }, [artefacts]);

  /**
   * Get value streams
   */
  const valueStreams = useMemo(() => {
    return artefacts.filter(a => a.artefact_type === 'cap_value_stream');
  }, [artefacts]);

  /**
   * Get assessments
   */
  const assessments = useMemo(() => {
    return artefacts.filter(a => a.artefact_type === 'cap_assessment');
  }, [artefacts]);

  /**
   * Get gaps
   */
  const gaps = useMemo(() => {
    return artefacts.filter(a => a.artefact_type === 'cap_gap');
  }, [artefacts]);

  /**
   * Get initiatives
   */
  const initiatives = useMemo(() => {
    return artefacts.filter(a => a.artefact_type === 'cap_initiative');
  }, [artefacts]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value = useMemo(() => ({
    // Data
    artefacts,
    capabilities,
    capabilityGroups,
    valueStreams,
    assessments,
    gaps,
    initiatives,
    capabilityTree,
    relationships,
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
    fetchCapabilityTree,
    fetchRelationships,
    fetchStats,

    // CRUD
    createArtefact,
    updateArtefact,
    deleteArtefact,
    getArtefact,
    getArtefactDetails,

    // Relationships
    createRelationship,
    deleteRelationship,
    getRelated,

    // Filtering
    getArtefactsByType,
    getArtefactsByStage,
    getArtefactsByModule,

    // Type utilities
    getTypeDefinition,
    isCapType,
    getTypeColor,
    calculateCapabilityCompleteness,
    calculateMaturitySummary,

    // Constants
    CAP_STAGES,
    CAP_WORKSPACE_MODULES,
    CAP_ALL_TYPES,
    CAP_TYPE_DEFS,
    CAP_RELATIONSHIP_TYPES,
    CAP_STATUS_OPTIONS,
    CAP_MATURITY_LEVELS,
    CAP_STRATEGIC_IMPORTANCE,
  }), [
    artefacts,
    capabilities,
    capabilityGroups,
    valueStreams,
    assessments,
    gaps,
    initiatives,
    capabilityTree,
    relationships,
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
    fetchCapabilityTree,
    fetchRelationships,
    fetchStats,
    createArtefact,
    updateArtefact,
    deleteArtefact,
    getArtefact,
    getArtefactDetails,
    createRelationship,
    deleteRelationship,
    getRelated,
    getArtefactsByType,
    getArtefactsByStage,
    getArtefactsByModule,
  ]);

  return (
    <CapContext.Provider value={value}>
      {children}
    </CapContext.Provider>
  );
}

/**
 * useCap - Hook to access Capability Studio context
 *
 * @returns {CapContextValue}
 * @throws {Error} If used outside CapProvider
 */
export function useCap() {
  const ctx = useContext(CapContext);
  if (!ctx) throw new Error('useCap must be used inside CapProvider');
  return ctx;
}
