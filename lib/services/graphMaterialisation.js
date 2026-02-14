/**
 * Graph Materialisation Rules Engine
 *
 * Declarative rules that define how artefacts are projected into the knowledge graph.
 * When an artefact is created or updated, the engine:
 *   1. Creates/updates a primary graph node for the artefact itself
 *   2. Extracts sub-nodes from JSONB data (e.g., actors from a RACI matrix)
 *   3. Creates typed edges between nodes
 *   4. Merges nodes by name+type to avoid duplicates
 *
 * @module lib/services/graphMaterialisation
 */

import { query } from '../pg';
import { getPipelineStage } from '../pipeline-types';

// ============================================================================
// DEPOSIT RULES — declarative configuration per artefact type
// ============================================================================

/**
 * Deposit rules define how each artefact type projects into graph nodes/edges.
 *
 * Structure:
 *   nodes[] — sub-nodes to extract from artefact data
 *     - source: JSONPath-like key into custom_fields/metadata (use [*] for arrays)
 *     - nodeType: graph node type string (or function of item)
 *     - nameField: which field on the item to use as node name
 *     - merge: if true, dedup by name+type within the domain
 *   edges[] — edges to create between extracted nodes
 *     - source: JSONPath-like key into custom_fields/metadata
 *     - edgeType: relationship type string
 *     - from/to: reference to a node source + match field
 *     - condition: optional filter function
 *     - properties: optional function to extract edge properties
 */
export const DEPOSIT_RULES = {
  // -- Analysis: RACI Matrix --
  raci: {
    nodes: [
      { source: 'actors', nodeType: 'Actor', nameField: 'name', merge: true },
      { source: 'activities', nodeType: 'Activity', nameField: 'name', merge: true },
    ],
    edges: [
      {
        source: 'assignments',
        condition: (a) => a.type === 'R',
        edgeType: 'RESPONSIBLE_FOR',
        fromRef: 'actor_id',
        fromNodeType: 'Actor',
        toRef: 'activity_id',
        toNodeType: 'Activity',
      },
      {
        source: 'assignments',
        condition: (a) => a.type === 'A',
        edgeType: 'ACCOUNTABLE_FOR',
        fromRef: 'actor_id',
        fromNodeType: 'Actor',
        toRef: 'activity_id',
        toNodeType: 'Activity',
      },
      {
        source: 'assignments',
        condition: (a) => a.type === 'C',
        edgeType: 'CONSULTED_ON',
        fromRef: 'actor_id',
        fromNodeType: 'Actor',
        toRef: 'activity_id',
        toNodeType: 'Activity',
      },
      {
        source: 'assignments',
        condition: (a) => a.type === 'I',
        edgeType: 'INFORMED_OF',
        fromRef: 'actor_id',
        fromNodeType: 'Actor',
        toRef: 'activity_id',
        toNodeType: 'Activity',
      },
    ],
  },

  // -- Analysis: Data Flow --
  data_flow: {
    nodes: [
      {
        source: 'entities',
        nodeType: (e) => (e.type === 'system' ? 'System' : 'ExternalEntity'),
        nameField: 'label',
        merge: true,
      },
    ],
    edges: [
      {
        source: 'flows',
        edgeType: 'SENDS_DATA_TO',
        fromRef: 'from_entity',
        toRef: 'to_entity',
        properties: (f) => ({ protocol: f.protocol, format: f.format }),
      },
    ],
  },

  // -- Analysis: Process Map --
  process_map: {
    nodes: [
      { source: 'steps', nodeType: 'ProcessStep', nameField: 'name', merge: false },
      { source: 'lanes', nodeType: 'Actor', nameField: 'name', merge: true },
    ],
    edges: [
      {
        source: 'transitions',
        edgeType: 'FLOWS_TO',
        fromRef: 'from_step',
        toRef: 'to_step',
      },
    ],
  },

  // -- Analysis: Stakeholder Map --
  stakeholder_map: {
    nodes: [
      { source: 'stakeholders', nodeType: 'Stakeholder', nameField: 'name', merge: true },
    ],
    edges: [],
  },

  // -- Analysis: Domain Model --
  domain_model: {
    nodes: [
      { source: 'entities', nodeType: 'DataEntity', nameField: 'name', merge: true },
    ],
    edges: [
      {
        source: 'relationships',
        edgeType: (r) => r.type || 'RELATES_TO',
        fromRef: 'from_entity',
        toRef: 'to_entity',
        properties: (r) => ({ cardinality: r.cardinality }),
      },
    ],
  },

  // -- Architecture: C4 Model --
  c4_model: {
    nodes: [
      { source: 'containers', nodeType: 'System', nameField: 'name', merge: true },
      { source: 'components', nodeType: 'Component', nameField: 'name', merge: true },
    ],
    edges: [
      {
        source: 'dependencies',
        edgeType: 'DEPENDS_ON',
        fromRef: 'from_id',
        toRef: 'to_id',
        properties: (d) => ({ protocol: d.protocol, technology: d.technology }),
      },
    ],
  },

  // -- Architecture: Capability Map --
  capability_map: {
    nodes: [
      { source: 'capabilities', nodeType: 'Capability', nameField: 'name', merge: true },
    ],
    edges: [
      {
        source: 'capabilities',
        condition: (c) => !!c.parent_id,
        edgeType: 'CHILD_OF',
        fromRef: 'id',
        toRef: 'parent_id',
      },
    ],
  },

  // -- Work Breakdown --
  epic: {
    nodes: [],
    edges: [],
  },
  feature: {
    nodes: [],
    edges: [],
  },
  user_story: {
    nodes: [],
    edges: [],
  },

  // -- Test Management --
  test_case: {
    nodes: [],
    edges: [],
  },
  test_suite: {
    nodes: [],
    edges: [],
  },
};

