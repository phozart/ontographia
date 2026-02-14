// components/spaces/analysis/AnalysisContext.js
// Analysis Studio Context - Consolidates BA, Architecture, and UX/UI Design
// Links to Initiatives (upstream from Blueprint) and Projects (downstream to PDS)

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useDomains } from '../../DomainContext';
import { useProjects } from '../../ProjectContext';

// Import all type definitions from the canonical source
import {
  ANALYSIS_ARTEFACT_TYPES,
  ANALYSIS_STATUS,
  ANALYSIS_MODULES,
  ANALYSIS_PROJECT_TYPE,
  COMPLETENESS_RULES,
  ANALYSIS_METAMODEL,
  ANALYSIS_PROFILES,
  ANALYSIS_DISCIPLINES,
  ARTEFACT_PREFIX_MAP,
  getValidRelationships,
  validateMetamodelRelationship,
  checkCoverage,
  getActiveDisciplines,
  getActiveModules,
} from '../../../lib/analysis-types';

// Re-export BA concepts for compatibility
export { BA_CONCEPTS, DECOMPOSITION_PATHS, CONTEXTUAL_TIPS } from '../ba/BAContext';

// Re-export type definitions for consumers
export {
  ANALYSIS_ARTEFACT_TYPES,
  ANALYSIS_STATUS,
  ANALYSIS_MODULES,
  ANALYSIS_PROJECT_TYPE,
  COMPLETENESS_RULES,
  ANALYSIS_METAMODEL,
  ANALYSIS_PROFILES,
  ANALYSIS_DISCIPLINES,
};

