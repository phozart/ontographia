// pages/api/blueprint/from-ea.js
// API route for EA-Blueprint cross-studio integration
// POST: Create initiative from EA capability gap
// GET: List initiatives generated from EA gaps (optionally filtered by capability_id)

import { getUserFromRequest, checkDomainAccess } from '../../../lib/projectAccess';
import { errorResponse } from '../../../lib/api/errorResponse';
import {
  createInitiativeFromCapabilityGap,
  getInitiativesForCapability,
} from '../../../lib/services/eaBlueprintBridge';
import { query } from '../../../lib/pg';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET - List initiatives generated from EA gaps
  if (req.method === 'GET') {
    try {
      const { capability_id, domain_id } = req.query;

      if (!domain_id) {
        return res.status(400).json({ error: 'domain_id is required' });
      }

      const { hasAccess, error } = await checkDomainAccess(req, domain_id, 'view');
      if (!hasAccess) {
        return res.status(403).json({ error: error || 'Access denied' });
      }

      // If capability_id provided, get initiatives for that specific capability
      if (capability_id) {
        const initiatives = await getInitiativesForCapability(capability_id);
        return res.status(200).json({ initiatives });
      }

      // Otherwise, list all EA-sourced initiatives for this domain
      const result = await query(`
        SELECT bi.*,
          csr.source_entity_id as capability_id,
          csr.metadata as reference_metadata,
          csr.created_at as linked_at
        FROM blueprint_initiatives bi
        JOIN cross_space_references csr
          ON csr.target_entity_id = bi.id
          AND csr.source_space = 'enterprise'
          AND csr.target_space = 'blueprint'
        WHERE bi.domain_id = $1
          AND bi.source = 'ea_capability_gap'
        ORDER BY bi.created_at DESC
      `, [domain_id]);

      return res.status(200).json({ initiatives: result.rows });
    } catch (err) {
      return errorResponse(res, 500, 'Failed to fetch EA-sourced initiatives', err);
    }
  }

  // POST - Create initiative from EA capability gap
  if (req.method === 'POST') {
    try {
      const { capability_id, capability_name, gap_description, gap_type, priority, domain_id } = req.body;

      if (!domain_id) {
        return res.status(400).json({ error: 'domain_id is required' });
      }

      if (!capability_id || !capability_name) {
        return res.status(400).json({ error: 'capability_id and capability_name are required' });
      }

      const { hasAccess, error } = await checkDomainAccess(req, domain_id, 'edit');
      if (!hasAccess) {
        return res.status(403).json({ error: error || 'Edit access denied' });
      }

      const initiative = await createInitiativeFromCapabilityGap(
        {
          capability_id,
          capability_name,
          gap_description: gap_description || '',
          gap_type: gap_type || 'missing',
          priority: priority || 'medium',
        },
        domain_id,
        user,
      );

      return res.status(201).json(initiative);
    } catch (err) {
      return errorResponse(res, 500, 'Failed to create initiative from EA gap', err);
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