// ============================================================================
// ENGINE — processes deposit rules
// ============================================================================

/**
 * Apply deposit rules for an artefact, materialising graph nodes and edges.
 *
 * This is the main entry point called by the outbox processor or directly
 * from API handlers.
 *
 * @param {Object} artefact - The artefact record (from artefacts or analysis_artefacts table)
 * @param {Object} [options] - Options
 * @param {string} [options.sourceTable] - Source table name (default: auto-detect)
 * @returns {Promise<Object>} { primaryNode, subNodes, edges }
 */
export async function materialiseArtefact(artefact, options = {}) {
  const sourceTable = options.sourceTable || detectSourceTable(artefact);
  const data = artefact.custom_fields || artefact.metadata || {};
  const domainId = artefact.domain_id || artefact.domain || null;

  // Determine artefact type (strip space prefix like 'pdw_', 'dwd_')
  const rawType = artefact.artefact_type || '';
  const baseType = rawType.replace(/^[a-z]+_/, '');
  const pipelineStage = artefact.pipeline_stage || getPipelineStage(baseType);

  // 1. Upsert primary node for the artefact itself
  const primaryNode = await upsertPrimaryNode(artefact, {
    sourceTable,
    pipelineStage,
    domainId,
  });

  // 2. Apply deposit rules if they exist for this type
  const rules = DEPOSIT_RULES[baseType] || DEPOSIT_RULES[rawType];
  if (!rules) {
    return { primaryNode, subNodes: [], edges: [] };
  }

  // 3. Extract and upsert sub-nodes
  const nodeMap = new Map(); // local ID → graph node ID
  const subNodes = [];

  for (const nodeRule of rules.nodes) {
    const items = resolveSource(data, nodeRule.source);
    for (const item of items) {
      const nodeType = typeof nodeRule.nodeType === 'function'
        ? nodeRule.nodeType(item)
        : nodeRule.nodeType;
      const nodeName = item[nodeRule.nameField] || item.name || 'Unnamed';
      const localId = item.id || `${nodeType}:${nodeName}`;

      let graphNodeId;
      if (nodeRule.merge) {
        graphNodeId = await mergeNode(nodeName, nodeType, domainId, artefact.id);
      } else {
        graphNodeId = await createSubNode(nodeName, nodeType, domainId, artefact.id);
      }

      nodeMap.set(localId, graphNodeId);
      nodeMap.set(nodeName, graphNodeId); // also index by name for loose matching
      subNodes.push({ id: graphNodeId, name: nodeName, type: nodeType });
    }
  }

  // 4. Create edges from rules
  const edges = [];

  for (const edgeRule of rules.edges) {
    const items = resolveSource(data, edgeRule.source);
    for (const item of items) {
      if (edgeRule.condition && !edgeRule.condition(item)) continue;

      const edgeType = typeof edgeRule.edgeType === 'function'
        ? edgeRule.edgeType(item)
        : edgeRule.edgeType;

      const fromId = resolveNodeRef(item, edgeRule.fromRef, nodeMap, primaryNode.id);
      const toId = resolveNodeRef(item, edgeRule.toRef, nodeMap, primaryNode.id);

      if (!fromId || !toId) continue;

      const props = edgeRule.properties ? edgeRule.properties(item) : {};
      const edge = await upsertEdge(fromId, toId, edgeType, domainId, {
        source_artefact_id: artefact.id,
        ...props,
      });
      if (edge) edges.push(edge);
    }
  }

  return { primaryNode, subNodes, edges };
}

