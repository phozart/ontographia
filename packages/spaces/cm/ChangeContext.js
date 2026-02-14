// components/cm/ChangeContext.js
// Context provider for Change Management module

import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useProjects } from '../../ProjectContext';
import { useAuth } from '../../AuthContext';

// ============ ENUMERATIONS ============

export const CHANGE_TYPES = {
  TRANSFORMATIONAL: {
    id: 'TRANSFORMATIONAL',
    name: 'Transformational',
    description: 'Fundamental shift in how work is done, culture, or identity',
    implications: 'Requires PCT, extensive stakeholder analysis, long adoption curve',
    complexityScore: 3,
    color: '#dc2626',
  },
  INCREMENTAL: {
    id: 'INCREMENTAL',
    name: 'Incremental',
    description: 'Enhancement to existing processes or tools',
    implications: 'Lighter assessment, focus on training',
    complexityScore: 1,
    color: '#22c55e',
  },
  REGULATORY: {
    id: 'REGULATORY',
    name: 'Regulatory/Compliance',
    description: 'Externally mandated change',
    implications: 'Focus on timeline, communication, minimal resistance expected',
    complexityScore: 2,
    color: '#3b82f6',
  },
  BEHAVIOURAL: {
    id: 'BEHAVIOURAL',
    name: 'Behavioural',
    description: 'Change in habits, practices, or ways of working',
    implications: 'Heavy focus on reinforcement, adoption signals',
    complexityScore: 2,
    color: '#f59e0b',
  },
  TECHNICAL: {
    id: 'TECHNICAL',
    name: 'Technical',
    description: 'System or tool change with limited process impact',
    implications: 'Focus on training, support readiness',
    complexityScore: 1,
    color: '#8b5cf6',
  },
  STRUCTURAL: {
    id: 'STRUCTURAL',
    name: 'Structural',
    description: 'Organizational restructure, reporting lines, roles',
    implications: 'High identity impact, resistance likely',
    complexityScore: 3,
    color: '#ec4899',
  },
};

export const CHANGE_CHARACTERISTICS = [
  { id: 'customer_facing', label: 'Affects customer-facing processes', score: 1 },
  { id: 'job_role_changes', label: 'Involves job role changes', score: 1 },
  { id: 'new_skills', label: 'Requires new skills acquisition', score: 1 },
  { id: 'multi_department', label: 'Impacts more than 3 departments', score: 1 },
  { id: 'regulatory_deadline', label: 'Has regulatory deadline', score: 1 },
  { id: 'previous_failure', label: 'Follows previous failed attempt', score: 1 },
  { id: 'competing_changes', label: 'Competes with other active changes', score: 1 },
  { id: 'c_level_sponsor', label: 'Sponsored at C-level', score: 0 },
  { id: 'union_involvement', label: 'Union/works council involvement required', score: 1 },
];

export const IMPACT_CATEGORIES = {
  PROCESS: { id: 'PROCESS', name: 'Process', description: 'Changes to workflows, procedures, handoffs' },
  BEHAVIOUR: { id: 'BEHAVIOUR', name: 'Behaviour', description: 'Changes to habits, practices, interactions' },
  SKILLS: { id: 'SKILLS', name: 'Skills', description: 'New capabilities required' },
  TOOLS: { id: 'TOOLS', name: 'Tools', description: 'Systems, applications, equipment' },
  IDENTITY: { id: 'IDENTITY', name: 'Identity', description: 'Role definition, status, autonomy' },
  RELATIONSHIPS: { id: 'RELATIONSHIPS', name: 'Relationships', description: 'Reporting lines, team structures, collaboration' },
  WORKLOAD: { id: 'WORKLOAD', name: 'Workload', description: 'Volume, pace, capacity' },
  LOCATION: { id: 'LOCATION', name: 'Location', description: 'Physical or remote work changes' },
};

