/**
 * GovContext - State management for Governance & Decision Design Studio
 *
 * Provides centralized state and API interactions for decision types,
 * decision rights, forums, policies, escalations, and accountabilities.
 *
 * @module components/gov/GovContext
 */

import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../AuthContext';
import { useDomains } from '../DomainContext';

// Re-export type definitions for convenience
export {
  GOV_TYPE_DEFS,
  GOV_STAGES,
  GOV_WORKSPACE_MODULES,
  GOV_RELATIONSHIP_TYPES,
  GOV_DECISION_SCOPE,
  GOV_RACI_TYPES,
  GOV_AUTHORITY_LEVELS,
  GOV_POLICY_STATUS,
  GOV_GUIDANCE,
  GOV_WIZARD_STEPS,
  isGovType,
  getTypeDefinition,
  getTypeColor,
  getStageForType,
  getTypesForStage,
  calculateGovernanceCoverage,
  buildGovernanceTree,
  buildDecisionRightsMatrix,
} from '../../lib/gov-types';

const GovContext = createContext(null);

/**
 * GovProvider component
 */
export function GovProvider({ children }) {
  const { user, role } = useAuth();
  const { activeDomain } = useDomains();
  const domainId = activeDomain;

  // Auth headers for API calls
  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    'x-user': user || '',
    'x-role': role || '',
  }), [user, role]);

  // State
  const [artefacts, setArtefacts] = useState([]);
  const [governanceStructure, setGovernanceStructure] = useState([]);
  const [policyHierarchy, setPolicyHierarchy] = useState([]);
  const [decisionMatrix, setDecisionMatrix] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [stats, setStats] = useState(null);
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeModule, setActiveModule] = useState('overview');
  const [activeView, setActiveView] = useState('list');
  const [selectedId, setSelectedId] = useState(null);

  // Fetch all artefacts
  const fetchArtefacts = useCallback(async (options = {}) => {
    if (!user || !domainId) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ domainId, ...options });
      const res = await fetch(`/api/gov/artefacts?${params}`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('Gov artefacts API returned error status:', res.status);
        setArtefacts([]);
        return null;
      }
      const data = await res.json();
      setArtefacts(data.artefacts || []);
      return data;
    } catch (err) {
      console.error('Error fetching governance artefacts:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, domainId, authHeaders]);

  // Fetch governance structure (forum hierarchy)
  const fetchGovernanceStructure = useCallback(async () => {
    if (!user || !domainId) return;
    try {
      const res = await fetch(`/api/gov/structure?domainId=${domainId}`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('Gov structure API returned error status:', res.status);
        setGovernanceStructure([]);
        return [];
      }
      const data = await res.json();
      setGovernanceStructure(data.structure || []);
      return data.structure;
    } catch (err) {
      console.error('Error fetching governance structure:', err);
      setGovernanceStructure([]);
      return [];
    }
  }, [user, domainId, authHeaders]);

  // Fetch policy hierarchy
  const fetchPolicyHierarchy = useCallback(async () => {
    if (!user || !domainId) return;
    try {
      const res = await fetch(`/api/gov/policies?domainId=${domainId}&hierarchy=true`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('Gov policies API returned error status:', res.status);
        setPolicyHierarchy([]);
        return [];
      }
      const data = await res.json();
      setPolicyHierarchy(data.hierarchy || []);
      return data.hierarchy;
    } catch (err) {
      console.error('Error fetching policy hierarchy:', err);
      setPolicyHierarchy([]);
      return [];
    }
  }, [user, domainId, authHeaders]);

  // Fetch decision rights matrix
  const fetchDecisionMatrix = useCallback(async () => {
    if (!user || !domainId) return;
    try {
      const res = await fetch(`/api/gov/matrix?domainId=${domainId}`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('Gov matrix API returned error status:', res.status);
        setDecisionMatrix({ rows: [], columns: [], cells: {} });
        return null;
      }
      const data = await res.json();
      setDecisionMatrix(data);
      return data;
    } catch (err) {
      console.error('Error fetching decision matrix:', err);
      setDecisionMatrix({ rows: [], columns: [], cells: {} });
      return null;
    }
  }, [user, domainId, authHeaders]);

  // Fetch dashboard summary
  const fetchDashboard = useCallback(async () => {
    if (!user || !domainId) return;
    try {
      const res = await fetch(`/api/gov/dashboard?domainId=${domainId}`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('Gov dashboard API returned error status:', res.status);
        return null;
      }
      const data = await res.json();
      setDashboard(data);
      return data;
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      return null;
    }
  }, [user, domainId, authHeaders]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    if (!user || !domainId) return;
    try {
      const res = await fetch(`/api/gov/stats?domainId=${domainId}`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('Gov stats API returned error status:', res.status);
        return null;
      }
      const data = await res.json();
      setStats(data);
      return data;
    } catch (err) {
      console.error('Error fetching stats:', err);
      return null;
    }
  }, [user, domainId, authHeaders]);

  // Fetch validation results
  const fetchValidation = useCallback(async () => {
    if (!user || !domainId) return;
    try {
      const res = await fetch(`/api/gov/validate?domainId=${domainId}`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('Gov validate API returned error status:', res.status);
        return null;
      }
      const data = await res.json();
      setValidation(data);
      return data;
    } catch (err) {
      console.error('Error fetching validation:', err);
      return null;
    }
  }, [user, domainId, authHeaders]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    if (!user || !domainId) return;
    setLoading(true);
    try {
      await Promise.all([
        fetchArtefacts(),
        fetchGovernanceStructure(),
        fetchPolicyHierarchy(),
        fetchDecisionMatrix(),
        fetchDashboard(),
        fetchStats(),
        fetchValidation(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [user, domainId, fetchArtefacts, fetchGovernanceStructure, fetchPolicyHierarchy, fetchDecisionMatrix, fetchDashboard, fetchStats, fetchValidation]);

  // CRUD operations
  const createArtefact = useCallback(async (data) => {
    if (!user || !domainId) return null;
    try {
      const res = await fetch('/api/gov/artefacts', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ ...data, domainId }),
      });
      if (!res.ok) throw new Error('Failed to create artefact');
      const artefact = await res.json();
      await refreshAll();
      return artefact;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [user, domainId, authHeaders, refreshAll]);

  const updateArtefact = useCallback(async (id, data) => {
    if (!user) return null;
    try {
      const res = await fetch(`/api/gov/artefacts/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update artefact');
      const artefact = await res.json();
      await refreshAll();
      return artefact;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [user, authHeaders, refreshAll]);

  const deleteArtefact = useCallback(async (id) => {
    if (!user) return false;
    try {
      const res = await fetch(`/api/gov/artefacts/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Failed to delete artefact');
      await refreshAll();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [user, authHeaders, refreshAll]);

  // Create relationship
  const createRelationship = useCallback(async (data) => {
    if (!user) return null;
    try {
      const res = await fetch('/api/gov/relationships', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create relationship');
      const relationship = await res.json();
      await refreshAll();
      return relationship;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [user, authHeaders, refreshAll]);

  // Load data when domain changes
  useEffect(() => {
    if (user && domainId) {
      refreshAll();
    }
  }, [user, domainId]);

  // Derived state - filter artefacts by type
  const decisionTypes = artefacts.filter(a => a.artefact_type === 'gov_decision_type');
  const decisionRights = artefacts.filter(a => a.artefact_type === 'gov_decision_right');
  const forums = artefacts.filter(a => a.artefact_type === 'gov_forum');
  const policies = artefacts.filter(a => a.artefact_type === 'gov_policy');
  const escalations = artefacts.filter(a => a.artefact_type === 'gov_escalation');
  const accountabilities = artefacts.filter(a => a.artefact_type === 'gov_accountability');
  const principles = artefacts.filter(a => a.artefact_type === 'gov_principle');

  // Get artefacts by module
  const getArtefactsByModule = useCallback((moduleId) => {
    const moduleTypes = {
      foundations: ['gov_principle', 'gov_decision_type'],
      rights: ['gov_decision_right', 'gov_accountability'],
      forums: ['gov_forum'],
      policies: ['gov_policy'],
      escalations: ['gov_escalation'],
    };
    const types = moduleTypes[moduleId] || [];
    return artefacts.filter(a => types.includes(a.artefact_type));
  }, [artefacts]);

  const value = {
    // State
    artefacts,
    decisionTypes,
    decisionRights,
    forums,
    policies,
    escalations,
    accountabilities,
    principles,
    governanceStructure,
    policyHierarchy,
    decisionMatrix,
    dashboard,
    stats,
    validation,
    loading,
    error,
    activeModule,
    setActiveModule,
    activeView,
    setActiveView,
    selectedId,
    setSelectedId,

    // Actions
    fetchArtefacts,
    fetchGovernanceStructure,
    fetchPolicyHierarchy,
    fetchDecisionMatrix,
    fetchDashboard,
    fetchStats,
    fetchValidation,
    refreshAll,
    createArtefact,
    updateArtefact,
    deleteArtefact,
    createRelationship,
    getArtefactsByModule,

    // Type definitions
    GOV_TYPE_DEFS: require('../../lib/gov-types').GOV_TYPE_DEFS,
  };

  return <GovContext.Provider value={value}>{children}</GovContext.Provider>;
}

/**
 * Hook to access Governance context
 */
export function useGov() {
  const context = useContext(GovContext);
  if (!context) {
    throw new Error('useGov must be used within a GovProvider');
  }
  return context;
}
