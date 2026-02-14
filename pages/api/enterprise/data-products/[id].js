// pages/api/enterprise/data-products/[id].js
// Individual Data Product API - GET, PUT, DELETE

import { query } from '../../../../lib/pg';
import { errorResponse } from '../../../../lib/api/errorResponse';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

const VALID_STATUS = ['draft', 'development', 'active', 'deprecated', 'retired'];
const VALID_CLASSIFICATION = ['source_aligned', 'aggregate', 'consumer_aligned'];

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);
  const { id } = req.query;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Data product ID is required' });
  }

  if (req.method === 'GET') {
    return handleGet(req, res, id);
  } else if (req.method === 'PUT') {
    return handlePut(req, res, id, user);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res, id);
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

async function handleGet(req, res, id) {
  try {
    const result = await query(
      `SELECT * FROM artefacts WHERE id = $1 AND artefact_type = 'enterprise_data_product'`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data product not found' });
    }

    return res.status(200).json(normalizeDataProduct(result.rows[0]));
  } catch (err) {
    return errorResponse(res, err, 'Failed to fetch data product');
  }
}

async function handlePut(req, res, id, user) {
  try {
    // Fetch existing
    const existing = await query(
      `SELECT * FROM artefacts WHERE id = $1 AND artefact_type = 'enterprise_data_product'`,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Data product not found' });
    }

    const row = existing.rows[0];
    const { hasAccess, error } = await checkDomainAccess(req, row.domain_id, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const {
      name,
      description,
      classification,
      status,
      data_domain,
      owner,
      purpose,
      input_ports,
      output_ports,
      tags,
      fqn,
      version,
    } = req.body;

    const existingCf = row.custom_fields || {};

    const updatedCf = {
      ...existingCf,
      ...(classification !== undefined && { classification: VALID_CLASSIFICATION.includes(classification) ? classification : existingCf.classification }),
      ...(status !== undefined && { status: VALID_STATUS.includes(status) ? status : existingCf.status }),
      ...(data_domain !== undefined && { data_domain }),
      ...(owner !== undefined && { owner }),
      ...(purpose !== undefined && { purpose }),
      ...(input_ports !== undefined && { input_ports }),
      ...(output_ports !== undefined && { output_ports }),
      ...(tags !== undefined && { tags }),
      ...(fqn !== undefined && { fqn }),
      ...(version !== undefined && { version }),
    };

    const result = await query(
      `UPDATE artefacts
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           custom_fields = $3,
           updated_at = NOW()
       WHERE id = $4 AND artefact_type = 'enterprise_data_product'
       RETURNING *`,
      [name || row.name, description !== undefined ? description : row.description, JSON.stringify(updatedCf), id]
    );

    return res.status(200).json(normalizeDataProduct(result.rows[0]));
  } catch (err) {
    return errorResponse(res, err, 'Failed to update data product');
  }
}

async function handleDelete(req, res, id) {
  try {
    const existing = await query(
      `SELECT * FROM artefacts WHERE id = $1 AND artefact_type = 'enterprise_data_product'`,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Data product not found' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, existing.rows[0].domain_id, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    // Delete related relationships
    await query(
      `DELETE FROM artefact_relationships WHERE source_id = $1 OR target_id = $1`,
      [id]
    );

    await query(`DELETE FROM artefacts WHERE id = $1`, [id]);

    return res.status(200).json({ success: true });
  } catch (err) {
    return errorResponse(res, err, 'Failed to delete data product');
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
