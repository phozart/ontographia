/**
 * Relationship Type Registry API
 * GET: List relationship types with optional filtering
 */

import IntegrationRepository from '../../../lib/repositories/IntegrationRepository';
import { errorResponse } from '../../../lib/api/errorResponse';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fromSpace, toSpace, semanticGroup, requiresApproval } = req.query;

    const types = await IntegrationRepository.getRelationshipTypes({
      fromSpace,
      toSpace,
      semanticGroup,
      requiresApproval: requiresApproval === 'true' ? true : requiresApproval === 'false' ? false : undefined
    });

    // Group by semantic category for UI
    const grouped = types.reduce((acc, type) => {
      const group = type.semantic_group || 'other';
      if (!acc[group]) acc[group] = [];
      acc[group].push(type);
      return acc;
    }, {});

    res.status(200).json({
      types,
      grouped,
      total: types.length
    });

  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch relationship types', error);
  }
}