export const IMPACT_LEVELS = {
  NONE: { id: 'NONE', name: 'None', color: '#9ca3af', score: 0 },
  LOW: { id: 'LOW', name: 'Low', color: '#22c55e', score: 1 },
  MEDIUM: { id: 'MEDIUM', name: 'Medium', color: '#f59e0b', score: 2 },
  HIGH: { id: 'HIGH', name: 'High', color: '#f97316', score: 3 },
  CRITICAL: { id: 'CRITICAL', name: 'Critical', color: '#dc2626', score: 4 },
};

export const INFLUENCE_LEVELS = {
  LOW: { id: 'LOW', name: 'Low', color: '#22c55e' },
  MEDIUM: { id: 'MEDIUM', name: 'Medium', color: '#f59e0b' },
  HIGH: { id: 'HIGH', name: 'High', color: '#dc2626' },
};

export const READINESS_LEVELS = {
  UNKNOWN: { id: 'UNKNOWN', name: 'Unknown', color: '#9ca3af' },
  LOW: { id: 'LOW', name: 'Low', color: '#dc2626' },
  MEDIUM: { id: 'MEDIUM', name: 'Medium', color: '#f59e0b' },
  HIGH: { id: 'HIGH', name: 'High', color: '#22c55e' },
};

export const ASSESSMENT_STATUS = {
  NOT_STARTED: { id: 'NOT_STARTED', name: 'Not Started', color: '#9ca3af' },
  IN_PROGRESS: { id: 'IN_PROGRESS', name: 'In Progress', color: '#3b82f6' },
  COMPLETE: { id: 'COMPLETE', name: 'Complete', color: '#22c55e' },
};

export const RISK_STATUS = {
  OPEN: { id: 'OPEN', name: 'Open', color: '#dc2626' },
  WATCHING: { id: 'WATCHING', name: 'Watching', color: '#f59e0b' },
  MITIGATED: { id: 'MITIGATED', name: 'Mitigated', color: '#22c55e' },
  CLOSED: { id: 'CLOSED', name: 'Closed', color: '#9ca3af' },
  OCCURRED: { id: 'OCCURRED', name: 'Occurred', color: '#7c3aed' },
};

// ============ PCT ASSESSMENT TEMPLATE ============
// 4 groups of 10 questions, each scored 1-3
// Group totals: 10-19 = Red (High risk), 20-24 = Amber (Alert), 25-30 = Green (Strength)

export const PCT_GROUPS = {
  leadership: {
    id: 'leadership',
    name: 'Leadership / Sponsorship',
    tag: 'Sponsor & direction',
    description: 'Assess the strength of executive sponsorship and leadership alignment',
  },
  project: {
    id: 'project',
    name: 'Project Management',
    tag: 'Delivery engine',
    description: 'Assess the robustness of project planning and execution capabilities',
  },
  change: {
    id: 'change',
    name: 'Change Management',
    tag: 'People & adoption',
    description: 'Assess the readiness for managing the people side of change',
  },
  success: {
    id: 'success',
    name: 'Success Factors',
    tag: 'Value & outcomes',
    description: 'Assess clarity of benefits and likelihood of realizing value',
  },
};

