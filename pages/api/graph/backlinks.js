// pages/api/graph/backlinks.js
// Returns all entities connected to a given entity ID across the knowledge graph.
// Groups results by source studio / type for the BacklinksSidebar component.
//
// GET /api/graph/backlinks?entityId=artefact_123
// GET /api/graph/backlinks?entityId=artefact_123&entityType=artefact

import { query } from '../../../lib/pg';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { entityId, entityType } = req.query;

  if (!entityId) {
    return res.status(400).json({ error: 'entityId is required' });
  }

  try {
    const backlinks = {};

    // 1. Search graph_relationships for edges where this entity is source or target
    const graphRels = await query(`
      SELECT
        r.id as rel_id,
        r.type_id as rel_type,
        r.name as rel_name,
        CASE
          WHEN r.source_id = $1 THEN r.target_id
          ELSE r.source_id
        END as connected_node_id,
        CASE
          WHEN r.source_id = $1 THEN 'outgoing'
          ELSE 'incoming'
        END as direction,
        n.name as connected_name,
        n.type_id as connected_type,
        n.attributes as connected_attrs,
        nt.name as type_name,
        nt.color as type_color,
        nt.icon as type_icon
      FROM graph_relationships r
      JOIN graph_nodes n ON n.id = CASE WHEN r.source_id = $1 THEN r.target_id ELSE r.source_id END
      LEFT JOIN graph_node_types nt ON n.type_id = nt.id
      WHERE r.source_id = $1 OR r.target_id = $1
      ORDER BY n.name
    `, [entityId]);

    if (graphRels.rows.length > 0) {
      backlinks.graph = graphRels.rows.map(r => ({
        id: r.connected_node_id,
        name: r.connected_name,
        type: r.connected_type,
        typeName: r.type_name,
        typeColor: r.type_color,
        typeIcon: r.type_icon,
        relationshipType: r.rel_type || r.rel_name,
        direction: r.direction,
        source: r.connected_attrs?.source || 'graph',
      }));
    }

    // 2. If this is an artefact node, also check artefact_relationships
    if (entityId.startsWith('artefact_')) {
      const artefactId = entityId.replace('artefact_', '');

      const artefactRels = await query(`
        SELECT
          r.id as rel_id,
          r.relationship_type,
          CASE
            WHEN r.from_artefact_id::text = $1 THEN r.to_artefact_id
            ELSE r.from_artefact_id
          END as connected_id,
          CASE
            WHEN r.from_artefact_id::text = $1 THEN 'outgoing'
            ELSE 'incoming'
          END as direction,
          a.name as connected_name,
          a.artefact_type,
          a.status,
          a.project_id
        FROM artefact_relationships r
        JOIN artefacts a ON a.id = CASE
          WHEN r.from_artefact_id::text = $1 THEN r.to_artefact_id
          ELSE r.from_artefact_id
        END
        WHERE r.from_artefact_id::text = $1 OR r.to_artefact_id::text = $1
        ORDER BY a.name
      `, [artefactId]);

      if (artefactRels.rows.length > 0) {
        backlinks.artefacts = artefactRels.rows.map(r => ({
          id: r.connected_id,
          name: r.connected_name,
          type: r.artefact_type,
          status: r.status,
          relationshipType: r.relationship_type,
          direction: r.direction,
          projectId: r.project_id,
          source: 'artefact',
        }));
      }
    }

    // 3. Check linked_graph_nodes on artefacts (reverse lookup)
    const linkedArtefacts = await query(`
      SELECT id, name, artefact_type, status, linked_graph_nodes
      FROM artefacts
      WHERE linked_graph_nodes::jsonb @> $1::jsonb
    `, [JSON.stringify([entityId])]);

    if (linkedArtefacts.rows.length > 0) {
      backlinks.linkedFrom = linkedArtefacts.rows.map(r => ({
        id: r.id,
        name: r.name,
        type: r.artefact_type,
        status: r.status,
        source: 'linked_artefact',
      }));
    }

    // Group by source for the UI
    const grouped = {};
    for (const [category, items] of Object.entries(backlinks)) {
      for (const item of items) {
        const groupKey = item.type || item.source || 'other';
        if (!grouped[groupKey]) {
          grouped[groupKey] = [];
        }
        grouped[groupKey].push({ ...item, category });
      }
    }

    return res.status(200).json({
      entityId,
      totalConnections: Object.values(backlinks).reduce((sum, arr) => sum + arr.length, 0),
      groups: grouped,
      raw: backlinks,
    });
  } catch (err) {
    console.error('[backlinks API error]', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
