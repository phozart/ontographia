// pages/api/enterprise/org-units/index.js
// Enterprise Org Units API - CRUD with hierarchy
// Task EN-143

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

const UNIT_TYPE = ['division', 'department', 'team', 'squad', 'chapter'];

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET - List org units
  if (req.method === 'GET') {
    const { domain_id: d1, domainId: d2, unit_type, parent_unit_id, search, limit, offset } = req.query;
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
          u.username as owner_username,
          (SELECT COUNT(*) FROM artefacts c
           WHERE c.custom_fields->>'parent_unit_id' = a.id::text
             AND c.artefact_type = 'enterprise_org_unit') as child_count
        FROM artefacts a
        LEFT JOIN users u ON u.username = a.owner_id
        WHERE a.domain_id = $1
          AND a.artefact_type = 'enterprise_org_unit'
      `;
      const params = [domain_id];
      let paramIdx = 2;

      if (unit_type && UNIT_TYPE.includes(unit_type)) {
        sql += ` AND a.custom_fields->>'unit_type' = $${paramIdx}`;
        params.push(unit_type);
        paramIdx++;
      }

      if (parent_unit_id) {
        sql += ` AND a.custom_fields->>'parent_unit_id' = $${paramIdx}`;
        params.push(parent_unit_id);
        paramIdx++;
      } else if (parent_unit_id === '') {
        // Root units only
        sql += ` AND (a.custom_fields->>'parent_unit_id' IS NULL OR a.custom_fields->>'parent_unit_id' = '')`;
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
        orgUnits: result.rows,
        total: result.rows.length,
        options: {
          unitTypes: UNIT_TYPE,
        },
      });
    } catch (err) {
      console.error('Error fetching org units:', err);
      return res.status(500).json({ error: 'Failed to fetch org units' });
    }
  }

  // POST - Create org unit
  if (req.method === 'POST') {
    const {
      domain_id: bd1, domainId: bd2,
      name,
      description,
      unit_type = 'team',
      parent_unit_id,
      head_of_unit,
      headcount,
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
        unit_type,
        parent_unit_id: parent_unit_id || null,
        head_of_unit: head_of_unit || null,
        headcount: headcount ? parseInt(headcount, 10) : null,
      };

      const result = await query(
        `INSERT INTO artefacts (
          project_id, domain_id, artefact_type, name, description, status,
          architecture_state, priority, owner_id, custom_fields,
          created_by, created_at, updated_at
        ) VALUES ($1, $2, 'enterprise_org_unit', $3, $4, 'Active', 'Current', 'Medium', $5, $6, $5, now(), now())
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
      console.error('Error creating org unit:', err);
      return res.status(500).json({ error: 'Failed to create org unit' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
