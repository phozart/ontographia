// components/RequirementContext.js
// BABOK-Aligned Requirement Structure Engine (EPIC 2)
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useDomains } from './DomainContext';
import { useProjects } from './ProjectContext';

// ============ FR-2.1 REQUIREMENT TYPES ============
export const REQUIREMENT_TYPES = {
  BUSINESS_NEED: {
    id: 'BUSINESS_NEED',
    name: 'Business Need',
    shortName: 'BN',
    description: 'High-level statement of a business problem, opportunity, or goal',
    color: '#dc2626',
    icon: 'BN',
    level: 0, // Top level - nothing derives from it
    allowedParentTypes: [], // Cannot derive from anything
    requiredTraceability: false,
  },
  BUSINESS_REQUIREMENT: {
    id: 'BUSINESS_REQUIREMENT',
    name: 'Business Requirement',
    shortName: 'BR',
    description: 'Goals, objectives, and outcomes that describe why a change is needed',
    color: '#f97316',
    icon: 'BR',
    level: 1,
    allowedParentTypes: ['BUSINESS_NEED'],
    requiredTraceability: true, // Must trace to Business Need (FR-2.4)
  },
  STAKEHOLDER_REQUIREMENT: {
    id: 'STAKEHOLDER_REQUIREMENT',
    name: 'Stakeholder Requirement',
    shortName: 'SR',
    description: 'Needs of a specific stakeholder or class of stakeholders',
    color: '#fb923c',
    icon: 'SR',
    level: 2,
    allowedParentTypes: ['BUSINESS_REQUIREMENT'],
    requiredTraceability: true,
  },
  SOLUTION_REQUIREMENT_FUNCTIONAL: {
    id: 'SOLUTION_REQUIREMENT_FUNCTIONAL',
    name: 'Functional Requirement',
    shortName: 'FR',
    description: 'Behavior that the solution must exhibit',
    color: '#22c55e',
    icon: 'FR',
    level: 3,
    allowedParentTypes: ['BUSINESS_REQUIREMENT', 'STAKEHOLDER_REQUIREMENT'],
    requiredTraceability: true, // Must trace to higher-level requirement (FR-2.4)
  },
  SOLUTION_REQUIREMENT_NONFUNCTIONAL: {
    id: 'SOLUTION_REQUIREMENT_NONFUNCTIONAL',
    name: 'Non-Functional Requirement',
    shortName: 'NFR',
    description: 'Quality attributes or constraints on the solution',
    color: '#4ade80',
    icon: 'NFR',
    level: 3,
    allowedParentTypes: ['BUSINESS_REQUIREMENT', 'STAKEHOLDER_REQUIREMENT'],
    requiredTraceability: true,
  },
  TRANSITION_REQUIREMENT: {
    id: 'TRANSITION_REQUIREMENT',
    name: 'Transition Requirement',
    shortName: 'TR',
    description: 'Capabilities needed to transition from current to future state',
    color: '#86efac',
    icon: 'TR',
    level: 3,
    allowedParentTypes: ['BUSINESS_REQUIREMENT', 'STAKEHOLDER_REQUIREMENT', 'SOLUTION_REQUIREMENT_FUNCTIONAL'],
    requiredTraceability: true,
  },
  CONSTRAINT: {
    id: 'CONSTRAINT',
    name: 'Constraint',
    shortName: 'CN',
    description: 'A limitation or restriction on the solution',
    color: '#f87171',
    icon: 'CN',
    level: 2,
    allowedParentTypes: ['BUSINESS_NEED', 'BUSINESS_REQUIREMENT'],
    requiredTraceability: false,
  },
  ASSUMPTION: {
    id: 'ASSUMPTION',
    name: 'Assumption',
    shortName: 'AS',
    description: 'A factor believed to be true but not confirmed',
    color: '#fcd34d',
    icon: 'AS',
    level: 2,
    allowedParentTypes: ['BUSINESS_NEED', 'BUSINESS_REQUIREMENT'],
    requiredTraceability: false,
  },
  RISK: {
    id: 'RISK',
    name: 'Risk',
    shortName: 'RK',
    description: 'A potential event that could negatively impact the project',
    color: '#ef4444',
    icon: 'RK',
    level: 2,
    allowedParentTypes: ['BUSINESS_NEED', 'BUSINESS_REQUIREMENT', 'ASSUMPTION'],
    requiredTraceability: false,
  },
};

