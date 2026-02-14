// components/spaces/gtm/GTMContext.js
// GTM Studio Context - Go-to-Market Planning State Management
// Links to services/products in Enterprise Studio

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useDomains } from '../../DomainContext';

// ============ GTM PLAN STAGES ============
export const GTM_STAGES = {
  draft: { id: 'draft', name: 'Draft', color: '#9ca3af', description: 'Initial capture' },
  planning: { id: 'planning', name: 'Planning', color: '#3b82f6', description: 'Developing strategy' },
  ready: { id: 'ready', name: 'Ready', color: '#f59e0b', description: 'Launch preparation complete' },
  active: { id: 'active', name: 'Active', color: '#10b981', description: 'In-market execution' },
  complete: { id: 'complete', name: 'Complete', color: '#8b5cf6', description: 'Post-launch review done' }
};

// ============ GTM ARTEFACT TYPES ============
export const GTM_ARTEFACT_TYPES = {
  // Core
  GTMPlan: {
    id: 'GTMPlan',
    name: 'GTM Plan',
    prefix: 'GTM',
    color: '#ec4899', // Coral
    icon: '📈',
    module: 'plan'
  },
  // Strategy
  Segment: {
    id: 'Segment',
    name: 'Market Segment',
    prefix: 'SEG',
    color: '#8b5cf6',
    icon: '🎯',
    module: 'strategy'
  },
  PricingStrategy: {
    id: 'PricingStrategy',
    name: 'Pricing Strategy',
    prefix: 'PRC',
    color: '#a78bfa',
    icon: '💰',
    module: 'strategy'
  },
  // Messaging
  KeyMessage: {
    id: 'KeyMessage',
    name: 'Key Message',
    prefix: 'MSG',
    color: '#06b6d4',
    icon: '💬',
    module: 'messaging'
  },
  ProofPoint: {
    id: 'ProofPoint',
    name: 'Proof Point',
    prefix: 'PRF',
    color: '#22d3ee',
    icon: '✓',
    module: 'messaging'
  },
  Objection: {
    id: 'Objection',
    name: 'Objection Handler',
    prefix: 'OBJ',
    color: '#67e8f9',
    icon: '🛡️',
    module: 'messaging'
  },
  // Channels & Campaigns
  Channel: {
    id: 'Channel',
    name: 'Channel',
    prefix: 'CH',
    color: '#f59e0b',
    icon: '📡',
    module: 'campaigns'
  },
  Campaign: {
    id: 'Campaign',
    name: 'Campaign',
    prefix: 'CAMP',
    color: '#fbbf24',
    icon: '📣',
    module: 'campaigns'
  },
  // Launch
  Milestone: {
    id: 'Milestone',
    name: 'Milestone',
    prefix: 'MS',
    color: '#10b981',
    icon: '🏁',
    module: 'launch'
  },
  ReadinessItem: {
    id: 'ReadinessItem',
    name: 'Readiness Item',
    prefix: 'RDY',
    color: '#34d399',
    icon: '✅',
    module: 'launch'
  },
  // Enablement
  Material: {
    id: 'Material',
    name: 'Sales Material',
    prefix: 'MAT',
    color: '#ec4899',
    icon: '📄',
    module: 'enablement'
  },
  Training: {
    id: 'Training',
    name: 'Training',
    prefix: 'TRN',
    color: '#f472b6',
    icon: '🎓',
    module: 'enablement'
  },
  // Metrics
  Metric: {
    id: 'Metric',
    name: 'Metric',
    prefix: 'MTR',
    color: '#64748b',
    icon: '📊',
    module: 'metrics'
  },
  Target: {
    id: 'Target',
    name: 'Target',
    prefix: 'TGT',
    color: '#94a3b8',
    icon: '🎯',
    module: 'metrics'
  }
};