/**
 * Remove all materialised graph data for an artefact.
 *
 * @param {string} artefactId - UUID of the artefact
 * @returns {Promise<void>}
 */
export async function dematerialiseArtefact(artefactId) {
  const nodeId = `artefact:${artefactId}`;

  // Remove edges involving this node or sourced from this artefact
  await query(
    `DELETE FROM graph_relationships
     WHERE source_id = $1 OR target_id = $1
        OR properties->>'source_artefact_id' = $2`,
    [nodeId, artefactId]
  );

  // Remove the primary node
  await query('DELETE FROM graph_nodes WHERE id = $1', [nodeId]);

  // Remove sub-nodes created by this artefact
  await query(
    `DELETE FROM graph_nodes WHERE attributes->>'source_artefact_id' = $1`,
    [artefactId]
  );
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

/**
 * Upsert the primary graph node for an artefact.
 */
async function upsertPrimaryNode(artefact, { sourceTable, pipelineStage, domainId }) {
  const nodeId = `artefact:${artefact.id}`;
  const rawType = artefact.artefact_type || '';
  const baseType = rawType.replace(/^[a-z]+_/, '');

  // Map common artefact types to node types
  const nodeTypeMap = {
    requirement: 'Requirement',
    epic: 'Epic',
    feature: 'Feature',
    user_story: 'UserStory',
    test_case: 'TestCase',
    test_suite: 'TestSuite',
    test_run: 'TestRun',
    process_map: 'ProcessMap',
    raci: 'RACI',
    data_flow: 'DataFlow',
    domain_model: 'DomainModel',
    stakeholder_map: 'StakeholderMap',
    user_journey: 'UserJourney',
    glossary_entry: 'GlossaryEntry',
    c4_model: 'C4Model',
    adr: 'ArchitectureDecision',
    data_product: 'DataProduct',
    data_contract: 'DataContract',
    capability_map: 'CapabilityMap',
    technology_radar: 'TechnologyRadar',
    experiment: 'Experiment',
    idea: 'Idea',
    business_case: 'BusinessCase',
  };
  const nodeType = nodeTypeMap[baseType] || rawType;

  const attributes = {
    source_table: sourceTable,
    source_id: artefact.id,
    artefact_type: rawType,
    pipeline_stage: pipelineStage,
    status: artefact.status,
    priority: artefact.priority,
    project_id: artefact.project_id,
    display_id: artefact.display_id || null,
  };

  const result = await query(`
    INSERT INTO graph_nodes (id, name, type_id, domain, description, attributes)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      type_id = EXCLUDED.type_id,
      description = EXCLUDED.description,
      attributes = EXCLUDED.attributes,
      updated_at = now()
    RETURNING *
  `, [
    nodeId,
    artefact.name,
    nodeType,
    domainId,
    artefact.description || '',
    JSON.stringify(attributes),
  ]);

  return result.rows[0];
}

/**
 * Merge a sub-node by name+type within a domain (dedup).
 * Returns the graph node ID.
 */
async function mergeNode(name, nodeType, domainId, sourceArtefactId) {
  // Check for existing node with same name+type in domain
  const existing = await query(`
    SELECT id FROM graph_nodes
    WHERE name = $1 AND type_id = $2 AND (domain = $3 OR ($3 IS NULL AND domain IS NULL))
    LIMIT 1
  `, [name, nodeType, domainId]);

  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }

  const nodeId = `sub:${nodeType}:${name}:${domainId || 'global'}`;
  const result = await query(`
    INSERT INTO graph_nodes (id, name, type_id, domain, attributes)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      updated_at = now()
    RETURNING id
  `, [
    nodeId,
    name,
    nodeType,
    domainId,
    JSON.stringify({ source_artefact_id: sourceArtefactId, merged: true }),
  ]);

  return result.rows[0].id;
}

