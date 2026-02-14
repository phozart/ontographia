/**
 * EA Business Logic Functions
 *
 * Implements:
 * - EN-092: View derivation rules (auto-include related elements)
 * - EN-093: Model versioning (version comparison, rollback)
 * - EN-094: Impact analysis for EA (trace through relationships)
 * - EN-095: Roadmap gap analysis (auto-detect gaps between plateaus)
 * - EN-096: Principle compliance checking (validate elements against principles)
 *
 * @module lib/ea-business-logic
 */

import { RELATIONSHIP_VALIDITY, getElementLayer, getElementAspect } from './ea-validation';

// ============================================================================
// EN-092: VIEW DERIVATION RULES
// ============================================================================

/**
 * Viewpoint definitions and their typical element types
 * Based on ArchiMate viewpoints
 */
export const VIEWPOINT_ELEMENT_TYPES = {
  organization: {
    name: 'Organization',
    description: 'Business actors, roles, and collaborations',
    primaryTypes: ['BusinessActor', 'BusinessRole', 'BusinessCollaboration', 'Location'],
    relatedTypes: ['BusinessInterface', 'BusinessProcess', 'BusinessFunction'],
    relationshipTypes: ['composition', 'aggregation', 'assignment', 'association'],
  },
  business_process_cooperation: {
    name: 'Business Process Cooperation',
    description: 'Business processes and their cooperation',
    primaryTypes: ['BusinessProcess', 'BusinessFunction', 'BusinessInteraction', 'BusinessEvent', 'BusinessService'],
    relatedTypes: ['BusinessActor', 'BusinessRole', 'BusinessObject'],
    relationshipTypes: ['triggering', 'flow', 'serving', 'access', 'assignment'],
  },
  product: {
    name: 'Product',
    description: 'Products and their composition',
    primaryTypes: ['Product', 'BusinessService', 'Contract'],
    relatedTypes: ['BusinessProcess', 'ApplicationService', 'Value'],
    relationshipTypes: ['composition', 'aggregation', 'serving', 'realization'],
  },
  application_cooperation: {
    name: 'Application Cooperation',
    description: 'Application components and their interactions',
    primaryTypes: ['ApplicationComponent', 'ApplicationCollaboration', 'ApplicationInterface'],
    relatedTypes: ['ApplicationService', 'DataObject', 'ApplicationFunction'],
    relationshipTypes: ['composition', 'aggregation', 'serving', 'flow', 'triggering'],
  },
  application_usage: {
    name: 'Application Usage',
    description: 'How applications support business processes',
    primaryTypes: ['BusinessProcess', 'BusinessFunction', 'ApplicationService', 'ApplicationComponent'],
    relatedTypes: ['DataObject', 'BusinessObject'],
    relationshipTypes: ['serving', 'access', 'realization'],
  },
  implementation_deployment: {
    name: 'Implementation and Deployment',
    description: 'Infrastructure and deployment',
    primaryTypes: ['Node', 'Device', 'SystemSoftware', 'Artifact'],
    relatedTypes: ['ApplicationComponent', 'CommunicationNetwork', 'TechnologyService'],
    relationshipTypes: ['assignment', 'realization', 'serving'],
  },
  technology: {
    name: 'Technology',
    description: 'Technology infrastructure',
    primaryTypes: ['Node', 'Device', 'SystemSoftware', 'CommunicationNetwork', 'Path'],
    relatedTypes: ['TechnologyService', 'TechnologyFunction', 'Artifact'],
    relationshipTypes: ['composition', 'aggregation', 'serving', 'assignment'],
  },
  layered: {
    name: 'Layered',
    description: 'Full stack view across layers',
    primaryTypes: ['all'],
    relatedTypes: [],
    relationshipTypes: ['serving', 'realization', 'assignment'],
  },
  motivation: {
    name: 'Motivation',
    description: 'Stakeholders, goals, and principles',
    primaryTypes: ['Stakeholder', 'Driver', 'Assessment', 'Goal', 'Outcome', 'Principle', 'Requirement', 'Constraint'],
    relatedTypes: ['Value', 'Meaning'],
    relationshipTypes: ['influence', 'association', 'realization', 'aggregation'],
  },
  strategy: {
    name: 'Strategy',
    description: 'Strategic resources and capabilities',
    primaryTypes: ['Resource', 'Capability', 'ValueStream', 'CourseOfAction'],
    relatedTypes: ['Goal', 'Outcome', 'BusinessProcess'],
    relationshipTypes: ['realization', 'assignment', 'association', 'flow'],
  },
  capability_map: {
    name: 'Capability Map',
    description: 'Business capabilities hierarchy',
    primaryTypes: ['Capability'],
    relatedTypes: ['Resource', 'CourseOfAction', 'BusinessProcess'],
    relationshipTypes: ['composition', 'aggregation', 'realization', 'assignment'],
  },
  migration: {
    name: 'Migration',
    description: 'Architecture transitions and gaps',
    primaryTypes: ['Plateau', 'Gap', 'WorkPackage', 'Deliverable'],
    relatedTypes: ['ImplementationEvent'],
    relationshipTypes: ['triggering', 'realization', 'association', 'aggregation'],
  },
};

