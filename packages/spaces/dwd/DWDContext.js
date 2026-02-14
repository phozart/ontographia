// components/dwd/DWDContext.js
// Dynamic Work Design context - API-backed, project-scoped
// Manages DWD cases, artefacts, and relationships via database persistence

import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { useProjects } from '../../ProjectContext';
import {
  DWD_STAGES,
  DWD_WORKSPACE_MODULES,
  DWD_ALL_TYPES,
  DWD_TYPE_DEFS,
  DWD_RELATIONSHIP_TYPES,
  DWD_CASE_STATUS,
  DWD_ADJUSTMENT_STATUS,
  DWD_WORK_ITEM_STATE,
  DWD_VOLATILITY_LEVELS,
  DWD_AUTHORITY_LEVELS,
  DWD_CONFIDENCE_LEVELS,
  DWD_IMPACT_LEVELS,
  DWD_FREQUENCY_LEVELS,
  DWD_REVERSIBILITY_LEVELS,
  DWD_SIGNAL_TYPES,
  DWD_WORK_ITEM_TYPES,
  DWD_ACTOR_TYPES,
  DWD_CAPABILITY_TYPES,
  DWD_COORDINATION_PATTERN_TYPES,
  DWD_DEFAULT_PROJECT_CONFIG,
  getTypeDefinition,
  isDWDType,
  getTypeColor,
  getStageForType,
  getCaseCompleteness,
  generateObservations,
} from '../../../lib/dwd-types';

// Re-export type definitions for components
export {
  DWD_STAGES,
  DWD_WORKSPACE_MODULES,
  DWD_ALL_TYPES,
  DWD_TYPE_DEFS,
  DWD_RELATIONSHIP_TYPES,
  DWD_CASE_STATUS,
  DWD_ADJUSTMENT_STATUS,
  DWD_WORK_ITEM_STATE,
  DWD_VOLATILITY_LEVELS,
  DWD_AUTHORITY_LEVELS,
  DWD_CONFIDENCE_LEVELS,
  DWD_IMPACT_LEVELS,
  DWD_FREQUENCY_LEVELS,
  DWD_REVERSIBILITY_LEVELS,
  DWD_SIGNAL_TYPES,
  DWD_WORK_ITEM_TYPES,
  DWD_ACTOR_TYPES,
  DWD_CAPABILITY_TYPES,
  DWD_COORDINATION_PATTERN_TYPES,
};

const DWDContext = createContext(null);

