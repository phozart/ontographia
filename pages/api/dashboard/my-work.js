// pages/api/dashboard/my-work.js
// Aggregates the user's recent work across all studios for the home dashboard.
// GET /api/dashboard/my-work?domainId=...

import { query } from '../../../lib/pg';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { domainId } = req.query;

  try {
    // 1. Recent artefacts (across all studios)
    const recentArtefactsQuery = domainId
      ? `SELECT id, name, artefact_type, status, project_id, updated_at, created_at
         FROM artefacts
         WHERE domain_id = $1
         ORDER BY updated_at DESC NULLS LAST
         LIMIT 15`
      : `SELECT id, name, artefact_type, status, project_id, updated_at, created_at
         FROM artefacts
         ORDER BY updated_at DESC NULLS LAST
         LIMIT 15`;

    const recentArtefacts = await query(
      recentArtefactsQuery,
      domainId ? [domainId] : []
    );

    // 2. Counts by type
    const countsByTypeQuery = domainId
      ? `SELECT artefact_type, COUNT(*)::int as count
         FROM artefacts WHERE domain_id = $1
         GROUP BY artefact_type ORDER BY count DESC`
      : `SELECT artefact_type, COUNT(*)::int as count
         FROM artefacts
         GROUP BY artefact_type ORDER BY count DESC`;

    const countsByType = await query(
      countsByTypeQuery,
      domainId ? [domainId] : []
    );

    // 3. Counts by status
    const countsByStatusQuery = domainId
      ? `SELECT status, COUNT(*)::int as count
         FROM artefacts WHERE domain_id = $1
         GROUP BY status ORDER BY count DESC`
      : `SELECT status, COUNT(*)::int as count
         FROM artefacts
         GROUP BY status ORDER BY count DESC`;

    const countsByStatus = await query(
      countsByStatusQuery,
      domainId ? [domainId] : []
    );

    // 4. Graph node count
    const graphNodesQuery = domainId
      ? `SELECT COUNT(*)::int as count FROM graph_nodes WHERE domain = $1`
      : `SELECT COUNT(*)::int as count FROM graph_nodes`;

    const graphNodes = await query(
      graphNodesQuery,
      domainId ? [domainId] : []
    );

    // 5. Graph relationship count
    const graphRelsQuery = domainId
      ? `SELECT COUNT(*)::int as count FROM graph_relationships WHERE domain = $1`
      : `SELECT COUNT(*)::int as count FROM graph_relationships`;

    const graphRels = await query(
      graphRelsQuery,
      domainId ? [domainId] : []
    );

    // 6. Recent outbox activity (sync status)
    const outboxStats = await query(`
      SELECT status, COUNT(*)::int as count
      FROM outbox_events
      GROUP BY status
    `);

    return res.status(200).json({
      recentArtefacts: recentArtefacts.rows,
      countsByType: countsByType.rows,
      countsByStatus: countsByStatus.rows,
      graphStats: {
        nodes: graphNodes.rows[0]?.count || 0,
        relationships: graphRels.rows[0]?.count || 0,
      },
      outboxStats: outboxStats.rows,
    });
  } catch (err) {
    console.error('[my-work API error]', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
