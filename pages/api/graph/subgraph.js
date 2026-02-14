// pages/api/graph/subgraph.js
// Extract a subgraph from the knowledge graph by pipeline stage, node type, or domain.
//
// GET /api/graph/subgraph?domain_id=xxx&pipeline_stage=analysis
// GET /api/graph/subgraph?domain_id=xxx&node_type=Requirement
// GET /api/graph/subgraph?domain_id=xxx  (full domain graph)

import { query } from '../../../lib/pg';
import { errorResponse } from '../../../lib/api/errorResponse';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { domain_id, pipeline_stage, node_type, limit = 500 } = req.query;

  try {
    // Build node query
    let nodeSql = 'SELECT * FROM graph_nodes WHERE 1=1';
    const nodeParams = [];
    let paramIdx = 1;

    if (domain_id) {
      nodeSql += ` AND domain = $${paramIdx}`;
      nodeParams.push(domain_id);
      paramIdx++;
    }

    if (pipeline_stage) {
      nodeSql += ` AND attributes->>'pipeline_stage' = $${paramIdx}`;
      nodeParams.push(pipeline_stage);
      paramIdx++;
    }

    if (node_type) {
      nodeSql += ` AND type_id = $${paramIdx}`;
      nodeParams.push(node_type);
      paramIdx++;
    }

    nodeSql += ` ORDER BY updated_at DESC LIMIT $${paramIdx}`;
    nodeParams.push(parseInt(limit, 10));

    const nodesResult = await query(nodeSql, nodeParams);
    const nodes = nodesResult.rows;
    const nodeIds = nodes.map(n => n.id);

    // Get edges between these nodes
    let edges = [];
    if (nodeIds.length > 0) {
      const edgesResult = await query(`
        SELECT * FROM graph_relationships
        WHERE source_id = ANY($1::text[]) AND target_id = ANY($1::text[])
        ORDER BY created_at DESC
      `, [nodeIds]);
      edges = edgesResult.rows;
    }

    // Aggregate stats
    const typeCounts = {};
    const stageCounts = {};
    for (const node of nodes) {
      const type = node.type_id || 'unknown';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
      const stage = node.attributes?.pipeline_stage;
      if (stage) {
        stageCounts[stage] = (stageCounts[stage] || 0) + 1;
      }
    }

    return res.status(200).json({
      nodes,
      edges,
      stats: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        typeCounts,
        stageCounts,
      },
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to extract subgraph', error);
  }
}
