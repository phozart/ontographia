// pages/api/dwd/artefacts/[id].js
// Dynamic Work Design - Single artefact CRUD API

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../../lib/projectAccess';
import { DWD_TYPE_DEFS, isDWDType } from '../../../../lib/dwd-types';

// Map DWD status to valid artefact status
const mapDWDStatusToArtefactStatus = (dwdStatus, type) => {
  if (type === 'dwd_case') {
    const mapping = {
      'draft': 'Draft',
      'active': 'Draft',
      'observed': 'InReview',
      'stabilised': 'Approved',
      'archived': 'Deprecated',
    };
    return mapping[dwdStatus] || 'Draft';
  }
  if (type === 'dwd_adjustment') {
    const mapping = {
      'proposed': 'Draft',
      'trying': 'InReview',
      'adopted': 'Approved',
      'reverted': 'Deprecated',
    };
    return mapping[dwdStatus] || 'Draft';
  }
  return 'Draft';
};

export default async function handler(req, res) {
  const { id } = req.query;
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Artefact ID required' });
  }

  // ========== GET - Fetch single artefact ==========
  if (req.method === 'GET') {
    try {
      const result = await query(
        `SELECT a.*,
          u.username as owner_username,
          cb.username as created_by_username
        FROM artefacts a
        LEFT JOIN users u ON u.id = a.owner_id
        LEFT JOIN users cb ON cb.id = a.created_by
        WHERE a.id = $1 AND a.artefact_type LIKE 'dwd_%'`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Artefact not found' });
      }

      const artefact = result.rows[0];

      // Check project access
      const { hasAccess, error } = await checkProjectAccess(req, artefact.project_id, 'view');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      // Fetch relationships
      const relsResult = await query(
        `SELECT ar.*,
          a1.name as from_name, a1.artefact_type as from_type,
          a2.name as to_name, a2.artefact_type as to_type
        FROM artefact_relationships ar
        LEFT JOIN artefacts a1 ON a1.id = ar.from_artefact_id
        LEFT JOIN artefacts a2 ON a2.id = ar.to_artefact_id
        WHERE ar.from_artefact_id = $1 OR ar.to_artefact_id = $1`,
        [id]
      );

      // Add type definition
      const typeDef = DWD_TYPE_DEFS[artefact.artefact_type] || null;

      return res.status(200).json({
        ...artefact,
        relationships: relsResult.rows,
        typeDef,
      });
    } catch (err) {
      console.error('Error fetching DWD artefact:', err);
      return res.status(500).json({ error: 'Failed to fetch artefact' });
    }
  }

  // ========== PUT - Update artefact ==========
  if (req.method === 'PUT') {
    const {
      name,
      description,
      ownerId,
      tags,
      customFields,
      ...typeSpecificFields
    } = req.body;

    try {
      // First fetch the artefact to get project_id and type
      const existing = await query(
        `SELECT * FROM artefacts WHERE id = $1 AND artefact_type LIKE 'dwd_%'`,
        [id]
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Artefact not found' });
      }

      const artefact = existing.rows[0];

      // Check project access
      const { hasAccess, error } = await checkProjectAccess(req, artefact.project_id, 'edit');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      // Merge existing custom_fields with updates
      const existingCustomFields = artefact.custom_fields || {};
      const mergedCustomFields = {
        ...existingCustomFields,
        ...(customFields || {}),
        ...typeSpecificFields,
      };

      // Get status for mapping
      let dwdStatus = null;
      if (artefact.artefact_type === 'dwd_case') {
        dwdStatus = mergedCustomFields.case_status || existingCustomFields.case_status;
      } else if (artefact.artefact_type === 'dwd_adjustment') {
        dwdStatus = mergedCustomFields.adjustment_status || existingCustomFields.adjustment_status;
      }

      // Build update fields
      const updates = [];
      const params = [];
      let paramIdx = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramIdx}`);
        params.push(name.trim());
        paramIdx++;
      }

      if (description !== undefined) {
        updates.push(`description = $${paramIdx}`);
        params.push(description);
        paramIdx++;
      }

      if (ownerId !== undefined) {
        updates.push(`owner_id = $${paramIdx}`);
        params.push(ownerId);
        paramIdx++;
      }

      if (tags !== undefined) {
        updates.push(`tags = $${paramIdx}`);
        params.push(JSON.stringify(tags));
        paramIdx++;
      }

      // Always update custom_fields if any type-specific fields provided
      if (Object.keys(typeSpecificFields).length > 0 || customFields) {
        updates.push(`custom_fields = $${paramIdx}`);
        params.push(JSON.stringify(mergedCustomFields));
        paramIdx++;
      }

      // Update artefact status if DWD status changed
      if (dwdStatus) {
        const artefactStatus = mapDWDStatusToArtefactStatus(dwdStatus, artefact.artefact_type);
        updates.push(`status = $${paramIdx}`);
        params.push(artefactStatus);
        paramIdx++;
      }

      // Add updated_at
      updates.push(`updated_at = now()`);

      // Add id at the end
      params.push(id);

      const sql = `
        UPDATE artefacts
        SET ${updates.join(', ')}
        WHERE id = $${paramIdx}
        RETURNING *
      `;

      const result = await query(sql, params);

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error updating DWD artefact:', err);
      return res.status(500).json({ error: 'Failed to update artefact' });
    }
  }

  // ========== DELETE - Remove artefact ==========
  if (req.method === 'DELETE') {
    try {
      // Fetch artefact first
      const existing = await query(
        `SELECT * FROM artefacts WHERE id = $1 AND artefact_type LIKE 'dwd_%'`,
        [id]
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Artefact not found' });
      }

      const artefact = existing.rows[0];

      // Check project access
      const { hasAccess, error } = await checkProjectAccess(req, artefact.project_id, 'delete');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      // Delete relationships first
      await query(
        `DELETE FROM artefact_relationships WHERE from_artefact_id = $1 OR to_artefact_id = $1`,
        [id]
      );

      // Delete the artefact
      await query(`DELETE FROM artefacts WHERE id = $1`, [id]);

      return res.status(200).json({ success: true, id });
    } catch (err) {
      console.error('Error deleting DWD artefact:', err);
      return res.status(500).json({ error: 'Failed to delete artefact' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
