// components/spaces/blueprint/BlueprintContext.js
// Blueprint Studio context - API-backed, initiative lifecycle management
// Manages initiatives from idea through approval via database persistence

import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { useProjects } from '../../ProjectContext';
import { useDomains } from '../../DomainContext';
import {
  BPS_STAGES,
  BPS_STAGE_INFO,
  BPS_HORIZONS,
  BPS_SCORING_CRITERIA,
  BPS_RECOMMENDATIONS,
  BPS_GATE_DECISIONS,
  BPS_GATE_CRITERIA,
  BPS_KILL_CRITERIA,
  BPS_STAGE_SLAS,
  BPS_INVESTMENT_THRESHOLDS,
  BPS_IDEA_SOURCES,
  BPS_PESTLE_CATEGORIES,
  BPS_TRACKS,
  BPS_KILL_CLASSIFICATIONS,
  BPS_POSTMORTEM_TEMPLATE,
  BPS_STAGE_METRICS,
  BPS_SLA_ESCALATION,
  BPS_PLR_CONFIG,
  BPS_PLR_TEMPLATE,
  BPS_CONFIDENCE_LEVELS,
  calculateOverallScore,
  calculateSLAStatus,
  calculateDetailedSLA,
  calculatePLRDate,
  calculatePLRVariance,
  checkKillCriteria,
  getNextStage,
  getPreviousStage,
  canAdvanceStage,
  calculateFunnelMetrics,
  getStageColor,
  getStageIcon,
  isTerminalStage,
  getTrackStages,
  formatCurrency,
  formatPercentage,
  calculateNPV,
  calculateIRR,
  calculatePayback,
  calculateBCR,
  generateInitiativeId,
  BPS_SCORE_ANCHORS,
} from '../../../lib/blueprint-types';

// Re-export type definitions for components
export {
  BPS_STAGES,
  BPS_STAGE_INFO,
  BPS_HORIZONS,
  BPS_SCORING_CRITERIA,
  BPS_RECOMMENDATIONS,
  BPS_GATE_DECISIONS,
  BPS_GATE_CRITERIA,
  BPS_KILL_CRITERIA,
  BPS_STAGE_SLAS,
  BPS_INVESTMENT_THRESHOLDS,
  BPS_IDEA_SOURCES,
  BPS_PESTLE_CATEGORIES,
  BPS_TRACKS,
  BPS_KILL_CLASSIFICATIONS,
  BPS_POSTMORTEM_TEMPLATE,
  BPS_STAGE_METRICS,
  BPS_SLA_ESCALATION,
  BPS_PLR_CONFIG,
  BPS_PLR_TEMPLATE,
  BPS_CONFIDENCE_LEVELS,
  BPS_SCORE_ANCHORS,
  calculateOverallScore,
  calculateSLAStatus,
  calculateDetailedSLA,
  calculatePLRDate,
  calculatePLRVariance,
  checkKillCriteria,
  getNextStage,
  getPreviousStage,
  canAdvanceStage,
  calculateFunnelMetrics,
  getStageColor,
  getStageIcon,
  isTerminalStage,
  getTrackStages,
  formatCurrency,
  formatPercentage,
  calculateNPV,
  calculateIRR,
  calculatePayback,
  calculateBCR,
  generateInitiativeId,
};

const BlueprintContext = createContext(null);

