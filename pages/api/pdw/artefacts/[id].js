// pages/api/pdw/artefacts/[id].js
// Product Design Workspace - Single artefact GET/PUT/DELETE

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

const mapPDWStatusToArtefactStatus = (pdwStatus) => {
  const mapping = {
    'draft': 'Draft',
    'in_progress': 'Draft',
    'in_review': 'InReview',
    'validated': 'Approved',
    'invalidated': 'Deprecated',
    'on_hold': 'Draft',
    'archived': 'Deprecated',
  };
  return mapping[pdwStatus] || 'Draft';
};

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);
  const { id } = req.query;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Artefact ID is required' });
  }

  // GET - Fetch single artefact
  if (req.method === 'GET') {
    try {
      const result = await query(
        `SELECT a.*,
          u.username as owner_username,
          cb.username as created_by_username
        FROM artefacts a
        LEFT JOIN users u ON u.username = a.owner_id
        LEFT JOIN users cb ON cb.username = a.created_by
        WHERE a.id = $1 AND a.artefact_type LIKE 'pdw_%'`,
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

      return res.status(200).json(artefact);
    } catch (err) {
      console.error('Error fetching PDW artefact:', err);
      return res.status(500).json({ error: 'Failed to fetch artefact' });
    }
  }

  // PUT - Update artefact
  if (req.method === 'PUT') {
    try {
      const existing = await query(
        `SELECT * FROM artefacts WHERE id = $1 AND artefact_type LIKE 'pdw_%'`,
        [id]
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Artefact not found' });
      }

      const artefact = existing.rows[0];

      const { hasAccess, error } = await checkDomainAccess(req, artefact.domain_id, 'edit');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      const {
        name,
        description,
        pdwStatus,
        ownerId,
        tags,
        customFields,
        ...typeSpecificFields
      } = req.body;

      const sets = [];
      const params = [];
      let paramIdx = 1;

      if (name !== undefined) {
        sets.push(`name = $${paramIdx}`);
        params.push(name.trim());
        paramIdx++;
      }

      if (description !== undefined) {
        sets.push(`description = $${paramIdx}`);
        params.push(description);
        paramIdx++;
      }

      if (pdwStatus !== undefined) {
        sets.push(`status = $${paramIdx}`);
        params.push(mapPDWStatusToArtefactStatus(pdwStatus));
        paramIdx++;
      }

      if (ownerId !== undefined) {
        sets.push(`owner_id = $${paramIdx}`);
        params.push(ownerId);
        paramIdx++;
      }

      if (tags !== undefined) {
        sets.push(`tags = $${paramIdx}`);
        params.push(JSON.stringify(tags));
        paramIdx++;
      }

      // Merge custom fields
      const existingCustomFields = artefact.custom_fields || {};
      const mergedCustomFields = {
        ...existingCustomFields,
        ...(customFields || {}),
        ...typeSpecificFields,
      };
      if (pdwStatus !== undefined) {
        mergedCustomFields.pdw_status = pdwStatus;
      }

      sets.push(`custom_fields = $${paramIdx}`);
      params.push(JSON.stringify(mergedCustomFields));
      paramIdx++;

      sets.push(`updated_at = now()`);

      params.push(id);

      const result = await query(
        `UPDATE artefacts SET ${sets.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
        params
      );

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error updating PDW artefact:', err);
      return res.status(500).json({ error: 'Failed to update artefact' });
    }
  }

  // DELETE - Delete artefact
  if (req.method === 'DELETE') {
    try {
      const existing = await query(
        `SELECT * FROM artefacts WHERE id = $1 AND artefact_type LIKE 'pdw_%'`,
        [id]
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Artefact not found' });
      }

      const artefact = existing.rows[0];

      const { hasAccess, error } = await checkDomainAccess(req, artefact.domain_id, 'edit');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      // Delete related relationships first
      await query(
        `DELETE FROM artefact_relationships WHERE from_artefact_id = $1 OR to_artefact_id = $1`,
        [id]
      );

      await query(`DELETE FROM artefacts WHERE id = $1`, [id]);

      return res.status(200).json({ success: true, id });
    } catch (err) {
      console.error('Error deleting PDW artefact:', err);
      return res.status(500).json({ error: 'Failed to delete artefact' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
