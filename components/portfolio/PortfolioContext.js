// components/portfolio/PortfolioContext.js
// Portfolio Studio Context - State management for portfolio investment decisions
// "This is where we decide what deserves a project."

import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../AuthContext';
import { useDomains } from '../DomainContext';
import {
  PORTFOLIO_ARTEFACT_TYPES,
  PORTFOLIO_STAGES,
  INVESTMENT_HORIZONS,
  CONFIDENCE_LEVELS,
  calculatePriorityScore,
} from '../../lib/portfolio-types';

const PortfolioContext = createContext(null);

export function PortfolioProvider({ children }) {
  const { user, role } = useAuth();
  const { activeDomain } = useDomains();

  // Core state
  const [artefacts, setArtefacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auth headers for API calls
  const authHeaders = useMemo(() => ({
    'x-user': user || '',
    'x-role': role || '',
  }), [user, role]);

  // Fetch all portfolio artefacts for the domain
  const refreshData = useCallback(async () => {
    if (!user || !activeDomain) {
      setArtefacts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/portfolio/artefacts?domainId=${activeDomain}`, {
        headers: authHeaders,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to fetch portfolio data (${res.status})`);
      }
      setArtefacts(data.artefacts || []);
    } catch (err) {
      console.error('Portfolio fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, activeDomain, authHeaders]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // ============ ARTEFACT OPERATIONS ============

  const createArtefact = useCallback(async (type, data) => {
    if (!activeDomain) {
      setError('No domain selected');
      return null;
    }

    try {
      const res = await fetch('/api/portfolio/artefacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          domainId: activeDomain,
          artefactType: type,
          ...data,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create artefact');
      }

      const newArtefact = await res.json();
      setArtefacts(prev => [...prev, newArtefact]);
      return newArtefact;
    } catch (err) {
      console.error('Create error:', err);
      setError(err.message);
      return null;
    }
  }, [activeDomain, authHeaders]);

  const updateArtefact = useCallback(async (id, updates) => {
    try {
      const res = await fetch(`/api/portfolio/artefacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error('Failed to update artefact');

      const updated = await res.json();
      setArtefacts(prev => prev.map(a => a.id === id ? updated : a));
      return updated;
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message);
      return null;
    }
  }, [authHeaders]);

  const deleteArtefact = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/portfolio/artefacts/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (!res.ok) throw new Error('Failed to delete artefact');

      setArtefacts(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message);
      return false;
    }
  }, [authHeaders]);

  // ============ FILTERED VIEWS ============

  // Get artefacts by type
  const getByType = useCallback((type) => {
    return artefacts.filter(a => a.artefact_type === type);
  }, [artefacts]);

  // Investment Themes
  const themes = useMemo(() =>
    artefacts.filter(a => a.artefact_type === 'portfolio_theme'),
  [artefacts]);

  // Portfolio Initiatives
  const initiatives = useMemo(() =>
    artefacts.filter(a => a.artefact_type === 'portfolio_initiative'),
  [artefacts]);

  // Dependencies
  const dependencies = useMemo(() =>
    artefacts.filter(a => a.artefact_type === 'portfolio_dependency'),
  [artefacts]);

  // Decision Records
  const decisions = useMemo(() =>
    artefacts.filter(a => a.artefact_type === 'portfolio_decision'),
  [artefacts]);

  // Risks
  const risks = useMemo(() =>
    artefacts.filter(a => a.artefact_type === 'portfolio_risk'),
  [artefacts]);

  // Trade-off Analyses
  const tradeoffs = useMemo(() =>
    artefacts.filter(a => a.artefact_type === 'portfolio_tradeoff'),
  [artefacts]);

  // ============ INITIATIVE HELPERS ============

  // Get initiatives by stage
  const getInitiativesByStage = useCallback((stageId) => {
    return initiatives.filter(i => i.custom_fields?.stage === stageId);
  }, [initiatives]);

  // Get initiatives by theme
  const getInitiativesByTheme = useCallback((themeId) => {
    return initiatives.filter(i => i.custom_fields?.theme_id === themeId);
  }, [initiatives]);

  // Get initiatives by horizon
  const getInitiativesByHorizon = useCallback((horizonId) => {
    return initiatives.filter(i => i.custom_fields?.time_horizon === horizonId);
  }, [initiatives]);

  // Calculate initiative with priority score
  const getInitiativesWithPriority = useMemo(() => {
    return initiatives.map(i => ({
      ...i,
      priorityScore: calculatePriorityScore(i),
    })).sort((a, b) => b.priorityScore - a.priorityScore);
  }, [initiatives]);

  // ============ STATISTICS ============

  const stats = useMemo(() => {
    // Stage counts
    const stageCounts = {};
    Object.keys(PORTFOLIO_STAGES).forEach(s => {
      stageCounts[s] = getInitiativesByStage(s).length;
    });

    // Horizon counts
    const horizonCounts = {};
    Object.keys(INVESTMENT_HORIZONS).forEach(h => {
      horizonCounts[h] = getInitiativesByHorizon(h).length;
    });

    // Confidence distribution
    const confidenceCounts = {};
    Object.keys(CONFIDENCE_LEVELS).forEach(c => {
      confidenceCounts[c] = initiatives.filter(i => i.custom_fields?.confidence === c).length;
    });

    // Risk summary
    const openRisks = risks.filter(r => r.custom_fields?.status === 'open').length;
    const highImpactRisks = risks.filter(r =>
      ['major', 'severe'].includes(r.custom_fields?.impact) && r.custom_fields?.status !== 'closed'
    ).length;

    // Dependency summary
    const blockingDeps = dependencies.filter(d =>
      d.custom_fields?.severity === 'blocking' && d.custom_fields?.status !== 'resolved'
    ).length;

    return {
      totalThemes: themes.length,
      activeThemes: themes.filter(t => t.custom_fields?.status === 'active').length,
      totalInitiatives: initiatives.length,
      stageCounts,
      horizonCounts,
      confidenceCounts,
      totalDecisions: decisions.length,
      recentDecisions: decisions.filter(d => {
        const date = new Date(d.custom_fields?.decision_date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return date > thirtyDaysAgo;
      }).length,
      openRisks,
      highImpactRisks,
      blockingDeps,
      totalDependencies: dependencies.length,
    };
  }, [themes, initiatives, decisions, risks, dependencies, getInitiativesByStage, getInitiativesByHorizon]);

  // ============ PORTFOLIO HEALTH ============

  const portfolioHealth = useMemo(() => {
    const issues = [];
    const warnings = [];
    const positives = [];

    // Check horizon balance
    const totalInitiatives = initiatives.length;
    if (totalInitiatives > 0) {
      const runPct = (stats.horizonCounts.run / totalInitiatives) * 100;
      const transformPct = (stats.horizonCounts.transform / totalInitiatives) * 100;

      if (runPct > 70) {
        warnings.push('Heavy focus on Run (maintenance) - consider more innovation');
      }
      if (transformPct > 50) {
        warnings.push('High Transform allocation - ensure capacity for innovation');
      }
      if (runPct < 30 && totalInitiatives > 5) {
        positives.push('Good innovation focus with adequate maintenance');
      }
    }

    // Check confidence levels
    const lowConfidence = initiatives.filter(i =>
      i.custom_fields?.stage === 'decide' && i.custom_fields?.confidence === 'hypothesis'
    ).length;
    if (lowConfidence > 0) {
      issues.push(`${lowConfidence} initiative(s) in Decide stage with only hypothesis confidence`);
    }

    // Check blocking dependencies
    if (stats.blockingDeps > 0) {
      issues.push(`${stats.blockingDeps} blocking dependency(ies) need resolution`);
    }

    // Check high-impact risks
    if (stats.highImpactRisks > 3) {
      warnings.push(`${stats.highImpactRisks} high-impact risks - review mitigation strategies`);
    }

    // Check theme coverage
    const unthemedInitiatives = initiatives.filter(i => !i.custom_fields?.theme_id).length;
    if (unthemedInitiatives > 2) {
      warnings.push(`${unthemedInitiatives} initiatives not linked to themes`);
    }

    // Positive signals
    if (stats.recentDecisions > 0) {
      positives.push(`${stats.recentDecisions} decisions made in last 30 days`);
    }
    if (stats.activeThemes > 0) {
      positives.push(`${stats.activeThemes} active investment themes`);
    }

    return {
      score: Math.max(0, 100 - (issues.length * 20) - (warnings.length * 10)),
      issues,
      warnings,
      positives,
    };
  }, [initiatives, stats]);

  // ============ PROJECT CREATION GATE ============

  const promoteToProject = useCallback(async (initiativeId) => {
    const initiative = initiatives.find(i => i.id === initiativeId);
    if (!initiative) {
      setError('Initiative not found');
      return null;
    }

    // Create a decision record
    const decision = await createArtefact('portfolio_decision', {
      name: `Approved: ${initiative.name}`,
      decision_date: new Date().toISOString().split('T')[0],
      decision_type: 'approve',
      initiative: initiativeId,
      decision_summary: `Initiative "${initiative.name}" approved for project creation.`,
      rationale: 'Met portfolio criteria and approved through portfolio process.',
    });

    // Update initiative stage to commit
    await updateArtefact(initiativeId, {
      custom_fields: {
        ...initiative.custom_fields,
        stage: 'commit',
      },
    });

    // Here we would typically create the project
    // For now, return the decision record
    return decision;
  }, [initiatives, createArtefact, updateArtefact]);

  const deferInitiative = useCallback(async (initiativeId, reason) => {
    const initiative = initiatives.find(i => i.id === initiativeId);
    if (!initiative) return null;

    const decision = await createArtefact('portfolio_decision', {
      name: `Deferred: ${initiative.name}`,
      decision_date: new Date().toISOString().split('T')[0],
      decision_type: 'defer',
      initiative: initiativeId,
      decision_summary: `Initiative "${initiative.name}" deferred.`,
      rationale: reason || 'Deferred for later consideration.',
    });

    return decision;
  }, [initiatives, createArtefact]);

  const dropInitiative = useCallback(async (initiativeId, reason) => {
    const initiative = initiatives.find(i => i.id === initiativeId);
    if (!initiative) return null;

    const decision = await createArtefact('portfolio_decision', {
      name: `Dropped: ${initiative.name}`,
      decision_date: new Date().toISOString().split('T')[0],
      decision_type: 'drop',
      initiative: initiativeId,
      decision_summary: `Initiative "${initiative.name}" dropped from portfolio.`,
      rationale: reason || 'Not pursuing this initiative.',
    });

    return decision;
  }, [initiatives, createArtefact]);

  // ============ CONTEXT VALUE ============

  const value = {
    // State
    artefacts,
    loading,
    error,

    // Collections
    themes,
    initiatives,
    dependencies,
    decisions,
    risks,
    tradeoffs,

    // Operations
    createArtefact,
    updateArtefact,
    deleteArtefact,
    refreshData,

    // Helpers
    getByType,
    getInitiativesByStage,
    getInitiativesByTheme,
    getInitiativesByHorizon,
    getInitiativesWithPriority,

    // Analytics
    stats,
    portfolioHealth,

    // Project Gate
    promoteToProject,
    deferInitiative,
    dropInitiative,

    // Constants
    PORTFOLIO_ARTEFACT_TYPES,
    PORTFOLIO_STAGES,
    INVESTMENT_HORIZONS,
    CONFIDENCE_LEVELS,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}

export default PortfolioContext;