/**
 * Derive related elements for a view based on viewpoint rules
 * EN-092: View derivation rules
 *
 * @param {Array} selectedElements - Elements explicitly added to the view
 * @param {Array} allElements - All available elements
 * @param {Array} allRelationships - All available relationships
 * @param {string} viewpointType - The viewpoint type
 * @param {Object} options - Derivation options
 * @returns {{
 *   derivedElements: Array,
 *   derivedRelationships: Array,
 *   suggestions: Array
 * }}
 */
export function deriveViewElements(selectedElements, allElements, allRelationships, viewpointType, options = {}) {
  const {
    maxDepth = 2,
    includeRelated = true,
    includeConnecting = true,
  } = options;

  const viewpoint = VIEWPOINT_ELEMENT_TYPES[viewpointType] || VIEWPOINT_ELEMENT_TYPES.layered;
  const selectedIds = new Set(selectedElements.map(e => e.id));

  const derivedElementIds = new Set();
  const derivedRelationshipIds = new Set();
  const suggestions = [];

  // Get valid relationship types for this viewpoint
  const validRelTypes = viewpoint.relationshipTypes;

  // Find directly connected elements through valid relationships
  function findConnected(elementId, depth = 0) {
    if (depth >= maxDepth) return;

    const connectedRels = allRelationships.filter(
      rel => (rel.source_id === elementId || rel.target_id === elementId) &&
             validRelTypes.includes(rel.relationship_type)
    );

    for (const rel of connectedRels) {
      derivedRelationshipIds.add(rel.id);

      const otherId = rel.source_id === elementId ? rel.target_id : rel.source_id;
      const otherElement = allElements.find(e => e.id === otherId);

      if (otherElement && !selectedIds.has(otherId) && !derivedElementIds.has(otherId)) {
        // Check if element type is appropriate for viewpoint
        const isRelevant =
          viewpoint.primaryTypes.includes('all') ||
          viewpoint.primaryTypes.includes(otherElement.element_type) ||
          viewpoint.relatedTypes.includes(otherElement.element_type);

        if (isRelevant) {
          derivedElementIds.add(otherId);
          findConnected(otherId, depth + 1);
        }
      }
    }
  }

  // Process each selected element
  for (const element of selectedElements) {
    findConnected(element.id, 0);
  }

  // Build result arrays
  const derivedElements = allElements.filter(e => derivedElementIds.has(e.id));
  const derivedRelationships = allRelationships.filter(r => derivedRelationshipIds.has(r.id));

  // Generate suggestions for missing elements
  if (includeRelated) {
    const allViewElementIds = new Set([...selectedIds, ...derivedElementIds]);

    // Check for elements that would complete common patterns
    for (const element of selectedElements) {
      // Suggest services for behavior elements
      if (['BusinessProcess', 'ApplicationFunction'].includes(element.element_type)) {
        const realizesService = allRelationships.find(
          r => r.source_id === element.id && r.relationship_type === 'realization'
        );
        if (!realizesService) {
          suggestions.push({
            type: 'missing_service',
            message: `${element.name} does not realize any service`,
            element: element,
          });
        }
      }
    }
  }

  return {
    derivedElements,
    derivedRelationships,
    suggestions,
    summary: {
      selectedCount: selectedElements.length,
      derivedElementCount: derivedElements.length,
      derivedRelationshipCount: derivedRelationships.length,
      suggestionCount: suggestions.length,
    },
  };
}

