// pages/api/enterprise/data-domains/index.js
// Data Domains API - CRUD for data mesh domain boundaries

import { query } from '../../../../lib/pg';
import { errorResponse } from '../../../../lib/api/errorResponse';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

const VALID_STATUS = ['active', 'proposed', 'dissolved'];

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
  const { domain_id: d1, domainId: d2 } = req.query;
  const domain_id = d1 || d2;

  if (!domain_id) {
    return res.status(400).json({ error: 'domainId is required' });
  }

  const { hasAccess, error } = await checkDomainAccess(req, domain_id, 'view');
  if (!hasAccess) {
    return res.status(403).json({ error });
  }

  try {
    const result = await query(
      `SELECT a.*
       FROM artefacts a
       WHERE a.domain_id = $1
         AND a.artefact_type = 'enterprise_data_domain'
       ORDER BY a.name ASC`,
      [domain_id]
    );

    const items = result.rows.map(normalizeDomain);

    // Enrich with data product counts
    for (const item of items) {
      const countResult = await query(
        `SELECT COUNT(*) AS count
         FROM artefacts
         WHERE domain_id = $1
           AND artefact_type = 'enterprise_data_product'
           AND custom_fields->>'data_domain' = $2`,
        [domain_id, item.name]
      );
      item.product_count = parseInt(countResult.rows[0]?.count || 0, 10);
    }

    return res.status(200).json(items);
  } catch (err) {
    return errorResponse(res, 500, 'Failed to fetch data domains', err);
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
    status = 'active',
    owning_team,
    boundary_definition,
    policies,
    aligned_capabilities,
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const custom_fields = {
      status: VALID_STATUS.includes(status) ? status : 'active',
      owning_team: owning_team || null,
      boundary_definition: boundary_definition || null,
      policies: policies || [],
      aligned_capabilities: aligned_capabilities || [],
    };

    const result = await query(
      `INSERT INTO artefacts (domain_id, name, description, artefact_type, custom_fields, created_by)
       VALUES ($1, $2, $3, 'enterprise_data_domain', $4, $5)
       RETURNING *`,
      [domain_id, name, description || null, JSON.stringify(custom_fields), user]
    );

    return res.status(201).json(normalizeDomain(result.rows[0]));
  } catch (err) {
    return errorResponse(res, 500, 'Failed to create data domain', err);
  }
}

function normalizeDomain(row) {
  if (!row) return null;
  const cf = row.custom_fields || {};
  return {
    id: row.id,
    domain_id: row.domain_id,
    name: row.name,
    description: row.description,
    status: cf.status || 'active',
    owning_team: cf.owning_team || null,
    boundary_definition: cf.boundary_definition || null,
    policies: cf.policies || [],
    aligned_capabilities: cf.aligned_capabilities || [],
    product_count: 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
    created_by: row.created_by,
  };
}
