// pages/api/enterprise/services/index.js
// Enterprise Services API - CRUD
// Task EN-131

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

const SERVICE_TYPE = ['internal', 'external', 'shared'];
const SERVICE_STATUS = ['active', 'retiring', 'planned'];
const SERVICE_TIER = ['critical', 'standard', 'basic'];

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET - List services
  if (req.method === 'GET') {
    const { domain_id: d1, domainId: d2, service_type, status, tier, search, limit, offset } = req.query;
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
          AND a.artefact_type = 'enterprise_service'
      `;
      const params = [domain_id];
      let paramIdx = 2;

      if (service_type && SERVICE_TYPE.includes(service_type)) {
        sql += ` AND a.custom_fields->>'service_type' = $${paramIdx}`;
        params.push(service_type);
        paramIdx++;
      }

      if (status && SERVICE_STATUS.includes(status)) {
        sql += ` AND a.custom_fields->>'status' = $${paramIdx}`;
        params.push(status);
        paramIdx++;
      }

      if (tier && SERVICE_TIER.includes(tier)) {
        sql += ` AND a.custom_fields->>'service_tier' = $${paramIdx}`;
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

      return res.status(200).json({
        services: result.rows,
        total: result.rows.length,
        options: {
          types: SERVICE_TYPE,
          statuses: SERVICE_STATUS,
          tiers: SERVICE_TIER,
        },
      });
    } catch (err) {
      console.error('Error fetching services:', err);
      return res.status(500).json({ error: 'Failed to fetch services' });
    }
  }

  // POST - Create service
  if (req.method === 'POST') {
    const {
      domain_id: bd1, domainId: bd2,
      name,
      description,
      service_type = 'internal',
      status = 'active',
      service_tier = 'standard',
      service_owner,
      sla,
      consumers,
      supporting_capabilities,
      implementing_applications,
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
        service_type,
        status,
        service_tier,
        service_owner,
        sla,
        consumers: consumers || [],
        supporting_capabilities: supporting_capabilities || [],
        implementing_applications: implementing_applications || [],
      };

      const result = await query(
        `INSERT INTO artefacts (
          project_id, domain_id, artefact_type, name, description, status,
          architecture_state, priority, owner_id, custom_fields,
          created_by, created_at, updated_at
        ) VALUES ($1, $2, 'enterprise_service', $3, $4, $5, 'Current', $6, $7, $8, $7, now(), now())
        RETURNING *`,
        [
          projectId,
          domain_id,
          name.trim(),
          description || '',
          status === 'active' ? 'Active' : 'Draft',
          service_tier === 'critical' ? 'Critical' : 'Medium',
          user,
          JSON.stringify(mergedCustomFields),
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating service:', err);
      return res.status(500).json({ error: 'Failed to create service' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
