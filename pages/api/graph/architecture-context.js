// pages/api/graph/architecture-context.js
// Returns Enterprise Architecture context for a given artefact — capabilities,
// applications, technologies, and processes that are connected via the graph.
// GET /api/graph/architecture-context?entityId=artefact_123

import { query } from '../../../lib/pg';

const EA_TYPES = ['Capability', 'Application', 'Technology', 'BusinessProcess', 'EAElement'];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { entityId } = req.query;
  if (!entityId) {
    return res.status(400).json({ error: 'entityId is required' });
  }

  try {
    // Find EA-typed nodes connected to this entity via graph_relationships
    const connected = await query(`
      SELECT
        n.id,
        n.name,
        n.type_id,
        n.description,
        nt.color as type_color,
        nt.icon as type_icon,
        r.type_id as relationship_type,
        CASE
          WHEN r.source_id = $1 THEN 'outgoing'
          ELSE 'incoming'
        END as direction
      FROM graph_relationships r
      JOIN graph_nodes n ON n.id = CASE WHEN r.source_id = $1 THEN r.target_id ELSE r.source_id END
      LEFT JOIN graph_node_types nt ON n.type_id = nt.id
      WHERE (r.source_id = $1 OR r.target_id = $1)
        AND n.type_id = ANY($2)
      ORDER BY n.type_id, n.name
    `, [entityId, EA_TYPES]);

    // Group by EA type
    const grouped = {};
    for (const row of connected.rows) {
      const key = row.type_id;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({
        id: row.id,
        name: row.name,
        type: row.type_id,
        typeColor: row.type_color,
        typeIcon: row.type_icon,
        relationshipType: row.relationship_type,
        direction: row.direction,
        description: row.description,
      });
    }

    // Also check if this entity itself is in the EA domain
    const selfNode = await query(
      `SELECT n.id, n.name, n.type_id, n.domain, n.layer
       FROM graph_nodes n
       WHERE n.id = $1`,
      [entityId]
    );

    return res.status(200).json({
      entityId,
      selfNode: selfNode.rows[0] || null,
      eaContext: grouped,
      totalEAConnections: connected.rows.length,
    });
  } catch (err) {
    console.error('[architecture-context API error]', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
