/**
 * PerfContext - State management for Performance and Outcomes Studio
 *
 * Provides centralized state and API interactions for OKRs, KPIs, metrics,
 * measurements, and performance tracking.
 *
 * @module components/perf/PerfContext
 */

import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../AuthContext';
import { useDomains } from '../DomainContext';

// Re-export type definitions for convenience
export {
  PERF_TYPE_DEFS,
  PERF_STAGES,
  PERF_WORKSPACE_MODULES,
  PERF_RELATIONSHIP_TYPES,
  PERF_OBJECTIVE_STATUS,
  PERF_OBJECTIVE_TYPE,
  PERF_KPI_CATEGORY,
  PERF_METRIC_TYPE,
  PERF_TREND,
  PERF_FREQUENCY,
  PERF_GUIDANCE,
  isPerfType,
  getTypeDefinition,
  getTypeColor,
  getStageForType,
  getTypesForStage,
  calculateObjectiveProgress,
  calculateKpiHealth,
} from '../../lib/perf-types';

const PerfContext = createContext(null);

/**
 * PerfProvider component
 */
export function PerfProvider({ children }) {
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
  const [objectiveHierarchy, setObjectiveHierarchy] = useState([]);
  const [kpiTree, setKpiTree] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all artefacts
  const fetchArtefacts = useCallback(async (options = {}) => {
    if (!user || !domainId) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ domainId, ...options });
      const res = await fetch(`/api/perf/artefacts?${params}`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('Perf artefacts API returned error status:', res.status);
        setArtefacts([]);
        return null;
      }
      const data = await res.json();
      setArtefacts(data.artefacts || []);
      return data;
    } catch (err) {
      console.error('Error fetching performance artefacts:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, domainId, authHeaders]);

  // Fetch objective hierarchy (OKR tree)
  const fetchObjectiveHierarchy = useCallback(async () => {
    if (!user || !domainId) return;
    try {
      const res = await fetch(`/api/perf/objectives?domainId=${domainId}&hierarchy=true`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('Perf objectives API returned error status:', res.status);
        setObjectiveHierarchy([]);
        return [];
      }
      const data = await res.json();
      setObjectiveHierarchy(data.hierarchy || []);
      return data.hierarchy;
    } catch (err) {
      console.error('Error fetching objective hierarchy:', err);
      setObjectiveHierarchy([]);
      return [];
    }
  }, [user, domainId, authHeaders]);

  // Fetch KPI tree
  const fetchKpiTree = useCallback(async () => {
    if (!user || !domainId) return;
    try {
      const res = await fetch(`/api/perf/kpis?domainId=${domainId}&tree=true`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('Perf KPIs API returned error status:', res.status);
        setKpiTree({ byCategory: {}, totalKpis: 0, totalMetrics: 0, orphanMetrics: [] });
        return null;
      }
      const data = await res.json();
      setKpiTree(data);
      return data;
    } catch (err) {
      console.error('Error fetching KPI tree:', err);
      setKpiTree({ byCategory: {}, totalKpis: 0, totalMetrics: 0, orphanMetrics: [] });
      return null;
    }
  }, [user, domainId, authHeaders]);

  // Fetch dashboard summary
  const fetchDashboard = useCallback(async () => {
    if (!user || !domainId) return;
    try {
      const res = await fetch(`/api/perf/dashboard?domainId=${domainId}`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('Perf dashboard API returned error status:', res.status);
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
      const res = await fetch(`/api/perf/stats?domainId=${domainId}`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('Perf stats API returned error status:', res.status);
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

  // Refresh all data
  const refreshAll = useCallback(async () => {
    if (!user || !domainId) return;
    setLoading(true);
    try {
      await Promise.all([
        fetchArtefacts(),
        fetchObjectiveHierarchy(),
        fetchKpiTree(),
        fetchDashboard(),
        fetchStats(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [user, domainId, fetchArtefacts, fetchObjectiveHierarchy, fetchKpiTree, fetchDashboard, fetchStats]);

  // CRUD operations
  const createArtefact = useCallback(async (data) => {
    if (!user || !domainId) return null;
    try {
      const res = await fetch('/api/perf/artefacts', {
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
      const res = await fetch(`/api/perf/artefacts/${id}`, {
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
      const res = await fetch(`/api/perf/artefacts/${id}`, {
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

  // Record measurement
  const recordMeasurement = useCallback(async (data) => {
    if (!user || !domainId) return null;
    try {
      const res = await fetch('/api/perf/measurements', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ ...data, domainId }),
      });
      if (!res.ok) throw new Error('Failed to record measurement');
      const measurement = await res.json();
      await refreshAll();
      return measurement;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [user, domainId, authHeaders, refreshAll]);

  // Get measurements for a KPI
  const getMeasurements = useCallback(async (kpiId, options = {}) => {
    if (!user) return { measurements: [], trend: null };
    try {
      const params = new URLSearchParams({ kpiId, ...options });
      const res = await fetch(`/api/perf/measurements?${params}`, { headers: authHeaders });
      if (!res.ok) throw new Error('Failed to fetch measurements');
      return await res.json();
    } catch (err) {
      console.error('Error fetching measurements:', err);
      return { measurements: [], trend: null };
    }
  }, [user, authHeaders]);

  // Load data when domain changes
  useEffect(() => {
    if (user && domainId) {
      refreshAll();
    }
  }, [user, domainId]);

  // Derived state
  const objectives = artefacts.filter(a => a.artefact_type === 'perf_objective');
  const keyResults = artefacts.filter(a => a.artefact_type === 'perf_key_result');
  const kpis = artefacts.filter(a => a.artefact_type === 'perf_kpi');
  const metrics = artefacts.filter(a => a.artefact_type === 'perf_metric');
  const targets = artefacts.filter(a => a.artefact_type === 'perf_target');
  const measurements = artefacts.filter(a => a.artefact_type === 'perf_measurement');
  const reviews = artefacts.filter(a => a.artefact_type === 'perf_review');
  const outcomes = artefacts.filter(a => a.artefact_type === 'perf_outcome');
  const insights = artefacts.filter(a => a.artefact_type === 'perf_insight');

  const value = {
    // State
    artefacts,
    objectives,
    keyResults,
    kpis,
    metrics,
    targets,
    measurements,
    reviews,
    outcomes,
    insights,
    objectiveHierarchy,
    kpiTree,
    dashboard,
    stats,
    loading,
    error,

    // Actions
    fetchArtefacts,
    fetchObjectiveHierarchy,
    fetchKpiTree,
    fetchDashboard,
    fetchStats,
    refreshAll,
    createArtefact,
    updateArtefact,
    deleteArtefact,
    recordMeasurement,
    getMeasurements,
  };

  return <PerfContext.Provider value={value}>{children}</PerfContext.Provider>;
}

/**
 * Hook to access Performance context
 */
export function usePerf() {
  const context = useContext(PerfContext);
  if (!context) {
    throw new Error('usePerf must be used within a PerfProvider');
  }
  return context;
}
