// pages/api/pdw/artefacts.js
// Product Design Workspace - List and create artefacts API
// Handles PDW-specific artefact types and canvases
// Domain-scoped (not project-scoped)

import { query } from '../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../lib/projectAccess';
import { PDW_ALL_TYPES, PDW_STATUS_OPTIONS, isPDWType } from '../../../lib/pdw-types';

// ============ DATABASE CONSTRAINT VALUES ============
const VALID_ARTEFACT_STATUS = ['Draft', 'InReview', 'Approved', 'Deprecated', 'Superseded'];
const VALID_PDW_STATUS = PDW_STATUS_OPTIONS.map(s => s.id);

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
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    // List PDW artefacts
    const { domainId, type, types, status, stage, module, search, limit, offset } = req.query;

    if (!domainId) {
      return res.status(400).json({ error: 'Domain ID required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domainId, 'view');
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
        LEFT JOIN users u ON u.username = a.owner_id
        LEFT JOIN users cb ON cb.username = a.created_by
        WHERE a.domain_id = $1
          AND a.artefact_type LIKE 'pdw_%'
      `;
      const params = [domainId];
      let paramIdx = 2;

      // Filter by single type
      if (type) {
        if (!isPDWType(type)) {
          return res.status(400).json({ error: `Invalid PDW type: ${type}` });
        }
        sql += ` AND a.artefact_type = $${paramIdx}`;
        params.push(type);
        paramIdx++;
      }

      // Filter by multiple types
      if (types) {
        const typeList = types.split(',').filter(t => isPDWType(t));
        if (typeList.length > 0) {
          sql += ` AND a.artefact_type = ANY($${paramIdx}::text[])`;
          params.push(typeList);
          paramIdx++;
        }
      }

      // Filter by status (PDW status stored in custom_fields.pdw_status)
      if (status) {
        sql += ` AND (a.custom_fields->>'pdw_status' = $${paramIdx} OR a.status = $${paramIdx})`;
        params.push(status);
        paramIdx++;
      }

      // Filter by stage (types belong to stages)
      if (stage) {
        const stageTypes = Object.values(PDW_ALL_TYPES)
          .filter(t => t.stage === stage)
          .map(t => t.id);
        if (stageTypes.length > 0) {
          sql += ` AND a.artefact_type = ANY($${paramIdx}::text[])`;
          params.push(stageTypes);
          paramIdx++;
        }
      }

      // Filter by module
      if (module) {
        const moduleTypes = Object.values(PDW_ALL_TYPES)
          .filter(t => t.module === module)
          .map(t => t.id);
        if (moduleTypes.length > 0) {
          sql += ` AND a.artefact_type = ANY($${paramIdx}::text[])`;
          params.push(moduleTypes);
          paramIdx++;
        }
      }

      // Search in name and description
      if (search) {
        sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx})`;
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
        WHERE a.domain_id = $1
          AND a.artefact_type LIKE 'pdw_%'
      `;
      const countParams = [domainId];
      const countResult = await query(countSql, countParams);

      return res.status(200).json({
        artefacts: result.rows,
        total: parseInt(countResult.rows[0].total, 10),
        limit: limit ? parseInt(limit, 10) : null,
        offset: offset ? parseInt(offset, 10) : 0,
      });
    } catch (err) {
      console.error('Error listing PDW artefacts:', err);
      return res.status(500).json({ error: 'Failed to list artefacts' });
    }
  }

  if (req.method === 'POST') {
    // Create PDW artefact
    const {
      domainId,
      artefactType,
      name,
      description,
      pdwStatus,
      ownerId,
      tags,
      customFields,
      ...typeSpecificFields
    } = req.body;

    if (!domainId) {
      return res.status(400).json({ error: 'Domain ID is required' });
    }

    if (!artefactType) {
      return res.status(400).json({ error: 'Artefact type is required' });
    }

    if (!isPDWType(artefactType)) {
      return res.status(400).json({ error: `Invalid PDW type: ${artefactType}. Type must start with 'pdw_'` });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Artefact name is required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domainId, 'create');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    // Get type definition for validation
    const typeDef = PDW_ALL_TYPES[artefactType];
    if (!typeDef) {
      return res.status(400).json({ error: `Unknown PDW type: ${artefactType}` });
    }

    // Validate required fields
    // Note: 'name' and 'description' are extracted as top-level params, so skip them in typeSpecificFields check
    if (typeDef.fields) {
      for (const [fieldName, fieldDef] of Object.entries(typeDef.fields)) {
        // Skip core fields that are handled separately
        if (fieldName === 'name' || fieldName === 'description') continue;

        if (fieldDef.required && !typeSpecificFields[fieldName]) {
          return res.status(400).json({ error: `Field '${fieldDef.label || fieldName}' is required` });
        }
      }
    }

    // Check description separately if it's required for this type
    if (typeDef.fields?.description?.required && !description?.trim()) {
      return res.status(400).json({ error: `Field '${typeDef.fields.description.label || 'Description'}' is required` });
    }

    // Merge type-specific fields into customFields
    const mergedCustomFields = {
      ...(customFields || {}),
      ...typeSpecificFields,
      pdw_status: pdwStatus || 'draft',
      pdw_type_category: typeDef.category || 'artefact',
      pdw_stage: typeDef.stage || null,
      pdw_module: typeDef.module || null,
    };

    // Map PDW status to valid artefact status for the database constraint
    const artefactStatus = mapPDWStatusToArtefactStatus(pdwStatus || 'draft');

    try {
      const result = await query(
        `INSERT INTO artefacts (
          domain_id, artefact_type, name, description, status,
          architecture_state, priority, owner_id, tags, custom_fields,
          created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now(), now())
        RETURNING *`,
        [
          domainId,
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
      console.error('Error creating PDW artefact:', err);
      return res.status(500).json({ error: 'Failed to create artefact' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
