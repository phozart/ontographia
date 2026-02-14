// components/pds/PDSContext.js
// Project Design Workspace context - API-backed, project-scoped
// Manages PDS projects, artefacts, and relationships via database persistence

import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { useProjects } from '../../ProjectContext';
import {
  PDS_STAGES,
  PDS_STAGE_INFO,
  PDS_ALL_TYPES,
  PDS_TYPE_DEFS,
  PDS_RELATIONSHIP_TYPES,
  PDS_STATUS_VALUES,
  PDS_RISK_PROBABILITY,
  PDS_RISK_IMPACT,
  PDS_STAKEHOLDER_INFLUENCE,
  PDS_STAKEHOLDER_INTEREST,
  PDS_CHANGE_PRIORITY,
  PDS_CONFIDENCE_LEVELS,
  getTypeDefinition,
  isPDSType,
  getTypeColor,
  getStageForType,
  getArtefactTypesByStage,
  calculateProjectHealth,
  calculateRiskExposure,
  validateSRSReadiness,
} from '../../../lib/pds-types';

// Re-export type definitions for components
export {
  PDS_STAGES,
  PDS_STAGE_INFO,
  PDS_ALL_TYPES,
  PDS_TYPE_DEFS,
  PDS_RELATIONSHIP_TYPES,
  PDS_STATUS_VALUES,
  PDS_RISK_PROBABILITY,
  PDS_RISK_IMPACT,
  PDS_STAKEHOLDER_INFLUENCE,
  PDS_STAKEHOLDER_INTEREST,
  PDS_CHANGE_PRIORITY,
  PDS_CONFIDENCE_LEVELS,
  getArtefactTypesByStage,
};

const PDSContext = createContext(null);

