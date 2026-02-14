// pages/api/gtm/materials/index.js
// GTM Materials Library API
// Task GT-013

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

// Material types
const MATERIAL_TYPES = [
  'presentation',
  'datasheet',
  'case_study',
  'demo',
  'video',
  'faq',
  'whitepaper',
  'infographic',
  'template',
  'script',
];

// Material statuses
const MATERIAL_STATUSES = ['draft', 'review', 'approved', 'archived'];

// Target audiences
const AUDIENCES = ['prospect', 'customer', 'partner', 'internal', 'all'];

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET - List materials
  if (req.method === 'GET') {
    const { domain_id, plan_id, material_type, audience, status, search, limit, offset } = req.query;

    if (!domain_id) {
      return res.status(400).json({ error: 'domain_id is required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domain_id, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      let sql = `
        SELECT a.*,
          u.username as owner_username,
          p.name as plan_name
        FROM artefacts a
        LEFT JOIN users u ON u.username = a.owner_id
        LEFT JOIN gtm_plans p ON p.id::text = a.custom_fields->>'gtm_plan_id'
        WHERE a.domain_id = $1
          AND a.artefact_type = 'gtm_material'
      `;
      const params = [domain_id];
      let paramIdx = 2;

      if (plan_id) {
        sql += ` AND a.custom_fields->>'gtm_plan_id' = $${paramIdx}`;
        params.push(plan_id);
        paramIdx++;
      }

      if (material_type && MATERIAL_TYPES.includes(material_type)) {
        sql += ` AND a.custom_fields->>'material_type' = $${paramIdx}`;
        params.push(material_type);
        paramIdx++;
      }

      if (audience && AUDIENCES.includes(audience)) {
        sql += ` AND a.custom_fields->>'audience' = $${paramIdx}`;
        params.push(audience);
        paramIdx++;
      }

      if (status && MATERIAL_STATUSES.includes(status)) {
        sql += ` AND a.custom_fields->>'material_status' = $${paramIdx}`;
        params.push(status);
        paramIdx++;
      }

      if (search) {
        sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx})`;
        params.push(`%${search}%`);
        paramIdx++;
      }

      sql += ' ORDER BY a.updated_at DESC';

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

      // Get counts by type and status
      const statsResult = await query(
        `SELECT
           custom_fields->>'material_type' as material_type,
           custom_fields->>'material_status' as material_status,
           COUNT(*) as count
         FROM artefacts
         WHERE domain_id = $1
           AND artefact_type = 'gtm_material'
         GROUP BY custom_fields->>'material_type', custom_fields->>'material_status'`,
        [domain_id]
      );

      const byType = {};
      const byStatus = {};
      statsResult.rows.forEach(row => {
        if (row.material_type) {
          byType[row.material_type] = (byType[row.material_type] || 0) + parseInt(row.count);
        }
        if (row.material_status) {
          byStatus[row.material_status] = (byStatus[row.material_status] || 0) + parseInt(row.count);
        }
      });

      return res.status(200).json({
        materials: result.rows,
        total: result.rows.length,
        stats: {
          byType,
          byStatus,
        },
        options: {
          types: MATERIAL_TYPES,
          statuses: MATERIAL_STATUSES,
          audiences: AUDIENCES,
        },
      });
    } catch (err) {
      console.error('Error fetching materials:', err);
      return res.status(500).json({ error: 'Failed to fetch materials' });
    }
  }

  // POST - Create material
  if (req.method === 'POST') {
    const {
      domain_id,
      plan_id,
      name,
      description,
      material_type = 'presentation',
      audience = 'all',
      status = 'draft',
      file_url,
      file_name,
      file_size,
      mime_type,
      version,
      tags,
      ...customFields
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

    if (!MATERIAL_TYPES.includes(material_type)) {
      return res.status(400).json({ error: `Invalid material_type. Use: ${MATERIAL_TYPES.join(', ')}` });
    }

    if (!AUDIENCES.includes(audience)) {
      return res.status(400).json({ error: `Invalid audience. Use: ${AUDIENCES.join(', ')}` });
    }

    try {
      // Get a project_id
      const projectResult = await query(
        `SELECT id FROM projects WHERE domain_id = $1 LIMIT 1`,
        [domain_id]
      );
      const projectId = projectResult.rows[0]?.id || null;

      const mergedCustomFields = {
        ...customFields,
        gtm_plan_id: plan_id,
        material_type,
        audience,
        material_status: status,
        file_url,
        file_name,
        file_size,
        mime_type,
        version: version || '1.0',
        tags: tags || [],
      };

      const result = await query(
        `INSERT INTO artefacts (
          project_id, domain_id, artefact_type, name, description, status,
          architecture_state, priority, owner_id, custom_fields,
          created_by, created_at, updated_at
        ) VALUES ($1, $2, 'gtm_material', $3, $4, $5, 'N/A', 'Medium', $6, $7, $6, now(), now())
        RETURNING *`,
        [
          projectId,
          domain_id,
          name.trim(),
          description || '',
          status === 'approved' ? 'Approved' : 'Draft',
          user,
          JSON.stringify(mergedCustomFields),
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating material:', err);
      return res.status(500).json({ error: 'Failed to create material' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
