// pages/api/artefacts/[id].js
// Get, update, delete single artefact with access control

import { query } from '../../../lib/pg';
import { getUserFromRequest, checkArtefactAccess } from '../../../lib/projectAccess';

// ============ DATABASE CONSTRAINT VALUES ============
const VALID_VALUES = {
  status: ['Draft', 'InReview', 'Approved', 'Deprecated', 'Superseded'],
  priority: ['Low', 'Medium', 'High', 'Critical'],
  architectureState: ['Baseline', 'Transition', 'Target', 'N/A'],
  ticketStatus: ['Backlog', 'Ready', 'InProgress', 'InReview', 'Done', 'Blocked'],
};

// Normalize a value to match database constraint (case-insensitive)
const normalizeValue = (value, field) => {
  if (!value) return null; // Return null for updates so COALESCE keeps existing value
  const validValues = VALID_VALUES[field];
  if (!validValues) return value;
  const lower = String(value).toLowerCase();
  const found = validValues.find(v => v.toLowerCase() === lower);
  return found || null;
};

// Check if a value is valid for a field
const isValidValue = (value, field) => {
  if (!value) return false;
  const validValues = VALID_VALUES[field];
  if (!validValues) return true;
  return validValues.some(v => v.toLowerCase() === String(value).toLowerCase());
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
    // Get single artefact with relationships
    const { hasAccess, error } = await checkArtefactAccess(req, id, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const result = await query(
        `SELECT a.*,
          u.username as owner_username,
          cb.username as created_by_username
        FROM artefacts a
        LEFT JOIN users u ON u.id = a.owner_id
        LEFT JOIN users cb ON cb.id = a.created_by
        WHERE a.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Artefact not found' });
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

      return res.status(200).json({
        ...result.rows[0],
        relationships: relResult.rows
      });
    } catch (err) {
      console.error('Error fetching artefact:', err);
      return res.status(500).json({ error: 'Failed to fetch artefact' });
    }
  }

  if (req.method === 'PUT') {
    // Update artefact
    const { hasAccess, error } = await checkArtefactAccess(req, id, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const {
      name,
      description,
      status,
      architectureState,
      priority,
      ownerId,
      tags,
      customFields,
      ticketStatus,
      linkedGraphNodes,
      // Extract known fields, rest go to custom_fields
      ...extraFields
    } = req.body;

    // Check if trying to approve - need approve permission
    if (status === 'Approved') {
      const { hasAccess: canApprove, error: approveError } = await checkArtefactAccess(req, id, 'approve');
      if (!canApprove) {
        return res.status(403).json({ error: approveError || 'Insufficient permissions to approve' });
      }
    }

    // Merge extra fields into customFields (for type-specific data)
    const mergedCustomFields = {
      ...(customFields || {}),
      ...extraFields,
    };
    // Remove fields that shouldn't be in customFields
    delete mergedCustomFields.id;
    delete mergedCustomFields.projectId;
    delete mergedCustomFields.createdAt;
    delete mergedCustomFields.updatedAt;
    delete mergedCustomFields.createdBy;
    delete mergedCustomFields.artefactType;

    // Normalize all constrained fields (returns null if not provided, so COALESCE keeps existing)
    let artefactStatus = normalizeValue(status, 'status');
    const artefactPriority = normalizeValue(priority, 'priority');
    const artefactArchState = normalizeValue(architectureState, 'architectureState');
    const artefactTicketStatus = normalizeValue(ticketStatus, 'ticketStatus');

    // Handle custom status fields (like ElicitationSession's "planned"/"completed")
    // If status is not a valid artefact status, store it as sessionStatus in customFields
    if (status && !isValidValue(status, 'status')) {
      mergedCustomFields.sessionStatus = status;
      artefactStatus = null; // Keep existing status in DB
    }

    // Handle custom priority values (case-insensitive normalization)
    if (priority && !artefactPriority) {
      mergedCustomFields.originalPriority = priority;
    }

    try {
      const result = await query(
        `UPDATE artefacts SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          status = COALESCE($3, status),
          architecture_state = COALESCE($4, architecture_state),
          priority = COALESCE($5, priority),
          owner_id = COALESCE($6, owner_id),
          tags = COALESCE($7, tags),
          custom_fields = COALESCE($8, custom_fields),
          ticket_status = COALESCE($9, ticket_status),
          linked_graph_nodes = COALESCE($10, linked_graph_nodes),
          version = version + 1,
          updated_at = now()
        WHERE id = $11
        RETURNING *`,
        [
          name,
          description,
          artefactStatus,
          artefactArchState,
          artefactPriority,
          ownerId,
          tags ? JSON.stringify(tags) : null,
          Object.keys(mergedCustomFields).length > 0 ? JSON.stringify(mergedCustomFields) : null,
          artefactTicketStatus,
          linkedGraphNodes ? JSON.stringify(linkedGraphNodes) : null,
          id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Artefact not found' });
      }

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error updating artefact:', err);
      return res.status(500).json({ error: 'Failed to update artefact' });
    }
  }

  if (req.method === 'DELETE') {
    // Delete artefact
    const { hasAccess, error } = await checkArtefactAccess(req, id, 'delete');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      // Check if approved
      const checkResult = await query(`SELECT status FROM artefacts WHERE id = $1`, [id]);
      if (checkResult.rows.length > 0 && checkResult.rows[0].status === 'Approved') {
        return res.status(400).json({ error: 'Approved artefacts cannot be deleted' });
      }

      await query(`DELETE FROM artefacts WHERE id = $1`, [id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error deleting artefact:', err);
      return res.status(500).json({ error: 'Failed to delete artefact' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