// ============================================================================
// EN-093: MODEL VERSIONING
// ============================================================================

/**
 * Compare two versions of a model
 * EN-093: Model versioning
 *
 * @param {Object} oldModel - Previous version of the model
 * @param {Object} newModel - Current version of the model
 * @returns {{
 *   added: {elements: Array, relationships: Array},
 *   removed: {elements: Array, relationships: Array},
 *   modified: {elements: Array, relationships: Array},
 *   unchanged: {elements: Array, relationships: Array}
 * }}
 */
export function compareModelVersions(oldModel, newModel) {
  const result = {
    added: { elements: [], relationships: [] },
    removed: { elements: [], relationships: [] },
    modified: { elements: [], relationships: [] },
    unchanged: { elements: [], relationships: [] },
  };

  // Parse elements from JSONB if needed
  const oldElements = Array.isArray(oldModel.elements) ? oldModel.elements :
    (typeof oldModel.elements === 'string' ? JSON.parse(oldModel.elements) : []);
  const newElements = Array.isArray(newModel.elements) ? newModel.elements :
    (typeof newModel.elements === 'string' ? JSON.parse(newModel.elements) : []);

  const oldRelationships = Array.isArray(oldModel.relationships) ? oldModel.relationships :
    (typeof oldModel.relationships === 'string' ? JSON.parse(oldModel.relationships) : []);
  const newRelationships = Array.isArray(newModel.relationships) ? newModel.relationships :
    (typeof newModel.relationships === 'string' ? JSON.parse(newModel.relationships) : []);

  // Build maps for efficient lookup
  const oldElementMap = new Map(oldElements.map(e => [e.id, e]));
  const newElementMap = new Map(newElements.map(e => [e.id, e]));
  const oldRelMap = new Map(oldRelationships.map(r => [r.id, r]));
  const newRelMap = new Map(newRelationships.map(r => [r.id, r]));

  // Compare elements
  for (const [id, newEl] of newElementMap) {
    if (!oldElementMap.has(id)) {
      result.added.elements.push(newEl);
    } else {
      const oldEl = oldElementMap.get(id);
      if (hasElementChanged(oldEl, newEl)) {
        result.modified.elements.push({ old: oldEl, new: newEl, changes: getElementChanges(oldEl, newEl) });
      } else {
        result.unchanged.elements.push(newEl);
      }
    }
  }

  for (const [id, oldEl] of oldElementMap) {
    if (!newElementMap.has(id)) {
      result.removed.elements.push(oldEl);
    }
  }

  // Compare relationships
  for (const [id, newRel] of newRelMap) {
    if (!oldRelMap.has(id)) {
      result.added.relationships.push(newRel);
    } else {
      const oldRel = oldRelMap.get(id);
      if (hasRelationshipChanged(oldRel, newRel)) {
        result.modified.relationships.push({ old: oldRel, new: newRel });
      } else {
        result.unchanged.relationships.push(newRel);
      }
    }
  }

  for (const [id, oldRel] of oldRelMap) {
    if (!newRelMap.has(id)) {
      result.removed.relationships.push(oldRel);
    }
  }

  return result;
}

function hasElementChanged(oldEl, newEl) {
  return oldEl.name !== newEl.name ||
         oldEl.description !== newEl.description ||
         oldEl.element_type !== newEl.element_type ||
         JSON.stringify(oldEl.properties) !== JSON.stringify(newEl.properties);
}

