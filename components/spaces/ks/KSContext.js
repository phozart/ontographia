// components/spaces/ks/KSContext.js
// State management for Knowledge Studio

import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../../AuthContext';
import { useDomains } from '../../DomainContext';

const KSContext = createContext(null);

// View configuration for Knowledge Studio
export const KS_VIEWS = {
  overview: { id: 'overview', label: 'Overview', description: 'Knowledge Studio dashboard' },
  navigator: { id: 'navigator', label: 'Graph Navigator', description: 'Visual graph exploration' },
  browser: { id: 'browser', label: 'Model Browser', description: 'Browse semantic model' },
  nodes: { id: 'nodes', label: 'Nodes', description: 'Manage graph nodes' },
  'node-types': { id: 'node-types', label: 'Node Types', description: 'Define node schemas' },
  relationships: { id: 'relationships', label: 'Relationships', description: 'Manage connections' },
  'relationship-types': { id: 'relationship-types', label: 'Relationship Types', description: 'Define relationship schemas' },
};

export function KSProvider({ children }) {
  const { user } = useAuth();
  const { activeDomain, activeDomainObj } = useDomains();

  // Core data state
  const [nodes, setNodes] = useState([]);
  const [nodeTypes, setNodeTypes] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [relationshipTypes, setRelationshipTypes] = useState([]);

  // UI state
  const [activeView, setActiveView] = useState('navigator');
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedRelationship, setSelectedRelationship] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    nodeCount: 0,
    nodeTypeCount: 0,
    relationshipCount: 0,
    relationshipTypeCount: 0,
  });

  // API headers
  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-user': user || '',
    'x-role': 'admin',
  }), [user]);

  // Fetch node types
  const fetchNodeTypes = useCallback(async () => {
    if (!user) return;
    try {
      const params = new URLSearchParams();
      if (activeDomain) params.append('domainId', activeDomain);
      const res = await fetch(`/api/node-types?${params}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setNodeTypes(data);
        setStats(prev => ({ ...prev, nodeTypeCount: data.length }));
      }
    } catch (err) {
      console.error('Error fetching node types:', err);
    }
  }, [user, activeDomain, getHeaders]);

  // Fetch relationship types
  const fetchRelationshipTypes = useCallback(async () => {
    if (!user) return;
    try {
      const params = new URLSearchParams();
      if (activeDomain) params.append('domainId', activeDomain);
      const res = await fetch(`/api/relationship-types?${params}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setRelationshipTypes(data);
        setStats(prev => ({ ...prev, relationshipTypeCount: data.length }));
      }
    } catch (err) {
      console.error('Error fetching relationship types:', err);
    }
  }, [user, activeDomain, getHeaders]);

  // Fetch stats/counts
  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      const params = new URLSearchParams();
      if (activeDomain) params.append('domainId', activeDomain);

      // Fetch counts in parallel
      const [nodesRes, relsRes] = await Promise.all([
        fetch(`/api/nodes?${params}&count=true`, { headers: getHeaders() }),
        fetch(`/api/relationships?${params}&count=true`, { headers: getHeaders() }),
      ]);

      if (nodesRes.ok) {
        const data = await nodesRes.json();
        setStats(prev => ({ ...prev, nodeCount: data.count || data.length || 0 }));
      }
      if (relsRes.ok) {
        const data = await relsRes.json();
        setStats(prev => ({ ...prev, relationshipCount: data.count || data.length || 0 }));
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [user, activeDomain, getHeaders]);

  // Initialize data on mount and domain change
  useEffect(() => {
    if (user) {
      fetchNodeTypes();
      fetchRelationshipTypes();
      fetchStats();
    }
  }, [user, activeDomain, fetchNodeTypes, fetchRelationshipTypes, fetchStats]);

  // Get current domain display ID
  const currentDomainId = useMemo(() => {
    if (activeDomainObj?.display_id) return activeDomainObj.display_id;
    if (activeDomainObj?.displayId) return activeDomainObj.displayId;
    return null;
  }, [activeDomainObj]);

  // Refresh all data
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchNodeTypes(),
        fetchRelationshipTypes(),
        fetchStats(),
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchNodeTypes, fetchRelationshipTypes, fetchStats]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedNode(null);
    setSelectedRelationship(null);
  }, []);

  const value = {
    // Data
    nodes,
    nodeTypes,
    relationships,
    relationshipTypes,
    stats,

    // UI State
    activeView,
    selectedNode,
    selectedRelationship,
    isLoading,
    error,
    currentDomainId,

    // Setters
    setActiveView,
    setSelectedNode,
    setSelectedRelationship,
    setNodes,
    setRelationships,

    // Actions
    refresh,
    fetchNodeTypes,
    fetchRelationshipTypes,
    fetchStats,
    clearSelection,

    // Config
    views: KS_VIEWS,
    getViewConfig: () => KS_VIEWS[activeView],
  };

  return (
    <KSContext.Provider value={value}>
      {children}
    </KSContext.Provider>
  );
}

export function useKS() {
  const context = useContext(KSContext);
  if (!context) {
    throw new Error('useKS must be used within a KSProvider');
  }
  return context;
}
