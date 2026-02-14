// pages/api/enterprise/data-contracts/index.js
// Data Contracts API - CRUD for data contracts (ODCS v3 / DCS aligned)

import { query } from '../../../../lib/pg';
import { errorResponse } from '../../../../lib/api/errorResponse';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

const VALID_STATUS = ['draft', 'proposed', 'active', 'deprecated'];

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res, user);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

async function handleGet(req, res) {
  const { domain_id: d1, domainId: d2, data_product_id, status, search } = req.query;
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
      SELECT a.*
      FROM artefacts a
      WHERE a.domain_id = $1
        AND a.artefact_type = 'enterprise_data_contract'
    `;
    const params = [domain_id];
    let paramIdx = 2;

    if (data_product_id) {
      sql += ` AND a.custom_fields->>'data_product_id' = $${paramIdx}`;
      params.push(data_product_id);
      paramIdx++;
    }

    if (status && VALID_STATUS.includes(status)) {
      sql += ` AND a.custom_fields->>'status' = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    if (search) {
      sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    sql += ' ORDER BY a.created_at DESC';

    const result = await query(sql, params);
    const items = result.rows.map(normalizeContract);

    return res.status(200).json(items);
  } catch (err) {
    return errorResponse(res, 500, 'Failed to fetch data contracts', err);
  }
}

async function handlePost(req, res, user) {
  const { domain_id: d1, domainId: d2 } = req.query;
  const domain_id = d1 || d2 || req.body.domain_id;

  if (!domain_id) {
    return res.status(400).json({ error: 'domainId is required' });
  }

  const { hasAccess, error } = await checkDomainAccess(req, domain_id, 'edit');
  if (!hasAccess) {
    return res.status(403).json({ error });
  }

  const {
    name,
    description,
    data_product_id,
    output_port_id,
    status = 'draft',
    version = '1.0',
    owner,
    schema,
    quality_rules,
    sla,
    access,
    terms,
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const custom_fields = {
      data_product_id: data_product_id || null,
      output_port_id: output_port_id || null,
      status: VALID_STATUS.includes(status) ? status : 'draft',
      version,
      owner: owner || null,
      // Schema definition (array of field objects)
      schema: schema || { fields: [] },
      // Quality rules (array of rule objects with dimension, rule, threshold)
      quality_rules: quality_rules || [],
      // SLA definitions (object with metric: { target, unit })
      sla: sla || {},
      // Access control (object with classification, access_level)
      access: access || { classification: 'internal', access_level: 'team' },
      // Terms of use
      terms: terms || null,
    };

    const result = await query(
      `INSERT INTO artefacts (domain_id, name, description, artefact_type, custom_fields, created_by)
       VALUES ($1, $2, $3, 'enterprise_data_contract', $4, $5)
       RETURNING *`,
      [domain_id, name, description || null, JSON.stringify(custom_fields), user]
    );

    // If linked to a data product, create relationship
    if (data_product_id) {
      try {
        await query(
          `INSERT INTO artefact_relationships (source_id, target_id, relationship_type, domain_id)
           VALUES ($1, $2, 'implements_contract', $3)
           ON CONFLICT DO NOTHING`,
          [data_product_id, result.rows[0].id, domain_id]
        );
      } catch {
        // Non-critical — relationship table may not have conflict constraint
      }
    }

    return res.status(201).json(normalizeContract(result.rows[0]));
  } catch (err) {
    return errorResponse(res, err, 'Failed to create data contract');
  }
}

function normalizeContract(row) {
  if (!row) return null;
  const cf = row.custom_fields || {};
  return {
    id: row.id,
    domain_id: row.domain_id,
    name: row.name,
    description: row.description,
    data_product_id: cf.data_product_id || null,
    output_port_id: cf.output_port_id || null,
    status: cf.status || 'draft',
    version: cf.version || '1.0',
    owner: cf.owner || null,
    schema: cf.schema || { fields: [] },
    quality_rules: cf.quality_rules || [],
    sla: cf.sla || {},
    access: cf.access || { classification: 'internal', access_level: 'team' },
    terms: cf.terms || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    created_by: row.created_by,
  };
}
