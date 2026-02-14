// pages/api/enterprise/roles/index.js
// Enterprise Roles API - CRUD
// Task EN-144

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

const ROLE_TYPE = ['leadership', 'management', 'individual'];

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET - List roles
  if (req.method === 'GET') {
    const { domain_id: d1, domainId: d2, role_type, org_unit_id, search, limit, offset } = req.query;
    const domain_id = d1 || d2;

    if (!domain_id) {
      return res.status(400).json({ error: 'domainId is required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domain_id, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      let sql = `
        SELECT a.*,
          u.username as owner_username
        FROM artefacts a
        LEFT JOIN users u ON u.username = a.owner_id
        WHERE a.domain_id = $1
          AND a.artefact_type = 'enterprise_role'
      `;
      const params = [domain_id];
      let paramIdx = 2;

      if (role_type && ROLE_TYPE.includes(role_type)) {
        sql += ` AND a.custom_fields->>'role_type' = $${paramIdx}`;
        params.push(role_type);
        paramIdx++;
      }

      if (org_unit_id) {
        sql += ` AND a.custom_fields->>'org_unit_id' = $${paramIdx}`;
        params.push(org_unit_id);
        paramIdx++;
      }

      if (search) {
        sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx})`;
        params.push(`%${search}%`);
        paramIdx++;
      }

      sql += ' ORDER BY a.name';

      if (limit) {
        sql += ` LIMIT $${paramIdx}`;
        params.push(parseInt(limit, 10));
        paramIdx++;
      }
      if (offset) {
        sql += ` OFFSET $${paramIdx}`;
        params.push(parseInt(offset, 10));
      }

      const result = await query(sql, params);

      return res.status(200).json({
        roles: result.rows,
        total: result.rows.length,
        options: {
          roleTypes: ROLE_TYPE,
        },
      });
    } catch (err) {
      console.error('Error fetching roles:', err);
      return res.status(500).json({ error: 'Failed to fetch roles' });
    }
  }

  // POST - Create role
  if (req.method === 'POST') {
    const {
      domain_id: bd1, domainId: bd2,
      name,
      description,
      role_type = 'individual',
      org_unit_id,
      responsibilities,
      required_capabilities,
      ...customFields
    } = req.body;
    const domain_id = bd1 || bd2;

    if (!domain_id) {
      return res.status(400).json({ error: 'domainId is required' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domain_id, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const projectResult = await query(
        `SELECT id FROM projects WHERE domain_id = $1 LIMIT 1`,
        [domain_id]
      );
      const projectId = projectResult.rows[0]?.id || null;

      const mergedCustomFields = {
        ...customFields,
        role_type,
        org_unit_id: org_unit_id || null,
        responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
        required_capabilities: Array.isArray(required_capabilities) ? required_capabilities : [],
      };

      const result = await query(
        `INSERT INTO artefacts (
          project_id, domain_id, artefact_type, name, description, status,
          architecture_state, priority, owner_id, custom_fields,
          created_by, created_at, updated_at
        ) VALUES ($1, $2, 'enterprise_role', $3, $4, 'Active', 'Current', 'Medium', $5, $6, $5, now(), now())
        RETURNING *`,
        [
          projectId,
          domain_id,
          name.trim(),
          description || '',
          user,
          JSON.stringify(mergedCustomFields),
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating role:', err);
      return res.status(500).json({ error: 'Failed to create role' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