function hasRelationshipChanged(oldRel, newRel) {
  return oldRel.source_id !== newRel.source_id ||
         oldRel.target_id !== newRel.target_id ||
         oldRel.relationship_type !== newRel.relationship_type;
}

function getElementChanges(oldEl, newEl) {
  const changes = [];
  if (oldEl.name !== newEl.name) changes.push({ field: 'name', old: oldEl.name, new: newEl.name });
  if (oldEl.description !== newEl.description) changes.push({ field: 'description', old: oldEl.description, new: newEl.description });
  if (oldEl.element_type !== newEl.element_type) changes.push({ field: 'element_type', old: oldEl.element_type, new: newEl.element_type });
  return changes;
}

/**
 * Generate version number based on changes
 * @param {string} currentVersion - Current version (semver format)
 * @param {Object} changes - Changes from compareModelVersions
 * @returns {string} New version number
 */
export function suggestNewVersion(currentVersion, changes) {
  const [major, minor, patch] = currentVersion.split('.').map(Number);

  // Major: structural changes (new element types, breaking changes)
  const hasStructuralChanges = changes.removed.elements.length > 0 ||
    changes.modified.elements.some(m => m.changes.some(c => c.field === 'element_type'));

  // Minor: new elements or relationships
  const hasAdditions = changes.added.elements.length > 0 || changes.added.relationships.length > 0;

  // Patch: modifications only
  const hasModifications = changes.modified.elements.length > 0 || changes.modified.relationships.length > 0;

  if (hasStructuralChanges) {
    return `${major + 1}.0.0`;
  } else if (hasAdditions) {
    return `${major}.${minor + 1}.0`;
  } else if (hasModifications) {
    return `${major}.${minor}.${patch + 1}`;
  }

  return currentVersion;
}

// ============================================================================
// EN-094: IMPACT ANALYSIS
// ============================================================================

/**
 * Analyze the impact of changes to an element
 * EN-094: Impact analysis for EA
 *
 * @param {string} elementId - The element to analyze
 * @param {Array} elements - All elements
 * @param {Array} relationships - All relationships
 * @param {Object} options - Analysis options
 * @returns {{
 *   element: Object,
 *   directImpact: Array,
 *   indirectImpact: Array,
 *   upstreamDependencies: Array,
 *   downstreamDependents: Array,
 *   crossLayerImpact: Array,
 *   riskAssessment: Object
 * }}
 */
