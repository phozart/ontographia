/**
 * EnterpriseContext - Enterprise Studio State Management
 *
 * Consolidates EA (Enterprise Architecture) + CAP (Capabilities) + Value Realization
 * into a unified domain-level view of "what we have, how it performs"
 *
 * @module components/spaces/enterprise/EnterpriseContext
 */

import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { useDomains } from '../../DomainContext';

const EnterpriseContext = createContext(null);

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Capability Types and Status Options
 */
export const CAPABILITY_STATUS = {
  active: { id: 'active', label: 'Active', color: '#5B8A6A' },
  developing: { id: 'developing', label: 'Developing', color: '#C9A227' },
  planned: { id: 'planned', label: 'Planned', color: '#9C9A94' },
  retiring: { id: 'retiring', label: 'Retiring', color: '#A54D4D' },
};

export const MATURITY_LEVELS = {
  1: { level: 1, label: 'Initial', description: 'Ad-hoc, reactive', color: '#A54D4D' },
  2: { level: 2, label: 'Developing', description: 'Repeatable, basic processes', color: '#C9A227' },
  3: { level: 3, label: 'Defined', description: 'Documented, standardized', color: '#47453F' },
  4: { level: 4, label: 'Managed', description: 'Measured, controlled', color: '#5B8A6A' },
  5: { level: 5, label: 'Optimizing', description: 'Continuous improvement', color: '#3b82f6' },
};

export const STRATEGIC_IMPORTANCE = {
  critical: { id: 'critical', label: 'Critical', color: '#A54D4D' },
  high: { id: 'high', label: 'High', color: '#C9A227' },
  medium: { id: 'medium', label: 'Medium', color: '#47453F' },
  low: { id: 'low', label: 'Low', color: '#9C9A94' },
};

export const INVESTMENT_PRIORITY = {
  invest: { id: 'invest', label: 'Invest', description: 'Actively growing', color: '#5B8A6A' },
  maintain: { id: 'maintain', label: 'Maintain', description: 'Keep current', color: '#47453F' },
  divest: { id: 'divest', label: 'Divest', description: 'Phase out', color: '#A54D4D' },
};

/**
 * Service Types
 */
export const SERVICE_TYPE = {
  internal: { id: 'internal', label: 'Internal', color: '#47453F' },
  external: { id: 'external', label: 'External', color: '#5B8A6A' },
  shared: { id: 'shared', label: 'Shared', color: '#3b82f6' },
};

export const SERVICE_STATUS = {
  active: { id: 'active', label: 'Active', color: '#5B8A6A' },
  retiring: { id: 'retiring', label: 'Retiring', color: '#C9A227' },
  planned: { id: 'planned', label: 'Planned', color: '#9C9A94' },
};

export const SERVICE_TIER = {
  critical: { id: 'critical', label: 'Critical', color: '#A54D4D' },
  standard: { id: 'standard', label: 'Standard', color: '#47453F' },
  basic: { id: 'basic', label: 'Basic', color: '#9C9A94' },
};

/**
 * Application Types
 */
export const APPLICATION_TYPE = {
  cots: { id: 'cots', label: 'COTS', description: 'Commercial Off-The-Shelf' },
  saas: { id: 'saas', label: 'SaaS', description: 'Software as a Service' },
  custom: { id: 'custom', label: 'Custom', description: 'Custom Built' },
  legacy: { id: 'legacy', label: 'Legacy', description: 'Legacy System' },
};

export const APPLICATION_STATUS = {
  production: { id: 'production', label: 'Production', color: '#5B8A6A' },
  development: { id: 'development', label: 'Development', color: '#3b82f6' },
  retiring: { id: 'retiring', label: 'Retiring', color: '#C9A227' },
  decommissioned: { id: 'decommissioned', label: 'Decommissioned', color: '#9C9A94' },
};

export const APPLICATION_TIER = {
  mission_critical: { id: 'mission_critical', label: 'Mission Critical', color: '#A54D4D' },
  business_essential: { id: 'business_essential', label: 'Business Essential', color: '#C9A227' },
  operational: { id: 'operational', label: 'Operational', color: '#47453F' },
  utility: { id: 'utility', label: 'Utility', color: '#9C9A94' },
};