// ============ GTM MODULES ============
export const GTM_MODULES = {
  plan: {
    id: 'plan',
    name: 'Overview',
    description: 'GTM plan summary and status',
    icon: '📋',
    color: '#ec4899',
    artefactTypes: ['GTMPlan']
  },
  strategy: {
    id: 'strategy',
    name: 'Strategy',
    description: 'Positioning, segmentation, and pricing',
    icon: '🎯',
    color: '#8b5cf6',
    artefactTypes: ['Segment', 'PricingStrategy']
  },
  messaging: {
    id: 'messaging',
    name: 'Messaging',
    description: 'Message house, proof points, objection handling',
    icon: '💬',
    color: '#06b6d4',
    artefactTypes: ['KeyMessage', 'ProofPoint', 'Objection']
  },
  launch: {
    id: 'launch',
    name: 'Launch',
    description: 'Launch readiness and milestones',
    icon: '🚀',
    color: '#10b981',
    artefactTypes: ['Milestone', 'ReadinessItem']
  },
  campaigns: {
    id: 'campaigns',
    name: 'Campaigns',
    description: 'Campaign planning and channels',
    icon: '📣',
    color: '#f59e0b',
    artefactTypes: ['Campaign', 'Channel']
  },
  enablement: {
    id: 'enablement',
    name: 'Enablement',
    description: 'Sales materials and training',
    icon: '📚',
    color: '#ec4899',
    artefactTypes: ['Material', 'Training']
  },
  metrics: {
    id: 'metrics',
    name: 'Metrics',
    description: 'Performance tracking and targets',
    icon: '📊',
    color: '#64748b',
    artefactTypes: ['Metric', 'Target']
  }
};

// ============ CAMPAIGN TYPES ============
export const CAMPAIGN_TYPES = {
  awareness: { id: 'awareness', name: 'Awareness', color: '#3b82f6' },
  acquisition: { id: 'acquisition', name: 'Acquisition', color: '#10b981' },
  activation: { id: 'activation', name: 'Activation', color: '#f59e0b' },
  retention: { id: 'retention', name: 'Retention', color: '#8b5cf6' },
  referral: { id: 'referral', name: 'Referral', color: '#ec4899' }
};

// ============ LAUNCH TYPES ============
export const LAUNCH_TYPES = {
  big_bang: { id: 'big_bang', name: 'Big Bang', description: 'Full launch at once' },
  phased: { id: 'phased', name: 'Phased', description: 'Rolling launch by segment/region' },
  soft: { id: 'soft', name: 'Soft Launch', description: 'Limited availability before main launch' },
  beta: { id: 'beta', name: 'Beta', description: 'Testing with early adopters' }
};

// ============ PRICING MODELS ============
export const PRICING_MODELS = {
  subscription: { id: 'subscription', name: 'Subscription' },
  usage: { id: 'usage', name: 'Usage-Based' },
  tiered: { id: 'tiered', name: 'Tiered' },
  freemium: { id: 'freemium', name: 'Freemium' },
  perpetual: { id: 'perpetual', name: 'Perpetual License' },
  custom: { id: 'custom', name: 'Custom' }
};

// ============ MATERIAL TYPES ============
export const MATERIAL_TYPES = {
  presentation: { id: 'presentation', name: 'Presentation', icon: '📊' },
  datasheet: { id: 'datasheet', name: 'Data Sheet', icon: '📋' },
  case_study: { id: 'case_study', name: 'Case Study', icon: '📖' },
  demo: { id: 'demo', name: 'Demo', icon: '💻' },
  video: { id: 'video', name: 'Video', icon: '🎬' },
  faq: { id: 'faq', name: 'FAQ', icon: '❓' }
};

// ============ READINESS DIMENSIONS ============
export const READINESS_DIMENSIONS = [
  { id: 'product', name: 'Product', criteria: ['Product complete', 'Documentation ready', 'Known issues documented'] },
  { id: 'sales', name: 'Sales', criteria: ['Pricing approved', 'Sales team trained', 'Materials ready'] },
  { id: 'marketing', name: 'Marketing', criteria: ['Website updated', 'Campaigns ready', 'PR prepared'] },
  { id: 'support', name: 'Support', criteria: ['Support team trained', 'Knowledge base updated', 'Escalation paths defined'] },
  { id: 'operations', name: 'Operations', criteria: ['Provisioning ready', 'Billing configured', 'SLAs defined'] }
];

