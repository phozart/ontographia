// pages/api/projects/[id]/artefacts.js
// List and create artefacts for a project

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../../lib/projectAccess';

// ============ DATABASE CONSTRAINT VALUES ============
const VALID_VALUES = {
  status: ['Draft', 'InReview', 'Approved', 'Deprecated', 'Superseded'],
  priority: ['Low', 'Medium', 'High', 'Critical'],
  architectureState: ['Baseline', 'Transition', 'Target', 'N/A'],
  ticketStatus: ['Backlog', 'Ready', 'InProgress', 'InReview', 'Done', 'Blocked'],
};

// Normalize a value to match database constraint (case-insensitive)
const normalizeValue = (value, field, defaultValue) => {
  if (!value) return defaultValue;
  const validValues = VALID_VALUES[field];
  if (!validValues) return value;
  const lower = String(value).toLowerCase();
  const found = validValues.find(v => v.toLowerCase() === lower);
  return found || defaultValue;
};

// Check if a value is valid for a field
const isValidValue = (value, field) => {
  if (!value) return false;
  const validValues = VALID_VALUES[field];
  if (!validValues) return true;
  return validValues.some(v => v.toLowerCase() === String(value).toLowerCase());
};

export default async function handler(req, res) {
  const { id: projectId } = req.query;
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!projectId) {
    return res.status(400).json({ error: 'Project ID required' });
  }

  if (req.method === 'GET') {
    // List artefacts for project
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const { type, status, search } = req.query;

      let sql = `
        SELECT a.*,
          u.username as owner_username,
          cb.username as created_by_username,
          (SELECT COUNT(*) FROM artefact_relationships WHERE from_artefact_id = a.id) as outgoing_count,
          (SELECT COUNT(*) FROM artefact_relationships WHERE to_artefact_id = a.id) as incoming_count
        FROM artefacts a
        LEFT JOIN users u ON u.id = a.owner_id
        LEFT JOIN users cb ON cb.id = a.created_by
        WHERE a.project_id = $1
      `;
      const params = [projectId];
      let paramIdx = 2;

      if (type) {
        sql += ` AND a.artefact_type = $${paramIdx}`;
        params.push(type);
        paramIdx++;
      }

      if (status) {
        sql += ` AND a.status = $${paramIdx}`;
        params.push(status);
        paramIdx++;
      }

      if (search) {
        sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx})`;
        params.push(`%${search}%`);
        paramIdx++;
      }

      sql += ` ORDER BY a.updated_at DESC`;

      const result = await query(sql, params);
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error listing artefacts:', err);
      return res.status(500).json({ error: 'Failed to list artefacts' });
    }
  }

  if (req.method === 'POST') {
    // Create artefact
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'create');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const {
      artefactType,
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

    if (!artefactType) {
      return res.status(400).json({ error: 'Artefact type is required' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Artefact name is required' });
    }

    // Merge extra fields into customFields (for type-specific data like ElicitationSession fields)
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

    // Normalize all constrained fields
    let artefactStatus = normalizeValue(status, 'status', 'Draft');
    const artefactPriority = normalizeValue(priority, 'priority', 'Medium');
    const artefactArchState = normalizeValue(architectureState, 'architectureState', 'N/A');
    const artefactTicketStatus = artefactType === 'Ticket'
      ? normalizeValue(ticketStatus, 'ticketStatus', 'Backlog')
      : null;

    // Handle custom status fields (like ElicitationSession's "planned"/"completed")
    // If status is not a valid artefact status, store it as sessionStatus in customFields
    if (status && !isValidValue(status, 'status')) {
      mergedCustomFields.sessionStatus = status;
      artefactStatus = 'Draft';
    }

    try {
      const result = await query(
        `INSERT INTO artefacts (
          project_id, artefact_type, name, description, status,
          architecture_state, priority, owner_id, tags, custom_fields,
          ticket_status, linked_graph_nodes, created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now(), now())
        RETURNING *`,
        [
          projectId,
          artefactType,
          name.trim(),
          description || '',
          artefactStatus,
          artefactArchState,
          artefactPriority,
          ownerId || user,
          JSON.stringify(tags || []),
          JSON.stringify(mergedCustomFields),
          artefactTicketStatus,
          JSON.stringify(linkedGraphNodes || []),
          user
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating artefact:', err);
      return res.status(500).json({ error: 'Failed to create artefact' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
