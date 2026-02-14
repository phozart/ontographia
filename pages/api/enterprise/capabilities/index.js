// pages/api/enterprise/capabilities/index.js
// Enterprise Capabilities API - CRUD with hierarchy
// Task EN-130

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

// Capability status options
const CAPABILITY_STATUS = ['active', 'developing', 'planned', 'retiring'];
const MATURITY_LEVELS = [1, 2, 3, 4, 5];
const STRATEGIC_IMPORTANCE = ['critical', 'high', 'medium', 'low'];
const INVESTMENT_PRIORITY = ['invest', 'maintain', 'divest'];

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET - List capabilities
  if (req.method === 'GET') {
    const { domain_id: d1, domainId: d2, status, importance, maturity, parent_id, search, limit, offset } = req.query;
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
          (SELECT COUNT(*) FROM artefacts c WHERE c.custom_fields->>'parent_capability_id' = a.id::text) as child_count
        FROM artefacts a
        LEFT JOIN users u ON u.username = a.owner_id
        WHERE a.domain_id = $1
          AND a.artefact_type = 'enterprise_capability'
      `;
      const params = [domain_id];
      let paramIdx = 2;

      if (status && CAPABILITY_STATUS.includes(status)) {
        sql += ` AND a.custom_fields->>'status' = $${paramIdx}`;
        params.push(status);
        paramIdx++;
      }

      if (importance && STRATEGIC_IMPORTANCE.includes(importance)) {
        sql += ` AND a.custom_fields->>'strategic_importance' = $${paramIdx}`;
        params.push(importance);
        paramIdx++;
      }

      if (maturity) {
        sql += ` AND (a.custom_fields->>'maturity_level')::int = $${paramIdx}`;
        params.push(parseInt(maturity, 10));
        paramIdx++;
      }

      if (parent_id) {
        sql += ` AND a.custom_fields->>'parent_capability_id' = $${paramIdx}`;
        params.push(parent_id);
        paramIdx++;
      } else if (parent_id === '') {
        // Root capabilities only
        sql += ` AND (a.custom_fields->>'parent_capability_id' IS NULL OR a.custom_fields->>'parent_capability_id' = '')`;
      }

      if (search) {
        sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx})`;
        params.push(`%${search}%`);
        paramIdx++;
      }

      sql += ' ORDER BY a.custom_fields->>\'sort_order\' NULLS LAST, a.name';

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

      // Get hierarchy stats
      const statsResult = await query(
        `SELECT
           custom_fields->>'status' as status,
           custom_fields->>'strategic_importance' as importance,
           COUNT(*) as count
         FROM artefacts
         WHERE domain_id = $1
           AND artefact_type = 'enterprise_capability'
         GROUP BY custom_fields->>'status', custom_fields->>'strategic_importance'`,
        [domain_id]
      );

      const byStatus = {};
      const byImportance = {};
      statsResult.rows.forEach(row => {
        if (row.status) byStatus[row.status] = (byStatus[row.status] || 0) + parseInt(row.count);
        if (row.importance) byImportance[row.importance] = (byImportance[row.importance] || 0) + parseInt(row.count);
      });

      return res.status(200).json({
        capabilities: result.rows,
        total: result.rows.length,
        stats: { byStatus, byImportance },
        options: {
          status: CAPABILITY_STATUS,
          importance: STRATEGIC_IMPORTANCE,
          maturityLevels: MATURITY_LEVELS,
          investmentPriority: INVESTMENT_PRIORITY,
        },
      });
    } catch (err) {
      console.error('Error fetching capabilities:', err);
      return res.status(500).json({ error: 'Failed to fetch capabilities' });
    }
  }

  // POST - Create capability
  if (req.method === 'POST') {
    const {
      domain_id: bd1, domainId: bd2,
      name,
      description,
      status = 'active',
      parent_capability_id,
      maturity_level = 1,
      strategic_importance = 'medium',
      investment_priority = 'maintain',
      business_owner,
      supporting_applications,
      linked_services,
      linked_processes,
      sort_order,
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

    if (!CAPABILITY_STATUS.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Use: ${CAPABILITY_STATUS.join(', ')}` });
    }

    if (!MATURITY_LEVELS.includes(maturity_level)) {
      return res.status(400).json({ error: `Invalid maturity_level. Use: ${MATURITY_LEVELS.join(', ')}` });
    }

    try {
      // Get project_id for domain
      const projectResult = await query(
        `SELECT id FROM projects WHERE domain_id = $1 LIMIT 1`,
        [domain_id]
      );
      const projectId = projectResult.rows[0]?.id || null;

      const mergedCustomFields = {
        ...customFields,
        status,
        parent_capability_id,
        maturity_level,
        strategic_importance,
        investment_priority,
        business_owner,
        supporting_applications: supporting_applications || [],
        linked_services: linked_services || [],
        linked_processes: linked_processes || [],
        sort_order: sort_order || 0,
      };

      const result = await query(
        `INSERT INTO artefacts (
          project_id, domain_id, artefact_type, name, description, status,
          architecture_state, priority, owner_id, custom_fields,
          created_by, created_at, updated_at
        ) VALUES ($1, $2, 'enterprise_capability', $3, $4, $5, 'Current', $6, $7, $8, $7, now(), now())
        RETURNING *`,
        [
          projectId,
          domain_id,
          name.trim(),
          description || '',
          status === 'active' ? 'Active' : status === 'developing' ? 'In Progress' : status === 'planned' ? 'Draft' : 'Deprecated',
          strategic_importance === 'critical' ? 'Critical' : strategic_importance === 'high' ? 'High' : 'Medium',
          user,
          JSON.stringify(mergedCustomFields),
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating capability:', err);
      return res.status(500).json({ error: 'Failed to create capability' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