export function analyzeImpact(elementId, elements, relationships, options = {}) {
  const {
    maxDepth = 3,
    includeIndirect = true,
  } = options;

  const element = elements.find(e => e.id === elementId);
  if (!element) {
    return { error: `Element ${elementId} not found` };
  }

  const elementLayer = getElementLayer(element.element_type);
  const visited = new Set([elementId]);

  const directImpact = [];
  const indirectImpact = [];
  const upstreamDependencies = [];
  const downstreamDependents = [];
  const crossLayerImpact = [];

  // Find direct relationships
  const directRels = relationships.filter(
    r => r.source_id === elementId || r.target_id === elementId
  );

  for (const rel of directRels) {
    const otherId = rel.source_id === elementId ? rel.target_id : rel.source_id;
    const otherElement = elements.find(e => e.id === otherId);

    if (!otherElement) continue;

    const otherLayer = getElementLayer(otherElement.element_type);
    const impact = {
      element: otherElement,
      relationship: rel,
      direction: rel.source_id === elementId ? 'outgoing' : 'incoming',
      relationshipType: rel.relationship_type,
    };

    directImpact.push(impact);

    // Categorize
    if (rel.target_id === elementId) {
      upstreamDependencies.push(impact);
    } else {
      downstreamDependents.push(impact);
    }

    if (otherLayer !== elementLayer) {
      crossLayerImpact.push({
        ...impact,
        fromLayer: elementLayer,
        toLayer: otherLayer,
      });
    }
  }

  // Find indirect impact (transitive)
  if (includeIndirect) {
    function findIndirect(currentId, depth) {
      if (depth >= maxDepth) return;

      const connectedRels = relationships.filter(
        r => (r.source_id === currentId || r.target_id === currentId) &&
             !visited.has(r.source_id === currentId ? r.target_id : r.source_id)
      );

      for (const rel of connectedRels) {
        const otherId = rel.source_id === currentId ? rel.target_id : rel.source_id;
        if (visited.has(otherId)) continue;

        visited.add(otherId);
        const otherElement = elements.find(e => e.id === otherId);

        if (otherElement) {
          indirectImpact.push({
            element: otherElement,
            depth: depth + 1,
            path: `via ${rel.relationship_type}`,
          });
          findIndirect(otherId, depth + 1);
        }
      }
    }

    for (const impact of directImpact) {
      findIndirect(impact.element.id, 1);
    }
  }

  // Risk assessment
  const riskAssessment = {
    impactScope: directImpact.length + indirectImpact.length,
    crossLayerRisk: crossLayerImpact.length > 0 ? 'high' : 'low',
    upstreamRisk: upstreamDependencies.length > 3 ? 'high' : upstreamDependencies.length > 0 ? 'medium' : 'low',
    downstreamRisk: downstreamDependents.length > 3 ? 'high' : downstreamDependents.length > 0 ? 'medium' : 'low',
    overallRisk: calculateOverallRisk(directImpact.length, indirectImpact.length, crossLayerImpact.length),
  };

  return {
    element,
    directImpact,
    indirectImpact,
    upstreamDependencies,
    downstreamDependents,
    crossLayerImpact,
    riskAssessment,
    summary: {
      directCount: directImpact.length,
      indirectCount: indirectImpact.length,
      upstreamCount: upstreamDependencies.length,
      downstreamCount: downstreamDependents.length,
      crossLayerCount: crossLayerImpact.length,
    },
  };
}

function calculateOverallRisk(direct, indirect, crossLayer) {
  const score = direct * 2 + indirect + crossLayer * 3;
  if (score > 15) return 'critical';
  if (score > 10) return 'high';
  if (score > 5) return 'medium';
  return 'low';
}

// ============================================================================
// EN-095: ROADMAP GAP ANALYSIS
// ============================================================================

/**
 * Analyze gaps between architecture states (plateaus)
 * EN-095: Roadmap gap analysis
 *
 * @param {Object} baseline - Baseline architecture state
 * @param {Object} target - Target architecture state
 * @param {Array} elements - All elements
 * @returns {{
 *   gaps: Array,
 *   additions: Array,
 *   removals: Array,
 *   modifications: Array,
 *   workPackages: Array
 * }}
 */
export function analyzeRoadmapGaps(baseline, target, elements) {
  const gaps = [];
  const additions = [];
  const removals = [];
  const modifications = [];
  const suggestedWorkPackages = [];

  // Parse baseline and target element lists
  const baselineElements = new Set(
    Array.isArray(baseline.elements) ? baseline.elements :
    (typeof baseline.elements === 'string' ? JSON.parse(baseline.elements) : [])
  );
  const targetElements = new Set(
    Array.isArray(target.elements) ? target.elements :
    (typeof target.elements === 'string' ? JSON.parse(target.elements) : [])
  );

  // Find additions (in target but not baseline)
  for (const elementId of targetElements) {
    if (!baselineElements.has(elementId)) {
      const element = elements.find(e => e.id === elementId);
      if (element) {
        additions.push(element);
        gaps.push({
          type: 'addition',
          element,
          description: `Add ${element.element_type}: ${element.name}`,
        });
      }
    }
  }

  // Find removals (in baseline but not target)
  for (const elementId of baselineElements) {
    if (!targetElements.has(elementId)) {
      const element = elements.find(e => e.id === elementId);
      if (element) {
        removals.push(element);
        gaps.push({
          type: 'removal',
          element,
          description: `Remove ${element.element_type}: ${element.name}`,
        });
      }
    }
  }

  // Group gaps by layer for work package suggestions
  const gapsByLayer = {};
  for (const gap of gaps) {
    const layer = getElementLayer(gap.element.element_type) || 'other';
    if (!gapsByLayer[layer]) gapsByLayer[layer] = [];
    gapsByLayer[layer].push(gap);
  }

  // Generate suggested work packages
  for (const [layer, layerGaps] of Object.entries(gapsByLayer)) {
    if (layerGaps.length > 0) {
      const addCount = layerGaps.filter(g => g.type === 'addition').length;
      const removeCount = layerGaps.filter(g => g.type === 'removal').length;

      suggestedWorkPackages.push({
        name: `${layer.charAt(0).toUpperCase() + layer.slice(1)} Layer Transformation`,
        description: `Implement ${addCount} additions and ${removeCount} removals in the ${layer} layer`,
        layer,
        gapCount: layerGaps.length,
        gaps: layerGaps,
        estimatedEffort: estimateEffort(layerGaps),
      });
    }
  }

  return {
    gaps,
    additions,
    removals,
    modifications,
    suggestedWorkPackages,
    summary: {
      totalGaps: gaps.length,
      additionCount: additions.length,
      removalCount: removals.length,
      modificationCount: modifications.length,
      workPackageCount: suggestedWorkPackages.length,
    },
  };
}