export function PDSProvider({ children }) {
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

  // PDS Projects
  const [pdsProjects, setPdsProjects] = useState([]);
  const [activePdsProject, setActivePdsProject] = useState(null);

  // Artefacts (all PDS types)
  const [artefacts, setArtefacts] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [stats, setStats] = useState(null);

  // UI state
  const [selectedId, setSelectedId] = useState(null);
  const [activeView, setActiveView] = useState('overview');
  const [activeTool, setActiveTool] = useState(null);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // Fetch PDS projects for current parent project
  const fetchPdsProjects = useCallback(async (filters = {}) => {
    if (!user || !activeProject?.id) return;

    try {
      const params = new URLSearchParams({
        projectId: activeProject.id,
        ...filters,
      });

      const res = await fetch(`/api/pds/projects?${params}`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('PDS projects API returned error status:', res.status);
        setPdsProjects([]);
        return null;
      }

      const data = await res.json();
      setPdsProjects(data.projects || []);
      return data;
    } catch (err) {
      console.error('Error fetching PDS projects:', err);
      setPdsProjects([]);
      return null;
    }
  }, [user, activeProject?.id, authHeaders]);

  // Fetch artefacts for current PDS project
  const fetchArtefacts = useCallback(async (filters = {}) => {
    if (!user || !activeProject?.id || !activePdsProject?.id) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        projectId: activeProject.id,        // Main project ID (required by API)
        pdsProjectId: activePdsProject.id,  // PDS project filter
        ...filters,
      });

      const res = await fetch(`/api/pds/artefacts?${params}`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('PDS artefacts API returned error status:', res.status);
        setArtefacts([]);
        return null;
      }

      const data = await res.json();
      setArtefacts(data.artefacts || []);
      return data;
    } catch (err) {
      console.error('Error fetching PDS artefacts:', err);
      setArtefacts([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, activeProject?.id, activePdsProject?.id, authHeaders]);

  // Fetch relationships for current PDS project
  const fetchRelationships = useCallback(async () => {
    if (!user || !activeProject?.id || !activePdsProject?.id) return;

    try {
      const params = new URLSearchParams({
        projectId: activeProject.id,        // Main project ID
        pdsProjectId: activePdsProject.id,  // PDS project filter
      });
      const res = await fetch(`/api/pds/relationships?${params}`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('PDS relationships API returned error status:', res.status);
        setRelationships([]);
        return null;
      }

      const data = await res.json();
      setRelationships(data.relationships || []);
      return data;
    } catch (err) {
      console.error('Error fetching PDS relationships:', err);
      setRelationships([]);
      return null;
    }
  }, [user, activeProject?.id, activePdsProject?.id, authHeaders]);

  // Fetch stats for current PDS project
  const fetchStats = useCallback(async () => {
    if (!user || !activeProject?.id || !activePdsProject?.id) return;

    try {
      const params = new URLSearchParams({
        projectId: activeProject.id,        // Main project ID
        pdsProjectId: activePdsProject.id,  // PDS project filter
      });
      const res = await fetch(`/api/pds/stats?${params}`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('PDS stats API returned error status:', res.status);
        return null;
      }

      const data = await res.json();
      setStats(data);
      return data;
    } catch (err) {
      console.error('Error fetching PDS stats:', err);
      return null;
    }
  }, [user, activeProject?.id, activePdsProject?.id, authHeaders]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    if (!user) return;
    await fetchPdsProjects();
    if (activePdsProject?.id) {
      await Promise.all([
        fetchArtefacts(),
        fetchRelationships(),
        fetchStats(),
      ]);
    }
  }, [user, activePdsProject?.id, fetchPdsProjects, fetchArtefacts, fetchRelationships, fetchStats]);

  // Load PDS projects when parent project changes
  // Auto-select first project or auto-create if none exist
  useEffect(() => {
    async function loadPdsProjects() {
      if (!user || !activeProject?.id) {
        setPdsProjects([]);
        setArtefacts([]);
        setRelationships([]);
        setStats(null);
        setActivePdsProject(null);
        return;
      }

      try {
        const params = new URLSearchParams({ projectId: activeProject.id });
        const res = await fetch(`/api/pds/projects?${params}`, { headers: authHeaders });

        if (!res.ok) {
          console.warn('PDS projects API returned error status:', res.status);
          setPdsProjects([]);
          return;
        }

        const data = await res.json();
        const projects = data.projects || [];
        setPdsProjects(projects);

        // Auto-select first project or create default one
        if (projects.length > 0) {
          // Auto-select first project if none is currently selected
          if (!activePdsProject || !projects.find(p => p.id === activePdsProject.id)) {
            setActivePdsProject(projects[0]);
          }
        } else {
          // No PDS projects exist - create a default one automatically
          console.log('[PDSContext] No PDS projects found, creating default...');
          const createRes = await fetch('/api/pds/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify({
              projectId: activeProject.id,
              name: activeProject.name || 'Project Delivery',
              vision: activeProject.description || 'Define the project vision and goals',
              status: 'planning',
            }),
          });

          if (createRes.ok) {
            const newProject = await createRes.json();
            setPdsProjects([newProject]);
            setActivePdsProject(newProject);
          }
        }
      } catch (err) {
        console.error('Error loading/creating PDS projects:', err);
        setPdsProjects([]);
      }
    }

    loadPdsProjects();
  }, [user, activeProject?.id, activeProject?.name, activeProject?.description, authHeaders]);

  // Reload artefacts when active PDS project changes
  useEffect(() => {
    if (activePdsProject?.id) {
      fetchArtefacts();
      fetchRelationships();
      fetchStats();
    } else {
      setArtefacts([]);
      setRelationships([]);
      setStats(null);
    }
  }, [activePdsProject?.id, fetchArtefacts, fetchRelationships, fetchStats]);

  // ============================================================================
  // PDS PROJECT OPERATIONS
  // ============================================================================

  // Create PDS project (with SRS readiness validation)
  const createPdsProject = useCallback(async (data = {}) => {
    if (!activeProject?.id) {
      setError('No parent project selected');
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/pds/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          projectId: activeProject.id,
          name: data.title || data.name || 'New Project',
          vision: data.vision || '',
          successCriteria: data.successCriteria || [],
          srsDecisionId: data.srsDecisionId || null,
          status: data.status || 'planning',
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create PDS project');
      }

      const newProject = await res.json();

      // Update local state
      setPdsProjects(prev => [newProject, ...prev]);
      setActivePdsProject(newProject);

      return newProject;
    } catch (err) {
      console.error('Error creating PDS project:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [activeProject?.id, authHeaders]);

  // Update PDS project
  const updatePdsProject = useCallback(async (id, updates) => {
    if (!id) return null;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/pds/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update PDS project');
      }

      const updated = await res.json();

      // Update local state
      setPdsProjects(prev => prev.map(p => p.id === id ? updated : p));
      if (activePdsProject?.id === id) {
        setActivePdsProject(updated);
      }

      return updated;
    } catch (err) {
      console.error('Error updating PDS project:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [activePdsProject?.id, authHeaders]);

  // ============================================================================
  // ARTEFACT CRUD OPERATIONS
  // ============================================================================

  // Create artefact
  const createArtefact = useCallback(async (type, data = {}) => {
    if (!activeProject?.id) {
      setError('No project selected');
      return null;
    }

    if (!activePdsProject?.id) {
      setError('No PDS project selected');
      return null;
    }

    if (!isPDSType(type)) {
      setError(`Invalid PDS type: ${type}`);
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      const typeDef = getTypeDefinition(type);
      const res = await fetch('/api/pds/artefacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          projectId: activeProject.id,
          pdsProjectId: activePdsProject.id,
          artefactType: type,
          name: data.name || `New ${typeDef?.name || 'Item'}`,
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

      // Refresh stats
      fetchStats();

      return newArtefact;
    } catch (err) {
      console.error('Error creating PDS artefact:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [activeProject?.id, activePdsProject?.id, fetchStats, authHeaders]);

  // Update artefact
  const updateArtefact = useCallback(async (id, updates) => {
    if (!id) return null;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/pds/artefacts/${id}`, {
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
      if (updates.status) {
        fetchStats();
      }

      return updated;
    } catch (err) {
      console.error('Error updating PDS artefact:', err);
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
      const res = await fetch(`/api/pds/artefacts/${id}`, {
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
      console.error('Error deleting PDS artefact:', err);
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
      const res = await fetch(`/api/pds/artefacts/${id}`, { headers: authHeaders });
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
      const res = await fetch('/api/pds/relationships', {
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
      console.error('Error creating PDS relationship:', err);
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
      const res = await fetch(`/api/pds/relationships?id=${id}`, {
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
      console.error('Error deleting PDS relationship:', err);
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
    // Get all type IDs for this stage
    const stageTypes = getArtefactTypesByStage(stageId);
    const stageTypeIds = stageTypes.map(t => t.id);
    return artefacts.filter(a => stageTypeIds.includes(a.artefact_type));
  }, [artefacts]);

  // Get risks with computed exposure
  const getRisks = useCallback(() => {
    return artefacts
      .filter(a => a.artefact_type === 'pds_risk')
      .map(risk => ({
        ...risk,
        exposure: calculateRiskExposure(
          risk.custom_fields?.probability || 'medium',
          risk.custom_fields?.impact || 'medium'
        ),
      }));
  }, [artefacts]);

  // Get stakeholders grouped by quadrant
  const getStakeholdersByQuadrant = useCallback(() => {
    const stakeholders = artefacts.filter(a => a.artefact_type === 'pds_stakeholder');
    return {
      manageClosely: stakeholders.filter(s =>
        s.custom_fields?.influence === 'high' && s.custom_fields?.interest === 'high'
      ),
      keepSatisfied: stakeholders.filter(s =>
        s.custom_fields?.influence === 'high' && s.custom_fields?.interest !== 'high'
      ),
      keepInformed: stakeholders.filter(s =>
        s.custom_fields?.influence !== 'high' && s.custom_fields?.interest === 'high'
      ),
      monitor: stakeholders.filter(s =>
        s.custom_fields?.influence !== 'high' && s.custom_fields?.interest !== 'high'
      ),
    };
  }, [artefacts]);

  // Get milestones sorted by date
  const getMilestones = useCallback(() => {
    return artefacts
      .filter(a => a.artefact_type === 'pds_milestone')
      .sort((a, b) => {
        const dateA = new Date(a.custom_fields?.planned_date || 0);
        const dateB = new Date(b.custom_fields?.planned_date || 0);
        return dateA - dateB;
      });
  }, [artefacts]);

  // Get deliverables with dependencies
  const getDeliverables = useCallback(() => {
    const deliverables = artefacts.filter(a => a.artefact_type === 'pds_deliverable');
    return deliverables.map(d => {
      const deps = relationships
        .filter(r => r.to_artefact_id === d.id && r.relationship_type === 'depends_on')
        .map(r => r.from_artefact_id);
      return { ...d, dependencies: deps };
    });
  }, [artefacts, relationships]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Project health score
  const projectHealth = useMemo(() => {
    if (!activePdsProject || artefacts.length === 0) return null;
    return calculateProjectHealth(artefacts, relationships);
  }, [activePdsProject, artefacts, relationships]);

  // Stage completion percentages
  const stageCompletion = useMemo(() => {
    const completion = {};
    // Use PDS_STAGE_INFO keys which are lowercase (intent, structure, etc.)
    Object.keys(PDS_STAGE_INFO).forEach(stageId => {
      const stageArtefacts = getArtefactsByStage(stageId);
      if (stageArtefacts.length === 0) {
        completion[stageId] = 0;
      } else {
        const complete = stageArtefacts.filter(a =>
          a.status === 'Approved' || a.custom_fields?.status === 'completed'
        ).length;
        completion[stageId] = Math.round((complete / stageArtefacts.length) * 100);
      }
    });
    return completion;
  }, [getArtefactsByStage]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value = useMemo(() => ({
    // Main project (from ProjectContext)
    activeProject,

    // PDS Projects (sub-projects)
    pdsProjects,
    activePdsProject,
    setActivePdsProject,
    createPdsProject,
    updatePdsProject,

    // Artefacts
    artefacts,
    relationships,
    stats,

    // UI state
    selectedId,
    setSelectedId,
    activeView,
    setActiveView,
    activeTool,
    setActiveTool,

    // Loading states
    loading,
    error,
    saving,
    setError,

    // Data operations
    refreshData,
    fetchPdsProjects,
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
    getRisks,
    getStakeholdersByQuadrant,
    getMilestones,
    getDeliverables,

    // Computed values
    projectHealth,
    stageCompletion,

    // Type utilities
    getTypeDefinition,
    isPDSType,
    getTypeColor,
    getStageForType,
    calculateProjectHealth,
    calculateRiskExposure,
    validateSRSReadiness,

    // Constants
    PDS_STAGES,
    PDS_STAGE_INFO,
    PDS_ALL_TYPES,
    PDS_TYPE_DEFS,
    PDS_RELATIONSHIP_TYPES,
    PDS_STATUS_VALUES,
    PDS_RISK_PROBABILITY,
    PDS_RISK_IMPACT,
    PDS_STAKEHOLDER_INFLUENCE,
    PDS_STAKEHOLDER_INTEREST,
    PDS_CHANGE_PRIORITY,
    PDS_CONFIDENCE_LEVELS,
  }), [
    activeProject,
    pdsProjects,
    activePdsProject,
    createPdsProject,
    updatePdsProject,
    artefacts,
    relationships,
    stats,
    selectedId,
    activeView,
    activeTool,
    loading,
    error,
    saving,
    refreshData,
    fetchPdsProjects,
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
    getRisks,
    getStakeholdersByQuadrant,
    getMilestones,
    getDeliverables,
    projectHealth,
    stageCompletion,
  ]);

  return (
    <PDSContext.Provider value={value}>
      {children}
    </PDSContext.Provider>
  );
}

export function usePDS() {
  const ctx = useContext(PDSContext);
  if (!ctx) throw new Error('usePDS must be used inside PDSProvider');
  return ctx;
}