// ============ COMPLETENESS RULES ============
export const GTM_COMPLETENESS_RULES = {
  gtmPlan: [
    { id: 'hasValueProp', check: (p) => !!p.strategy?.value_proposition, weight: 15, message: 'Define value proposition' },
    { id: 'hasSegments', check: (p, a) => a.filter(x => x.artefactType === 'Segment').length > 0, weight: 15, message: 'Define target segments' },
    { id: 'hasPricing', check: (p, a) => a.filter(x => x.artefactType === 'PricingStrategy').length > 0, weight: 10, message: 'Define pricing strategy' },
    { id: 'hasMessages', check: (p, a) => a.filter(x => x.artefactType === 'KeyMessage').length > 0, weight: 15, message: 'Define key messages' },
    { id: 'hasCampaigns', check: (p, a) => a.filter(x => x.artefactType === 'Campaign').length > 0, weight: 10, message: 'Create campaigns' },
    { id: 'hasMaterials', check: (p, a) => a.filter(x => x.artefactType === 'Material').length > 0, weight: 10, message: 'Prepare sales materials' },
    { id: 'hasLaunchDate', check: (p) => !!p.launch?.launch_date, weight: 10, message: 'Set launch date' },
    { id: 'hasReadiness', check: (p, a) => a.filter(x => x.artefactType === 'ReadinessItem').length > 0, weight: 10, message: 'Track launch readiness' },
    { id: 'hasMetrics', check: (p, a) => a.filter(x => x.artefactType === 'Target').length > 0, weight: 5, message: 'Define success metrics' }
  ]
};

// ============ CONTEXT IMPLEMENTATION ============
const GTMContext = createContext(null);

