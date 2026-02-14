// pages/api/gtm/artefacts/[id].js
// GTM Artefact API - Individual artefact operations
// Task GT-011

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Artefact ID is required' });
  }

  // GET - Get single artefact
  if (req.method === 'GET') {
    try {
      const result = await query(
        `SELECT a.*,
          u.username as owner_username,
          p.name as plan_name
         FROM artefacts a
         LEFT JOIN users u ON u.username = a.owner_id
         LEFT JOIN gtm_plans p ON p.id::text = a.custom_fields->>'gtm_plan_id'
         WHERE a.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Artefact not found' });
      }

      const artefact = result.rows[0];

      const { hasAccess, error } = await checkDomainAccess(req, artefact.domain_id, 'view');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      // Get related artefacts if any
      const relatedResult = await query(
        `SELECT r.*, a.name as related_name, a.artefact_type as related_type
         FROM artefact_relationships r
         JOIN artefacts a ON a.id = r.to_artefact_id
         WHERE r.from_artefact_id = $1
         UNION
         SELECT r.*, a.name as related_name, a.artefact_type as related_type
         FROM artefact_relationships r
         JOIN artefacts a ON a.id = r.from_artefact_id
         WHERE r.to_artefact_id = $1`,
        [id]
      );

      return res.status(200).json({
        ...artefact,
        relationships: relatedResult.rows,
      });
    } catch (err) {
      console.error('Error fetching GTM artefact:', err);
      return res.status(500).json({ error: 'Failed to fetch GTM artefact' });
    }
  }

  // PUT - Update artefact
  if (req.method === 'PUT') {
    try {
      const existingResult = await query(
        `SELECT * FROM artefacts WHERE id = $1`,
        [id]
      );

      if (existingResult.rows.length === 0) {
        return res.status(404).json({ error: 'Artefact not found' });
      }

      const existing = existingResult.rows[0];

      const { hasAccess, error } = await checkDomainAccess(req, existing.domain_id, 'edit');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      const {
        name,
        description,
        status,
        priority,
        owner_id,
        custom_fields,
      } = req.body;

      // Merge custom fields
      const mergedCustomFields = custom_fields
        ? { ...existing.custom_fields, ...custom_fields }
        : existing.custom_fields;

      const result = await query(
        `UPDATE artefacts SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          status = COALESCE($3, status),
          priority = COALESCE($4, priority),
          owner_id = COALESCE($5, owner_id),
          custom_fields = $6,
          updated_at = now()
        WHERE id = $7
        RETURNING *`,
        [
          name?.trim() || null,
          description,
          status,
          priority,
          owner_id,
          JSON.stringify(mergedCustomFields),
          id,
        ]
      );

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error updating GTM artefact:', err);
      return res.status(500).json({ error: 'Failed to update GTM artefact' });
    }
  }

  // DELETE - Delete artefact
  if (req.method === 'DELETE') {
    try {
      const existingResult = await query(
        `SELECT * FROM artefacts WHERE id = $1`,
        [id]
      );

      if (existingResult.rows.length === 0) {
        return res.status(404).json({ error: 'Artefact not found' });
      }

      const existing = existingResult.rows[0];

      const { hasAccess, error } = await checkDomainAccess(req, existing.domain_id, 'edit');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      // Delete relationships first
      await query(`DELETE FROM artefact_relationships WHERE from_artefact_id = $1 OR to_artefact_id = $1`, [id]);

      // Delete artefact
      await query(`DELETE FROM artefacts WHERE id = $1`, [id]);

      return res.status(200).json({ message: 'Artefact deleted successfully' });
    } catch (err) {
      console.error('Error deleting GTM artefact:', err);
      return res.status(500).json({ error: 'Failed to delete GTM artefact' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
