// pages/api/enterprise/applications/index.js
// Enterprise Applications API - CRUD
// Task EN-132

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

const APPLICATION_TYPE = ['cots', 'saas', 'custom', 'legacy'];
const APPLICATION_STATUS = ['production', 'development', 'retiring', 'decommissioned'];
const APPLICATION_TIER = ['mission_critical', 'business_essential', 'operational', 'utility'];

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET - List applications
  if (req.method === 'GET') {
    const { domain_id: d1, domainId: d2, app_type, status, tier, search, limit, offset } = req.query;
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
          AND a.artefact_type = 'enterprise_application'
      `;
      const params = [domain_id];
      let paramIdx = 2;

      if (app_type && APPLICATION_TYPE.includes(app_type)) {
        sql += ` AND a.custom_fields->>'application_type' = $${paramIdx}`;
        params.push(app_type);
        paramIdx++;
      }

      if (status && APPLICATION_STATUS.includes(status)) {
        sql += ` AND a.custom_fields->>'status' = $${paramIdx}`;
        params.push(status);
        paramIdx++;
      }

      if (tier && APPLICATION_TIER.includes(tier)) {
        sql += ` AND a.custom_fields->>'application_tier' = $${paramIdx}`;
        params.push(tier);
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

      // Get integration stats
      const statsResult = await query(
        `SELECT
           custom_fields->>'application_type' as app_type,
           custom_fields->>'status' as status,
           COUNT(*) as count
         FROM artefacts
         WHERE domain_id = $1 AND artefact_type = 'enterprise_application'
         GROUP BY custom_fields->>'application_type', custom_fields->>'status'`,
        [domain_id]
      );

      const byType = {};
      const byStatus = {};
      statsResult.rows.forEach(row => {
        if (row.app_type) byType[row.app_type] = (byType[row.app_type] || 0) + parseInt(row.count);
        if (row.status) byStatus[row.status] = (byStatus[row.status] || 0) + parseInt(row.count);
      });

      return res.status(200).json({
        applications: result.rows,
        total: result.rows.length,
        stats: { byType, byStatus },
        options: {
          types: APPLICATION_TYPE,
          statuses: APPLICATION_STATUS,
          tiers: APPLICATION_TIER,
        },
      });
    } catch (err) {
      console.error('Error fetching applications:', err);
      return res.status(500).json({ error: 'Failed to fetch applications' });
    }
  }

  // POST - Create application
  if (req.method === 'POST') {
    const {
      domain_id: bd1, domainId: bd2,
      name,
      description,
      application_type = 'custom',
      status = 'production',
      application_tier = 'operational',
      vendor,
      version,
      license_type,
      license_expiry,
      technical_owner,
      business_owner,
      supporting_capabilities,
      interfaces,
      technical_debt_score,
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
        application_type,
        status,
        application_tier,
        vendor,
        version,
        license_type,
        license_expiry,
        technical_owner,
        business_owner,
        supporting_capabilities: supporting_capabilities || [],
        interfaces: interfaces || [],
        technical_debt_score,
      };

      const result = await query(
        `INSERT INTO artefacts (
          project_id, domain_id, artefact_type, name, description, status,
          architecture_state, priority, owner_id, custom_fields,
          created_by, created_at, updated_at
        ) VALUES ($1, $2, 'enterprise_application', $3, $4, $5, 'Current', $6, $7, $8, $7, now(), now())
        RETURNING *`,
        [
          projectId,
          domain_id,
          name.trim(),
          description || '',
          status === 'production' ? 'Active' : status === 'development' ? 'Draft' : 'Deprecated',
          application_tier === 'mission_critical' ? 'Critical' : application_tier === 'business_essential' ? 'High' : 'Medium',
          user,
          JSON.stringify(mergedCustomFields),
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating application:', err);
      return res.status(500).json({ error: 'Failed to create application' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