function estimateEffort(gaps) {
  // Simple effort estimation based on gap count and types
  const baseEffort = gaps.length * 2; // 2 days per gap as baseline
  const complexity = gaps.filter(g =>
    ['ApplicationComponent', 'Node', 'BusinessProcess'].includes(g.element?.element_type)
  ).length;
  return `${baseEffort + complexity} person-days (estimate)`;
}

// ============================================================================
// EN-096: PRINCIPLE COMPLIANCE CHECKING
// ============================================================================

/**
 * Architecture principle structure for compliance checking
 */
export const PRINCIPLE_RULES = {
  // Business principles
  'data_sovereignty': {
    name: 'Data Sovereignty',
    description: 'Data must be stored in approved regions',
    check: (element) => {
      if (element.element_type === 'DataObject' || element.element_type === 'Artifact') {
        const location = element.properties?.location || element.properties?.region;
        return location ? { compliant: true } : { compliant: false, reason: 'No storage location specified' };
      }
      return { compliant: true, notApplicable: true };
    },
  },
  'service_orientation': {
    name: 'Service Orientation',
    description: 'Business capabilities should be exposed through services',
    check: (element, relationships) => {
      if (element.element_type === 'BusinessProcess' || element.element_type === 'BusinessFunction') {
        const hasService = relationships.some(
          r => r.source_id === element.id && r.relationship_type === 'realization' &&
               r.target_type?.includes('Service')
        );
        return hasService
          ? { compliant: true }
          : { compliant: false, reason: 'Business process does not realize a service' };
      }
      return { compliant: true, notApplicable: true };
    },
  },
  'loose_coupling': {
    name: 'Loose Coupling',
    description: 'Components should minimize direct dependencies',
    check: (element, relationships) => {
      if (element.element_type === 'ApplicationComponent') {
        const directDeps = relationships.filter(
          r => r.source_id === element.id &&
               ['composition', 'aggregation'].includes(r.relationship_type)
        ).length;
        return directDeps <= 5
          ? { compliant: true }
          : { compliant: false, reason: `Component has ${directDeps} tight dependencies (max 5 recommended)` };
      }
      return { compliant: true, notApplicable: true };
    },
  },
  'technology_independence': {
    name: 'Technology Independence',
    description: 'Business logic should not depend on specific technology',
    check: (element, relationships) => {
      if (['BusinessProcess', 'BusinessFunction', 'BusinessService'].includes(element.element_type)) {
        const techDeps = relationships.filter(
          r => r.source_id === element.id &&
               ['Node', 'Device', 'SystemSoftware', 'Artifact'].includes(r.target_type)
        ).length;
        return techDeps === 0
          ? { compliant: true }
          : { compliant: false, reason: 'Business element has direct technology dependencies' };
      }
      return { compliant: true, notApplicable: true };
    },
  },
  'single_source_of_truth': {
    name: 'Single Source of Truth',
    description: 'Data should have one authoritative source',
    check: (element, relationships) => {
      if (element.element_type === 'DataObject') {
        const owners = relationships.filter(
          r => r.target_id === element.id &&
               r.relationship_type === 'access' &&
               r.access_type === 'write'
        ).length;
        return owners <= 1
          ? { compliant: true }
          : { compliant: false, reason: `Data has ${owners} write sources (should be 1)` };
      }
      return { compliant: true, notApplicable: true };
    },
  },
};