// ============ CONTEXT IMPLEMENTATION ============
const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
  const { activeDomainObj } = useDomains();
  const { activeProject } = useProjects();

  // State
  const [analysisProjects, setAnalysisProjects] = useState([]);
  const [activeAnalysisProject, setActiveAnalysisProject] = useState(null);
  const [artefacts, setArtefacts] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active module for navigation
  const [activeModule, setActiveModule] = useState('requirements');

  // Load analysis projects
  const loadAnalysisProjects = useCallback(async () => {
    if (!activeDomainObj?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/analysis/projects?domain_id=${activeDomainObj.id}`);
      if (response.ok) {
        const data = await response.json();
        setAnalysisProjects(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading analysis projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeDomainObj?.id]);

  // Load artefacts for active project
  const loadArtefacts = useCallback(async () => {
    if (!activeAnalysisProject?.id) {
      setArtefacts([]);
      return;
    }

    try {
      const response = await fetch(`/api/analysis/artefacts?project_id=${activeAnalysisProject.id}`);
      if (response.ok) {
        const data = await response.json();
        setArtefacts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading artefacts:', err);
    }
  }, [activeAnalysisProject?.id]);

  // Load relationships
  const loadRelationships = useCallback(async () => {
    if (!activeAnalysisProject?.id) {
      setRelationships([]);
      return;
    }

    try {
      const response = await fetch(`/api/analysis/relationships?project_id=${activeAnalysisProject.id}`);
      if (response.ok) {
        const data = await response.json();
        setRelationships(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading relationships:', err);
    }
  }, [activeAnalysisProject?.id]);

  // Initial load
  useEffect(() => {
    loadAnalysisProjects();
  }, [loadAnalysisProjects]);

  useEffect(() => {
    loadArtefacts();
    loadRelationships();
  }, [loadArtefacts, loadRelationships]);

  // CRUD Operations
  const createAnalysisProject = useCallback(async (data) => {
    try {
      const response = await fetch('/api/analysis/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          domain_id: activeDomainObj?.id
        })
      });

      if (response.ok) {
        const newProject = await response.json();
        setAnalysisProjects(prev => [...prev, newProject]);
        return newProject;
      }
      throw new Error('Failed to create analysis project');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [activeDomainObj?.id]);

  const updateAnalysisProject = useCallback(async (id, data) => {
    try {
      const response = await fetch(`/api/analysis/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const updated = await response.json();
        setAnalysisProjects(prev => prev.map(p => p.id === id ? updated : p));
        if (activeAnalysisProject?.id === id) {
          setActiveAnalysisProject(updated);
        }
        return updated;
      }
      throw new Error('Failed to update analysis project');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [activeAnalysisProject?.id]);

  const deleteAnalysisProject = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/analysis/projects/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setAnalysisProjects(prev => prev.filter(p => p.id !== id));
        if (activeAnalysisProject?.id === id) {
          setActiveAnalysisProject(null);
        }
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [activeAnalysisProject?.id]);

  const createArtefact = useCallback(async (type, data) => {
    try {
      const response = await fetch('/api/analysis/artefacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          artefactType: type,
          project_id: activeAnalysisProject?.id,
          domain_id: activeDomainObj?.id
        })
      });

      if (response.ok) {
        const newArtefact = await response.json();
        setArtefacts(prev => [...prev, newArtefact]);
        return newArtefact;
      }
      throw new Error('Failed to create artefact');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [activeAnalysisProject?.id, activeDomainObj?.id]);

  const updateArtefact = useCallback(async (id, data) => {
    try {
      const response = await fetch(`/api/analysis/artefacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const updated = await response.json();
        setArtefacts(prev => prev.map(a => a.id === id ? updated : a));
        return updated;
      }
      throw new Error('Failed to update artefact');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteArtefact = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/analysis/artefacts/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setArtefacts(prev => prev.filter(a => a.id !== id));
        // Also remove related relationships
        setRelationships(prev => prev.filter(r => r.from !== id && r.to !== id));
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Create relationship
  const createRelationship = useCallback(async (data) => {
    try {
      const response = await fetch('/api/analysis/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const newRel = await response.json();
        setRelationships(prev => [...prev, newRel]);
        return newRel;
      }
      throw new Error('Failed to create relationship');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Delete relationship
  const deleteRelationship = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/analysis/relationships/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setRelationships(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Get artefacts by module
  const getArtefactsByModule = useCallback((moduleId) => {
    const module = ANALYSIS_MODULES[moduleId];
    if (!module) return [];
    return artefacts.filter(a => module.artefactTypes.includes(a.artefactType));
  }, [artefacts]);

  // Get artefacts by type
  const getArtefactsByType = useCallback((type) => {
    return artefacts.filter(a => a.artefactType === type);
  }, [artefacts]);

  // Get upstream trace (what this artefact depends on)
  const getUpstreamTrace = useCallback((artefactId) => {
    const result = [];
    const visited = new Set();

    const traverse = (id) => {
      if (visited.has(id)) return;
      visited.add(id);

      const incoming = relationships.filter(r => r.to === id);
      incoming.forEach(rel => {
        const source = artefacts.find(a => a.id === rel.from);
        if (source) {
          result.push({ artefact: source, relationship: rel });
          traverse(source.id);
        }
      });
    };

    traverse(artefactId);
    return result;
  }, [artefacts, relationships]);

  // Get downstream trace (what depends on this artefact)
  const getDownstreamTrace = useCallback((artefactId) => {
    const result = [];
    const visited = new Set();

    const traverse = (id) => {
      if (visited.has(id)) return;
      visited.add(id);

      const outgoing = relationships.filter(r => r.from === id);
      outgoing.forEach(rel => {
        const target = artefacts.find(a => a.id === rel.to);
        if (target) {
          result.push({ artefact: target, relationship: rel });
          traverse(target.id);
        }
      });
    };

    traverse(artefactId);
    return result;
  }, [artefacts, relationships]);

  // Calculate completeness score
  const calculateCompleteness = useCallback(() => {
    if (!activeAnalysisProject) return { score: 0, rules: [] };

    const results = COMPLETENESS_RULES.analysisProject.map(rule => ({
      ...rule,
      passed: rule.check(activeAnalysisProject, artefacts)
    }));

    const totalWeight = results.reduce((sum, r) => sum + r.weight, 0);
    const earnedWeight = results.filter(r => r.passed).reduce((sum, r) => sum + r.weight, 0);

    return {
      score: Math.round((earnedWeight / totalWeight) * 100),
      rules: results
    };
  }, [activeAnalysisProject, artefacts]);

  // Compute stats
  const stats = useMemo(() => {
    const byType = {};
    const byStatus = {};
    const byModule = {};

    artefacts.forEach(a => {
      // Count by type
      byType[a.artefactType] = (byType[a.artefactType] || 0) + 1;

      // Count by status
      byStatus[a.status] = (byStatus[a.status] || 0) + 1;

      // Count by module
      const typeInfo = ANALYSIS_ARTEFACT_TYPES[a.artefactType];
      if (typeInfo?.module) {
        byModule[typeInfo.module] = (byModule[typeInfo.module] || 0) + 1;
      }
    });

    return {
      total: artefacts.length,
      byType,
      byStatus,
      byModule,
      relationships: relationships.length
    };
  }, [artefacts, relationships]);

  const value = useMemo(() => ({
    // Data
    analysisProjects,
    activeAnalysisProject,
    artefacts,
    relationships,
    loading,
    error,
    stats,

    // Navigation
    activeModule,
    setActiveModule,

    // Project operations
    setActiveAnalysisProject,
    createAnalysisProject,
    updateAnalysisProject,
    deleteAnalysisProject,
    loadAnalysisProjects,

    // Artefact operations
    createArtefact,
    updateArtefact,
    deleteArtefact,
    getArtefactsByModule,
    getArtefactsByType,

    // Relationship operations
    createRelationship,
    deleteRelationship,
    getUpstreamTrace,
    getDownstreamTrace,

    // Analysis
    calculateCompleteness,

    // Type definitions
    artefactTypes: ANALYSIS_ARTEFACT_TYPES,
    modules: ANALYSIS_MODULES,
    statusConfig: ANALYSIS_STATUS,
    disciplines: ANALYSIS_DISCIPLINES,
    profiles: ANALYSIS_PROFILES,
    metamodel: ANALYSIS_METAMODEL,

    // Metamodel helpers
    validateRelationship: validateMetamodelRelationship,
    checkCoverage,
    getActiveDisciplines,
    getActiveModules,
  }), [
    analysisProjects, activeAnalysisProject, artefacts, relationships,
    loading, error, stats, activeModule,
    createAnalysisProject, updateAnalysisProject, deleteAnalysisProject,
    createArtefact, updateArtefact, deleteArtefact,
    createRelationship, deleteRelationship,
    getArtefactsByModule, getArtefactsByType,
    getUpstreamTrace, getDownstreamTrace,
    calculateCompleteness, loadAnalysisProjects
  ]);

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}

export default AnalysisContext;
