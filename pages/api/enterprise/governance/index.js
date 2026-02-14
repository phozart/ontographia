// pages/api/enterprise/governance/index.js
// Enterprise Governance API - CRUD for policies, principles, standards, decisions
// Task EN-141

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

const GOVERNANCE_STATUS = ['active', 'draft', 'retired'];
const GOVERNANCE_TYPE = ['policy', 'principle', 'standard', 'decision'];
const ENFORCEMENT_LEVEL = ['mandatory', 'recommended', 'optional'];

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET - List governance items
  if (req.method === 'GET') {
    const { domain_id: d1, domainId: d2, status, governance_type, enforcement_level, search, limit, offset } = req.query;
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
          AND a.artefact_type = 'enterprise_governance'
      `;
      const params = [domain_id];
      let paramIdx = 2;

      if (status && GOVERNANCE_STATUS.includes(status)) {
        sql += ` AND a.custom_fields->>'status' = $${paramIdx}`;
        params.push(status);
        paramIdx++;
      }

      if (governance_type && GOVERNANCE_TYPE.includes(governance_type)) {
        sql += ` AND a.custom_fields->>'governance_type' = $${paramIdx}`;
        params.push(governance_type);
        paramIdx++;
      }

      if (enforcement_level && ENFORCEMENT_LEVEL.includes(enforcement_level)) {
        sql += ` AND a.custom_fields->>'enforcement_level' = $${paramIdx}`;
        params.push(enforcement_level);
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
        governance: result.rows,
        total: result.rows.length,
        options: {
          statuses: GOVERNANCE_STATUS,
          governanceTypes: GOVERNANCE_TYPE,
          enforcementLevels: ENFORCEMENT_LEVEL,
        },
      });
    } catch (err) {
      console.error('Error fetching governance items:', err);
      return res.status(500).json({ error: 'Failed to fetch governance items' });
    }
  }

  // POST - Create governance item
  if (req.method === 'POST') {
    const {
      domain_id: bd1, domainId: bd2,
      name,
      description,
      status = 'draft',
      governance_type = 'policy',
      enforcement_level = 'recommended',
      review_date,
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
        status,
        governance_type,
        enforcement_level,
        review_date: review_date || null,
      };

      const result = await query(
        `INSERT INTO artefacts (
          project_id, domain_id, artefact_type, name, description, status,
          architecture_state, priority, owner_id, custom_fields,
          created_by, created_at, updated_at
        ) VALUES ($1, $2, 'enterprise_governance', $3, $4, $5, 'Current', $6, $7, $8, $7, now(), now())
        RETURNING *`,
        [
          projectId,
          domain_id,
          name.trim(),
          description || '',
          status === 'active' ? 'Active' : 'Draft',
          enforcement_level === 'mandatory' ? 'Critical' : 'Medium',
          user,
          JSON.stringify(mergedCustomFields),
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating governance item:', err);
      return res.status(500).json({ error: 'Failed to create governance item' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