/**
 * Technology Radar Rings
 */
export const RADAR_RINGS = {
  adopt: { id: 'adopt', label: 'Adopt', description: 'Use in production', order: 1, color: '#5B8A6A' },
  trial: { id: 'trial', label: 'Trial', description: 'Worth pursuing', order: 2, color: '#3b82f6' },
  assess: { id: 'assess', label: 'Assess', description: 'Explore with caution', order: 3, color: '#C9A227' },
  hold: { id: 'hold', label: 'Hold', description: 'Proceed with caution', order: 4, color: '#A54D4D' },
};

export const TECHNOLOGY_CATEGORIES = {
  languages: { id: 'languages', label: 'Languages & Frameworks' },
  platforms: { id: 'platforms', label: 'Platforms' },
  tools: { id: 'tools', label: 'Tools' },
  techniques: { id: 'techniques', label: 'Techniques' },
};

/**
 * Governance Types
 */
export const GOVERNANCE_TYPE = {
  policy: { id: 'policy', label: 'Policy', icon: '📋' },
  principle: { id: 'principle', label: 'Principle', icon: '⚖️' },
  standard: { id: 'standard', label: 'Standard', icon: '📐' },
  decision: { id: 'decision', label: 'Decision', icon: '✓' },
};

export const GOVERNANCE_STATUS = {
  active: { id: 'active', label: 'Active', color: '#5B8A6A' },
  draft: { id: 'draft', label: 'Draft', color: '#C9A227' },
  retired: { id: 'retired', label: 'Retired', color: '#9C9A94' },
};

/**
 * Risk Categories and Status
 */
export const RISK_CATEGORY = {
  strategic: { id: 'strategic', label: 'Strategic', color: '#8b5cf6' },
  operational: { id: 'operational', label: 'Operational', color: '#f59e0b' },
  financial: { id: 'financial', label: 'Financial', color: '#5B8A6A' },
  compliance: { id: 'compliance', label: 'Compliance', color: '#A54D4D' },
  technology: { id: 'technology', label: 'Technology', color: '#3b82f6' },
};

export const RISK_STATUS = {
  open: { id: 'open', label: 'Open', color: '#A54D4D' },
  mitigated: { id: 'mitigated', label: 'Mitigated', color: '#5B8A6A' },
  accepted: { id: 'accepted', label: 'Accepted', color: '#C9A227' },
  closed: { id: 'closed', label: 'Closed', color: '#9C9A94' },
};

/**
 * Benefit Types
 */
export const BENEFIT_TYPE = {
  financial: { id: 'financial', label: 'Financial', icon: '💰' },
  efficiency: { id: 'efficiency', label: 'Efficiency', icon: '⚡' },
  quality: { id: 'quality', label: 'Quality', icon: '✨' },
  strategic: { id: 'strategic', label: 'Strategic', icon: '🎯' },
  compliance: { id: 'compliance', label: 'Compliance', icon: '✓' },
};

export const BENEFIT_STATUS = {
  planned: { id: 'planned', label: 'Planned', color: '#9C9A94' },
  tracking: { id: 'tracking', label: 'Tracking', color: '#3b82f6' },
  realized: { id: 'realized', label: 'Realized', color: '#5B8A6A' },
  not_realized: { id: 'not_realized', label: 'Not Realized', color: '#A54D4D' },
};

/**
 * KPI Status
 */
export const KPI_STATUS = {
  green: { id: 'green', label: 'On Target', color: '#5B8A6A' },
  amber: { id: 'amber', label: 'At Risk', color: '#C9A227' },
  red: { id: 'red', label: 'Off Target', color: '#A54D4D' },
};

/**
 * Organisation Unit Types
 */
export const ORG_UNIT_TYPE = {
  division: { id: 'division', label: 'Division' },
  department: { id: 'department', label: 'Department' },
  team: { id: 'team', label: 'Team' },
  squad: { id: 'squad', label: 'Squad' },
  chapter: { id: 'chapter', label: 'Chapter' },
};

// ============================================================================
// ENTERPRISE MODULES
// ============================================================================

