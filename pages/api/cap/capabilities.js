/**
 * Capability Studio - Capabilities Tree API
 *
 * Specialized endpoints for capability hierarchy operations.
 *
 * @route GET /api/cap/capabilities - Get capabilities as tree
 * @route GET /api/cap/capabilities?flat=true - Get flat list
 *
 * @requires x-user header - User ID for authentication
 * @requires x-role header - User role for authorization
 *
 * @module pages/api/cap/capabilities
 */

import { capRepository } from '../../../lib/repositories';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';
import { calculateMaturitySummary, generateCapabilityHeatmap } from '../../../lib/cap-types';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectId, flat, parentId, includeHeatmap } = req.query;

  if (!projectId) {
    return res.status(400).json({ error: 'Project ID required' });
  }

  const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
  if (!hasAccess) {
    return res.status(403).json({ error });
  }

  try {
    // Get children of specific parent
    if (parentId) {
      const children = await capRepository.findChildCapabilities(parentId);
      return res.status(200).json({ capabilities: children });
    }

    // Get flat list
    if (flat === 'true') {
      const capabilities = await capRepository.findCapabilities(projectId);

      // Include maturity summary and heatmap if requested
      const response = { capabilities };

      if (includeHeatmap === 'true') {
        response.heatmap = generateCapabilityHeatmap(capabilities);
        response.maturitySummary = calculateMaturitySummary(capabilities);
      }

      return res.status(200).json(response);
    }

    // Get as tree (default)
    const tree = await capRepository.buildCapabilityTree(projectId);

    // Get flat list for additional data
    const allCapabilities = await capRepository.findCapabilities(projectId);

    return res.status(200).json({
      tree,
      rootCount: tree.length,
      totalCount: allCapabilities.length,
      maturitySummary: calculateMaturitySummary(allCapabilities),
    });
  } catch (err) {
    console.error('Error fetching capabilities:', err);
    return res.status(500).json({ error: 'Failed to fetch capabilities', details: err.message });
  }
}