export const PCT_QUESTIONS = {
  leadership: [
    { id: 'L1', text: 'Leadership visibly sponsors the change.' },
    { id: 'L2', text: 'Leaders communicate a clear and shared vision.' },
    { id: 'L3', text: 'Leaders allocate sufficient time to the initiative.' },
    { id: 'L4', text: 'Leaders actively remove obstacles and blockers.' },
    { id: 'L5', text: 'Leadership team is aligned on priorities.' },
    { id: 'L6', text: 'Leaders model the desired new behaviours.' },
    { id: 'L7', text: 'There is a clear single accountable sponsor.' },
    { id: 'L8', text: 'Leaders openly address resistance to change.' },
    { id: 'L9', text: 'Leaders provide consistent messages over time.' },
    { id: 'L10', text: 'Leaders link the change to strategic objectives.' },
  ],
  project: [
    { id: 'P1', text: 'Objectives and scope are clearly defined.' },
    { id: 'P2', text: 'Deliverables and milestones are realistic.' },
    { id: 'P3', text: 'Roles and responsibilities are clear.' },
    { id: 'P4', text: 'Risks are identified and managed.' },
    { id: 'P5', text: 'Dependencies are known and monitored.' },
    { id: 'P6', text: 'The project has sufficient resources and skills.' },
    { id: 'P7', text: 'There is a workable plan with agreed timelines.' },
    { id: 'P8', text: 'Progress is tracked with meaningful KPIs.' },
    { id: 'P9', text: 'Decisions are made quickly when issues arise.' },
    { id: 'P10', text: 'There is an effective governance structure.' },
  ],
  change: [
    { id: 'C1', text: 'Stakeholders are identified and understood.' },
    { id: 'C2', text: 'There is a clear change story for impacted groups.' },
    { id: 'C3', text: 'Impact analysis has been done for key roles.' },
    { id: 'C4', text: 'There is a structured communication plan.' },
    { id: 'C5', text: 'Training and enablement plans are defined.' },
    { id: 'C6', text: 'Resistance is anticipated and managed.' },
    { id: 'C7', text: 'Local change agents or champions are in place.' },
    { id: 'C8', text: 'Feedback loops with users are established.' },
    { id: 'C9', text: 'Measures exist to reinforce new behaviours.' },
    { id: 'C10', text: 'There is a plan for sustaining the change.' },
  ],
  success: [
    { id: 'S1', text: 'Expected benefits are clearly defined.' },
    { id: 'S2', text: 'Success metrics are agreed and measurable.' },
    { id: 'S3', text: 'There is a baseline to compare results against.' },
    { id: 'S4', text: 'Ownership for benefits realisation is clear.' },
    { id: 'S5', text: 'Tracking of benefits is planned over time.' },
    { id: 'S6', text: 'The solution addresses a real business problem.' },
    { id: 'S7', text: 'Users see personal value in the change.' },
    { id: 'S8', text: 'The change fits with other initiatives.' },
    { id: 'S9', text: 'Risks to benefits are understood and managed.' },
    { id: 'S10', text: 'There is leadership commitment to realise benefits.' },
  ],
};

// Score thresholds for color coding (per group, max 30)
export const PCT_THRESHOLDS = {
  RED: { min: 10, max: 19, label: 'High risk/threat', description: 'Needs immediate action' },
  AMBER: { min: 20, max: 24, label: 'Alert/possible risk', description: 'Needs further investigation' },
  GREEN: { min: 25, max: 30, label: 'Strength', description: 'Should be leveraged and maintained' },
};

export function getPCTScoreColor(score) {
  if (score >= 25) return { color: '#22c55e', bg: '#dcfce7', level: 'green', label: 'Strength' };
  if (score >= 20) return { color: '#f59e0b', bg: '#fef3c7', level: 'amber', label: 'Alert' };
  if (score >= 10) return { color: '#dc2626', bg: '#fee2e2', level: 'red', label: 'High Risk' };
  return { color: '#9ca3af', bg: '#f3f4f6', level: 'none', label: 'Not Scored' };
}

// ============ CONTEXT ============

const ChangeContext = createContext({
  // State
  changeContext: null,
  stakeholderGroups: [],
  impactAssessments: [],
  assessments: [],
  risks: [],
  loading: false,
  error: null,

  // Actions
  loadChangeData: async () => {},
  createChangeContext: async () => null,
  updateChangeContext: async () => null,
  createStakeholderGroup: async () => null,
  updateStakeholderGroup: async () => null,
  deleteStakeholderGroup: async () => null,
  createAssessment: async () => null,
  updateAssessment: async () => null,
  createRisk: async () => null,
  updateRisk: async () => null,

  // Computed
  complexityScore: 0,
  overallReadiness: null,
  coverageGaps: [],
});

export function useChange() {
  return useContext(ChangeContext);
}

