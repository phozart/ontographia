// pages/api/pdw/artefacts/[id].js
// Product Design Workspace - Single artefact CRUD API
// Get, update, delete PDW artefacts with access control

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkArtefactAccess } from '../../../../lib/projectAccess';
import { PDW_ALL_TYPES, PDW_STATUS_OPTIONS, isPDWType } from '../../../../lib/pdw-types';

// ============ DATABASE CONSTRAINT VALUES ============
const VALID_ARTEFACT_STATUS = ['Draft', 'InReview', 'Approved', 'Deprecated', 'Superseded'];

// Map PDW status to valid artefact status
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
  const { id } = req.query;
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Artefact ID required' });
  }

  if (req.method === 'GET') {
    // Get single PDW artefact with relationships
    const { hasAccess, error } = await checkArtefactAccess(req, id, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const result = await query(
        `SELECT a.*,
          u.username as owner_username,
          cb.username as created_by_username,
          d.name as domain_name
        FROM artefacts a
        LEFT JOIN users u ON u.id = a.owner_id
        LEFT JOIN users cb ON cb.id = a.created_by
        LEFT JOIN domains d ON d.id = a.domain_id
        WHERE a.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Artefact not found' });
      }

      const artefact = result.rows[0];

      // Verify it's a PDW artefact
      if (!isPDWType(artefact.artefact_type)) {
        return res.status(400).json({ error: 'Not a PDW artefact' });
      }

      // Get relationships
      const relResult = await query(
        `SELECT r.*,
          fa.name as from_name, fa.artefact_type as from_type,
          ta.name as to_name, ta.artefact_type as to_type
        FROM artefact_relationships r
        LEFT JOIN artefacts fa ON fa.id = r.from_artefact_id
        LEFT JOIN artefacts ta ON ta.id = r.to_artefact_id
        WHERE r.from_artefact_id = $1 OR r.to_artefact_id = $1`,
        [id]
      );

      // Get type definition for additional context
      const typeDef = PDW_ALL_TYPES[artefact.artefact_type];

      return res.status(200).json({
        ...artefact,
        relationships: relResult.rows,
        typeDef: typeDef ? {
          name: typeDef.name,
          category: typeDef.category,
          stage: typeDef.stage,
          module: typeDef.module,
          color: typeDef.color,
          icon: typeDef.icon,
          fields: typeDef.fields,
          guidance: typeDef.guidance,
        } : null,
      });
    } catch (err) {
      console.error('Error fetching PDW artefact:', err);
      return res.status(500).json({ error: 'Failed to fetch artefact' });
    }
  }

  if (req.method === 'PUT') {
    // Update PDW artefact
    const { hasAccess, error } = await checkArtefactAccess(req, id, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    // First, verify it's a PDW artefact
    const checkResult = await query(`SELECT artefact_type, custom_fields FROM artefacts WHERE id = $1`, [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artefact not found' });
    }
    if (!isPDWType(checkResult.rows[0].artefact_type)) {
      return res.status(400).json({ error: 'Not a PDW artefact' });
    }

    const existingCustomFields = checkResult.rows[0].custom_fields || {};

    const {
      name,
      description,
      pdwStatus,
      ownerId,
      tags,
      customFields,
      ...typeSpecificFields
    } = req.body;

    // Merge existing custom fields with updates
    const mergedCustomFields = {
      ...existingCustomFields,
      ...(customFields || {}),
      ...typeSpecificFields,
    };

    // Update PDW status if provided
    if (pdwStatus) {
      mergedCustomFields.pdw_status = pdwStatus;
    }

    // Remove fields that shouldn't be in customFields
    delete mergedCustomFields.id;
    delete mergedCustomFields.domainId;
    delete mergedCustomFields.createdAt;
    delete mergedCustomFields.updatedAt;
    delete mergedCustomFields.createdBy;
    delete mergedCustomFields.artefactType;

    // Map PDW status to artefact status
    const artefactStatus = pdwStatus ? mapPDWStatusToArtefactStatus(pdwStatus) : null;

    try {
      const result = await query(
        `UPDATE artefacts SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          status = COALESCE($3, status),
          owner_id = COALESCE($4, owner_id),
          tags = COALESCE($5, tags),
          custom_fields = COALESCE($6, custom_fields),
          version = version + 1,
          updated_at = now()
        WHERE id = $7
        RETURNING *`,
        [
          name,
          description,
          artefactStatus,
          ownerId,
          tags ? JSON.stringify(tags) : null,
          Object.keys(mergedCustomFields).length > 0 ? JSON.stringify(mergedCustomFields) : null,
          id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Artefact not found' });
      }

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error updating PDW artefact:', err);
      return res.status(500).json({ error: 'Failed to update artefact' });
    }
  }

  if (req.method === 'DELETE') {
    // Delete PDW artefact
    const { hasAccess, error } = await checkArtefactAccess(req, id, 'delete');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      // Check if it's a PDW artefact and its status
      const checkResult = await query(`SELECT artefact_type, status FROM artefacts WHERE id = $1`, [id]);
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Artefact not found' });
      }
      if (!isPDWType(checkResult.rows[0].artefact_type)) {
        return res.status(400).json({ error: 'Not a PDW artefact' });
      }
      if (checkResult.rows[0].status === 'Approved') {
        return res.status(400).json({ error: 'Approved artefacts cannot be deleted. Change status first.' });
      }

      // Delete relationships first
      await query(`DELETE FROM artefact_relationships WHERE from_artefact_id = $1 OR to_artefact_id = $1`, [id]);

      // Delete the artefact
      await query(`DELETE FROM artefacts WHERE id = $1`, [id]);

      return res.status(200).json({ success: true, message: 'Artefact deleted' });
    } catch (err) {
      console.error('Error deleting PDW artefact:', err);
      return res.status(500).json({ error: 'Failed to delete artefact' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