export function BlueprintProvider({ children }) {
  const { user, role } = useAuth();
  const { activeProject } = useProjects();
  const { activeDomainObj } = useDomains();

  // Get domain ID from the active domain object
  const domainId = activeDomainObj?.id;

  // Auth headers for API calls
  const authHeaders = useMemo(() => ({
    'x-user': user || '',
    'x-role': role || '',
  }), [user, role]);

  // ============================================================================
  // CORE STATE
  // ============================================================================

  // Initiatives (strategic containers)
  const [initiatives, setInitiatives] = useState([]);
  const [activeInitiative, setActiveInitiative] = useState(null);

  // Product Ideas (breakdown items under initiatives)
  const [productIdeas, setProductIdeas] = useState([]);
  const [activeProductIdea, setActiveProductIdea] = useState(null);

  // UI state
  const [selectedId, setSelectedId] = useState(null);
  const [selectedProductIdeaId, setSelectedProductIdeaId] = useState(null);
  const [activeView, setActiveView] = useState('overview');
  const [activeStage, setActiveStage] = useState(null);
  const [filterStage, setFilterStage] = useState(null);
  const [filterHorizon, setFilterHorizon] = useState(null);
  const [filterInitiativeStatus, setFilterInitiativeStatus] = useState('open'); // 'open', 'closed', 'all'

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [loadingProductIdeas, setLoadingProductIdeas] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // Fetch initiatives for current domain (optionally filtered by project)
  const fetchInitiatives = useCallback(async (filters = {}) => {
    if (!user || !domainId) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        domainId,
        ...filters,
      });

      // Only filter by project if one is selected
      if (activeProject?.id) {
        params.set('projectId', activeProject.id);
      }

      if (filterStage) params.set('stage', filterStage);
      if (filterHorizon) params.set('horizon', filterHorizon);

      const res = await fetch(`/api/blueprint/initiatives?${params}`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('Blueprint initiatives API returned error status:', res.status);
        setInitiatives([]);
        return null;
      }

      const data = await res.json();
      setInitiatives(data.initiatives || []);
      return data;
    } catch (err) {
      console.error('Error fetching initiatives:', err);
      setInitiatives([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, domainId, activeProject?.id, authHeaders, filterStage, filterHorizon]);

  // Fetch single initiative by ID
  const fetchInitiative = useCallback(async (id) => {
    if (!user || !id || !domainId) return null;

    try {
      const res = await fetch(`/api/blueprint/initiatives/${id}?domainId=${domainId}`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('Blueprint initiative API returned error status:', res.status);
        return null;
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Error fetching initiative:', err);
      return null;
    }
  }, [user, domainId, authHeaders]);

  // Refresh data when project or domain changes
  useEffect(() => {
    if (user && domainId) {
      fetchInitiatives();
    } else {
      setInitiatives([]);
      setActiveInitiative(null);
    }
  }, [user, domainId, activeProject?.id, fetchInitiatives]);

  // ============================================================================
  // PRODUCT IDEAS DATA FETCHING
  // ============================================================================

  // Fetch product ideas for current domain or active initiative
  const fetchProductIdeas = useCallback(async (filters = {}) => {
    if (!user || !domainId) return;

    setLoadingProductIdeas(true);

    try {
      const params = new URLSearchParams({ domainId, ...filters });

      // Filter by active initiative if set
      if (activeInitiative?.id) {
        params.set('initiativeId', activeInitiative.id);
      }

      if (filterStage) params.set('stage', filterStage);

      const res = await fetch(`/api/blueprint/product-ideas?${params}`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('Product ideas API returned error status:', res.status);
        setProductIdeas([]);
        return null;
      }

      const data = await res.json();
      setProductIdeas(data || []);
      return data;
    } catch (err) {
      console.error('Error fetching product ideas:', err);
      setProductIdeas([]);
      return null;
    } finally {
      setLoadingProductIdeas(false);
    }
  }, [user, domainId, activeInitiative?.id, authHeaders, filterStage]);

  // Fetch product ideas for a specific initiative
  // This updates context state AND returns the data for immediate use
  const fetchProductIdeasForInitiative = useCallback(async (initiativeId) => {
    if (!user || !initiativeId || !domainId) return [];

    try {
      const params = new URLSearchParams({
        domainId,
        initiativeId,
      });

      const res = await fetch(`/api/blueprint/product-ideas?${params}`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('Product ideas API returned error status:', res.status);
        return [];
      }

      const data = await res.json();
      const ideas = data || [];

      // Merge fetched ideas into context state (accumulate for multiple initiatives)
      if (ideas.length > 0) {
        setProductIdeas(prev => {
          // Remove any existing ideas for this initiative, then add fresh ones
          const otherIdeas = prev.filter(pi => pi.initiative_id !== initiativeId);
          return [...otherIdeas, ...ideas];
        });
      }

      return ideas;
    } catch (err) {
      console.error('Error fetching product ideas for initiative:', err);
      return [];
    }
  }, [user, domainId, authHeaders]);

  // Fetch single product idea by ID
  const fetchProductIdea = useCallback(async (id) => {
    if (!user || !id) return null;

    try {
      const res = await fetch(`/api/blueprint/product-ideas/${id}`, { headers: authHeaders });
      if (!res.ok) {
        console.warn('Product idea API returned error status:', res.status);
        return null;
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Error fetching product idea:', err);
      return null;
    }
  }, [user, authHeaders]);

  // Refresh product ideas when active initiative changes
  useEffect(() => {
    if (user && domainId && activeInitiative?.id) {
      fetchProductIdeas();
    } else {
      setProductIdeas([]);
      setActiveProductIdea(null);
    }
  }, [user, domainId, activeInitiative?.id, fetchProductIdeas]);

  // ============================================================================
  // INITIATIVE CRUD OPERATIONS
  // ============================================================================

  // Create new initiative (starts in 'idea' stage)
  const createInitiative = useCallback(async (data = {}) => {
    if (!domainId) {
      setError('No domain selected');
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      // Handle ideaData from InitiativeForm or direct fields
      const formIdeaData = data.ideaData || {};

      const res = await fetch(`/api/blueprint/initiatives?domainId=${domainId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          // projectId is optional - only include if a project is selected
          ...(activeProject?.id && { projectId: activeProject.id }),
          name: data.name || 'New Initiative',
          stage: 'idea',
          description: formIdeaData.description || data.description || '',
          ideaData: {
            description: formIdeaData.description || data.description || '',
            problem_statement: formIdeaData.problem_statement || data.problem_statement || '',
            hypothesis: formIdeaData.hypothesis || data.hypothesis || '',
            source: formIdeaData.source || data.source || 'internal_innovation',
            target_customer: formIdeaData.target_customer || data.target_customer || '',
            success_metrics: formIdeaData.success_metrics || data.success_metrics || '',
            submitter: user,
          },
          horizon: data.horizon || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create initiative');
      }

      const newInitiative = await res.json();

      // Update local state
      setInitiatives(prev => [newInitiative, ...prev]);
      setActiveInitiative(newInitiative);
      setSelectedId(newInitiative.id);

      return newInitiative;
    } catch (err) {
      console.error('Error creating initiative:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [domainId, activeProject?.id, authHeaders, user]);

  // Update initiative
  const updateInitiative = useCallback(async (id, updates) => {
    if (!id || !domainId) return null;

    setSaving(true);
    setError(null);

    try {
      // Map frontend field names to API expected names
      // Frontend uses: explore, assess, idea, case, approval
      // API expects: exploreData, assessData, ideaData, caseData, approvalData
      const processedUpdates = { ...updates };

      // Map camelCase frontend fields to API field names
      if (updates.explore !== undefined) {
        processedUpdates.exploreData = updates.explore;
        delete processedUpdates.explore;
      }
      if (updates.assess !== undefined) {
        processedUpdates.assessData = updates.assess;
        delete processedUpdates.assess;
      }
      if (updates.idea !== undefined) {
        processedUpdates.ideaData = updates.idea;
        delete processedUpdates.idea;
      }
      if (updates.case !== undefined) {
        processedUpdates.caseData = updates.case;
        delete processedUpdates.case;
      }
      if (updates.approval !== undefined) {
        processedUpdates.approvalData = updates.approval;
        delete processedUpdates.approval;
      }

      const res = await fetch(`/api/blueprint/initiatives/${id}?domainId=${domainId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(processedUpdates),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update initiative');
      }

      const updated = await res.json();

      // Update local state
      setInitiatives(prev => prev.map(i => i.id === id ? updated : i));
      if (activeInitiative?.id === id) {
        setActiveInitiative(updated);
      }

      return updated;
    } catch (err) {
      console.error('Error updating initiative:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [domainId, activeInitiative?.id, authHeaders]);

  // Delete initiative
  const deleteInitiative = useCallback(async (id) => {
    if (!id || !domainId) return false;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/blueprint/initiatives/${id}?domainId=${domainId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete initiative');
      }

      // Update local state
      setInitiatives(prev => prev.filter(i => i.id !== id));
      if (activeInitiative?.id === id) {
        setActiveInitiative(null);
      }
      if (selectedId === id) {
        setSelectedId(null);
      }

      return true;
    } catch (err) {
      console.error('Error deleting initiative:', err);
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [domainId, activeInitiative?.id, selectedId, authHeaders]);

  // ============================================================================
  // STAGE OPERATIONS
  // ============================================================================

  // Advance initiative to next stage
  const advanceStage = useCallback(async (id, gateDecision = 'approved', conditions = '') => {
    const initiative = initiatives.find(i => i.id === id);
    if (!initiative) return null;

    const nextStage = getNextStage(initiative.status);
    if (!nextStage) {
      setError('Initiative is already at final stage');
      return null;
    }

    // Check if can advance
    if (!canAdvanceStage(initiative)) {
      setError('Initiative does not meet requirements to advance');
      return null;
    }

    const stageHistory = [...(initiative.governance?.stage_history || [])];
    // Mark current stage as exited
    const currentStageIdx = stageHistory.findIndex(h => h.stage === initiative.status && !h.exited);
    if (currentStageIdx >= 0) {
      stageHistory[currentStageIdx] = {
        ...stageHistory[currentStageIdx],
        exited: new Date().toISOString(),
        decision: gateDecision,
      };
    }
    // Add new stage entry
    stageHistory.push({
      stage: nextStage,
      entered: new Date().toISOString(),
      by: user,
    });

    return updateInitiative(id, {
      status: nextStage,
      governance: {
        ...initiative.governance,
        stage_history: stageHistory,
        sla_status: 'on_track',
      },
      ...(conditions && { approval: { ...initiative.approval, conditions } }),
    });
  }, [initiatives, user, updateInitiative]);

  // Decline initiative
  const declineInitiative = useCallback(async (id, reason = '') => {
    const initiative = initiatives.find(i => i.id === id);
    if (!initiative) return null;

    const stageHistory = [...(initiative.governance?.stage_history || [])];
    const currentStageIdx = stageHistory.findIndex(h => h.stage === initiative.status && !h.exited);
    if (currentStageIdx >= 0) {
      stageHistory[currentStageIdx] = {
        ...stageHistory[currentStageIdx],
        exited: new Date().toISOString(),
        decision: 'declined',
      };
    }
    stageHistory.push({
      stage: 'declined',
      entered: new Date().toISOString(),
      by: user,
      reason,
    });

    return updateInitiative(id, {
      status: 'declined',
      governance: {
        ...initiative.governance,
        stage_history: stageHistory,
      },
      approval: {
        ...initiative.approval,
        decision: 'declined',
        decision_date: new Date().toISOString(),
      },
    });
  }, [initiatives, user, updateInitiative]);

  // Submit a gate decision via the advance API
  const submitGateDecision = useCallback(async (id, { decision, notes, conditions, targetStage, forceAdvance }) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/blueprint/initiatives/${id}/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ decision, notes, conditions, targetStage, forceAdvance }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gate decision failed');
        return null;
      }
      // Refresh initiatives to get updated state
      await fetchInitiatives();
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [authHeaders, fetchInitiatives]);

  // ============================================================================
  // SCORING OPERATIONS
  // ============================================================================

  // Update scoring for an initiative
  const updateScoring = useCallback(async (id, criteriaScores) => {
    const initiative = initiatives.find(i => i.id === id);
    if (!initiative) return null;

    const assess = { ...initiative.assess, ...criteriaScores };
    assess.overall_score = calculateOverallScore(assess);

    return updateInitiative(id, { assess });
  }, [initiatives, updateInitiative]);

  // ============================================================================
  // MARKET DATA OPERATIONS
  // ============================================================================

  // Update market sizing
  const updateMarketSizing = useCallback(async (id, marketSizing) => {
    const initiative = initiatives.find(i => i.id === id);
    if (!initiative) return null;

    return updateInitiative(id, {
      explore: {
        ...initiative.explore,
        market_sizing: marketSizing,
      },
    });
  }, [initiatives, updateInitiative]);

  // Update competitors
  const updateCompetitors = useCallback(async (id, competitors) => {
    const initiative = initiatives.find(i => i.id === id);
    if (!initiative) return null;

    return updateInitiative(id, {
      explore: {
        ...initiative.explore,
        competitors,
      },
    });
  }, [initiatives, updateInitiative]);

  // Update PESTLE analysis
  const updatePESTLE = useCallback(async (id, pestle) => {
    const initiative = initiatives.find(i => i.id === id);
    if (!initiative) return null;

    return updateInitiative(id, {
      explore: {
        ...initiative.explore,
        pestle,
      },
    });
  }, [initiatives, updateInitiative]);

  // ============================================================================
  // BUSINESS CASE OPERATIONS
  // ============================================================================

  // Update business case
  const updateBusinessCase = useCallback(async (id, caseData) => {
    const initiative = initiatives.find(i => i.id === id);
    if (!initiative) return null;

    return updateInitiative(id, {
      case: {
        ...initiative.case,
        ...caseData,
      },
    });
  }, [initiatives, updateInitiative]);

  // ============================================================================
  // AI IMPORT OPERATIONS
  // ============================================================================

  // Import AI-generated data into an initiative (V2 - creates product ideas)
  const importFromAI = useCallback(async (id, aiData, selectedSections = null) => {
    if (!domainId) {
      setError('No domain selected');
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      // Use the new V2 endpoint that creates product ideas
      const res = await fetch(`/api/blueprint/initiatives/${id}/import-product-ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          jsonData: aiData,
          createdBy: user,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to import AI data');
      }

      const result = await res.json();

      // Update local state with the returned initiative
      if (result.initiative) {
        setInitiatives(prev => prev.map(i => i.id === id ? result.initiative : i));
        if (activeInitiative?.id === id) {
          setActiveInitiative(result.initiative);
        }
      }

      // Update product ideas if they were created
      if (result.productIdeas && result.productIdeas.length > 0) {
        setProductIdeas(prev => [...result.productIdeas, ...prev]);
      }

      return result;
    } catch (err) {
      console.error('Error importing AI data:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [domainId, activeInitiative?.id, authHeaders, user]);

  // ============================================================================
  // PRODUCT IDEAS CRUD OPERATIONS
  // ============================================================================

  // Create new product idea under an initiative
  const createProductIdea = useCallback(async (data = {}) => {
    if (!domainId || !activeInitiative?.id) {
      setError('No domain or initiative selected');
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/blueprint/product-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          initiativeId: activeInitiative.id,
          domainId,
          name: data.name || 'New Product Idea',
          tagline: data.tagline || '',
          description: data.description || '',
          stage: data.stage || 'idea',
          ideaType: data.ideaType || null,
          technologyPosture: data.technologyPosture || null,
          riskProfile: data.riskProfile || null,
          validationPriority: data.validationPriority || productIdeas.length + 1,
          ideaData: data.ideaData || {},
          canvasData: data.canvasData || {},
          createdBy: user,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create product idea');
      }

      const newProductIdea = await res.json();

      // Update local state
      setProductIdeas(prev => [newProductIdea, ...prev]);
      setActiveProductIdea(newProductIdea);
      setSelectedProductIdeaId(newProductIdea.id);

      return newProductIdea;
    } catch (err) {
      console.error('Error creating product idea:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [domainId, activeInitiative?.id, productIdeas.length, authHeaders, user]);

  // Update product idea
  const updateProductIdea = useCallback(async (id, updates) => {
    if (!id) return null;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/blueprint/product-ideas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update product idea');
      }

      const updated = await res.json();

      // Update local state
      setProductIdeas(prev => prev.map(pi => pi.id === id ? updated : pi));
      if (activeProductIdea?.id === id) {
        setActiveProductIdea(updated);
      }

      return updated;
    } catch (err) {
      console.error('Error updating product idea:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [activeProductIdea?.id, authHeaders]);

  // Delete product idea
  const deleteProductIdea = useCallback(async (id) => {
    if (!id) return false;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/blueprint/product-ideas/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete product idea');
      }

      // Update local state
      setProductIdeas(prev => prev.filter(pi => pi.id !== id));
      if (activeProductIdea?.id === id) {
        setActiveProductIdea(null);
      }
      if (selectedProductIdeaId === id) {
        setSelectedProductIdeaId(null);
      }

      return true;
    } catch (err) {
      console.error('Error deleting product idea:', err);
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [activeProductIdea?.id, selectedProductIdeaId, authHeaders]);

  // Advance product idea to next stage
  const advanceProductIdeaStage = useCallback(async (id, decision = 'approved', notes = '') => {
    if (!id) return null;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/blueprint/product-ideas/${id}/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          decision,
          decisionBy: user,
          notes,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to advance product idea');
      }

      const updated = await res.json();

      // Update local state
      setProductIdeas(prev => prev.map(pi => pi.id === id ? updated : pi));
      if (activeProductIdea?.id === id) {
        setActiveProductIdea(updated);
      }

      return updated;
    } catch (err) {
      console.error('Error advancing product idea:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [activeProductIdea?.id, authHeaders, user]);

  // Update product idea scoring
  const updateProductIdeaScoring = useCallback(async (id, scores) => {
    if (!id) return null;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/blueprint/product-ideas/${id}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ scores }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update product idea scoring');
      }

      const updated = await res.json();

      // Update local state
      setProductIdeas(prev => prev.map(pi => pi.id === id ? updated : pi));
      if (activeProductIdea?.id === id) {
        setActiveProductIdea(updated);
      }

      return updated;
    } catch (err) {
      console.error('Error updating product idea scoring:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [activeProductIdea?.id, authHeaders]);

  // Select product idea for execution
  const selectProductIdea = useCallback(async (id) => {
    if (!id) return null;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/blueprint/product-ideas/${id}/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ selectedBy: user }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to select product idea');
      }

      const updated = await res.json();

      // Update local state
      setProductIdeas(prev => prev.map(pi => pi.id === id ? updated : pi));
      if (activeProductIdea?.id === id) {
        setActiveProductIdea(updated);
      }

      return updated;
    } catch (err) {
      console.error('Error selecting product idea:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [activeProductIdea?.id, authHeaders, user]);

  // Get product idea by ID from local state
  const getProductIdea = useCallback((id) => {
    return productIdeas.find(pi => pi.id === id) || null;
  }, [productIdeas]);

  // ============================================================================
  // FILTERING & GROUPING
  // ============================================================================

  // Get initiatives by stage
  const getInitiativesByStage = useCallback((stage) => {
    return initiatives.filter(i => i.status === stage);
  }, [initiatives]);

  // Get initiatives by horizon
  const getInitiativesByHorizon = useCallback((horizon) => {
    return initiatives.filter(i => i.assess?.horizon === horizon);
  }, [initiatives]);

  // Get active (non-terminal) initiatives
  const activeInitiatives = useMemo(() => {
    return initiatives.filter(i => !isTerminalStage(i.status));
  }, [initiatives]);

  // Get initiatives at risk (SLA breached or at risk)
  const initiativesAtRisk = useMemo(() => {
    return initiatives.filter(i => {
      const slaStatus = calculateSLAStatus(i);
      return slaStatus === 'at_risk' || slaStatus === 'breached';
    });
  }, [initiatives]);

  // Get initiatives with kill criteria met
  const initiativesWithKillCriteria = useMemo(() => {
    return initiatives.filter(i => {
      const result = checkKillCriteria(i);
      return result.mustMeetFails?.length > 0 || result.shouldMeetWarns?.length > 0;
    }).map(i => ({
      ...i,
      killCriteria: checkKillCriteria(i),
    }));
  }, [initiatives]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Funnel metrics (now based on product ideas)
  const funnelMetrics = useMemo(() => {
    // If we have product ideas, use those for the funnel
    if (productIdeas.length > 0) {
      return calculateFunnelMetrics(productIdeas);
    }
    // Fall back to initiatives for backward compatibility
    return calculateFunnelMetrics(initiatives);
  }, [productIdeas, initiatives]);

  // Product idea counts by stage
  const stageCounts = useMemo(() => {
    const counts = {};
    BPS_STAGES.forEach(stage => {
      counts[stage] = productIdeas.filter(pi => pi.status === stage).length;
    });
    // Also add initiative count for overview
    counts.total = productIdeas.length;
    return counts;
  }, [productIdeas]);

  // Initiative counts by status (open/closed)
  const initiativeStatusCounts = useMemo(() => {
    const counts = { open: 0, closed: 0, total: initiatives.length };
    initiatives.forEach(i => {
      const status = i.initiativeStatus || 'open';
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [initiatives]);

  // Product idea counts by horizon
  const horizonCounts = useMemo(() => {
    const counts = { h1: 0, h2: 0, h3: 0, unclassified: 0 };
    productIdeas.forEach(pi => {
      const horizon = pi.horizon || pi.assess?.horizon;
      if (horizon && counts[horizon] !== undefined) {
        counts[horizon]++;
      } else {
        counts.unclassified++;
      }
    });
    return counts;
  }, [productIdeas]);

  // Product ideas grouped by stage (for pipeline view)
  const productIdeasByStage = useMemo(() => {
    const grouped = {};
    BPS_STAGES.forEach(stage => {
      grouped[stage] = productIdeas.filter(pi => pi.status === stage);
    });
    return grouped;
  }, [productIdeas]);

  // Product ideas at risk (SLA breached or at risk)
  const productIdeasAtRisk = useMemo(() => {
    return productIdeas.filter(pi => {
      const slaStatus = calculateSLAStatus(pi);
      return slaStatus === 'at_risk' || slaStatus === 'breached';
    });
  }, [productIdeas]);

  // Selected product idea (for execution)
  const selectedProductIdeas = useMemo(() => {
    return productIdeas.filter(pi => pi.selectionStatus === 'selected');
  }, [productIdeas]);

  // Get single initiative by ID from local state
  const getInitiative = useCallback((id) => {
    return initiatives.find(i => i.id === id) || null;
  }, [initiatives]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value = useMemo(() => ({
    // Main project (from ProjectContext)
    activeProject,

    // Initiatives (strategic containers)
    initiatives,
    activeInitiative,
    setActiveInitiative,

    // Product Ideas (breakdown items)
    productIdeas,
    activeProductIdea,
    setActiveProductIdea,

    // UI state
    selectedId,
    setSelectedId,
    selectedProductIdeaId,
    setSelectedProductIdeaId,
    activeView,
    setActiveView,
    activeStage,
    setActiveStage,
    filterStage,
    setFilterStage,
    filterHorizon,
    setFilterHorizon,
    filterInitiativeStatus,
    setFilterInitiativeStatus,

    // Loading states
    loading,
    loadingProductIdeas,
    error,
    saving,
    setError,

    // Initiative data fetching
    fetchInitiatives,
    fetchInitiative,

    // Product idea data fetching
    fetchProductIdeas,
    fetchProductIdeasForInitiative,
    fetchProductIdea,

    // Initiative CRUD operations
    createInitiative,
    updateInitiative,
    deleteInitiative,
    getInitiative,

    // Product idea CRUD operations
    createProductIdea,
    updateProductIdea,
    deleteProductIdea,
    getProductIdea,

    // Initiative stage operations (legacy)
    advanceStage,
    declineInitiative,

    // Gate decision (5-state model via advance API)
    submitGateDecision,

    // Product idea stage operations
    advanceProductIdeaStage,
    selectProductIdea,

    // Scoring operations
    updateScoring,
    updateProductIdeaScoring,

    // Market data operations
    updateMarketSizing,
    updateCompetitors,
    updatePESTLE,

    // Business case operations
    updateBusinessCase,

    // AI import operations (now creates product ideas)
    importFromAI,

    // Initiative filtering
    getInitiativesByStage,
    getInitiativesByHorizon,
    activeInitiatives,
    initiativesAtRisk,
    initiativesWithKillCriteria,

    // Computed values
    funnelMetrics,
    stageCounts,
    horizonCounts,
    initiativeStatusCounts,
    productIdeasByStage,
    productIdeasAtRisk,
    selectedProductIdeas,

    // Type definitions
    BPS_STAGES,
    BPS_STAGE_INFO,
    BPS_HORIZONS,
    BPS_SCORING_CRITERIA,
    BPS_RECOMMENDATIONS,
    BPS_GATE_DECISIONS,
    BPS_KILL_CRITERIA,
    BPS_STAGE_SLAS,
    BPS_INVESTMENT_THRESHOLDS,
    BPS_IDEA_SOURCES,
    BPS_PESTLE_CATEGORIES,
    BPS_TRACKS,
    BPS_KILL_CLASSIFICATIONS,
    BPS_POSTMORTEM_TEMPLATE,

    // Helper functions
    calculateOverallScore,
    calculateSLAStatus,
    checkKillCriteria,
    getNextStage,
    getPreviousStage,
    canAdvanceStage,
    getStageColor,
    isTerminalStage,
    getTrackStages,
  }), [
    activeProject,
    initiatives,
    activeInitiative,
    productIdeas,
    activeProductIdea,
    selectedId,
    selectedProductIdeaId,
    activeView,
    activeStage,
    filterStage,
    filterHorizon,
    filterInitiativeStatus,
    loading,
    loadingProductIdeas,
    error,
    saving,
    fetchInitiatives,
    fetchInitiative,
    fetchProductIdeas,
    fetchProductIdeasForInitiative,
    fetchProductIdea,
    createInitiative,
    updateInitiative,
    deleteInitiative,
    getInitiative,
    createProductIdea,
    updateProductIdea,
    deleteProductIdea,
    getProductIdea,
    advanceStage,
    declineInitiative,
    submitGateDecision,
    advanceProductIdeaStage,
    selectProductIdea,
    updateScoring,
    updateProductIdeaScoring,
    updateMarketSizing,
    updateCompetitors,
    updatePESTLE,
    updateBusinessCase,
    importFromAI,
    getInitiativesByStage,
    getInitiativesByHorizon,
    activeInitiatives,
    initiativesAtRisk,
    initiativesWithKillCriteria,
    funnelMetrics,
    stageCounts,
    horizonCounts,
    initiativeStatusCounts,
    productIdeasByStage,
    productIdeasAtRisk,
    selectedProductIdeas,
  ]);

  return (
    <BlueprintContext.Provider value={value}>
      {children}
    </BlueprintContext.Provider>
  );
}

export function useBlueprint() {
  const ctx = useContext(BlueprintContext);
  if (!ctx) throw new Error('useBlueprint must be used inside BlueprintProvider');
  return ctx;
}
