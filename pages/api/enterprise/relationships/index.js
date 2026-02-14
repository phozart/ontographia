// pages/api/enterprise/relationships/index.js
// Enterprise Relationships API - CRUD for artefact relationships
// Task EN-145

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET - List relationships between enterprise artefacts
  if (req.method === 'GET') {
    const { domain_id: d1, domainId: d2, from_artefact_id, to_artefact_id, relationship_type, search, limit, offset } = req.query;
    const domain_id = d1 || d2;

    if (!domain_id) {
      return res.status(400).json({ error: 'domainId is required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domain_id, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      let sql = `
        SELECT ar.*,
          fa.name as from_name,
          fa.artefact_type as from_type,
          ta.name as to_name,
          ta.artefact_type as to_type
        FROM artefact_relationships ar
        JOIN artefacts fa ON fa.id = ar.from_artefact_id
        JOIN artefacts ta ON ta.id = ar.to_artefact_id
        WHERE fa.domain_id = $1
          AND fa.artefact_type LIKE 'enterprise_%'
      `;
      const params = [domain_id];
      let paramIdx = 2;

      if (from_artefact_id) {
        sql += ` AND ar.from_artefact_id = $${paramIdx}`;
        params.push(from_artefact_id);
        paramIdx++;
      }

      if (to_artefact_id) {
        sql += ` AND ar.to_artefact_id = $${paramIdx}`;
        params.push(to_artefact_id);
        paramIdx++;
      }

      if (relationship_type) {
        sql += ` AND ar.relationship_type = $${paramIdx}`;
        params.push(relationship_type);
        paramIdx++;
      }

      sql += ' ORDER BY fa.name, ta.name';

      if (limit) {
        sql += ` LIMIT $${paramIdx}`;
        params.push(parseInt(limit, 10));
        paramIdx++;
      }
      if (offset) {
        sql += ` OFFSET $${paramIdx}`;
        params.push(parseInt(offset, 10));
      }

      const result = await query(sql, params);

      return res.status(200).json({
        relationships: result.rows,
        total: result.rows.length,
      });
    } catch (err) {
      console.error('Error fetching relationships:', err);
      return res.status(500).json({ error: 'Failed to fetch relationships' });
    }
  }

  // POST - Create relationship
  if (req.method === 'POST') {
    const {
      domain_id: bd1, domainId: bd2,
      from_artefact_id,
      to_artefact_id,
      relationship_type,
      description,
      ...customFields
    } = req.body;
    const domain_id = bd1 || bd2;

    if (!domain_id) {
      return res.status(400).json({ error: 'domainId is required' });
    }

    if (!from_artefact_id || !to_artefact_id) {
      return res.status(400).json({ error: 'from_artefact_id and to_artefact_id are required' });
    }

    if (!relationship_type) {
      return res.status(400).json({ error: 'relationship_type is required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domain_id, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const result = await query(
        `INSERT INTO artefact_relationships (
          from_artefact_id, to_artefact_id, relationship_type,
          description, custom_fields, created_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, now())
        RETURNING *`,
        [
          from_artefact_id,
          to_artefact_id,
          relationship_type,
          description || '',
          JSON.stringify(customFields || {}),
          user,
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating relationship:', err);
      return res.status(500).json({ error: 'Failed to create relationship' });
    }
  }

  // DELETE - Remove relationship
  if (req.method === 'DELETE') {
    const { id, domain_id: dd1, domainId: dd2 } = req.query;
    const domain_id = dd1 || dd2;

    if (!id) {
      return res.status(400).json({ error: 'id is required' });
    }

    if (!domain_id) {
      return res.status(400).json({ error: 'domainId is required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domain_id, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const result = await query(
        `DELETE FROM artefact_relationships WHERE id = $1 RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Relationship not found' });
      }

      return res.status(200).json({ deleted: true, relationship: result.rows[0] });
    } catch (err) {
      console.error('Error deleting relationship:', err);
      return res.status(500).json({ error: 'Failed to delete relationship' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
