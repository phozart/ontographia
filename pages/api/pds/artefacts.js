/**
 * PDS Artefacts API - Project Design Workspace
 *
 * List and create PDS artefacts (all pds_* types except pds_project)
 * Project-scoped operations.
 *
 * @module pages/api/pds/artefacts
 */

import { query } from '../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';
import { PDS_ARTEFACT_TYPES, PDS_STAGES, getDefaultValues } from '../../../lib/pds-types';

// Valid artefact status values for database constraint
const VALID_ARTEFACT_STATUS = ['Draft', 'InReview', 'Approved', 'Deprecated', 'Superseded'];

// Check if type is a valid PDS type
const isPDSType = (type) => type && type.startsWith('pds_');

// Map PDS-specific status to valid artefact status
const mapPDSStatusToArtefactStatus = (status, type) => {
  // Default mappings based on common status patterns
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

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    // List PDS artefacts
    const {
      projectId,
      pdsProjectId,
      type,
      types,
      stage,
      status,
      search,
      limit,
      offset
    } = req.query;

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
          AND a.artefact_type LIKE 'pds_%'
          AND a.artefact_type != 'pds_project'
      `;
      const params = [projectId];
      let paramIdx = 2;

      // Filter by PDS project (artefacts linked to a specific PDS project)
      if (pdsProjectId) {
        sql += ` AND (
          a.custom_fields->>'pds_project_id' = $${paramIdx}
          OR a.id IN (
            SELECT to_artefact_id FROM artefact_relationships WHERE from_artefact_id = $${paramIdx}
            UNION
            SELECT from_artefact_id FROM artefact_relationships WHERE to_artefact_id = $${paramIdx}
          )
        )`;
        params.push(pdsProjectId);
        paramIdx++;
      }

      // Filter by single type
      if (type) {
        if (!isPDSType(type)) {
          return res.status(400).json({ error: `Invalid PDS type: ${type}` });
        }
        sql += ` AND a.artefact_type = $${paramIdx}`;
        params.push(type);
        paramIdx++;
      }

      // Filter by multiple types
      if (types) {
        const typeList = types.split(',').filter(t => isPDSType(t));
        if (typeList.length > 0) {
          sql += ` AND a.artefact_type = ANY($${paramIdx}::text[])`;
          params.push(typeList);
          paramIdx++;
        }
      }

      // Filter by stage
      if (stage && PDS_STAGES[stage.toUpperCase()]) {
        const stageTypes = Object.values(PDS_ARTEFACT_TYPES)
          .filter(t => t.stage === stage)
          .map(t => t.id);
        if (stageTypes.length > 0) {
          sql += ` AND a.artefact_type = ANY($${paramIdx}::text[])`;
          params.push(stageTypes);
          paramIdx++;
        }
      }

      // Filter by status (in custom_fields)
      if (status) {
        sql += ` AND a.custom_fields->>'status' = $${paramIdx}`;
        params.push(status);
        paramIdx++;
      }

      // Search in name and description
      if (search) {
        sql += ` AND (
          a.name ILIKE $${paramIdx}
          OR a.description ILIKE $${paramIdx}
          OR a.custom_fields->>'title' ILIKE $${paramIdx}
          OR a.custom_fields->>'statement' ILIKE $${paramIdx}
        )`;
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
          AND a.artefact_type LIKE 'pds_%'
          AND a.artefact_type != 'pds_project'
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
      console.error('Error listing PDS artefacts:', err);
      return res.status(500).json({ error: 'Failed to list artefacts', details: err.message });
    }
  }

  if (req.method === 'POST') {
    // Create PDS artefact
    const {
      projectId,
      pdsProjectId,
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

    if (!isPDSType(artefactType)) {
      return res.status(400).json({ error: `Invalid PDS type: ${artefactType}. Type must start with 'pds_'` });
    }

    // Don't allow creating pds_project through this endpoint
    if (artefactType === 'pds_project') {
      return res.status(400).json({ error: 'Use /api/pds/projects to create projects' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'create');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    // Get type definition for validation
    const typeDef = PDS_ARTEFACT_TYPES[artefactType];
    if (!typeDef) {
      return res.status(400).json({ error: `Unknown PDS type: ${artefactType}` });
    }

    // Determine name from type-specific fields if not provided
    let artefactName = name;
    if (!artefactName) {
      // Try to get name from type-specific fields
      artefactName = typeSpecificFields.title ||
                     typeSpecificFields.name ||
                     typeSpecificFields.statement?.substring(0, 100) ||
                     `New ${typeDef.name}`;
    }

    if (!artefactName.trim()) {
      return res.status(400).json({ error: 'Artefact name is required' });
    }

    // Validate required fields from type definition
    if (typeDef.fields) {
      for (const [fieldName, fieldDef] of Object.entries(typeDef.fields)) {
        // Skip name since we handle it above
        if (fieldName === 'name' || fieldName === 'title') continue;

        if (fieldDef.required) {
          const value = typeSpecificFields[fieldName] || customFields?.[fieldName];
          if (value === undefined || value === null || value === '') {
            return res.status(400).json({
              error: `Field '${fieldDef.label || fieldName}' is required`
            });
          }
        }
      }
    }

    // Get default values for the type
    const defaults = getDefaultValues(artefactType);

    // Merge fields: defaults < customFields < typeSpecificFields
    const mergedCustomFields = {
      ...defaults,
      ...(customFields || {}),
      ...typeSpecificFields,
      pds_project_id: pdsProjectId || null,
      pds_stage: typeDef.stage || null,
      pds_type: artefactType,
    };

    // Determine artefact status from type-specific status
    const typeStatus = mergedCustomFields.status || defaults.status || 'draft';
    const artefactStatus = mapPDSStatusToArtefactStatus(typeStatus, artefactType);

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
          artefactName.trim(),
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

      const newArtefact = result.rows[0];

      // If linked to a PDS project, create relationship
      if (pdsProjectId) {
        try {
          // Determine relationship type based on artefact type
          let relType = 'belongs_to';
          if (artefactType === 'pds_stakeholder') relType = 'stakeholder_of';
          if (artefactType === 'pds_governance_gate') relType = 'governs';

          await query(
            `INSERT INTO artefact_relationships (from_artefact_id, to_artefact_id, relationship_type, created_by)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT DO NOTHING`,
            [newArtefact.id, pdsProjectId, relType, user]
          );
        } catch (relErr) {
          console.error('Error creating relationship:', relErr);
          // Don't fail the whole operation if relationship creation fails
        }
      }

      return res.status(201).json(newArtefact);
    } catch (err) {
      console.error('Error creating PDS artefact:', err);
      return res.status(500).json({ error: 'Failed to create artefact', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
