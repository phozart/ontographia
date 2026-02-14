// pages/api/graph/impact.js
// API endpoint for impact analysis - detailed breakdown of what's affected

import { query } from '../../../lib/pg';
import { getUserFromRequest } from '../../../lib/projectAccess';

/**
 * Impact Analysis API - Calculate impact of changes to an artefact
 *
 * GET /api/graph/impact?artefactId=xxx&direction=downstream
 *
 * Returns detailed impact analysis including:
 * - Direct dependents (1 hop)
 * - Indirect dependents (2+ hops)
 * - Breakdown by space, type, status
 * - Risk assessment
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { artefactId, direction = 'downstream' } = req.query;

  if (!artefactId) {
    return res.status(400).json({ error: 'artefactId is required' });
  }

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

    // Get all impacted artefacts with depth info (up to 5 levels)
    const impactQuery = direction === 'upstream'
      ? buildUpstreamImpactQuery()
      : buildDownstreamImpactQuery();

    const impactResult = await query(impactQuery, [artefactId]);

    // Build impact analysis
    const impacted = [];
    const bySpace = {};
    const byType = {};
    const byStatus = {};
    const byDepth = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    const criticalPath = [];

    for (const row of impactResult.rows) {
      const space = row.space || inferSpace(row.artefact_type);
      const item = {
        id: row.id,
        name: row.name,
        type: row.artefact_type,
        status: row.status,
        space,
        depth: row.depth,
        relationshipType: row.relationship_type,
        path: row.path || [],
      };

      impacted.push(item);

      // Aggregate by space
      if (!bySpace[space]) bySpace[space] = [];
      bySpace[space].push(item);

      // Aggregate by type
      if (!byType[row.artefact_type]) byType[row.artefact_type] = [];
      byType[row.artefact_type].push(item);

      // Aggregate by status
      const status = row.status || 'Unknown';
      if (!byStatus[status]) byStatus[status] = [];
      byStatus[status].push(item);

      // Aggregate by depth
      const depth = Math.min(row.depth, 5);
      byDepth[depth].push(item);

      // Track critical items (Approved status or High priority)
      if (row.status === 'Approved' || row.priority === 'High' || row.priority === 'Critical') {
        criticalPath.push(item);
      }
    }

    // Calculate risk score
    const riskScore = calculateRiskScore(impacted, criticalPath);

    // Get relationship type breakdown
    const relationshipTypes = await getRelationshipTypeBreakdown(artefactId, direction);

    return res.status(200).json({
      source: {
        id: source.id,
        name: source.name,
        type: source.artefact_type,
        status: source.status,
        space: source.space || inferSpace(source.artefact_type),
      },
      impact: {
        total: impacted.length,
        direct: byDepth[1].length,
        indirect: impacted.length - byDepth[1].length,
        bySpace: Object.fromEntries(
          Object.entries(bySpace).map(([k, v]) => [k, { count: v.length, items: v.slice(0, 5) }])
        ),
        byType: Object.fromEntries(
          Object.entries(byType).map(([k, v]) => [k, { count: v.length, items: v.slice(0, 5) }])
        ),
        byStatus: Object.fromEntries(
          Object.entries(byStatus).map(([k, v]) => [k, v.length])
        ),
        byDepth: Object.fromEntries(
          Object.entries(byDepth).map(([k, v]) => [k, v.length])
        ),
        relationshipTypes,
        criticalPath: criticalPath.slice(0, 10),
        riskScore,
      },
      all: impacted,
    });
  } catch (err) {
    console.error('Error in impact analysis:', err);
    return res.status(500).json({ error: 'Failed to analyze impact' });
  }
}

/**
 * Build downstream impact query (what depends on this)
 */
function buildDownstreamImpactQuery() {
  return `
    WITH RECURSIVE impact AS (
      -- Base case
      SELECT
        r.to_artefact_id as id,
        r.relationship_type,
        1 as depth,
        ARRAY[r.from_artefact_id, r.to_artefact_id] as path
      FROM artefact_relationships r
      WHERE r.from_artefact_id = $1

      UNION ALL

      -- Recursive case
      SELECT
        r.to_artefact_id,
        r.relationship_type,
        impact.depth + 1,
        impact.path || r.to_artefact_id
      FROM artefact_relationships r
      JOIN impact ON r.from_artefact_id = impact.id
      WHERE impact.depth < 5
        AND NOT r.to_artefact_id = ANY(impact.path)
    )
    SELECT DISTINCT ON (a.id)
      a.id,
      a.name,
      a.artefact_type,
      a.status,
      a.priority,
      a.description,
      COALESCE(a.custom_fields->>'space', 'ba') as space,
      impact.depth,
      impact.relationship_type,
      impact.path
    FROM impact
    JOIN artefacts a ON a.id = impact.id
    ORDER BY a.id, impact.depth
  `;
}