export function DWDProvider({ children }) {
  const { user, role } = useAuth();
  const { activeProject } = useProjects();

  // Auth headers for API calls
  const authHeaders = useMemo(() => ({
    'x-user': user || '',
    'x-role': role || '',
  }), [user, role]);

  // ============================================================================
  // CORE STATE
  // ============================================================================

  // Cases (Work Situations)
  const [cases, setCases] = useState([]);
  const [activeCase, setActiveCase] = useState(null);

  // Artefacts (all DWD types)
  const [artefacts, setArtefacts] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [stats, setStats] = useState(null);

  // UI state
  const [selectedId, setSelectedId] = useState(null);
  const [activeView, setActiveView] = useState('overview');

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // Fetch cases for current project
  const fetchCases = useCallback(async (filters = {}) => {
    if (!user || !activeProject?.id) return;

    try {
      const params = new URLSearchParams({
        projectId: activeProject.id,
        ...filters,
      });

      const res = await fetch(`/api/dwd/cases?${params}`, { headers: authHeaders });
      if (!res.ok) {
        // Don't throw, just log and return empty
        console.warn('DWD cases API returned error status:', res.status);
        setCases([]);
        return null;
      }

      const data = await res.json();
      setCases(data.cases || []);
      return data;
    } catch (err) {
      console.error('Error fetching DWD cases:', err);
      setCases([]);
      return null;
    }
  }, [user, activeProject?.id, authHeaders]);

  // Fetch artefacts for current project (optionally filtered by case)
  const fetchArtefacts = useCallback(async (filters = {}) => {
    if (!user || !activeProject?.id) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        projectId: activeProject.id,
        ...filters,
      });

      if (activeCase?.id) {
        params.set('caseId', activeCase.id);
      }

      const res = await fetch(`/api/dwd/artefacts?${params}`, { headers: authHeaders });
      if (!res.ok) {
        // Don't throw, just log and return empty
        console.warn('DWD artefacts API returned error status:', res.status);
        setArtefacts([]);
        return null;
      }

      const data = await res.json();
      setArtefacts(data.artefacts || []);
      return data;
    } catch (err) {
      console.error('Error fetching DWD artefacts:', err);
      setArtefacts([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, activeProject?.id, activeCase?.id, authHeaders]);

  // Fetch relationships for current project
  const fetchRelationships = useCallback(async () => {
    if (!user || !activeProject?.id) return;

    try {
      const params = new URLSearchParams({ projectId: activeProject.id });
      if (activeCase?.id) {
        params.set('caseId', activeCase.id);
      }

      const res = await fetch(`/api/dwd/relationships?${params}`, { headers: authHeaders });
      if (!res.ok) {
        // Don't throw, just log and return empty
        console.warn('DWD relationships API returned error status:', res.status);
        setRelationships([]);
        return null;
      }

      const data = await res.json();
      setRelationships(data.relationships || []);
      return data;
    } catch (err) {
      console.error('Error fetching DWD relationships:', err);
      setRelationships([]);
      return null;
    }
  }, [user, activeProject?.id, activeCase?.id, authHeaders]);

  // Fetch stats for current project
  const fetchStats = useCallback(async () => {
    if (!user || !activeProject?.id) return;

    try {
      const params = new URLSearchParams({ projectId: activeProject.id });
      if (activeCase?.id) {
        params.set('caseId', activeCase.id);
      }

      const res = await fetch(`/api/dwd/stats?${params}`, { headers: authHeaders });
      if (!res.ok) {
        // Don't throw, just log and return
        console.warn('DWD stats API returned error status:', res.status);
        return null;
      }

      const data = await res.json();
      setStats(data);
      return data;
    } catch (err) {
      console.error('Error fetching DWD stats:', err);
      return null;
    }
  }, [user, activeProject?.id, activeCase?.id, authHeaders]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    if (!user) return;
    await Promise.all([
      fetchCases(),
      fetchArtefacts(),
      fetchRelationships(),
      fetchStats(),
    ]);
  }, [user, fetchCases, fetchArtefacts, fetchRelationships, fetchStats]);

  // Load data when project changes
  useEffect(() => {
    if (user && activeProject?.id) {
      refreshData();
    } else {
      setCases([]);
      setArtefacts([]);
      setRelationships([]);
      setStats(null);
      setActiveCase(null);
    }
  }, [user, activeProject?.id, refreshData]);

  // Reload artefacts when active case changes
  useEffect(() => {
    if (activeCase?.id) {
      fetchArtefacts();
      fetchRelationships();
      fetchStats();
    }
  }, [activeCase?.id, fetchArtefacts, fetchRelationships, fetchStats]);

  // ============================================================================
  // CASE OPERATIONS
  // ============================================================================

  // Create case
  const createCase = useCallback(async (data = {}) => {
    if (!activeProject?.id) {
      setError('No project selected');
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/dwd/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          projectId: activeProject.id,
          name: data.name || 'New Work Situation',
          summary: data.summary || '',
          context: data.context || '',
          tags: data.tags || [],
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create case');
      }

      const newCase = await res.json();

      // Update local state
      setCases(prev => [newCase, ...prev]);
      setActiveCase(newCase);

      // Refresh stats
      fetchStats();

      return newCase;
    } catch (err) {
      console.error('Error creating DWD case:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [activeProject?.id, fetchStats, authHeaders]);

  // ============================================================================
  // ARTEFACT CRUD OPERATIONS
  // ============================================================================

  // Create artefact
  const createArtefact = useCallback(async (type, data = {}) => {
    if (!activeProject?.id) {
      setError('No project selected');
      return null;
    }

    if (!isDWDType(type)) {
      setError(`Invalid DWD type: ${type}`);
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/dwd/artefacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          projectId: activeProject.id,
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

      // If we have an active case, create a relationship
      if (activeCase?.id && type !== 'dwd_case') {
        const relType = getRelationshipTypeForArtefact(type);
        if (relType) {
          // createRelationship expects (type, fromId, toId)
          await createRelationship(relType, activeCase.id, newArtefact.id);
        }
      }

      // Refresh stats
      fetchStats();

      return newArtefact;
    } catch (err) {
      console.error('Error creating DWD artefact:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [activeProject?.id, activeCase?.id, fetchStats, authHeaders]);

  // Update artefact
  const updateArtefact = useCallback(async (id, updates) => {
    if (!id) return null;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/dwd/artefacts/${id}`, {
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

      // Also update cases if it's a case
      if (updated.artefact_type === 'dwd_case') {
        setCases(prev => prev.map(c => c.id === id ? updated : c));
        if (activeCase?.id === id) {
          setActiveCase(updated);
        }
      }

      // Refresh stats if status changed
      if (updates.case_status || updates.adjustment_status) {
        fetchStats();
      }

      return updated;
    } catch (err) {
      console.error('Error updating DWD artefact:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [activeCase?.id, fetchStats, authHeaders]);

  // Delete artefact
  const deleteArtefact = useCallback(async (id) => {
    if (!id) return false;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/dwd/artefacts/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete artefact');
      }

      // Update local state
      setArtefacts(prev => prev.filter(a => a.id !== id));
      setCases(prev => prev.filter(c => c.id !== id));
      setRelationships(prev => prev.filter(r =>
        r.from_artefact_id !== id && r.to_artefact_id !== id
      ));

      if (selectedId === id) {
        setSelectedId(null);
      }

      if (activeCase?.id === id) {
        setActiveCase(null);
      }

      // Refresh stats
      fetchStats();

      return true;
    } catch (err) {
      console.error('Error deleting DWD artefact:', err);
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [selectedId, activeCase?.id, fetchStats, authHeaders]);

  // Get single artefact
  const getArtefact = useCallback((id) => {
    return artefacts.find(a => a.id === id) || cases.find(c => c.id === id) || null;
  }, [artefacts, cases]);

  // Get artefact with full details from API
  const getArtefactDetails = useCallback(async (id) => {
    if (!id) return null;

    try {
      const res = await fetch(`/api/dwd/artefacts/${id}`, { headers: authHeaders });
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

  // Helper to get relationship type for artefact type
  const getRelationshipTypeForArtefact = (type) => {
    const map = {
      'dwd_work_item': 'case_involves_work_item',
      'dwd_actor': 'case_involves_actor',
      'dwd_signal': 'case_has_signal',
      'dwd_adjustment': 'case_has_adjustment',
      'dwd_outcome': 'case_has_outcome',
    };
    return map[type] || null;
  };

  // Create relationship
  const createRelationship = useCallback(async (fromId, toId, type, description = null) => {
    if (!fromId || !toId || !type) {
      setError('Missing relationship parameters');
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/dwd/relationships', {
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
      console.error('Error creating DWD relationship:', err);
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
      const res = await fetch(`/api/dwd/relationships?id=${id}`, {
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
      console.error('Error deleting DWD relationship:', err);
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
    const stage = DWD_STAGES[stageId];
    if (!stage) return [];
    return artefacts.filter(a => stage.types.includes(a.artefact_type));
  }, [artefacts]);

  // Get artefacts for active case
  const getCaseArtefacts = useCallback(() => {
    if (!activeCase?.id) return artefacts;

    const caseRelIds = new Set();
    relationships.forEach(rel => {
      if (rel.from_artefact_id === activeCase.id) {
        caseRelIds.add(rel.to_artefact_id);
      }
      if (rel.to_artefact_id === activeCase.id) {
        caseRelIds.add(rel.from_artefact_id);
      }
    });

    return artefacts.filter(a => caseRelIds.has(a.id) || a.id === activeCase.id);
  }, [activeCase?.id, artefacts, relationships]);

  // ============================================================================
  // OBSERVATIONS (Heuristic insights)
  // ============================================================================

  const observations = useMemo(() => {
    return stats?.observations || generateObservations(artefacts, relationships);
  }, [stats?.observations, artefacts, relationships]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value = useMemo(() => ({
    // Cases
    cases,
    activeCase,
    setActiveCase,
    createCase,

    // Artefacts
    artefacts,
    relationships,
    stats,
    observations,

    // UI state
    selectedId,
    setSelectedId,
    activeView,
    setActiveView,

    // Loading states
    loading,
    error,
    saving,
    setError,

    // Data operations
    refreshData,
    fetchCases,
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
    getCaseArtefacts,

    // Type utilities
    getTypeDefinition,
    isDWDType,
    getTypeColor,
    getStageForType,
    getCaseCompleteness,

    // Constants
    DWD_STAGES,
    DWD_WORKSPACE_MODULES,
    DWD_ALL_TYPES,
    DWD_TYPE_DEFS,
    DWD_RELATIONSHIP_TYPES,
    DWD_CASE_STATUS,
    DWD_ADJUSTMENT_STATUS,
    DWD_WORK_ITEM_STATE,
    DWD_VOLATILITY_LEVELS,
    DWD_AUTHORITY_LEVELS,
    DWD_CONFIDENCE_LEVELS,
    DWD_IMPACT_LEVELS,
    DWD_FREQUENCY_LEVELS,
    DWD_REVERSIBILITY_LEVELS,
    DWD_SIGNAL_TYPES,
    DWD_WORK_ITEM_TYPES,
    DWD_ACTOR_TYPES,
    DWD_CAPABILITY_TYPES,
    DWD_COORDINATION_PATTERN_TYPES,
  }), [
    cases,
    activeCase,
    createCase,
    artefacts,
    relationships,
    stats,
    observations,
    selectedId,
    activeView,
    loading,
    error,
    saving,
    refreshData,
    fetchCases,
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
    getCaseArtefacts,
  ]);

  return (
    <DWDContext.Provider value={value}>
      {children}
    </DWDContext.Provider>
  );
}

export function useDWD() {
  const ctx = useContext(DWDContext);
  if (!ctx) throw new Error('useDWD must be used inside DWDProvider');
  return ctx;
}