export function ChangeProvider({ children }) {
  const { activeProject } = useProjects();
  const { user, role } = useAuth();

  // Core state
  const [changeContext, setChangeContext] = useState(null);
  const [stakeholderGroups, setStakeholderGroups] = useState([]);
  const [impactAssessments, setImpactAssessments] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============ API CALLS ============

  const loadChangeData = useCallback(async () => {
    if (!activeProject?.id) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/cm/${activeProject.id}`, {
        headers: { 'x-user': user, 'x-role': role },
      });

      if (res.ok) {
        const data = await res.json();
        setChangeContext(data.changeContext || null);
        setStakeholderGroups(data.stakeholderGroups || []);
        setImpactAssessments(data.impactAssessments || []);
        setAssessments(data.assessments || []);
        setRisks(data.risks || []);
      } else if (res.status === 404) {
        // No change context yet - that's ok
        setChangeContext(null);
        setStakeholderGroups([]);
        setImpactAssessments([]);
        setAssessments([]);
        setRisks([]);
      } else {
        throw new Error('Failed to load change data');
      }
    } catch (err) {
      console.error('[ChangeContext] Load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeProject?.id, user, role]);

  // Load data when project changes
  useEffect(() => {
    if (activeProject?.id) {
      loadChangeData();
    }
  }, [activeProject?.id, loadChangeData]);

  // ============ CHANGE CONTEXT OPERATIONS ============

  const createChangeContext = useCallback(async (data) => {
    if (!activeProject?.id) return null;

    try {
      const res = await fetch(`/api/cm/${activeProject.id}/context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': role },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const created = await res.json();
        setChangeContext(created);
        return created;
      }
      return null;
    } catch (err) {
      console.error('[ChangeContext] Create error:', err);
      return null;
    }
  }, [activeProject?.id, user, role]);

  const updateChangeContext = useCallback(async (data) => {
    if (!activeProject?.id || !changeContext?.id) return null;

    try {
      const res = await fetch(`/api/cm/${activeProject.id}/context`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': role },
        body: JSON.stringify({ ...changeContext, ...data }),
      });

      if (res.ok) {
        const updated = await res.json();
        setChangeContext(updated);
        return updated;
      }
      return null;
    } catch (err) {
      console.error('[ChangeContext] Update error:', err);
      return null;
    }
  }, [activeProject?.id, changeContext, user, role]);

  // ============ STAKEHOLDER GROUP OPERATIONS ============

  const createStakeholderGroup = useCallback(async (data) => {
    if (!activeProject?.id) return null;

    try {
      const res = await fetch(`/api/cm/${activeProject.id}/stakeholders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': role },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const created = await res.json();
        setStakeholderGroups(prev => [...prev, created]);
        return created;
      }
      return null;
    } catch (err) {
      console.error('[ChangeContext] Create stakeholder error:', err);
      return null;
    }
  }, [activeProject?.id, user, role]);

  const updateStakeholderGroup = useCallback(async (id, data) => {
    if (!activeProject?.id) return null;

    try {
      const res = await fetch(`/api/cm/${activeProject.id}/stakeholders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': role },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const updated = await res.json();
        setStakeholderGroups(prev => prev.map(s => s.id === id ? updated : s));
        return updated;
      }
      return null;
    } catch (err) {
      console.error('[ChangeContext] Update stakeholder error:', err);
      return null;
    }
  }, [activeProject?.id, user, role]);

  const deleteStakeholderGroup = useCallback(async (id) => {
    if (!activeProject?.id) return false;

    try {
      const res = await fetch(`/api/cm/${activeProject.id}/stakeholders/${id}`, {
        method: 'DELETE',
        headers: { 'x-user': user, 'x-role': role },
      });

      if (res.ok) {
        setStakeholderGroups(prev => prev.filter(s => s.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('[ChangeContext] Delete stakeholder error:', err);
      return false;
    }
  }, [activeProject?.id, user, role]);

  // ============ ASSESSMENT OPERATIONS ============

  const createAssessment = useCallback(async (data) => {
    if (!activeProject?.id) return null;

    try {
      const res = await fetch(`/api/cm/${activeProject.id}/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': role },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const created = await res.json();
        setAssessments(prev => [...prev, created]);
        return created;
      }
      return null;
    } catch (err) {
      console.error('[ChangeContext] Create assessment error:', err);
      return null;
    }
  }, [activeProject?.id, user, role]);

  const updateAssessment = useCallback(async (id, data) => {
    if (!activeProject?.id) return null;

    try {
      const res = await fetch(`/api/cm/${activeProject.id}/assessments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': role },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const updated = await res.json();
        setAssessments(prev => prev.map(a => a.id === id ? updated : a));
        return updated;
      }
      return null;
    } catch (err) {
      console.error('[ChangeContext] Update assessment error:', err);
      return null;
    }
  }, [activeProject?.id, user, role]);

  // ============ RISK OPERATIONS ============

  const createRisk = useCallback(async (data) => {
    if (!activeProject?.id) return null;

    try {
      const res = await fetch(`/api/cm/${activeProject.id}/risks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': role },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const created = await res.json();
        setRisks(prev => [...prev, created]);
        return created;
      }
      return null;
    } catch (err) {
      console.error('[ChangeContext] Create risk error:', err);
      return null;
    }
  }, [activeProject?.id, user, role]);

  const updateRisk = useCallback(async (id, data) => {
    if (!activeProject?.id) return null;

    try {
      const res = await fetch(`/api/cm/${activeProject.id}/risks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': role },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const updated = await res.json();
        setRisks(prev => prev.map(r => r.id === id ? updated : r));
        return updated;
      }
      return null;
    } catch (err) {
      console.error('[ChangeContext] Update risk error:', err);
      return null;
    }
  }, [activeProject?.id, user, role]);

  const deleteRisk = useCallback(async (id) => {
    if (!activeProject?.id) return false;

    try {
      const res = await fetch(`/api/cm/${activeProject.id}/risks/${id}`, {
        method: 'DELETE',
        headers: { 'x-user': user, 'x-role': role },
      });

      if (res.ok) {
        setRisks(prev => prev.filter(r => r.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('[ChangeContext] Delete risk error:', err);
      return false;
    }
  }, [activeProject?.id, user, role]);

  // ============ IMPACT ASSESSMENT OPERATIONS ============

  const createImpactAssessment = useCallback(async (data) => {
    if (!activeProject?.id) return null;

    try {
      const res = await fetch(`/api/cm/${activeProject.id}/impacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': role },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const created = await res.json();
        setImpactAssessments(prev => [...prev, created]);
        return created;
      }
      return null;
    } catch (err) {
      console.error('[ChangeContext] Create impact assessment error:', err);
      return null;
    }
  }, [activeProject?.id, user, role]);

  const updateImpactAssessment = useCallback(async (id, data) => {
    if (!activeProject?.id) return null;

    try {
      const res = await fetch(`/api/cm/${activeProject.id}/impacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': role },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const updated = await res.json();
        setImpactAssessments(prev => prev.map(ia => ia.id === id ? updated : ia));
        return updated;
      }
      return null;
    } catch (err) {
      console.error('[ChangeContext] Update impact assessment error:', err);
      return null;
    }
  }, [activeProject?.id, user, role]);

  const deleteImpactAssessment = useCallback(async (id) => {
    if (!activeProject?.id) return false;

    try {
      const res = await fetch(`/api/cm/${activeProject.id}/impacts/${id}`, {
        method: 'DELETE',
        headers: { 'x-user': user, 'x-role': role },
      });

      if (res.ok) {
        setImpactAssessments(prev => prev.filter(ia => ia.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('[ChangeContext] Delete impact assessment error:', err);
      return false;
    }
  }, [activeProject?.id, user, role]);

  // ============ COMPUTED VALUES ============

  // Calculate complexity score based on change type and characteristics
  const complexityScore = useMemo(() => {
    if (!changeContext) return 0;

    const typeScore = CHANGE_TYPES[changeContext.changeType]?.complexityScore || 0;
    const charScore = (changeContext.characteristics || []).reduce((sum, charId) => {
      const char = CHANGE_CHARACTERISTICS.find(c => c.id === charId);
      return sum + (char?.score || 0);
    }, 0);

    return typeScore + charScore;
  }, [changeContext]);

  // Get complexity level from score
  const complexityLevel = useMemo(() => {
    if (complexityScore <= 3) return { level: 'Low', color: '#22c55e' };
    if (complexityScore <= 6) return { level: 'Medium', color: '#f59e0b' };
    return { level: 'High', color: '#dc2626' };
  }, [complexityScore]);

  // Calculate overall readiness from latest PCT assessment
  const overallReadiness = useMemo(() => {
    const pctAssessments = assessments.filter(a => a.templateType === 'PCT' && a.status === 'COMPLETE');
    if (pctAssessments.length === 0) return null;

    const latest = pctAssessments.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
    return {
      assessment: latest,
      score: latest.overallScore,
      percentage: Math.round((latest.overallScore / 5) * 100),
    };
  }, [assessments]);

  // Calculate coverage gaps
  const coverageGaps = useMemo(() => {
    const gaps = [];

    if (!changeContext?.title) {
      gaps.push({ id: 'definition', label: 'Change Definition documented', section: 'definition' });
    }

    if (stakeholderGroups.length < 3) {
      gaps.push({ id: 'stakeholders', label: 'Stakeholder groups identified (min 3)', section: 'stakeholders' });
    }

    const hasImpactAssessment = impactAssessments.length > 0;
    if (!hasImpactAssessment) {
      gaps.push({ id: 'impact', label: 'Impact assessment completed', section: 'impact' });
    }

    const hasPCT = assessments.some(a => a.templateType === 'PCT' && a.status === 'COMPLETE');
    if (!hasPCT) {
      gaps.push({ id: 'pct', label: 'PCT Assessment completed', section: 'assessments' });
    }

    if (!changeContext?.sponsorId) {
      gaps.push({ id: 'sponsorship', label: 'Sponsorship model defined', section: 'strategy' });
    }

    return gaps;
  }, [changeContext, stakeholderGroups, impactAssessments, assessments]);

  // Stakeholders at risk
  const stakeholdersAtRisk = useMemo(() => {
    return stakeholderGroups.filter(s =>
      s.impactLevel === 'HIGH' && (s.readinessLevel === 'LOW' || s.readinessLevel === 'UNKNOWN')
    );
  }, [stakeholderGroups]);

  // Open assessments
  const openAssessments = useMemo(() => {
    return assessments.filter(a => a.status !== 'COMPLETE');
  }, [assessments]);

  // Unaddressed risks
  const unaddressedRisks = useMemo(() => {
    return risks.filter(r => r.mitigationStatus === 'NONE' && r.status === 'OPEN');
  }, [risks]);

  // ============ CONTEXT VALUE ============

  const value = useMemo(() => ({
    // State
    changeContext,
    stakeholderGroups,
    impactAssessments,
    assessments,
    risks,
    loading,
    error,

    // Actions
    loadChangeData,
    createChangeContext,
    updateChangeContext,
    createStakeholderGroup,
    updateStakeholderGroup,
    deleteStakeholderGroup,
    createAssessment,
    updateAssessment,
    createRisk,
    updateRisk,
    deleteRisk,
    createImpactAssessment,
    updateImpactAssessment,
    deleteImpactAssessment,

    // Computed
    complexityScore,
    complexityLevel,
    overallReadiness,
    coverageGaps,
    stakeholdersAtRisk,
    openAssessments,
    unaddressedRisks,
  }), [
    changeContext, stakeholderGroups, impactAssessments, assessments, risks, loading, error,
    loadChangeData, createChangeContext, updateChangeContext,
    createStakeholderGroup, updateStakeholderGroup, deleteStakeholderGroup,
    createAssessment, updateAssessment, createRisk, updateRisk, deleteRisk,
    createImpactAssessment, updateImpactAssessment, deleteImpactAssessment,
    complexityScore, complexityLevel, overallReadiness, coverageGaps,
    stakeholdersAtRisk, openAssessments, unaddressedRisks,
  ]);

  return (
    <ChangeContext.Provider value={value}>
      {children}
    </ChangeContext.Provider>
  );
}

export default ChangeContext;
