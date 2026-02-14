// pages/api/enterprise/data-products/index.js
// Data Products API - CRUD for enterprise data products (ODPS/DPDS aligned)

import { query } from '../../../../lib/pg';
import { errorResponse } from '../../../../lib/api/errorResponse';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

const VALID_STATUS = ['draft', 'development', 'active', 'deprecated', 'retired'];
const VALID_CLASSIFICATION = ['source_aligned', 'aggregate', 'consumer_aligned'];

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
  const { domain_id: d1, domainId: d2, classification, status, domain_name, search, limit: lim, offset: off } = req.query;
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
        AND a.artefact_type = 'enterprise_data_product'
    `;
    const params = [domain_id];
    let paramIdx = 2;

    if (classification && VALID_CLASSIFICATION.includes(classification)) {
      sql += ` AND a.custom_fields->>'classification' = $${paramIdx}`;
      params.push(classification);
      paramIdx++;
    }

    if (status && VALID_STATUS.includes(status)) {
      sql += ` AND a.custom_fields->>'status' = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    if (domain_name) {
      sql += ` AND a.custom_fields->>'data_domain' = $${paramIdx}`;
      params.push(domain_name);
      paramIdx++;
    }

    if (search) {
      sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    sql += ' ORDER BY a.created_at DESC';

    if (lim) {
      sql += ` LIMIT $${paramIdx}`;
      params.push(parseInt(lim, 10));
      paramIdx++;
    }
    if (off) {
      sql += ` OFFSET $${paramIdx}`;
      params.push(parseInt(off, 10));
    }

    const result = await query(sql, params);

    // Parse custom_fields into flat structure for frontend
    const items = result.rows.map(normalizeDataProduct);

    return res.status(200).json(items);
  } catch (err) {
    return errorResponse(res, 500, 'Failed to fetch data products', err);
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
    classification,
    status = 'draft',
    data_domain,
    owner,
    purpose,
    input_ports,
    output_ports,
    tags,
    fqn,
    version = '1.0',
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const custom_fields = {
      classification: VALID_CLASSIFICATION.includes(classification) ? classification : 'source_aligned',
      status: VALID_STATUS.includes(status) ? status : 'draft',
      data_domain: data_domain || null,
      owner: owner || null,
      purpose: purpose || null,
      input_ports: input_ports || [],
      output_ports: output_ports || [],
      tags: tags || [],
      fqn: fqn || null,
      version: version,
      consumer_count: 0,
      health_score: null,
    };

    const result = await query(
      `INSERT INTO artefacts (domain_id, name, description, artefact_type, custom_fields, created_by)
       VALUES ($1, $2, $3, 'enterprise_data_product', $4, $5)
       RETURNING *`,
      [domain_id, name, description || null, JSON.stringify(custom_fields), user]
    );

    return res.status(201).json(normalizeDataProduct(result.rows[0]));
  } catch (err) {
    return errorResponse(res, 500, 'Failed to create data product', err);
  }
}

function normalizeDataProduct(row) {
  if (!row) return null;
  const cf = row.custom_fields || {};
  return {
    id: row.id,
    domain_id: row.domain_id,
    name: row.name,
    description: row.description,
    classification: cf.classification || 'source_aligned',
    status: cf.status || 'draft',
    data_domain: cf.data_domain || null,
    owner: cf.owner || null,
    purpose: cf.purpose || null,
    input_ports: cf.input_ports || [],
    output_ports: cf.output_ports || [],
    tags: cf.tags || [],
    fqn: cf.fqn || null,
    version: cf.version || '1.0',
    consumer_count: cf.consumer_count || 0,
    health_score: cf.health_score || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    created_by: row.created_by,
  };
}