// ============ FR-2.2 REQUIREMENT STATUS ============
export const REQUIREMENT_STATUS = {
  DRAFT: { id: 'DRAFT', name: 'Draft', color: '#94a3b8' },
  PROPOSED: { id: 'PROPOSED', name: 'Proposed', color: '#60a5fa' },
  IN_REVIEW: { id: 'IN_REVIEW', name: 'In Review', color: '#fbbf24' },
  APPROVED: { id: 'APPROVED', name: 'Approved', color: '#22c55e' },
  IMPLEMENTED: { id: 'IMPLEMENTED', name: 'Implemented', color: '#8b5cf6' },
  VERIFIED: { id: 'VERIFIED', name: 'Verified', color: '#06b6d4' },
  DEFERRED: { id: 'DEFERRED', name: 'Deferred', color: '#f59e0b' },
  REJECTED: { id: 'REJECTED', name: 'Rejected', color: '#ef4444' },
  DEPRECATED: { id: 'DEPRECATED', name: 'Deprecated', color: '#6b7280' },
};

// ============ FR-2.2 REQUIREMENT PRIORITY ============
export const REQUIREMENT_PRIORITY = {
  CRITICAL: { id: 'CRITICAL', name: 'Critical', color: '#dc2626', weight: 4 },
  HIGH: { id: 'HIGH', name: 'High', color: '#f97316', weight: 3 },
  MEDIUM: { id: 'MEDIUM', name: 'Medium', color: '#fbbf24', weight: 2 },
  LOW: { id: 'LOW', name: 'Low', color: '#22c55e', weight: 1 },
};

// ============ FR-2.3 RELATIONSHIP TYPES ============
export const REQUIREMENT_RELATIONSHIPS = {
  DERIVES_FROM: {
    id: 'DERIVES_FROM',
    name: 'Derives From',
    description: 'This requirement is derived from another requirement',
    inverse: 'PARENT_OF',
    color: '#f97316',
  },
  REFINES: {
    id: 'REFINES',
    name: 'Refines',
    description: 'This requirement adds detail to another requirement',
    inverse: 'REFINED_BY',
    color: '#ec4899',
  },
  SATISFIES: {
    id: 'SATISFIES',
    name: 'Satisfies',
    description: 'This requirement satisfies another requirement',
    inverse: 'SATISFIED_BY',
    color: '#22c55e',
  },
  CONSTRAINS: {
    id: 'CONSTRAINS',
    name: 'Constrains',
    description: 'This requirement places constraints on another',
    inverse: 'CONSTRAINED_BY',
    color: '#f87171',
  },
  DEPENDS_ON: {
    id: 'DEPENDS_ON',
    name: 'Depends On',
    description: 'This requirement depends on another being implemented first',
    inverse: 'DEPENDED_ON_BY',
    color: '#6366f1',
  },
  CONFLICTS_WITH: {
    id: 'CONFLICTS_WITH',
    name: 'Conflicts With',
    description: 'This requirement conflicts with another requirement',
    inverse: 'CONFLICTS_WITH',
    color: '#ef4444',
  },
  RELATED_TO: {
    id: 'RELATED_TO',
    name: 'Related To',
    description: 'This requirement is related to another requirement',
    inverse: 'RELATED_TO',
    color: '#94a3b8',
  },
};

