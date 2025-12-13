// pages/api/ea/relationships.js
// CRUD API for EA relationships (PostgreSQL-only)

import { query } from '../../../lib/pg';

// ArchiMate relationship types
export const EA_RELATIONSHIP_TYPES = [
  { id: 'composition', name: 'Composition', color: '#3b82f6', description: 'Element consists of other elements' },
  { id: 'aggregation', name: 'Aggregation', color: '#60a5fa', description: 'Element groups other elements' },
  { id: 'assignment', name: 'Assignment', color: '#2563eb', description: 'Links active to behavior elements' },
  { id: 'realization', name: 'Realization', color: '#22c55e', description: 'Element realizes another' },
  { id: 'serving', name: 'Serving', color: '#10b981', description: 'Provides functionality to another' },
  { id: 'access', name: 'Access', color: '#059669', description: 'Access to business or data objects' },
  { id: 'influence', name: 'Influence', color: '#eab308', description: 'Element affects another' },
  { id: 'triggering', name: 'Triggering', color: '#f97316', description: 'Temporal or causal relationship' },
  { id: 'flow', name: 'Flow', color: '#f59e0b', description: 'Exchange or transfer between elements' },
  { id: 'specialization', name: 'Specialization', color: '#8b5cf6', description: 'Element is a specialization' },
  { id: 'association', name: 'Association', color: '#94a3b8', description: 'Unspecified relationship' },
];

export default async function handler(req, res) {
  const { domain } = req.query;

  if (req.method === 'GET') {
    try {
      let sql = `
        SELECT r.*,
          se.name as source_name, se.element_type as source_type, se.layer as source_layer,
          te.name as target_name, te.element_type as target_type, te.layer as target_layer
        FROM ea_relationships r
        LEFT JOIN ea_elements se ON se.id = r.source_id
        LEFT JOIN ea_elements te ON te.id = r.target_id
      `;
      const params = [];

      if (domain) {
        const domainResult = await query('SELECT id FROM domains WHERE name = $1', [domain]);
        if (domainResult.rows.length > 0) {
          sql += ' WHERE r.domain_id = $1';
          params.push(domainResult.rows[0].id);
        }
      }

      sql += ' ORDER BY r.created_at DESC';

      const result = await query(sql, params);
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error fetching EA relationships:', err);
      return res.status(500).json({ error: 'Failed to fetch EA relationships' });
    }
  }

  if (req.method === 'POST') {
    const { sourceId, targetId, relationshipType, label, properties, domainName, userId } = req.body;

    if (!sourceId || !targetId || !relationshipType) {
      return res.status(400).json({ error: 'sourceId, targetId, and relationshipType are required' });
    }

    try {
      // Get domain ID
      let domainId = null;
      if (domainName) {
        const domainResult = await query('SELECT id FROM domains WHERE name = $1', [domainName]);
        if (domainResult.rows.length > 0) {
          domainId = domainResult.rows[0].id;
        }
      }

      const result = await query(
        `INSERT INTO ea_relationships (domain_id, source_id, target_id, relationship_type, label, properties, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [domainId, sourceId, targetId, relationshipType, label || null, properties ? JSON.stringify(properties) : '{}', userId || null]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating EA relationship:', err);
      return res.status(500).json({ error: 'Failed to create EA relationship' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Relationship ID required' });
    }

    try {
      const result = await query('DELETE FROM ea_relationships WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Relationship not found' });
      }

      return res.status(200).json({ success: true, id });
    } catch (err) {
      console.error('Error deleting EA relationship:', err);
      return res.status(500).json({ error: 'Failed to delete EA relationship' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