/**
 * Check element compliance against architecture principles
 * EN-096: Principle compliance checking
 *
 * @param {Object} element - Element to check
 * @param {Array} relationships - Related relationships
 * @param {Array} principleIds - Principles to check (or all if not specified)
 * @returns {{
 *   element: Object,
 *   results: Array,
 *   compliant: boolean,
 *   violations: Array
 * }}
 */
export function checkPrincipleCompliance(element, relationships, principleIds = null) {
  const principlesToCheck = principleIds
    ? principleIds.filter(id => PRINCIPLE_RULES[id])
    : Object.keys(PRINCIPLE_RULES);

  const results = [];
  const violations = [];

  for (const principleId of principlesToCheck) {
    const principle = PRINCIPLE_RULES[principleId];
    const result = principle.check(element, relationships);

    const checkResult = {
      principleId,
      principleName: principle.name,
      description: principle.description,
      ...result,
    };

    results.push(checkResult);

    if (!result.compliant && !result.notApplicable) {
      violations.push(checkResult);
    }
  }

  return {
    element,
    results,
    compliant: violations.length === 0,
    violations,
    summary: {
      total: results.length,
      compliant: results.filter(r => r.compliant).length,
      violations: violations.length,
      notApplicable: results.filter(r => r.notApplicable).length,
    },
  };
}

/**
 * Check compliance for multiple elements (model-wide)
 *
 * @param {Array} elements - Elements to check
 * @param {Array} relationships - All relationships
 * @param {Array} principleIds - Principles to check
 * @returns {{
 *   results: Array,
 *   overallCompliant: boolean,
 *   violationCount: number,
 *   byPrinciple: Object
 * }}
 */
export function checkModelCompliance(elements, relationships, principleIds = null) {
  const results = [];
  let totalViolations = 0;
  const byPrinciple = {};

  for (const element of elements) {
    // Get relationships for this element
    const elementRels = relationships.filter(
      r => r.source_id === element.id || r.target_id === element.id
    );

    const compliance = checkPrincipleCompliance(element, elementRels, principleIds);
    results.push(compliance);
    totalViolations += compliance.violations.length;

    // Track by principle
    for (const result of compliance.results) {
      if (!byPrinciple[result.principleId]) {
        byPrinciple[result.principleId] = {
          name: result.principleName,
          compliant: 0,
          violations: 0,
          notApplicable: 0,
        };
      }
      if (result.notApplicable) {
        byPrinciple[result.principleId].notApplicable++;
      } else if (result.compliant) {
        byPrinciple[result.principleId].compliant++;
      } else {
        byPrinciple[result.principleId].violations++;
      }
    }
  }

  return {
    results,
    overallCompliant: totalViolations === 0,
    violationCount: totalViolations,
    byPrinciple,
    summary: {
      elementsChecked: elements.length,
      totalViolations,
      complianceRate: elements.length > 0
        ? Math.round((1 - totalViolations / (elements.length * Object.keys(PRINCIPLE_RULES).length)) * 100)
        : 100,
    },
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // EN-092: View derivation
  VIEWPOINT_ELEMENT_TYPES,
  deriveViewElements,

  // EN-093: Model versioning
  compareModelVersions,
  suggestNewVersion,

  // EN-094: Impact analysis
  analyzeImpact,

  // EN-095: Roadmap gap analysis
  analyzeRoadmapGaps,

  // EN-096: Principle compliance
  PRINCIPLE_RULES,
  checkPrincipleCompliance,
  checkModelCompliance,
};