// Generate unique requirement ID
const generateRequirementId = (type, projectId, sequence) => {
  const prefix = REQUIREMENT_TYPES[type]?.shortName || 'REQ';
  return `${prefix}-${sequence.toString().padStart(4, '0')}`;
};

// Context
const RequirementContext = createContext({
  requirements: [],
  relationships: [],
  getRequirement: () => null,
  createRequirement: () => {},
  updateRequirement: () => {},
  deleteRequirement: () => {},
  createRelationship: () => {},
  deleteRelationship: () => {},
  getRequirementRelationships: () => [],
  getRequirementChildren: () => [],
  getRequirementParents: () => [],
  validateRequirement: () => ({ valid: true, errors: [] }),
  validateAllRequirements: () => [],
  getRequirementsByType: () => [],
  getRequirementsByStatus: () => [],
  searchRequirements: () => [],
  getTraceabilityMatrix: () => [],
  loading: false,
  error: '',
});

export function RequirementProvider({ children }) {
  const { user } = useAuth();
  const { activeDomain } = useDomains();
  const { activeProject, updateProject } = useProjects();
  const [requirements, setRequirements] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sequence, setSequence] = useState(1);

  // Load requirements for active project
  useEffect(() => {
    if (!user || !activeProject) {
      setRequirements([]);
      setRelationships([]);
      return;
    }

    async function loadRequirements() {
      setLoading(true);
      setError('');
      try {
        const storageKey = `ba-requirements-${activeProject.id}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const data = JSON.parse(stored);
          setRequirements(data.requirements || []);
          setRelationships(data.relationships || []);
          setSequence(data.sequence || 1);
        } else {
          setRequirements([]);
          setRelationships([]);
          setSequence(1);
        }
      } catch (e) {
        setError(e.message || 'Failed to load requirements');
        setRequirements([]);
        setRelationships([]);
      } finally {
        setLoading(false);
      }
    }

    loadRequirements();
  }, [user, activeProject]);

  // Save requirements to storage
  const saveRequirements = useCallback((reqs, rels, seq) => {
    if (!activeProject) return;
    const storageKey = `ba-requirements-${activeProject.id}`;
    localStorage.setItem(storageKey, JSON.stringify({
      requirements: reqs,
      relationships: rels,
      sequence: seq,
    }));

    // Update project stats
    const statusCounts = reqs.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    updateProject(activeProject.id, {
      stats: {
        ...activeProject.stats,
        requirementsCount: reqs.length,
        pendingApprovals: statusCounts.IN_REVIEW || 0,
      },
    });
  }, [activeProject, updateProject]);

  // Get single requirement
  const getRequirement = useCallback((id) => {
    return requirements.find(r => r.id === id) || null;
  }, [requirements]);

  // ============ FR-2.4 VALIDATION RULES ============
  const validateRequirement = useCallback((requirement) => {
    const errors = [];
    const warnings = [];
    const typeDef = REQUIREMENT_TYPES[requirement.type];

    // Check required fields
    if (!requirement.title?.trim()) {
      errors.push('Title is required');
    }
    if (!requirement.type) {
      errors.push('Type is required');
    }

    // Check traceability (FR-2.4)
    if (typeDef?.requiredTraceability) {
      const parentRels = relationships.filter(
        r => r.targetId === requirement.id &&
        (r.type === 'DERIVES_FROM' || r.type === 'REFINES' || r.type === 'SATISFIES')
      );

      if (parentRels.length === 0) {
        if (requirement.type === 'BUSINESS_REQUIREMENT') {
          errors.push('Business Requirement must trace to at least one Business Need');
        } else if (requirement.type.startsWith('SOLUTION_REQUIREMENT')) {
          errors.push('Solution Requirement must trace to a higher-level requirement');
        } else if (typeDef.requiredTraceability) {
          warnings.push(`${typeDef.name} should trace to a higher-level requirement`);
        }
      }

      // Validate parent types
      parentRels.forEach(rel => {
        const parentReq = requirements.find(r => r.id === rel.sourceId);
        if (parentReq && typeDef.allowedParentTypes.length > 0) {
          if (!typeDef.allowedParentTypes.includes(parentReq.type)) {
            warnings.push(`${typeDef.name} typically derives from ${typeDef.allowedParentTypes.map(t => REQUIREMENT_TYPES[t]?.name).join(' or ')}`);
          }
        }
      });
    }

    // Check for acceptance criteria on functional requirements
    if (requirement.type === 'SOLUTION_REQUIREMENT_FUNCTIONAL') {
      if (!requirement.acceptanceCriteria?.length) {
        warnings.push('Functional requirements should have acceptance criteria');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }, [requirements, relationships]);

  // Validate all requirements
  const validateAllRequirements = useCallback(() => {
    return requirements.map(req => ({
      requirement: req,
      validation: validateRequirement(req),
    })).filter(r => !r.validation.valid || r.validation.warnings.length > 0);
  }, [requirements, validateRequirement]);

  // Create requirement (FR-2.1, FR-2.2)
  const createRequirement = useCallback((data) => {
    const newSequence = sequence + 1;
    const newRequirement = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      displayId: generateRequirementId(data.type, activeProject?.id, newSequence),
      // FR-2.2 Attributes
      title: data.title || '',
      description: data.description || '',
      type: data.type || 'BUSINESS_REQUIREMENT',
      priority: data.priority || 'MEDIUM',
      status: data.status || 'DRAFT',
      owner: data.owner || user,
      source: data.source || '',
      acceptanceCriteria: data.acceptanceCriteria || [],
      // Metadata
      projectId: activeProject?.id,
      createdBy: user,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      // Custom fields
      rationale: data.rationale || '',
      notes: data.notes || '',
      tags: data.tags || [],
    };

    const updatedReqs = [...requirements, newRequirement];
    setRequirements(updatedReqs);
    setSequence(newSequence);
    saveRequirements(updatedReqs, relationships, newSequence);

    return newRequirement;
  }, [requirements, relationships, sequence, activeProject, user, saveRequirements]);

  // Update requirement
  const updateRequirement = useCallback((id, updates) => {
    const updatedReqs = requirements.map(req => {
      if (req.id === id) {
        return {
          ...req,
          ...updates,
          updatedAt: new Date().toISOString(),
          version: (req.version || 1) + 1,
        };
      }
      return req;
    });
    setRequirements(updatedReqs);
    saveRequirements(updatedReqs, relationships, sequence);
  }, [requirements, relationships, sequence, saveRequirements]);

  // Delete requirement
  const deleteRequirement = useCallback((id) => {
    const updatedReqs = requirements.filter(r => r.id !== id);
    const updatedRels = relationships.filter(r => r.sourceId !== id && r.targetId !== id);
    setRequirements(updatedReqs);
    setRelationships(updatedRels);
    saveRequirements(updatedReqs, updatedRels, sequence);
  }, [requirements, relationships, sequence, saveRequirements]);

  // Create relationship (FR-2.3)
  const createRelationship = useCallback((sourceId, targetId, type) => {
    // Prevent duplicate relationships
    const exists = relationships.some(
      r => r.sourceId === sourceId && r.targetId === targetId && r.type === type
    );
    if (exists) return null;

    // Prevent self-references
    if (sourceId === targetId) return null;

    const newRelationship = {
      id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sourceId,
      targetId,
      type,
      createdBy: user,
      createdAt: new Date().toISOString(),
    };

    const updatedRels = [...relationships, newRelationship];
    setRelationships(updatedRels);
    saveRequirements(requirements, updatedRels, sequence);

    return newRelationship;
  }, [requirements, relationships, sequence, user, saveRequirements]);

  // Delete relationship
  const deleteRelationship = useCallback((id) => {
    const updatedRels = relationships.filter(r => r.id !== id);
    setRelationships(updatedRels);
    saveRequirements(requirements, updatedRels, sequence);
  }, [requirements, relationships, sequence, saveRequirements]);

  // Get relationships for a requirement
  const getRequirementRelationships = useCallback((reqId) => {
    return relationships.filter(r => r.sourceId === reqId || r.targetId === reqId);
  }, [relationships]);

  // Get child requirements (that derive from this one)
  const getRequirementChildren = useCallback((reqId) => {
    const childIds = relationships
      .filter(r => r.sourceId === reqId && r.type === 'DERIVES_FROM')
      .map(r => r.targetId);
    return requirements.filter(r => childIds.includes(r.id));
  }, [requirements, relationships]);

  // Get parent requirements (that this one derives from)
  const getRequirementParents = useCallback((reqId) => {
    const parentIds = relationships
      .filter(r => r.targetId === reqId && r.type === 'DERIVES_FROM')
      .map(r => r.sourceId);
    return requirements.filter(r => parentIds.includes(r.id));
  }, [requirements, relationships]);

  // Get requirements by type
  const getRequirementsByType = useCallback((type) => {
    return requirements.filter(r => r.type === type);
  }, [requirements]);

  // Get requirements by status
  const getRequirementsByStatus = useCallback((status) => {
    return requirements.filter(r => r.status === status);
  }, [requirements]);

  // Search requirements
  const searchRequirements = useCallback((query) => {
    const lowerQuery = query.toLowerCase();
    return requirements.filter(r =>
      r.title?.toLowerCase().includes(lowerQuery) ||
      r.description?.toLowerCase().includes(lowerQuery) ||
      r.displayId?.toLowerCase().includes(lowerQuery) ||
      r.tags?.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }, [requirements]);

  // Get traceability matrix (FR-6.1 preview)
  const getTraceabilityMatrix = useCallback(() => {
    const matrix = {};

    // Build hierarchy from Business Need down
    const businessNeeds = requirements.filter(r => r.type === 'BUSINESS_NEED');

    businessNeeds.forEach(bn => {
      matrix[bn.id] = {
        requirement: bn,
        children: [],
      };

      // Find Business Requirements that trace to this Business Need
      const brIds = relationships
        .filter(r => r.sourceId === bn.id && r.type === 'DERIVES_FROM')
        .map(r => r.targetId);

      brIds.forEach(brId => {
        const br = requirements.find(r => r.id === brId);
        if (br) {
          const brNode = { requirement: br, children: [] };
          matrix[bn.id].children.push(brNode);

          // Find Solution Requirements that trace to this BR
          const srIds = relationships
            .filter(r => r.sourceId === brId && r.type === 'DERIVES_FROM')
            .map(r => r.targetId);

          srIds.forEach(srId => {
            const sr = requirements.find(r => r.id === srId);
            if (sr) {
              brNode.children.push({ requirement: sr, children: [] });
            }
          });
        }
      });
    });

    return matrix;
  }, [requirements, relationships]);

  const value = {
    requirements,
    relationships,
    getRequirement,
    createRequirement,
    updateRequirement,
    deleteRequirement,
    createRelationship,
    deleteRelationship,
    getRequirementRelationships,
    getRequirementChildren,
    getRequirementParents,
    validateRequirement,
    validateAllRequirements,
    getRequirementsByType,
    getRequirementsByStatus,
    searchRequirements,
    getTraceabilityMatrix,
    loading,
    error,
    REQUIREMENT_TYPES,
    REQUIREMENT_STATUS,
    REQUIREMENT_PRIORITY,
    REQUIREMENT_RELATIONSHIPS,
  };

  return (
    <RequirementContext.Provider value={value}>
      {children}
    </RequirementContext.Provider>
  );
}

export function useRequirements() {
  return useContext(RequirementContext);
}

export default RequirementContext;