export const ENTERPRISE_MODULES = {
  overview: {
    id: 'overview',
    name: 'Overview',
    icon: '🏠',
    description: 'Enterprise dashboard',
    path: '/enterprise/',
  },
  capabilities: {
    id: 'capabilities',
    name: 'Capabilities',
    icon: '🎯',
    description: 'What the organisation can do',
    path: '/enterprise/capabilities/',
    color: '#f59e0b',
  },
  services: {
    id: 'services',
    name: 'Services',
    icon: '⚙️',
    description: 'What the organisation offers',
    path: '/enterprise/services/',
    color: '#3b82f6',
  },
  products: {
    id: 'products',
    name: 'Products',
    icon: '📦',
    description: 'Delivered products in operation',
    path: '/enterprise/products/',
    color: '#10b981',
  },
  landscape: {
    id: 'landscape',
    name: 'Landscape',
    icon: '💻',
    description: 'Application and technology landscape',
    path: '/enterprise/landscape/',
    color: '#8b5cf6',
  },
  technology: {
    id: 'technology',
    name: 'Technology',
    icon: '📡',
    description: 'Technology radar and standards',
    path: '/enterprise/technology/',
    color: '#06b6d4',
  },
  governance: {
    id: 'governance',
    name: 'Governance',
    icon: '⚖️',
    description: 'Policies, principles, decisions',
    path: '/enterprise/governance/',
    color: '#64748b',
  },
  risk: {
    id: 'risk',
    name: 'Risk',
    icon: '⚠️',
    description: 'Enterprise risk register',
    path: '/enterprise/risk/',
    color: '#A54D4D',
  },
  value: {
    id: 'value',
    name: 'Value',
    icon: '📈',
    description: 'Benefits and performance',
    path: '/enterprise/value/',
    color: '#5B8A6A',
  },
  organisation: {
    id: 'organisation',
    name: 'Organisation',
    icon: '👥',
    description: 'Structure, roles, responsibilities',
    path: '/enterprise/organisation/',
    color: '#f97316',
  },
  data: {
    id: 'data',
    name: 'Data Products',
    icon: '📦',
    description: 'Data mesh: products, contracts, domains',
    path: '/enterprise/data/',
    color: '#14b8a6',
  },
};

// ============================================================================
// PROVIDER
// ============================================================================