/**
 * Build upstream impact query (what this depends on)
 */
function buildUpstreamImpactQuery() {
  return `
    WITH RECURSIVE impact AS (
      -- Base case
      SELECT
        r.from_artefact_id as id,
        r.relationship_type,
        1 as depth,
        ARRAY[r.to_artefact_id, r.from_artefact_id] as path
      FROM artefact_relationships r
      WHERE r.to_artefact_id = $1

      UNION ALL

      -- Recursive case
      SELECT
        r.from_artefact_id,
        r.relationship_type,
        impact.depth + 1,
        impact.path || r.from_artefact_id
      FROM artefact_relationships r
      JOIN impact ON r.to_artefact_id = impact.id
      WHERE impact.depth < 5
        AND NOT r.from_artefact_id = ANY(impact.path)
    )
    SELECT DISTINCT ON (a.id)
      a.id,
      a.name,
      a.artefact_type,
      a.status,
      a.priority,
      a.description,
      COALESCE(a.custom_fields->>'space', 'ba') as space,
      impact.depth,
      impact.relationship_type,
      impact.path
    FROM impact
    JOIN artefacts a ON a.id = impact.id
    ORDER BY a.id, impact.depth
  `;
}

/**
 * Get relationship type breakdown
 */
async function getRelationshipTypeBreakdown(artefactId, direction) {
  const column = direction === 'upstream' ? 'to_artefact_id' : 'from_artefact_id';

  const result = await query(
    `SELECT relationship_type, COUNT(*) as count
     FROM artefact_relationships
     WHERE ${column} = $1
     GROUP BY relationship_type
     ORDER BY count DESC`,
    [artefactId]
  );

  return result.rows.reduce((acc, row) => {
    acc[row.relationship_type] = parseInt(row.count, 10);
    return acc;
  }, {});
}

/**
 * Calculate risk score based on impact
 */
function calculateRiskScore(impacted, criticalPath) {
  if (impacted.length === 0) return { level: 'low', score: 0, factors: [] };

  const factors = [];
  let score = 0;

  // Factor 1: Total impacted count
  if (impacted.length > 20) {
    score += 30;
    factors.push('High number of dependencies (>20)');
  } else if (impacted.length > 10) {
    score += 15;
    factors.push('Moderate number of dependencies (10-20)');
  } else if (impacted.length > 5) {
    score += 5;
    factors.push('Some dependencies (5-10)');
  }

  // Factor 2: Critical items in path
  if (criticalPath.length > 5) {
    score += 30;
    factors.push('Many critical items affected (>5)');
  } else if (criticalPath.length > 0) {
    score += 15;
    factors.push(`${criticalPath.length} critical item(s) affected`);
  }

  // Factor 3: Cross-space impact
  const spaces = new Set(impacted.map(i => i.space));
  if (spaces.size > 3) {
    score += 20;
    factors.push(`Impact spans ${spaces.size} spaces`);
  } else if (spaces.size > 1) {
    score += 10;
    factors.push(`Impact spans ${spaces.size} spaces`);
  }

  // Factor 4: Deep dependencies
  const deepItems = impacted.filter(i => i.depth >= 3);
  if (deepItems.length > 0) {
    score += 10;
    factors.push(`${deepItems.length} items at depth 3+`);
  }

  // Determine level
  let level;
  if (score >= 60) level = 'critical';
  else if (score >= 40) level = 'high';
  else if (score >= 20) level = 'medium';
  else level = 'low';

  return { level, score: Math.min(score, 100), factors };
}

/**
 * Infer space from artefact type
 */
function inferSpace(artefactType) {
  const typeToSpace = {
    'BusinessRequirement': 'ba',
    'StakeholderRequirement': 'ba',
    'SolutionRequirement': 'ba',
    'UserStory': 'ba',
    'Epic': 'ba',
    'Feature': 'ba',
    'Capability': 'ea',
    'Application': 'ea',
    'BusinessProcess': 'ea',
    'BusinessService': 'cap',
    'Policy': 'cap',
    'Risk': 'cap',
    'Project': 'pds',
    'Milestone': 'pds',
    'Initiative': 'portfolio',
    'WorkItem': 'dwd',
  };

  return typeToSpace[artefactType] || 'ba';
}
