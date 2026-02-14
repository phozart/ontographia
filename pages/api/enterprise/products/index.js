// pages/api/enterprise/products/index.js
// Enterprise Products API - CRUD
// Task EN-140

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

const PRODUCT_STATUS = ['active', 'planned', 'retiring'];
const PRODUCT_TYPE = ['internal', 'external', 'platform'];
const LIFECYCLE_STAGE = ['concept', 'development', 'launch', 'growth', 'maturity', 'decline', 'retirement'];

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET - List products
  if (req.method === 'GET') {
    const { domain_id: d1, domainId: d2, status, product_type, lifecycle_stage, search, limit, offset } = req.query;
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
          AND a.artefact_type = 'enterprise_product'
      `;
      const params = [domain_id];
      let paramIdx = 2;

      if (status && PRODUCT_STATUS.includes(status)) {
        sql += ` AND a.custom_fields->>'status' = $${paramIdx}`;
        params.push(status);
        paramIdx++;
      }

      if (product_type && PRODUCT_TYPE.includes(product_type)) {
        sql += ` AND a.custom_fields->>'product_type' = $${paramIdx}`;
        params.push(product_type);
        paramIdx++;
      }

      if (lifecycle_stage && LIFECYCLE_STAGE.includes(lifecycle_stage)) {
        sql += ` AND a.custom_fields->>'lifecycle_stage' = $${paramIdx}`;
        params.push(lifecycle_stage);
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
        products: result.rows,
        total: result.rows.length,
        options: {
          statuses: PRODUCT_STATUS,
          productTypes: PRODUCT_TYPE,
          lifecycleStages: LIFECYCLE_STAGE,
        },
      });
    } catch (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  // POST - Create product
  if (req.method === 'POST') {
    const {
      domain_id: bd1, domainId: bd2,
      name,
      description,
      status = 'active',
      product_type = 'internal',
      product_owner,
      lifecycle_stage = 'growth',
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
        product_type,
        product_owner: product_owner || null,
        lifecycle_stage,
      };

      const result = await query(
        `INSERT INTO artefacts (
          project_id, domain_id, artefact_type, name, description, status,
          architecture_state, priority, owner_id, custom_fields,
          created_by, created_at, updated_at
        ) VALUES ($1, $2, 'enterprise_product', $3, $4, $5, 'Current', 'Medium', $6, $7, $6, now(), now())
        RETURNING *`,
        [
          projectId,
          domain_id,
          name.trim(),
          description || '',
          status === 'active' ? 'Active' : 'Draft',
          user,
          JSON.stringify(mergedCustomFields),
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating product:', err);
      return res.status(500).json({ error: 'Failed to create product' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
