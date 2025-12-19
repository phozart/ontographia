// pages/api/portfolio/artefacts/[id].js
// Single portfolio artefact API - Get, Update, Delete

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

export default async function handler(req, res) {
  try {
    const { user } = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Artefact ID required' });
    }

    // Get the artefact first
    const artefactResult = await query(
      'SELECT * FROM artefacts WHERE id = $1 AND artefact_type LIKE $2',
      [id, 'portfolio_%']
    );

    if (artefactResult.rows.length === 0) {
      return res.status(404).json({ error: 'Portfolio artefact not found' });
    }

    const artefact = artefactResult.rows[0];

    // Check domain access
    const { hasAccess, error: accessError } = await checkDomainAccess(req, artefact.domain_id, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error: accessError || 'Access denied' });
    }

    // GET - Get single artefact
    if (req.method === 'GET') {
      return res.status(200).json(artefact);
    }

    // PATCH - Update artefact
    if (req.method === 'PATCH') {
      const { hasAccess: canEdit } = await checkDomainAccess(req, artefact.domain_id, 'edit');
      if (!canEdit) {
        return res.status(403).json({ error: 'Edit access denied' });
      }

      const { name, description, custom_fields } = req.body;

      const updates = [];
      const values = [];
      let paramCount = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramCount++}`);
        values.push(name.trim());
      }

      if (description !== undefined) {
        updates.push(`description = $${paramCount++}`);
        values.push(description?.trim() || null);
      }

      if (custom_fields !== undefined) {
        // Merge with existing custom_fields
        const mergedFields = { ...artefact.custom_fields, ...custom_fields };
        updates.push(`custom_fields = $${paramCount++}`);
        values.push(JSON.stringify(mergedFields));
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No updates provided' });
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);

      const result = await query(
        `UPDATE artefacts SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      return res.status(200).json(result.rows[0]);
    }

    // DELETE - Delete artefact
    if (req.method === 'DELETE') {
      const { hasAccess: canEdit } = await checkDomainAccess(req, artefact.domain_id, 'edit');
      if (!canEdit) {
        return res.status(403).json({ error: 'Edit access denied' });
      }

      await query('DELETE FROM artefacts WHERE id = $1', [id]);

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Portfolio artefact API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