export function GTMProvider({ children }) {
  const { activeDomainObj } = useDomains();

  // State
  const [gtmPlans, setGTMPlans] = useState([]);
  const [activeGTMPlan, setActiveGTMPlan] = useState(null);
  const [artefacts, setArtefacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active module for navigation
  const [activeModule, setActiveModule] = useState('plan');

  // Load GTM plans
  const loadGTMPlans = useCallback(async () => {
    if (!activeDomainObj?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/gtm/plans?domain_id=${activeDomainObj.id}`);
      if (response.ok) {
        const data = await response.json();
        setGTMPlans(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading GTM plans:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeDomainObj?.id]);

  // Load artefacts for active plan
  const loadArtefacts = useCallback(async () => {
    if (!activeGTMPlan?.id) {
      setArtefacts([]);
      return;
    }

    try {
      const response = await fetch(`/api/gtm/artefacts?plan_id=${activeGTMPlan.id}`);
      if (response.ok) {
        const data = await response.json();
        setArtefacts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading artefacts:', err);
    }
  }, [activeGTMPlan?.id]);

  // Initial load
  useEffect(() => {
    loadGTMPlans();
  }, [loadGTMPlans]);

  useEffect(() => {
    loadArtefacts();
  }, [loadArtefacts]);

  // CRUD Operations
  const createGTMPlan = useCallback(async (data) => {
    try {
      const response = await fetch('/api/gtm/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          domain_id: activeDomainObj?.id,
          status: 'draft'
        })
      });

      if (response.ok) {
        const newPlan = await response.json();
        setGTMPlans(prev => [...prev, newPlan]);
        return newPlan;
      }
      throw new Error('Failed to create GTM plan');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [activeDomainObj?.id]);

  const updateGTMPlan = useCallback(async (id, data) => {
    try {
      const response = await fetch(`/api/gtm/plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const updated = await response.json();
        setGTMPlans(prev => prev.map(p => p.id === id ? updated : p));
        if (activeGTMPlan?.id === id) {
          setActiveGTMPlan(updated);
        }
        return updated;
      }
      throw new Error('Failed to update GTM plan');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [activeGTMPlan?.id]);

  const deleteGTMPlan = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/gtm/plans/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setGTMPlans(prev => prev.filter(p => p.id !== id));
        if (activeGTMPlan?.id === id) {
          setActiveGTMPlan(null);
        }
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [activeGTMPlan?.id]);

  const createArtefact = useCallback(async (type, data) => {
    try {
      const response = await fetch('/api/gtm/artefacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          artefactType: type,
          plan_id: activeGTMPlan?.id,
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
  }, [activeGTMPlan?.id, activeDomainObj?.id]);

  const updateArtefact = useCallback(async (id, data) => {
    try {
      const response = await fetch(`/api/gtm/artefacts/${id}`, {
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
      const response = await fetch(`/api/gtm/artefacts/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setArtefacts(prev => prev.filter(a => a.id !== id));
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Get artefacts by module
  const getArtefactsByModule = useCallback((moduleId) => {
    const module = GTM_MODULES[moduleId];
    if (!module) return [];
    return artefacts.filter(a => module.artefactTypes.includes(a.artefactType));
  }, [artefacts]);

  // Get artefacts by type
  const getArtefactsByType = useCallback((type) => {
    return artefacts.filter(a => a.artefactType === type);
  }, [artefacts]);

  // Calculate readiness status
  const calculateReadiness = useCallback(() => {
    const readinessItems = artefacts.filter(a => a.artefactType === 'ReadinessItem');
    const dimensions = {};

    READINESS_DIMENSIONS.forEach(dim => {
      const dimItems = readinessItems.filter(i => i.dimension === dim.id);
      const completed = dimItems.filter(i => i.status === 'complete').length;
      const total = dim.criteria.length;

      dimensions[dim.id] = {
        name: dim.name,
        completed,
        total,
        status: completed === total ? 'green' : completed > 0 ? 'amber' : 'red'
      };
    });

    const totalCompleted = Object.values(dimensions).reduce((sum, d) => sum + d.completed, 0);
    const totalItems = Object.values(dimensions).reduce((sum, d) => sum + d.total, 0);
    const overallStatus = totalCompleted === totalItems ? 'green' :
                          totalCompleted > totalItems / 2 ? 'amber' : 'red';

    return { dimensions, overallStatus, completedCount: totalCompleted, totalCount: totalItems };
  }, [artefacts]);

  // Calculate completeness score
  const calculateCompleteness = useCallback(() => {
    if (!activeGTMPlan) return { score: 0, rules: [] };

    const results = GTM_COMPLETENESS_RULES.gtmPlan.map(rule => ({
      ...rule,
      passed: rule.check(activeGTMPlan, artefacts)
    }));

    const totalWeight = results.reduce((sum, r) => sum + r.weight, 0);
    const earnedWeight = results.filter(r => r.passed).reduce((sum, r) => sum + r.weight, 0);

    return {
      score: Math.round((earnedWeight / totalWeight) * 100),
      rules: results
    };
  }, [activeGTMPlan, artefacts]);

  // Compute stats
  const stats = useMemo(() => {
    const byType = {};
    const byModule = {};
    const byStage = { draft: 0, planning: 0, ready: 0, active: 0, complete: 0 };

    artefacts.forEach(a => {
      // Count by type
      byType[a.artefactType] = (byType[a.artefactType] || 0) + 1;

      // Count by module
      const typeInfo = GTM_ARTEFACT_TYPES[a.artefactType];
      if (typeInfo?.module) {
        byModule[typeInfo.module] = (byModule[typeInfo.module] || 0) + 1;
      }
    });

    // Count plans by stage
    gtmPlans.forEach(p => {
      if (byStage[p.status] !== undefined) {
        byStage[p.status]++;
      }
    });

    const campaigns = artefacts.filter(a => a.artefactType === 'Campaign');
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

    return {
      totalPlans: gtmPlans.length,
      totalArtefacts: artefacts.length,
      byType,
      byModule,
      byStage,
      activeCampaigns
    };
  }, [artefacts, gtmPlans]);

  const value = useMemo(() => ({
    // Data
    gtmPlans,
    activeGTMPlan,
    artefacts,
    loading,
    error,
    stats,

    // Navigation
    activeModule,
    setActiveModule,

    // Plan operations
    setActiveGTMPlan,
    createGTMPlan,
    updateGTMPlan,
    deleteGTMPlan,
    loadGTMPlans,

    // Artefact operations
    createArtefact,
    updateArtefact,
    deleteArtefact,
    getArtefactsByModule,
    getArtefactsByType,

    // Analysis
    calculateReadiness,
    calculateCompleteness,

    // Type definitions
    artefactTypes: GTM_ARTEFACT_TYPES,
    modules: GTM_MODULES,
    stages: GTM_STAGES,
    campaignTypes: CAMPAIGN_TYPES,
    launchTypes: LAUNCH_TYPES,
    pricingModels: PRICING_MODELS,
    materialTypes: MATERIAL_TYPES,
    readinessDimensions: READINESS_DIMENSIONS
  }), [
    gtmPlans, activeGTMPlan, artefacts, loading, error, stats, activeModule,
    createGTMPlan, updateGTMPlan, deleteGTMPlan,
    createArtefact, updateArtefact, deleteArtefact,
    getArtefactsByModule, getArtefactsByType,
    calculateReadiness, calculateCompleteness, loadGTMPlans
  ]);

  return (
    <GTMContext.Provider value={value}>
      {children}
    </GTMContext.Provider>
  );
}

export function useGTM() {
  const context = useContext(GTMContext);
  if (!context) {
    throw new Error('useGTM must be used within a GTMProvider');
  }
  return context;
}

export default GTMContext;
