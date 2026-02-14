// components/pdw/PDWContext.js
// Product Design Workspace context - API-backed, domain-scoped
// Manages PDW artefacts, canvases, and relationships via database persistence

import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { useDomains } from '../../DomainContext';
import {
  PDW_STAGES,
  PDW_WORKSPACE_MODULES,
  PDW_ALL_TYPES,
  PDW_TYPE_DEFS,
  PDW_CANVAS_DEFS,
  PDW_RELATIONSHIP_TYPES,
  PDW_STATUS_OPTIONS,
  PDW_DEFAULT_PROJECT_CONFIG,
  getTypeDefinition,
  isCanvasType,
  isArtefactType,
  isPDWType,
  calculateStageHealth,
  getTypeColor,
} from '../../../lib/pdw-types';

// Re-export type definitions for components
export {
  PDW_STAGES,
  PDW_WORKSPACE_MODULES,
  PDW_ALL_TYPES,
  PDW_TYPE_DEFS,
  PDW_CANVAS_DEFS,
  PDW_RELATIONSHIP_TYPES,
  PDW_STATUS_OPTIONS,
  PDW_DEFAULT_PROJECT_CONFIG,
};

const PDWContext = createContext(null);

export function PDWProvider({ children }) {
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

  // UI state
  const [selectedId, setSelectedId] = useState(null);
  const [activeView, setActiveView] = useState('overview');
  const [activeStage, setActiveStage] = useState(null);
  const [activeModule, setActiveModule] = useState(null);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Project configuration
  const [projectConfig, setProjectConfig] = useState(PDW_DEFAULT_PROJECT_CONFIG);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // Fetch artefacts for current domain
  const fetchArtefacts = useCallback(async (filters = {}) => {
    if (!user || !activeDomain) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        domainId: activeDomain,
        ...filters,
      });

      const res = await fetch(`/api/pdw/artefacts?${params}`, { headers: authHeaders });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch artefacts');
      }

      const data = await res.json();
      setArtefacts(data.artefacts || []);
      return data;
    } catch (err) {
      console.error('Error fetching PDW artefacts:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, activeDomain, authHeaders]);

  // Fetch relationships for current domain
  const fetchRelationships = useCallback(async () => {
    if (!user || !activeDomain) return;

    try {
      const res = await fetch(`/api/pdw/relationships?domainId=${activeDomain}`, { headers: authHeaders });
      if (!res.ok) {
        // Don't throw, just log and return empty
        console.warn('PDW relationships API returned error status:', res.status);
        setRelationships([]);
        return null;
      }

      const data = await res.json();
      setRelationships(data.relationships || []);
      return data;
    } catch (err) {
      console.error('Error fetching PDW relationships:', err);
      setRelationships([]);
      return null;
    }
  }, [user, activeDomain, authHeaders]);

  // Fetch stats for current domain
  const fetchStats = useCallback(async () => {
    if (!user || !activeDomain) return;

    try {
      const res = await fetch(`/api/pdw/stats?domainId=${activeDomain}`, { headers: authHeaders });
      if (!res.ok) {
        // Don't throw, just log and return
        console.warn('PDW stats API returned error status:', res.status);
        return null;
      }

      const data = await res.json();
      setStats(data);
      return data;
    } catch (err) {
      console.error('Error fetching PDW stats:', err);
      return null;
    }
  }, [user, activeDomain, authHeaders]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    if (!user) return;
    await Promise.all([
      fetchArtefacts(),
      fetchRelationships(),
      fetchStats(),
    ]);
  }, [user, fetchArtefacts, fetchRelationships, fetchStats]);

  // Load data when domain changes
  useEffect(() => {
    if (user && activeDomain) {
      refreshData();
    } else {
      setArtefacts([]);
      setRelationships([]);
      setStats(null);
    }
  }, [user, activeDomain, refreshData]);

  // ============================================================================
  // ARTEFACT CRUD OPERATIONS
  // ============================================================================

  // Create artefact
  const createArtefact = useCallback(async (type, data = {}) => {
    if (!activeDomain) {
      setError('No domain selected');
      return null;
    }

    if (!isPDWType(type)) {
      setError(`Invalid PDW type: ${type}`);
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/pdw/artefacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          domainId: activeDomain,
          artefactType: type,
          name: data.name || `New ${getTypeDefinition(type)?.name || 'Item'}`,
          description: data.description || '',
          pdwStatus: data.pdwStatus || 'draft',
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

      // Refresh stats
      fetchStats();

      return newArtefact;
    } catch (err) {
      console.error('Error creating PDW artefact:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [activeDomain, fetchStats, authHeaders]);

  // Update artefact
  const updateArtefact = useCallback(async (id, updates) => {
    if (!id) return null;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/pdw/artefacts/${id}`, {
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

      // Refresh stats if status changed
      if (updates.pdwStatus) {
        fetchStats();
      }

      return updated;
    } catch (err) {
      console.error('Error updating PDW artefact:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [fetchStats, authHeaders]);

  // Delete artefact
  const deleteArtefact = useCallback(async (id) => {
    if (!id) return false;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/pdw/artefacts/${id}`, {
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

      // Refresh stats
      fetchStats();

      return true;
    } catch (err) {
      console.error('Error deleting PDW artefact:', err);
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [selectedId, fetchStats, authHeaders]);

  // Get single artefact
  const getArtefact = useCallback((id) => {
    return artefacts.find(a => a.id === id) || null;
  }, [artefacts]);

  // Get artefact with full details from API
  const getArtefactDetails = useCallback(async (id) => {
    if (!id) return null;

    try {
      const res = await fetch(`/api/pdw/artefacts/${id}`, { headers: authHeaders });
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

  // Create relationship
  const createRelationship = useCallback(async (fromId, toId, type, description = null) => {
    if (!fromId || !toId || !type) {
      setError('Missing relationship parameters');
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/pdw/relationships', {
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
      console.error('Error creating PDW relationship:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [authHeaders]);

  // Delete relationship
  const deleteRelationship = useCallback(async (id) => {
    if (!id) return false;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/pdw/relationships?id=${id}`, {
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
      console.error('Error deleting PDW relationship:', err);
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [authHeaders]);

  // Get related artefacts
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

  // Get artefacts by type
  const getArtefactsByType = useCallback((type) => {
    return artefacts.filter(a => a.artefact_type === type);
  }, [artefacts]);

  // Get artefacts by stage
  const getArtefactsByStage = useCallback((stageId) => {
    const stage = PDW_STAGES[stageId];
    if (!stage) return [];
    return artefacts.filter(a => stage.types.includes(a.artefact_type));
  }, [artefacts]);

  // Get artefacts by module
  const getArtefactsByModule = useCallback((moduleId) => {
    const module = PDW_WORKSPACE_MODULES[moduleId];
    if (!module) return [];
    const types = [...(module.types || []), ...(module.canvases || [])];
    return artefacts.filter(a => types.includes(a.artefact_type));
  }, [artefacts]);

  // Get artefacts by status
  const getArtefactsByStatus = useCallback((status) => {
    return artefacts.filter(a =>
      a.custom_fields?.pdw_status === status ||
      a.status?.toLowerCase() === status.toLowerCase()
    );
  }, [artefacts]);

  // Get only core artefacts (not canvases)
  const getCoreArtefacts = useCallback(() => {
    return artefacts.filter(a => isArtefactType(a.artefact_type));
  }, [artefacts]);

  // Get only canvases
  const getCanvases = useCallback(() => {
    return artefacts.filter(a => isCanvasType(a.artefact_type));
  }, [artefacts]);

  // ============================================================================
  // HEALTH & SCORING
  // ============================================================================

  // Calculate stage health
  const getStageHealth = useCallback((stageId) => {
    return calculateStageHealth(artefacts, stageId);
  }, [artefacts]);

  // Calculate overall health
  const getOverallHealth = useCallback(() => {
    const stages = Object.keys(PDW_STAGES);
    const scores = stages.map(s => calculateStageHealth(artefacts, s).score);
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }, [artefacts]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value = useMemo(() => ({
    // Data
    artefacts,
    relationships,
    stats,
    projectConfig,

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
    getArtefactsByStatus,
    getCoreArtefacts,
    getCanvases,

    // Health
    getStageHealth,
    getOverallHealth,

    // Type utilities
    getTypeDefinition,
    isCanvasType,
    isArtefactType,
    isPDWType,
    getTypeColor,

    // Constants
    PDW_STAGES,
    PDW_WORKSPACE_MODULES,
    PDW_ALL_TYPES,
    PDW_TYPE_DEFS,
    PDW_CANVAS_DEFS,
    PDW_RELATIONSHIP_TYPES,
    PDW_STATUS_OPTIONS,
  }), [
    artefacts,
    relationships,
    stats,
    projectConfig,
    selectedId,
    activeView,
    activeStage,
    activeModule,
    loading,
    error,
    saving,
    refreshData,
    fetchArtefacts,
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
    getArtefactsByStatus,
    getCoreArtefacts,
    getCanvases,
    getStageHealth,
    getOverallHealth,
  ]);

  return (
    <PDWContext.Provider value={value}>
      {children}
    </PDWContext.Provider>
  );
}

export function usePDW() {
  const ctx = useContext(PDWContext);
  if (!ctx) throw new Error('usePDW must be used inside PDWProvider');
  return ctx;
}
