/**
 * Risk and Resilience Context
 *
 * Provides state management for the Risk & Resilience Studio.
 *
 * @module RiskContext
 */

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { useDomains } from '../DomainContext';

const RiskContext = createContext(null);

/**
 * Risk Provider component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function RiskProvider({ children }) {
  const { user, role } = useAuth();
  const { activeDomain } = useDomains();
  const domainId = activeDomain;

  const [artefacts, setArtefacts] = useState([]);
  const [stats, setStats] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auth headers for API calls
  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    'x-user': user || '',
    'x-role': role || '',
  }), [user, role]);

  // Fetch all artefacts
  const fetchArtefacts = useCallback(async () => {
    if (!user || !domainId) return;

    try {
      const res = await fetch(`/api/risk/artefacts?domainId=${domainId}`, {
        headers: authHeaders,
      });

      if (!res.ok) {
        console.warn('[RiskContext] Artefacts API returned error status:', res.status);
        setArtefacts([]);
        return;
      }

      const data = await res.json();
      setArtefacts(data.artefacts || []);
    } catch (err) {
      console.error('[RiskContext] Fetch error:', err);
      setError(err.message);
    }
  }, [user, domainId, authHeaders]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!user || !domainId) return;

    try {
      const res = await fetch(`/api/risk/stats?domainId=${domainId}`, {
        headers: authHeaders,
      });

      if (!res.ok) {
        console.warn('[RiskContext] Stats API returned error status:', res.status);
        return;
      }

      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('[RiskContext] Stats error:', err);
    }
  }, [user, domainId, authHeaders]);

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    if (!user || !domainId) return;

    try {
      const res = await fetch(`/api/risk/dashboard?domainId=${domainId}`, {
        headers: authHeaders,
      });

      if (!res.ok) {
        console.warn('[RiskContext] Dashboard API returned error status:', res.status);
        return;
      }

      const data = await res.json();
      setDashboard(data);
    } catch (err) {
      console.error('[RiskContext] Dashboard error:', err);
    }
  }, [user, domainId, authHeaders]);

  // Initial load
  useEffect(() => {
    if (user && domainId) {
      setLoading(true);
      Promise.all([fetchArtefacts(), fetchStats(), fetchDashboard()])
        .finally(() => setLoading(false));
    }
  }, [user, domainId, fetchArtefacts, fetchStats, fetchDashboard]);

  // Create artefact
  const createArtefact = useCallback(async (data) => {
    const res = await fetch('/api/risk/artefacts', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ ...data, domainId }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create');
    }

    const newArtefact = await res.json();
    setArtefacts(prev => [...prev, newArtefact]);

    // Refresh stats
    fetchStats();
    fetchDashboard();

    return newArtefact;
  }, [domainId, authHeaders, fetchStats, fetchDashboard]);

  // Update artefact
  const updateArtefact = useCallback(async (id, data) => {
    const res = await fetch(`/api/risk/artefacts/${id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to update');
    }

    const updated = await res.json();
    setArtefacts(prev => prev.map(a => a.id === id ? updated : a));

    // Refresh stats
    fetchStats();
    fetchDashboard();

    return updated;
  }, [authHeaders, fetchStats, fetchDashboard]);

  // Delete artefact
  const deleteArtefact = useCallback(async (id) => {
    const res = await fetch(`/api/risk/artefacts/${id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to delete');
    }

    setArtefacts(prev => prev.filter(a => a.id !== id));

    // Refresh stats
    fetchStats();
    fetchDashboard();
  }, [authHeaders, fetchStats, fetchDashboard]);

  // Filter artefacts by type
  const getByType = useCallback((type) => {
    return artefacts.filter(a => a.type === type);
  }, [artefacts]);

  // Get artefact by ID
  const getById = useCallback((id) => {
    return artefacts.find(a => a.id === id);
  }, [artefacts]);

  // Refetch all data
  const refetch = useCallback(() => {
    setLoading(true);
    Promise.all([fetchArtefacts(), fetchStats(), fetchDashboard()])
      .finally(() => setLoading(false));
  }, [fetchArtefacts, fetchStats, fetchDashboard]);

  const value = useMemo(() => ({
    artefacts,
    stats,
    dashboard,
    loading,
    error,
    createArtefact,
    updateArtefact,
    deleteArtefact,
    getByType,
    getById,
    refetch,
    // Convenience getters
    risks: artefacts.filter(a => a.type === 'risk_risk'),
    controls: artefacts.filter(a => a.type === 'risk_control'),
    scenarios: artefacts.filter(a => a.type === 'risk_scenario'),
    resilience: artefacts.filter(a => a.type === 'risk_resilience'),
    assessments: artefacts.filter(a => a.type === 'risk_assessment'),
  }), [
    artefacts, stats, dashboard, loading, error,
    createArtefact, updateArtefact, deleteArtefact,
    getByType, getById, refetch,
  ]);

  return (
    <RiskContext.Provider value={value}>
      {children}
    </RiskContext.Provider>
  );
}

/**
 * Hook to use risk context
 * @returns {Object} Risk context value
 * @throws {Error} If used outside of RiskProvider
 */
export function useRisk() {
  const context = useContext(RiskContext);
  if (!context) {
    throw new Error('useRisk must be used within RiskProvider');
  }
  return context;
}
