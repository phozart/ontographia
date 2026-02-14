// pages/api/gtm/artefacts/index.js
// GTM Artefacts API - CRUD for GTM artefacts (campaigns, segments, messages, etc.)
// Task GT-011

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

// GTM artefact types
const GTM_ARTEFACT_TYPES = [
  'gtm_segment',
  'gtm_pricing',
  'gtm_message',
  'gtm_proof_point',
  'gtm_objection',
  'gtm_channel',
  'gtm_campaign',
  'gtm_milestone',
  'gtm_readiness',
  'gtm_material',
  'gtm_training',
  'gtm_metric',
  'gtm_target',
];

// Campaign types
const CAMPAIGN_TYPES = ['awareness', 'acquisition', 'activation', 'retention', 'referral'];

// Material types
const MATERIAL_TYPES = ['presentation', 'datasheet', 'case_study', 'demo', 'video', 'faq'];

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET - List GTM artefacts
  if (req.method === 'GET') {
    const { plan_id, domain_id, artefact_type, module, search, limit, offset } = req.query;

    // Need either plan_id or domain_id
    if (!plan_id && !domain_id) {
      return res.status(400).json({ error: 'plan_id or domain_id is required' });
    }

    try {
      // If plan_id provided, get domain from plan
      let domainId = domain_id;
      if (plan_id) {
        const planResult = await query(`SELECT domain_id FROM gtm_plans WHERE id = $1`, [plan_id]);
        if (planResult.rows.length === 0) {
          return res.status(404).json({ error: 'GTM Plan not found' });
        }
        domainId = planResult.rows[0].domain_id;
      }

      const { hasAccess, error } = await checkDomainAccess(req, domainId, 'view');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      let sql = `
        SELECT a.*,
          u.username as owner_username
        FROM artefacts a
        LEFT JOIN users u ON u.username = a.owner_id
        WHERE a.domain_id = $1
          AND a.artefact_type LIKE 'gtm_%'
      `;
      const params = [domainId];
      let paramIdx = 2;

      if (plan_id) {
        sql += ` AND a.custom_fields->>'gtm_plan_id' = $${paramIdx}`;
        params.push(plan_id);
        paramIdx++;
      }

      if (artefact_type && GTM_ARTEFACT_TYPES.includes(artefact_type)) {
        sql += ` AND a.artefact_type = $${paramIdx}`;
        params.push(artefact_type);
        paramIdx++;
      }

      if (module) {
        // Filter by module (maps to artefact types)
        const moduleTypes = getArtefactTypesForModule(module);
        if (moduleTypes.length > 0) {
          sql += ` AND a.artefact_type = ANY($${paramIdx})`;
          params.push(moduleTypes);
          paramIdx++;
        }
      }

      if (search) {
        sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx})`;
        params.push(`%${search}%`);
        paramIdx++;
      }

      sql += ' ORDER BY a.created_at DESC';

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

      // Get counts by type
      const countSql = `
        SELECT artefact_type, COUNT(*) as count
        FROM artefacts
        WHERE domain_id = $1
          AND artefact_type LIKE 'gtm_%'
          ${plan_id ? `AND custom_fields->>'gtm_plan_id' = $2` : ''}
        GROUP BY artefact_type
      `;
      const countParams = plan_id ? [domainId, plan_id] : [domainId];
      const countResult = await query(countSql, countParams);

      const byType = {};
      countResult.rows.forEach(row => {
        byType[row.artefact_type] = parseInt(row.count);
      });

      return res.status(200).json({
        artefacts: result.rows,
        total: result.rows.length,
        byType,
      });
    } catch (err) {
      console.error('Error fetching GTM artefacts:', err);
      return res.status(500).json({ error: 'Failed to fetch GTM artefacts' });
    }
  }

  // POST - Create GTM artefact
  if (req.method === 'POST') {
    const {
      domain_id,
      plan_id,
      artefactType,
      name,
      description,
      status = 'Draft',
      // Type-specific fields
      campaign_type,
      material_type,
      dimension,
      channel,
      start_date,
      end_date,
      budget,
      target_value,
      current_value,
      ...customFields
    } = req.body;

    if (!domain_id) {
      return res.status(400).json({ error: 'domain_id is required' });
    }

    if (!artefactType) {
      return res.status(400).json({ error: 'artefactType is required' });
    }

    if (!GTM_ARTEFACT_TYPES.includes(artefactType)) {
      return res.status(400).json({ error: `Invalid artefactType. Use: ${GTM_ARTEFACT_TYPES.join(', ')}` });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domain_id, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    // Validate type-specific fields
    if (artefactType === 'gtm_campaign' && campaign_type && !CAMPAIGN_TYPES.includes(campaign_type)) {
      return res.status(400).json({ error: `Invalid campaign_type. Use: ${CAMPAIGN_TYPES.join(', ')}` });
    }

    if (artefactType === 'gtm_material' && material_type && !MATERIAL_TYPES.includes(material_type)) {
      return res.status(400).json({ error: `Invalid material_type. Use: ${MATERIAL_TYPES.join(', ')}` });
    }

    try {
      // Get a project_id if plan is associated with one
      let projectId = null;
      if (plan_id) {
        const planResult = await query(
          `SELECT linked_product_id FROM gtm_plans WHERE id = $1`,
          [plan_id]
        );
        // Use domain's default project if no specific link
        const domainResult = await query(
          `SELECT id FROM projects WHERE domain_id = $1 LIMIT 1`,
          [domain_id]
        );
        if (domainResult.rows.length > 0) {
          projectId = domainResult.rows[0].id;
        }
      }

      const mergedCustomFields = {
        ...customFields,
        gtm_plan_id: plan_id,
        campaign_type,
        material_type,
        dimension,
        channel,
        start_date,
        end_date,
        budget,
        target_value,
        current_value,
      };

      const result = await query(
        `INSERT INTO artefacts (
          project_id, domain_id, artefact_type, name, description, status,
          architecture_state, priority, owner_id, custom_fields,
          created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now(), now())
        RETURNING *`,
        [
          projectId,
          domain_id,
          artefactType,
          name.trim(),
          description || '',
          status,
          'N/A',
          'Medium',
          user,
          JSON.stringify(mergedCustomFields),
          user,
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating GTM artefact:', err);
      return res.status(500).json({ error: 'Failed to create GTM artefact' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Map module to artefact types
function getArtefactTypesForModule(module) {
  const moduleMap = {
    strategy: ['gtm_segment', 'gtm_pricing'],
    messaging: ['gtm_message', 'gtm_proof_point', 'gtm_objection'],
    launch: ['gtm_milestone', 'gtm_readiness'],
    campaigns: ['gtm_campaign', 'gtm_channel'],
    enablement: ['gtm_material', 'gtm_training'],
    metrics: ['gtm_metric', 'gtm_target'],
  };
  return moduleMap[module] || [];
}
