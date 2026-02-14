/**
 * PDS Individual Artefact API - Project Design Workspace
 *
 * GET, PUT, DELETE operations for individual PDS artefacts
 *
 * @module pages/api/pds/artefacts/[id]
 */

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../../lib/projectAccess';
import { PDS_ARTEFACT_TYPES } from '../../../../lib/pds-types';
import { errorResponse } from '../../../../lib/api/errorResponse';

// Valid artefact status values for database constraint
const VALID_ARTEFACT_STATUS = ['Draft', 'InReview', 'Approved', 'Deprecated', 'Superseded'];

// Check if type is a valid PDS type
const isPDSType = (type) => type && type.startsWith('pds_');

// Map PDS-specific status to valid artefact status
const mapPDSStatusToArtefactStatus = (status) => {
  const mapping = {
    'draft': 'Draft',
    'pending': 'Draft',
    'open': 'Draft',
    'not_started': 'Draft',
    'in_progress': 'InReview',
    'in_review': 'InReview',
    'analyzing': 'InReview',
    'escalated': 'InReview',
    'trying': 'InReview',
    'testing': 'InReview',
    'approved': 'Approved',
    'completed': 'Approved',
    'achieved': 'Approved',
    'adopted': 'Approved',
    'validated': 'Approved',
    'resolved': 'Approved',
    'closed': 'Approved',
    'rejected': 'Deprecated',
    'cancelled': 'Deprecated',
    'invalidated': 'Deprecated',
    'missed': 'Deprecated',
    'on_hold': 'Draft',
    'deferred': 'Draft',
  };
  return mapping[status] || 'Draft';
};

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);
  const { id } = req.query;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Artefact ID required' });
  }

  // Get the artefact first to check access
  let artefact;
  try {
    const result = await query(
      `SELECT a.*,
        u.username as owner_username,
        cb.username as created_by_username
       FROM artefacts a
       LEFT JOIN users u ON u.username = a.owner_id
       LEFT JOIN users cb ON cb.username = a.created_by
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artefact not found' });
    }

    artefact = result.rows[0];

    if (!isPDSType(artefact.artefact_type)) {
      return res.status(400).json({ error: 'Not a PDS artefact' });
    }
  } catch (err) {
    console.error('Error fetching artefact:', err);
    return res.status(500).json({ error: 'Failed to fetch artefact' });
  }

  // Check project access
  const { hasAccess, error } = await checkProjectAccess(req, artefact.project_id, 'view');
  if (!hasAccess) {
    return res.status(403).json({ error });
  }

  if (req.method === 'GET') {
    // Return artefact with relationships
    try {
      // Get relationships
      const relResult = await query(
        `SELECT
          ar.*,
          fa.name as from_name, fa.artefact_type as from_type,
          ta.name as to_name, ta.artefact_type as to_type
         FROM artefact_relationships ar
         JOIN artefacts fa ON fa.id = ar.from_artefact_id
         JOIN artefacts ta ON ta.id = ar.to_artefact_id
         WHERE ar.from_artefact_id = $1 OR ar.to_artefact_id = $1`,
        [id]
      );

      return res.status(200).json({
        ...artefact,
        relationships: relResult.rows,
      });
    } catch (err) {
      console.error('Error fetching relationships:', err);
      return res.status(200).json(artefact);
    }
  }

  if (req.method === 'PUT') {
    // Update artefact
    const { hasAccess: editAccess, error: editError } = await checkProjectAccess(req, artefact.project_id, 'edit');
    if (!editAccess) {
      return res.status(403).json({ error: editError });
    }

    const {
      name,
      description,
      ownerId,
      tags,
      customFields,
      ...typeSpecificFields
    } = req.body;

    // Merge existing custom fields with updates
    const existingCustomFields = artefact.custom_fields || {};
    const mergedCustomFields = {
      ...existingCustomFields,
      ...(customFields || {}),
      ...typeSpecificFields,
    };

    // Determine artefact status from type-specific status
    const typeStatus = mergedCustomFields.status || existingCustomFields.status;
    const artefactStatus = typeStatus ? mapPDSStatusToArtefactStatus(typeStatus) : artefact.status;

    try {
      const result = await query(
        `UPDATE artefacts SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          status = $3,
          owner_id = COALESCE($4, owner_id),
          tags = COALESCE($5, tags),
          custom_fields = $6,
          updated_at = now()
         WHERE id = $7
         RETURNING *`,
        [
          name?.trim() || null,
          description !== undefined ? description : null,
          artefactStatus,
          ownerId || null,
          tags ? JSON.stringify(tags) : null,
          JSON.stringify(mergedCustomFields),
          id
        ]
      );

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error updating PDS artefact:', err);
      return errorResponse(res, 500, 'Failed to update artefact', err);
    }
  }

  if (req.method === 'DELETE') {
    // Delete artefact
    const { hasAccess: deleteAccess, error: deleteError } = await checkProjectAccess(req, artefact.project_id, 'delete');
    if (!deleteAccess) {
      return res.status(403).json({ error: deleteError });
    }

    try {
      // Delete relationships first
      await query(
        `DELETE FROM artefact_relationships WHERE from_artefact_id = $1 OR to_artefact_id = $1`,
        [id]
      );

      // Delete the artefact
      await query(`DELETE FROM artefacts WHERE id = $1`, [id]);

      return res.status(200).json({ success: true, deleted: id });
    } catch (err) {
      console.error('Error deleting PDS artefact:', err);
      return errorResponse(res, 500, 'Failed to delete artefact', err);
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