/**
 * Create a sub-node (non-merged, unique per artefact).
 */
async function createSubNode(name, nodeType, domainId, sourceArtefactId) {
  const nodeId = `sub:${sourceArtefactId}:${nodeType}:${name}`;
  const result = await query(`
    INSERT INTO graph_nodes (id, name, type_id, domain, attributes)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      updated_at = now()
    RETURNING id
  `, [
    nodeId,
    name,
    nodeType,
    domainId,
    JSON.stringify({ source_artefact_id: sourceArtefactId }),
  ]);

  return result.rows[0].id;
}

/**
 * Upsert an edge between two graph nodes.
 */
async function upsertEdge(fromId, toId, edgeType, domainId, properties = {}) {
  // Verify both nodes exist
  const check = await query(
    'SELECT id FROM graph_nodes WHERE id = ANY($1::text[])',
    [[fromId, toId]]
  );
  if (check.rows.length < 2) return null;

  const edgeId = `edge:${fromId}:${toId}:${edgeType}`;
  const result = await query(`
    INSERT INTO graph_relationships (id, source_id, target_id, name, type_id, domain, properties)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (id) DO UPDATE SET
      properties = EXCLUDED.properties,
      updated_at = now()
    RETURNING *
  `, [
    edgeId,
    fromId,
    toId,
    edgeType,
    edgeType,
    domainId,
    JSON.stringify(properties),
  ]);

  return result.rows[0];
}

/**
 * Resolve a JSONPath-like source key from artefact data.
 * Supports top-level keys and nested arrays.
 */
function resolveSource(data, sourcePath) {
  if (!data || !sourcePath) return [];
  const key = sourcePath.replace(/\[\*\]$/, '');
  const value = data[key];
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return [value];
  return [];
}

/**
 * Resolve a node reference from an edge rule item.
 * Looks up the node ID in the nodeMap by local ID or name.
 */
function resolveNodeRef(item, refField, nodeMap, fallbackId) {
  if (!refField) return fallbackId;
  const refValue = item[refField];
  if (!refValue) return fallbackId;
  return nodeMap.get(refValue) || nodeMap.get(String(refValue)) || null;
}

/**
 * Detect the source table based on artefact properties.
 */
function detectSourceTable(artefact) {
  if (artefact.prefix !== undefined || artefact.module !== undefined) {
    return 'analysis_artefacts';
  }
  return 'artefacts';
}