export function EnterpriseProvider({ children }) {
  const { user, role } = useAuth();
  const { activeDomain } = useDomains();

  // Auth headers
  const authHeaders = useMemo(() => ({
    'x-user': user || '',
    'x-role': role || '',
  }), [user, role]);

  // ============================================================================
  // STATE
  // ============================================================================

  // Data state - each module has its own data array
  const [capabilities, setCapabilities] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interfaces, setInterfaces] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [governance, setGovernance] = useState([]);
  const [risks, setRisks] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [orgUnits, setOrgUnits] = useState([]);
  const [roles, setRoles] = useState([]);

  // Data mesh state
  const [dataProducts, setDataProducts] = useState([]);
  const [dataContracts, setDataContracts] = useState([]);
  const [dataDomains, setDataDomains] = useState([]);

  // Relationships
  const [relationships, setRelationships] = useState([]);

  // UI state
  const [activeModule, setActiveModule] = useState('overview');
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Stats cache
  const [stats, setStats] = useState(null);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  /**
   * Fetch capabilities
   */
  const fetchCapabilities = useCallback(async () => {
    if (!user || !activeDomain) return;

    try {
      const res = await fetch(`/api/enterprise/capabilities?domainId=${activeDomain}`, {
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        setCapabilities(data.capabilities || data || []);
      }
    } catch (err) {
      console.error('Error fetching capabilities:', err);
    }
  }, [user, activeDomain, authHeaders]);

  /**
   * Fetch services
   */
  const fetchServices = useCallback(async () => {
    if (!user || !activeDomain) return;

    try {
      const res = await fetch(`/api/enterprise/services?domainId=${activeDomain}`, {
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || data || []);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  }, [user, activeDomain, authHeaders]);

  /**
   * Fetch products
   */
  const fetchProducts = useCallback(async () => {
    if (!user || !activeDomain) return;

    try {
      const res = await fetch(`/api/enterprise/products?domainId=${activeDomain}`, {
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || data || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  }, [user, activeDomain, authHeaders]);

  /**
   * Fetch applications
   */
  const fetchApplications = useCallback(async () => {
    if (!user || !activeDomain) return;

    try {
      const res = await fetch(`/api/enterprise/applications?domainId=${activeDomain}`, {
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || data || []);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  }, [user, activeDomain, authHeaders]);

  /**
   * Fetch technologies
   */
  const fetchTechnologies = useCallback(async () => {
    if (!user || !activeDomain) return;

    try {
      const res = await fetch(`/api/enterprise/technologies?domainId=${activeDomain}`, {
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        setTechnologies(data.technologies || data || []);
      }
    } catch (err) {
      console.error('Error fetching technologies:', err);
    }
  }, [user, activeDomain, authHeaders]);

  /**
   * Fetch governance items
   */
  const fetchGovernance = useCallback(async () => {
    if (!user || !activeDomain) return;

    try {
      const res = await fetch(`/api/enterprise/governance?domainId=${activeDomain}`, {
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        setGovernance(data.items || data || []);
      }
    } catch (err) {
      console.error('Error fetching governance:', err);
    }
  }, [user, activeDomain, authHeaders]);

  /**
   * Fetch risks
   */
  const fetchRisks = useCallback(async () => {
    if (!user || !activeDomain) return;

    try {
      const res = await fetch(`/api/enterprise/risks?domainId=${activeDomain}`, {
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        setRisks(data.risks || data || []);
      }
    } catch (err) {
      console.error('Error fetching risks:', err);
    }
  }, [user, activeDomain, authHeaders]);

  /**
   * Fetch benefits and KPIs
   */
  const fetchValue = useCallback(async () => {
    if (!user || !activeDomain) return;

    try {
      const [benefitsRes, kpisRes] = await Promise.all([
        fetch(`/api/enterprise/benefits?domainId=${activeDomain}`, { headers: authHeaders }),
        fetch(`/api/enterprise/kpis?domainId=${activeDomain}`, { headers: authHeaders }),
      ]);

      if (benefitsRes.ok) {
        const data = await benefitsRes.json();
        setBenefits(data.benefits || data || []);
      }

      if (kpisRes.ok) {
        const data = await kpisRes.json();
        setKpis(data.kpis || data || []);
      }
    } catch (err) {
      console.error('Error fetching value data:', err);
    }
  }, [user, activeDomain, authHeaders]);

  /**
   * Fetch organisation structure
   */
  const fetchOrganisation = useCallback(async () => {
    if (!user || !activeDomain) return;

    try {
      const [unitsRes, rolesRes] = await Promise.all([
        fetch(`/api/enterprise/org-units?domainId=${activeDomain}`, { headers: authHeaders }),
        fetch(`/api/enterprise/roles?domainId=${activeDomain}`, { headers: authHeaders }),
      ]);

      if (unitsRes.ok) {
        const data = await unitsRes.json();
        setOrgUnits(data.units || data || []);
      }

      if (rolesRes.ok) {
        const data = await rolesRes.json();
        setRoles(data.roles || data || []);
      }
    } catch (err) {
      console.error('Error fetching organisation data:', err);
    }
  }, [user, activeDomain, authHeaders]);

  /**
   * Fetch data products
   */
  const fetchDataProducts = useCallback(async () => {
    if (!user || !activeDomain) return;

    try {
      const res = await fetch(`/api/enterprise/data-products?domainId=${activeDomain}`, {
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        setDataProducts(data || []);
      }
    } catch (err) {
      console.error('Error fetching data products:', err);
    }
  }, [user, activeDomain, authHeaders]);

  /**
   * Fetch data contracts
   */
  const fetchDataContracts = useCallback(async () => {
    if (!user || !activeDomain) return;

    try {
      const res = await fetch(`/api/enterprise/data-contracts?domainId=${activeDomain}`, {
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        setDataContracts(data || []);
      }
    } catch (err) {
      console.error('Error fetching data contracts:', err);
    }
  }, [user, activeDomain, authHeaders]);

  /**
   * Fetch data domains
   */
  const fetchDataDomains = useCallback(async () => {
    if (!user || !activeDomain) return;

    try {
      const res = await fetch(`/api/enterprise/data-domains?domainId=${activeDomain}`, {
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        setDataDomains(data || []);
      }
    } catch (err) {
      console.error('Error fetching data domains:', err);
    }
  }, [user, activeDomain, authHeaders]);

  /**
   * Fetch all relationships
   */
  const fetchRelationships = useCallback(async () => {
    if (!user || !activeDomain) return;

    try {
      const res = await fetch(`/api/enterprise/relationships?domainId=${activeDomain}`, {
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        setRelationships(data.relationships || data || []);
      }
    } catch (err) {
      console.error('Error fetching relationships:', err);
    }
  }, [user, activeDomain, authHeaders]);

  /**
   * Fetch stats
   */
  const fetchStats = useCallback(async () => {
    if (!user || !activeDomain) return;

    try {
      const res = await fetch(`/api/enterprise/stats?domainId=${activeDomain}`, {
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [user, activeDomain, authHeaders]);

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async () => {
    if (!user || !activeDomain) return;

    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchCapabilities(),
        fetchServices(),
        fetchProducts(),
        fetchApplications(),
        fetchTechnologies(),
        fetchGovernance(),
        fetchRisks(),
        fetchValue(),
        fetchOrganisation(),
        fetchDataProducts(),
        fetchDataContracts(),
        fetchDataDomains(),
        fetchRelationships(),
        fetchStats(),
      ]);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to load enterprise data');
    } finally {
      setLoading(false);
    }
  }, [
    user, activeDomain,
    fetchCapabilities, fetchServices, fetchProducts, fetchApplications,
    fetchTechnologies, fetchGovernance, fetchRisks, fetchValue,
    fetchOrganisation, fetchDataProducts, fetchDataContracts, fetchDataDomains,
    fetchRelationships, fetchStats,
  ]);

  // Load data when domain changes
  useEffect(() => {
    if (user && activeDomain) {
      refreshData();
    } else {
      // Clear all data
      setCapabilities([]);
      setServices([]);
      setProducts([]);
      setApplications([]);
      setInterfaces([]);
      setTechnologies([]);
      setGovernance([]);
      setRisks([]);
      setBenefits([]);
      setKpis([]);
      setOrgUnits([]);
      setRoles([]);
      setDataProducts([]);
      setDataContracts([]);
      setDataDomains([]);
      setRelationships([]);
      setStats(null);
    }
  }, [user, activeDomain, refreshData]);

  // ============================================================================
  // CRUD OPERATIONS (Generic)
  // ============================================================================

  /**
   * Create an artefact
   */
  const createArtefact = useCallback(async (module, data) => {
    if (!activeDomain) {
      setError('No domain selected');
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/enterprise/${module}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          domainId: activeDomain,
          ...data,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Failed to create ${module} item`);
      }

      const newItem = await res.json();

      // Update appropriate state
      switch (module) {
        case 'capabilities':
          setCapabilities(prev => [newItem, ...prev]);
          break;
        case 'services':
          setServices(prev => [newItem, ...prev]);
          break;
        case 'products':
          setProducts(prev => [newItem, ...prev]);
          break;
        case 'applications':
          setApplications(prev => [newItem, ...prev]);
          break;
        case 'technologies':
          setTechnologies(prev => [newItem, ...prev]);
          break;
        case 'governance':
          setGovernance(prev => [newItem, ...prev]);
          break;
        case 'risks':
          setRisks(prev => [newItem, ...prev]);
          break;
        case 'benefits':
          setBenefits(prev => [newItem, ...prev]);
          break;
        case 'kpis':
          setKpis(prev => [newItem, ...prev]);
          break;
        case 'org-units':
          setOrgUnits(prev => [newItem, ...prev]);
          break;
        case 'roles':
          setRoles(prev => [newItem, ...prev]);
          break;
        case 'data-products':
          setDataProducts(prev => [newItem, ...prev]);
          break;
        case 'data-contracts':
          setDataContracts(prev => [newItem, ...prev]);
          break;
        case 'data-domains':
          setDataDomains(prev => [newItem, ...prev]);
          break;
      }

      // Refresh stats
      fetchStats();

      return newItem;
    } catch (err) {
      console.error(`Error creating ${module} item:`, err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [activeDomain, authHeaders, fetchStats]);

  /**
   * Update an artefact
   */
  const updateArtefact = useCallback(async (module, id, updates) => {
    if (!id) return null;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/enterprise/${module}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Failed to update ${module} item`);
      }

      const updated = await res.json();

      // Update appropriate state
      const updateState = (setter) => setter(prev => prev.map(item => item.id === id ? updated : item));

      switch (module) {
        case 'capabilities':
          updateState(setCapabilities);
          break;
        case 'services':
          updateState(setServices);
          break;
        case 'products':
          updateState(setProducts);
          break;
        case 'applications':
          updateState(setApplications);
          break;
        case 'technologies':
          updateState(setTechnologies);
          break;
        case 'governance':
          updateState(setGovernance);
          break;
        case 'risks':
          updateState(setRisks);
          break;
        case 'benefits':
          updateState(setBenefits);
          break;
        case 'kpis':
          updateState(setKpis);
          break;
        case 'org-units':
          updateState(setOrgUnits);
          break;
        case 'roles':
          updateState(setRoles);
          break;
        case 'data-products':
          updateState(setDataProducts);
          break;
        case 'data-contracts':
          updateState(setDataContracts);
          break;
        case 'data-domains':
          updateState(setDataDomains);
          break;
      }

      return updated;
    } catch (err) {
      console.error(`Error updating ${module} item:`, err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [authHeaders]);

  /**
   * Delete an artefact
   */
  const deleteArtefact = useCallback(async (module, id) => {
    if (!id) return false;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/enterprise/${module}/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Failed to delete ${module} item`);
      }

      // Update appropriate state
      const filterState = (setter) => setter(prev => prev.filter(item => item.id !== id));

      switch (module) {
        case 'capabilities':
          filterState(setCapabilities);
          break;
        case 'services':
          filterState(setServices);
          break;
        case 'products':
          filterState(setProducts);
          break;
        case 'applications':
          filterState(setApplications);
          break;
        case 'technologies':
          filterState(setTechnologies);
          break;
        case 'governance':
          filterState(setGovernance);
          break;
        case 'risks':
          filterState(setRisks);
          break;
        case 'benefits':
          filterState(setBenefits);
          break;
        case 'kpis':
          filterState(setKpis);
          break;
        case 'org-units':
          filterState(setOrgUnits);
          break;
        case 'roles':
          filterState(setRoles);
          break;
        case 'data-products':
          filterState(setDataProducts);
          break;
        case 'data-contracts':
          filterState(setDataContracts);
          break;
        case 'data-domains':
          filterState(setDataDomains);
          break;
      }

      // Clear selection if deleted
      if (selectedId === id) {
        setSelectedId(null);
      }

      // Also remove relationships involving this item
      setRelationships(prev => prev.filter(r =>
        r.source_id !== id && r.target_id !== id
      ));

      // Refresh stats
      fetchStats();

      return true;
    } catch (err) {
      console.error(`Error deleting ${module} item:`, err);
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [authHeaders, selectedId, fetchStats]);

  // ============================================================================
  // RELATIONSHIP OPERATIONS
  // ============================================================================

  /**
   * Create a relationship
   */
  const createRelationship = useCallback(async (sourceId, targetId, type, properties = {}) => {
    if (!sourceId || !targetId || !type) {
      setError('Missing relationship parameters');
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/enterprise/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          domainId: activeDomain,
          sourceId,
          targetId,
          type,
          ...properties,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create relationship');
      }

      const newRel = await res.json();
      setRelationships(prev => [...prev, newRel]);
      return newRel;
    } catch (err) {
      console.error('Error creating relationship:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [activeDomain, authHeaders]);

  /**
   * Delete a relationship
   */
  const deleteRelationship = useCallback(async (id) => {
    if (!id) return false;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/enterprise/relationships/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete relationship');
      }

      setRelationships(prev => prev.filter(r => r.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting relationship:', err);
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [authHeaders]);

  /**
   * Get relationships for an item
   */
  const getRelationships = useCallback((id, direction = 'both') => {
    return relationships.filter(rel => {
      if (direction === 'out') return rel.source_id === id;
      if (direction === 'in') return rel.target_id === id;
      return rel.source_id === id || rel.target_id === id;
    });
  }, [relationships]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * All items count
   */
  const totalItems = useMemo(() => {
    return capabilities.length +
      services.length +
      products.length +
      applications.length +
      technologies.length +
      governance.length +
      risks.length +
      benefits.length +
      kpis.length +
      orgUnits.length +
      roles.length +
      dataProducts.length +
      dataContracts.length +
      dataDomains.length;
  }, [
    capabilities, services, products, applications, technologies,
    governance, risks, benefits, kpis, orgUnits, roles,
    dataProducts, dataContracts, dataDomains,
  ]);

  /**
   * Computed stats (if not fetched from API)
   */
  const computedStats = useMemo(() => {
    if (stats) return stats;

    return {
      capabilities: capabilities.length,
      services: services.length,
      products: products.length,
      applications: applications.length,
      technologies: technologies.length,
      governance: governance.length,
      risks: risks.filter(r => r.status === 'open').length,
      risksTotal: risks.length,
      benefits: benefits.filter(b => b.status === 'realized').length,
      benefitsTotal: benefits.length,
      kpis: kpis.filter(k => k.status === 'green').length,
      kpisTotal: kpis.length,
      dataProducts: dataProducts.length,
      dataContracts: dataContracts.length,
      dataDomains: dataDomains.length,
      relationships: relationships.length,
    };
  }, [stats, capabilities, services, products, applications, technologies, governance, risks, benefits, kpis, dataProducts, dataContracts, dataDomains, relationships]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value = useMemo(() => ({
    // Data
    capabilities,
    services,
    products,
    applications,
    interfaces,
    technologies,
    governance,
    risks,
    benefits,
    kpis,
    orgUnits,
    roles,
    relationships,
    dataProducts,
    dataContracts,
    dataDomains,
    stats: computedStats,

    // UI State
    activeModule,
    setActiveModule,
    selectedId,
    setSelectedId,
    loading,
    error,
    saving,
    setError,

    // Data operations
    refreshData,
    fetchCapabilities,
    fetchServices,
    fetchProducts,
    fetchApplications,
    fetchTechnologies,
    fetchGovernance,
    fetchRisks,
    fetchValue,
    fetchOrganisation,
    fetchDataProducts,
    fetchDataContracts,
    fetchDataDomains,
    fetchRelationships,

    // CRUD
    createArtefact,
    updateArtefact,
    deleteArtefact,

    // Relationships
    createRelationship,
    deleteRelationship,
    getRelationships,

    // Stats
    totalItems,

    // Type definitions
    CAPABILITY_STATUS,
    MATURITY_LEVELS,
    STRATEGIC_IMPORTANCE,
    INVESTMENT_PRIORITY,
    SERVICE_TYPE,
    SERVICE_STATUS,
    SERVICE_TIER,
    APPLICATION_TYPE,
    APPLICATION_STATUS,
    APPLICATION_TIER,
    RADAR_RINGS,
    TECHNOLOGY_CATEGORIES,
    GOVERNANCE_TYPE,
    GOVERNANCE_STATUS,
    RISK_CATEGORY,
    RISK_STATUS,
    BENEFIT_TYPE,
    BENEFIT_STATUS,
    KPI_STATUS,
    ORG_UNIT_TYPE,
    ENTERPRISE_MODULES,
  }), [
    capabilities, services, products, applications, interfaces, technologies,
    governance, risks, benefits, kpis, orgUnits, roles, relationships,
    dataProducts, dataContracts, dataDomains, computedStats,
    activeModule, selectedId, loading, error, saving,
    refreshData, fetchCapabilities, fetchServices, fetchProducts, fetchApplications,
    fetchTechnologies, fetchGovernance, fetchRisks, fetchValue, fetchOrganisation,
    fetchDataProducts, fetchDataContracts, fetchDataDomains,
    fetchRelationships, createArtefact, updateArtefact, deleteArtefact,
    createRelationship, deleteRelationship, getRelationships, totalItems,
  ]);

  return (
    <EnterpriseContext.Provider value={value}>
      {children}
    </EnterpriseContext.Provider>
  );
}

/**
 * useEnterprise - Hook to access Enterprise Studio context
 */
export function useEnterprise() {
  const ctx = useContext(EnterpriseContext);
  if (!ctx) throw new Error('useEnterprise must be used inside EnterpriseProvider');
  return ctx;
}

export default EnterpriseContext;
