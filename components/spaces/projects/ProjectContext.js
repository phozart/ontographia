/**
 * ProjectContext.js
 *
 * State management for Project Studio.
 * Manages projects and their artefacts through the project lifecycle.
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useProjects } from '../../ProjectContext';
import { useDomains } from '../../DomainContext';
import {
  PROJECT_STAGES,
  PROJECT_STAGE_INFO,
  PROJECT_HEALTH,
  PROJECT_ARTEFACT_TYPES,
  calculateProjectHealth,
  calculateRiskScore,
  getArtefactTypesByStage,
} from '../../../lib/project-types';

const ProjectContext = createContext(null);

export function useProjectStudio() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectStudio must be used within a ProjectStudioProvider');
  }
  return context;
}

export function ProjectStudioProvider({ children }) {
  const { activeProject, projects } = useProjects();
  const { activeDomain } = useDomains();

  // State
  const [artefacts, setArtefacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [selectedArtefact, setSelectedArtefact] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Get the active project with full details
  const activeProjectDetail = useMemo(() => {
    if (!selectedProjectId && !activeProject) return null;
    const projectId = selectedProjectId || activeProject?.id;
    return projects.find(p => p.id === projectId) || activeProject;
  }, [selectedProjectId, activeProject, projects]);

  // Fetch artefacts for the active project
  const fetchArtefacts = useCallback(async () => {
    if (!activeProjectDetail?.id) {
      setArtefacts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${activeProjectDetail.id}/artefacts`);
      if (!response.ok) {
        throw new Error('Failed to fetch project artefacts');
      }
      const data = await response.json();
      setArtefacts(data.artefacts || []);
    } catch (err) {
      console.error('Error fetching project artefacts:', err);
      setError(err.message);
      setArtefacts([]);
    } finally {
      setLoading(false);
    }
  }, [activeProjectDetail?.id]);

  // Fetch artefacts when project changes
  useEffect(() => {
    fetchArtefacts();
  }, [fetchArtefacts]);

  // Create a new artefact
  const createArtefact = useCallback(async (artefactType, data) => {
    if (!activeProjectDetail?.id) {
      throw new Error('No active project selected');
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${activeProjectDetail.id}/artefacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artefact_type: artefactType,
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create artefact');
      }

      const result = await response.json();
      await fetchArtefacts();
      return result;
    } catch (err) {
      console.error('Error creating artefact:', err);
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [activeProjectDetail?.id, fetchArtefacts]);

  // Update an artefact
  const updateArtefact = useCallback(async (artefactId, data) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/artefacts/${artefactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update artefact');
      }

      const result = await response.json();
      await fetchArtefacts();
      return result;
    } catch (err) {
      console.error('Error updating artefact:', err);
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [fetchArtefacts]);

  // Delete an artefact
  const deleteArtefact = useCallback(async (artefactId) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/artefacts/${artefactId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete artefact');
      }

      await fetchArtefacts();
    } catch (err) {
      console.error('Error deleting artefact:', err);
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [fetchArtefacts]);

  // Update project status/stage
  const updateProjectStage = useCallback(async (newStage) => {
    if (!activeProjectDetail?.id) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${activeProjectDetail.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          custom_fields: {
            ...activeProjectDetail.custom_fields,
            stage: newStage,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project stage');
      }

      // Refresh the project data
      window.location.reload();
    } catch (err) {
      console.error('Error updating project stage:', err);
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [activeProjectDetail]);

  // Calculate statistics
  const stats = useMemo(() => {
    const byType = {};
    Object.keys(PROJECT_ARTEFACT_TYPES).forEach(typeId => {
      byType[typeId] = artefacts.filter(a => a.artefact_type === typeId).length;
    });

    const byStage = {};
    Object.values(PROJECT_STAGES).forEach(stageId => {
      const stageTypes = getArtefactTypesByStage(stageId).map(t => t.id);
      byStage[stageId] = artefacts.filter(a => stageTypes.includes(a.artefact_type)).length;
    });

    // RAID counts
    const openRisks = artefacts.filter(a => a.artefact_type === 'risk' && a.custom_fields?.status === 'open').length;
    const openIssues = artefacts.filter(a => a.artefact_type === 'issue' && a.custom_fields?.status === 'open').length;
    const activeAssumptions = artefacts.filter(a => a.artefact_type === 'assumption' && a.custom_fields?.status === 'unvalidated').length;
    const activeDependencies = artefacts.filter(a => a.artefact_type === 'dependency' && a.custom_fields?.status === 'active').length;

    return {
      total: artefacts.length,
      byType,
      byStage,
      openRisks,
      openIssues,
      activeAssumptions,
      activeDependencies,
      raidTotal: openRisks + openIssues + activeAssumptions + activeDependencies,
    };
  }, [artefacts]);

  // Get artefacts by type
  const getArtefactsByType = useCallback((typeId) => {
    return artefacts.filter(a => a.artefact_type === typeId);
  }, [artefacts]);

  // Get artefacts by stage
  const getArtefactsByStage = useCallback((stageId) => {
    const stageTypes = getArtefactTypesByStage(stageId).map(t => t.id);
    return artefacts.filter(a => stageTypes.includes(a.artefact_type));
  }, [artefacts]);

  // Get risks sorted by score
  const getRisksByScore = useCallback(() => {
    return artefacts
      .filter(a => a.artefact_type === 'risk')
      .map(risk => ({
        ...risk,
        score: calculateRiskScore(
          risk.custom_fields?.probability,
          risk.custom_fields?.impact
        ),
      }))
      .sort((a, b) => b.score - a.score);
  }, [artefacts]);

  // Get milestones sorted by date
  const getMilestonesByDate = useCallback(() => {
    return artefacts
      .filter(a => a.artefact_type === 'milestone')
      .sort((a, b) => {
        const dateA = new Date(a.custom_fields?.planned_date || 0);
        const dateB = new Date(b.custom_fields?.planned_date || 0);
        return dateA - dateB;
      });
  }, [artefacts]);

  // Get project health
  const projectHealth = useMemo(() => {
    return calculateProjectHealth(artefacts);
  }, [artefacts]);

  // Get current project stage
  const currentStage = useMemo(() => {
    const stage = activeProjectDetail?.custom_fields?.stage || PROJECT_STAGES.INITIATION;
    return PROJECT_STAGE_INFO[stage] || PROJECT_STAGE_INFO[PROJECT_STAGES.INITIATION];
  }, [activeProjectDetail]);

  // Context value
  const value = useMemo(() => ({
    // Project data
    activeProject: activeProjectDetail,
    projects,
    selectedProjectId,
    setSelectedProjectId,

    // Artefacts
    artefacts,
    loading,
    error,
    saving,

    // View state
    activeView,
    setActiveView,
    selectedArtefact,
    setSelectedArtefact,

    // CRUD operations
    createArtefact,
    updateArtefact,
    deleteArtefact,
    refreshData: fetchArtefacts,

    // Project operations
    updateProjectStage,
    currentStage,
    projectHealth,

    // Stats and queries
    stats,
    getArtefactsByType,
    getArtefactsByStage,
    getRisksByScore,
    getMilestonesByDate,

    // Type definitions
    PROJECT_STAGES,
    PROJECT_STAGE_INFO,
    PROJECT_HEALTH,
    PROJECT_ARTEFACT_TYPES,
  }), [
    activeProjectDetail,
    projects,
    selectedProjectId,
    artefacts,
    loading,
    error,
    saving,
    activeView,
    selectedArtefact,
    createArtefact,
    updateArtefact,
    deleteArtefact,
    fetchArtefacts,
    updateProjectStage,
    currentStage,
    projectHealth,
    stats,
    getArtefactsByType,
    getArtefactsByStage,
    getRisksByScore,
    getMilestonesByDate,
  ]);

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export default ProjectContext;
