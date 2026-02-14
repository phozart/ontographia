// pages/api/gtm/plans/index.js
// GTM Plans API - CRUD for Go-to-Market plans
// Tasks GT-010, GT-011

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

// GTM stages
const GTM_STAGES = ['draft', 'planning', 'ready', 'active', 'complete'];

// Launch types
const LAUNCH_TYPES = ['big_bang', 'phased', 'soft', 'beta'];

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET - List GTM plans
  if (req.method === 'GET') {
    const { domain_id, status, launch_type, search, limit, offset } = req.query;

    if (!domain_id) {
      return res.status(400).json({ error: 'domain_id is required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domain_id, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      let sql = `
        SELECT g.*,
          u.username as owner_username,
          (SELECT COUNT(*) FROM artefacts WHERE custom_fields->>'gtm_plan_id' = g.id::text) as artefact_count
        FROM gtm_plans g
        LEFT JOIN users u ON u.username = g.owner_id
        WHERE g.domain_id = $1
      `;
      const params = [domain_id];
      let paramIdx = 2;

      if (status && GTM_STAGES.includes(status)) {
        sql += ` AND g.status = $${paramIdx}`;
        params.push(status);
        paramIdx++;
      }

      if (launch_type && LAUNCH_TYPES.includes(launch_type)) {
        sql += ` AND g.launch_type = $${paramIdx}`;
        params.push(launch_type);
        paramIdx++;
      }

      if (search) {
        sql += ` AND (g.name ILIKE $${paramIdx} OR g.description ILIKE $${paramIdx})`;
        params.push(`%${search}%`);
        paramIdx++;
      }

      sql += ' ORDER BY g.updated_at DESC';

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

      // Get counts by stage
      const statsResult = await query(
        `SELECT status, COUNT(*) as count
         FROM gtm_plans
         WHERE domain_id = $1
         GROUP BY status`,
        [domain_id]
      );

      const byStage = {};
      statsResult.rows.forEach(row => {
        byStage[row.status] = parseInt(row.count);
      });

      return res.status(200).json({
        plans: result.rows,
        total: result.rows.length,
        stats: {
          byStage,
          total: result.rows.length,
        },
      });
    } catch (err) {
      console.error('Error fetching GTM plans:', err);
      return res.status(500).json({ error: 'Failed to fetch GTM plans' });
    }
  }

  // POST - Create GTM plan
  if (req.method === 'POST') {
    const {
      domain_id,
      name,
      description,
      status = 'draft',
      launch_type = 'phased',
      owner_id,
      launch_date,
      target_market,
      linked_product_id,
      linked_service_id,
      strategy,
      messaging,
      launch,
      pricing,
      custom_fields,
    } = req.body;

    if (!domain_id) {
      return res.status(400).json({ error: 'domain_id is required' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domain_id, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    if (!GTM_STAGES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Use: ${GTM_STAGES.join(', ')}` });
    }

    if (!LAUNCH_TYPES.includes(launch_type)) {
      return res.status(400).json({ error: `Invalid launch_type. Use: ${LAUNCH_TYPES.join(', ')}` });
    }

    try {
      // Generate plan ID
      const seqResult = await query(`SELECT nextval('gtm_plan_seq')`);
      const planNum = seqResult.rows[0].nextval;
      const planId = `GTM-${String(planNum).padStart(4, '0')}`;

      const result = await query(
        `INSERT INTO gtm_plans (
          domain_id, plan_id, name, description, status, launch_type,
          owner_id, launch_date, target_market, linked_product_id, linked_service_id,
          strategy, messaging, launch, pricing, custom_fields,
          created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, now(), now())
        RETURNING *`,
        [
          domain_id,
          planId,
          name.trim(),
          description || '',
          status,
          launch_type,
          owner_id || user,
          launch_date || null,
          target_market || null,
          linked_product_id || null,
          linked_service_id || null,
          JSON.stringify(strategy || {}),
          JSON.stringify(messaging || {}),
          JSON.stringify(launch || {}),
          JSON.stringify(pricing || {}),
          JSON.stringify(custom_fields || {}),
          user,
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating GTM plan:', err);
      return res.status(500).json({ error: 'Failed to create GTM plan' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
