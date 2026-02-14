// pages/api/graph/trace.js
// API endpoint for trace traversal - finds all connections for an artefact across spaces

import { query } from '../../../lib/pg';
import { getUserFromRequest } from '../../../lib/projectAccess';

/**
 * Trace API - Traverse relationships from a source artefact
 *
 * GET /api/graph/trace?artefactId=xxx&direction=both&depth=3
 *
 * @param artefactId - The source artefact UUID
 * @param direction - 'upstream' | 'downstream' | 'both' (default: 'both')
 * @param depth - How many levels to traverse (1-5, default: 3)
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { artefactId, direction = 'both', depth = 3 } = req.query;

  if (!artefactId) {
    return res.status(400).json({ error: 'artefactId is required' });
  }

  const maxDepth = Math.min(Math.max(1, parseInt(depth, 10) || 3), 5);
  const validDirections = ['upstream', 'downstream', 'both'];
  const traceDirection = validDirections.includes(direction) ? direction : 'both';

  try {
    // Get the source artefact
    const sourceResult = await query(
      `SELECT a.*,
        COALESCE(a.custom_fields->>'space', 'ba') as space,
        u.username as owner_username
       FROM artefacts a
       LEFT JOIN users u ON u.username = a.owner_id
       WHERE a.id = $1`,
      [artefactId]
    );

    if (sourceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artefact not found' });
    }

    const source = sourceResult.rows[0];

    // Build the trace using recursive CTE
    // This finds all connected artefacts up to maxDepth levels
    const traceQuery = buildTraceQuery(traceDirection, maxDepth);
    const traceResult = await query(traceQuery, [artefactId]);

    // Transform results into nodes and edges
    const nodesMap = new Map();
    const edges = [];

    // Add source node
    nodesMap.set(source.id, formatNode(source, 0));

    // Process trace results
    for (const row of traceResult.rows) {
      // Add target node if not already present
      if (!nodesMap.has(row.target_id)) {
        nodesMap.set(row.target_id, formatNode({
          id: row.target_id,
          name: row.target_name,
          artefact_type: row.target_type,
          status: row.target_status,
          space: row.target_space || inferSpace(row.target_type),
          description: row.target_description,
        }, row.depth));
      }

      // Add edge
      edges.push({
        id: row.relationship_id,
        source: row.source_id,
        target: row.target_id,
        type: row.relationship_type,
        direction: row.direction,
        depth: row.depth,
      });
    }

    const nodes = Array.from(nodesMap.values());

    // Calculate summary statistics
    const summary = calculateSummary(nodes, edges, artefactId);

    return res.status(200).json({
      source: formatNode(source, 0),
      nodes,
      edges,
      summary,
      meta: {
        direction: traceDirection,
        depth: maxDepth,
        totalNodes: nodes.length,
        totalEdges: edges.length,
      },
    });
  } catch (err) {
    console.error('Error in trace API:', err);
    return res.status(500).json({ error: 'Failed to trace relationships' });
  }
}

/**
 * Build the recursive CTE query for tracing
 */
function buildTraceQuery(direction, maxDepth) {
  const upstreamCondition = `r.to_artefact_id = trace.target_id`;
  const downstreamCondition = `r.from_artefact_id = trace.target_id`;

  let directionLogic;
  if (direction === 'upstream') {
    directionLogic = `
      SELECT r.from_artefact_id as target_id, trace.target_id as source_id,
             r.id as relationship_id, r.relationship_type, 'upstream' as direction,
             trace.depth + 1 as depth
      FROM artefact_relationships r
      WHERE ${upstreamCondition}
    `;
  } else if (direction === 'downstream') {
    directionLogic = `
      SELECT r.to_artefact_id as target_id, trace.target_id as source_id,
             r.id as relationship_id, r.relationship_type, 'downstream' as direction,
             trace.depth + 1 as depth
      FROM artefact_relationships r
      WHERE ${downstreamCondition}
    `;
  } else {
    // Both directions
    directionLogic = `
      SELECT r.from_artefact_id as target_id, trace.target_id as source_id,
             r.id as relationship_id, r.relationship_type, 'upstream' as direction,
             trace.depth + 1 as depth
      FROM artefact_relationships r
      WHERE ${upstreamCondition}
      UNION ALL
      SELECT r.to_artefact_id as target_id, trace.target_id as source_id,
             r.id as relationship_id, r.relationship_type, 'downstream' as direction,
             trace.depth + 1 as depth
      FROM artefact_relationships r
      WHERE ${downstreamCondition}
    `;
  }

  return `
    WITH RECURSIVE trace AS (
      -- Base case: start from the source artefact
      SELECT
        $1::uuid as target_id,
        $1::uuid as source_id,
        NULL::uuid as relationship_id,
        NULL::text as relationship_type,
        'source'::text as direction,
        0 as depth

      UNION ALL

      -- Recursive case: follow relationships
      ${directionLogic}
      AND trace.depth < ${maxDepth}
      AND r.from_artefact_id != r.to_artefact_id
    )
    SELECT DISTINCT ON (trace.relationship_id)
      trace.target_id,
      trace.source_id,
      trace.relationship_id,
      trace.relationship_type,
      trace.direction,
      trace.depth,
      a.name as target_name,
      a.artefact_type as target_type,
      a.status as target_status,
      a.description as target_description,
      COALESCE(a.custom_fields->>'space', 'ba') as target_space
    FROM trace
    LEFT JOIN artefacts a ON a.id = trace.target_id
    WHERE trace.relationship_id IS NOT NULL
    ORDER BY trace.relationship_id, trace.depth
  `;
}

