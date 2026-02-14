// pages/api/search/universal.js
// Unified search across artefacts + graph nodes.
// GET /api/search/universal?q=term&domainId=...&limit=30

import { query } from '../../../lib/pg';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q, domainId, limit = 30 } = req.query;

  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Query must be at least 2 characters' });
  }

  const searchLimit = Math.min(parseInt(limit, 10) || 30, 100);
  const pattern = `%${q}%`;

  try {
    // 1. Search artefacts
    const artefactSql = domainId
      ? `SELECT id, name, artefact_type as type, status, 'artefact' as source, updated_at
         FROM artefacts
         WHERE domain_id = $2 AND (name ILIKE $1 OR description ILIKE $1)
         ORDER BY CASE WHEN name ILIKE $1 THEN 0 ELSE 1 END, updated_at DESC NULLS LAST
         LIMIT $3`
      : `SELECT id, name, artefact_type as type, status, 'artefact' as source, updated_at
         FROM artefacts
         WHERE name ILIKE $1 OR description ILIKE $1
         ORDER BY CASE WHEN name ILIKE $1 THEN 0 ELSE 1 END, updated_at DESC NULLS LAST
         LIMIT $2`;

    const artefactParams = domainId
      ? [pattern, domainId, searchLimit]
      : [pattern, searchLimit];

    const artefacts = await query(artefactSql, artefactParams);

    // 2. Search graph nodes
    const nodeSql = domainId
      ? `SELECT n.id, n.name, n.type_id as type, nt.color as type_color, 'graph_node' as source, n.updated_at
         FROM graph_nodes n
         LEFT JOIN graph_node_types nt ON n.type_id = nt.id
         WHERE n.domain = $2 AND (n.name ILIKE $1 OR n.description ILIKE $1)
         ORDER BY CASE WHEN n.name ILIKE $1 THEN 0 ELSE 1 END, n.updated_at DESC NULLS LAST
         LIMIT $3`
      : `SELECT n.id, n.name, n.type_id as type, nt.color as type_color, 'graph_node' as source, n.updated_at
         FROM graph_nodes n
         LEFT JOIN graph_node_types nt ON n.type_id = nt.id
         WHERE n.name ILIKE $1 OR n.description ILIKE $1
         ORDER BY CASE WHEN n.name ILIKE $1 THEN 0 ELSE 1 END, n.updated_at DESC NULLS LAST
         LIMIT $2`;

    const nodeParams = domainId
      ? [pattern, domainId, searchLimit]
      : [pattern, searchLimit];

    const nodes = await query(nodeSql, nodeParams);

    // 3. Merge & sort by relevance (name matches first, then by recency)
    const combined = [
      ...artefacts.rows.map(r => ({
        ...r,
        href: `/app/spaces/analysis/projects`, // default for artefacts
      })),
      ...nodes.rows.map(r => ({
        ...r,
        href: `/app/spaces/ks/navigator`,
      })),
    ].sort((a, b) => {
      // Name-exact matches first
      const aExact = a.name?.toLowerCase().includes(q.toLowerCase()) ? 0 : 1;
      const bExact = b.name?.toLowerCase().includes(q.toLowerCase()) ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;
      // Then by recency
      return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
    }).slice(0, searchLimit);

    return res.status(200).json({
      query: q,
      total: combined.length,
      results: combined,
    });
  } catch (err) {
    console.error('[universal search error]', err);
    return res.status(500).json({ error: 'Search failed', details: err.message });
  }
}
