// pages/api/dwd/artefacts.js
// Dynamic Work Design - List and create artefacts API
// Handles DWD-specific artefact types (Case, Work Item, Actor, Signal, etc.)

import { query } from '../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';
import { DWD_ALL_TYPES, DWD_TYPE_DEFS, isDWDType, DWD_CASE_STATUS, DWD_ADJUSTMENT_STATUS } from '../../../lib/dwd-types';

// ============ DATABASE CONSTRAINT VALUES ============
const VALID_ARTEFACT_STATUS = ['Draft', 'InReview', 'Approved', 'Deprecated', 'Superseded'];

// Map DWD status to valid artefact status
const mapDWDStatusToArtefactStatus = (dwdStatus, type) => {
  // For cases
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
  // For adjustments
  if (type === 'dwd_adjustment') {
    const mapping = {
      'proposed': 'Draft',
      'trying': 'InReview',
      'adopted': 'Approved',
      'reverted': 'Deprecated',
    };
    return mapping[dwdStatus] || 'Draft';
  }
  // Default
  return 'Draft';
};

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    // List DWD artefacts
    const { projectId, caseId, type, types, stage, search, limit, offset } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
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
          AND a.artefact_type LIKE 'dwd_%'
      `;
      const params = [projectId];
      let paramIdx = 2;

      // Filter by case (artefacts related to a specific case)
      if (caseId) {
        sql += ` AND (a.id = $${paramIdx} OR a.id IN (
          SELECT to_artefact_id FROM artefact_relationships WHERE from_artefact_id = $${paramIdx}
          UNION
          SELECT from_artefact_id FROM artefact_relationships WHERE to_artefact_id = $${paramIdx}
        ))`;
        params.push(caseId);
        paramIdx++;
      }

      // Filter by single type
      if (type) {
        if (!isDWDType(type)) {
          return res.status(400).json({ error: `Invalid DWD type: ${type}` });
        }
        sql += ` AND a.artefact_type = $${paramIdx}`;
        params.push(type);
        paramIdx++;
      }

      // Filter by multiple types
      if (types) {
        const typeList = types.split(',').filter(t => isDWDType(t));
        if (typeList.length > 0) {
          sql += ` AND a.artefact_type = ANY($${paramIdx}::text[])`;
          params.push(typeList);
          paramIdx++;
        }
      }

      // Filter by stage
      if (stage) {
        const stageTypes = DWD_ALL_TYPES.filter(t => DWD_TYPE_DEFS[t]?.stage === stage);
        if (stageTypes.length > 0) {
          sql += ` AND a.artefact_type = ANY($${paramIdx}::text[])`;
          params.push(stageTypes);
          paramIdx++;
        }
      }

      // Search in name and description
      if (search) {
        sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx} OR a.custom_fields->>'summary' ILIKE $${paramIdx})`;
        params.push(`%${search}%`);
        paramIdx++;
      }

      sql += ` ORDER BY a.updated_at DESC`;

      // Pagination
      if (limit) {
        sql += ` LIMIT $${paramIdx}`;
        params.push(parseInt(limit, 10));
        paramIdx++;
      }
      if (offset) {
        sql += ` OFFSET $${paramIdx}`;
        params.push(parseInt(offset, 10));
        paramIdx++;
      }

      const result = await query(sql, params);

      // Get total count for pagination
      let countSql = `
        SELECT COUNT(*) as total
        FROM artefacts a
        WHERE a.project_id = $1
          AND a.artefact_type LIKE 'dwd_%'
      `;
      const countParams = [projectId];
      const countResult = await query(countSql, countParams);

      return res.status(200).json({
        artefacts: result.rows,
        total: parseInt(countResult.rows[0].total, 10),
        limit: limit ? parseInt(limit, 10) : null,
        offset: offset ? parseInt(offset, 10) : 0,
      });
    } catch (err) {
      console.error('Error listing DWD artefacts:', err);
      return res.status(500).json({ error: 'Failed to list artefacts' });
    }
  }

  if (req.method === 'POST') {
    // Create DWD artefact
    const {
      projectId,
      artefactType,
      name,
      description,
      ownerId,
      tags,
      customFields,
      ...typeSpecificFields
    } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    if (!artefactType) {
      return res.status(400).json({ error: 'Artefact type is required' });
    }

    if (!isDWDType(artefactType)) {
      return res.status(400).json({ error: `Invalid DWD type: ${artefactType}. Type must start with 'dwd_'` });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Artefact name is required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'create');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    // Get type definition for validation
    const typeDef = DWD_TYPE_DEFS[artefactType];
    if (!typeDef) {
      return res.status(400).json({ error: `Unknown DWD type: ${artefactType}` });
    }

    // Validate required fields from type definition
    if (typeDef.fields) {
      for (const field of typeDef.fields) {
        if (field.required && !typeSpecificFields[field.key] && field.key !== 'name') {
          // Check if it's in customFields instead
          if (!customFields?.[field.key]) {
            return res.status(400).json({ error: `Field '${field.label || field.key}' is required` });
          }
        }
      }
    }

    // Get default status for type
    let dwdStatus = 'draft';
    if (artefactType === 'dwd_case') {
      dwdStatus = typeSpecificFields.case_status || customFields?.case_status || 'draft';
    } else if (artefactType === 'dwd_adjustment') {
      dwdStatus = typeSpecificFields.adjustment_status || customFields?.adjustment_status || 'proposed';
    }

    // Merge type-specific fields into customFields
    const mergedCustomFields = {
      ...(customFields || {}),
      ...typeSpecificFields,
      dwd_stage: typeDef.stage || null,
    };

    // Map DWD status to valid artefact status for the database constraint
    const artefactStatus = mapDWDStatusToArtefactStatus(dwdStatus, artefactType);

    try {
      const result = await query(
        `INSERT INTO artefacts (
          project_id, artefact_type, name, description, status,
          architecture_state, priority, owner_id, tags, custom_fields,
          created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now(), now())
        RETURNING *`,
        [
          projectId,
          artefactType,
          name.trim(),
          description || '',
          artefactStatus,
          'N/A',
          'Medium',
          ownerId || user,
          JSON.stringify(tags || []),
          JSON.stringify(mergedCustomFields),
          user
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating DWD artefact:', err);
      return res.status(500).json({ error: 'Failed to create artefact' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