/**
 * Format an artefact as a node for the graph
 */
function formatNode(artefact, depth) {
  const space = artefact.space || inferSpace(artefact.artefact_type);
  return {
    id: artefact.id,
    name: artefact.name,
    type: artefact.artefact_type,
    status: artefact.status,
    space,
    description: artefact.description,
    depth,
    color: getSpaceColor(space),
  };
}

/**
 * Infer space from artefact type
 */
function inferSpace(artefactType) {
  const typeToSpace = {
    // BA types
    'BusinessRequirement': 'ba',
    'StakeholderRequirement': 'ba',
    'SolutionRequirement': 'ba',
    'TransitionRequirement': 'ba',
    'UserStory': 'ba',
    'Epic': 'ba',
    'Feature': 'ba',
    'UseCase': 'ba',
    'Actor': 'ba',
    'Stakeholder': 'ba',

    // EA types
    'Capability': 'ea',
    'Application': 'ea',
    'BusinessProcess': 'ea',
    'DataObject': 'ea',
    'Technology': 'ea',
    'Principle': 'ea',
    'Goal': 'ea',
    'Driver': 'ea',

    // CAP types
    'BusinessService': 'cap',
    'Policy': 'cap',
    'Risk': 'cap',
    'Control': 'cap',
    'KPI': 'cap',
    'OKR': 'cap',

    // PDS types
    'Project': 'pds',
    'Milestone': 'pds',
    'Deliverable': 'pds',
    'WorkPackage': 'pds',
    'Risk': 'pds',
    'Issue': 'pds',
    'Decision': 'pds',

    // Portfolio types
    'Initiative': 'portfolio',
    'Investment': 'portfolio',

    // DWD types
    'WorkItem': 'dwd',
    'WorkActor': 'dwd',
    'WorkPattern': 'dwd',
  };

  return typeToSpace[artefactType] || 'ba';
}

/**
 * Get color for a space
 */
function getSpaceColor(space) {
  const colors = {
    ba: '#3b82f6',      // Blue
    ea: '#8b5cf6',      // Purple
    cap: '#14b8a6',     // Teal
    pds: '#10b981',     // Green
    srs: '#6366f1',     // Indigo
    portfolio: '#06b6d4', // Cyan
    pdw: '#f59e0b',     // Amber
    dwd: '#f43f5e',     // Rose
    sd: '#f97316',      // Orange
    perf: '#34d399',    // Emerald
    cm: '#8b5cf6',      // Violet
    ks: '#64748b',      // Slate
  };
  return colors[space] || '#6b7280';
}

/**
 * Calculate summary statistics
 */
function calculateSummary(nodes, edges, sourceId) {
  const bySpace = {};
  const byDepth = {};
  let upstreamCount = 0;
  let downstreamCount = 0;

  for (const node of nodes) {
    if (node.id === sourceId) continue;

    // Count by space
    bySpace[node.space] = (bySpace[node.space] || 0) + 1;

    // Count by depth
    byDepth[node.depth] = (byDepth[node.depth] || 0) + 1;
  }

  for (const edge of edges) {
    if (edge.direction === 'upstream') upstreamCount++;
    if (edge.direction === 'downstream') downstreamCount++;
  }

  return {
    upstreamCount,
    downstreamCount,
    bySpace,
    byDepth,
    totalConnections: nodes.length - 1, // Exclude source
  };
}
