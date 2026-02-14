/**
 * EA Aggregated API - Main Endpoint
 *
 * GET /api/ea/aggregated - Returns aggregated view of all linked artefacts from source spaces
 *
 * @module pages/api/ea/aggregated/index
 */

import { eaAggregationService, AGGREGATION_SOURCES } from '../../../../lib/services/EAAggregationService';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';
import { errorResponse } from '../../../../lib/api/errorResponse';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET - Get aggregated view from all source spaces
  if (req.method === 'GET') {
    const {
      domainId,
      projectId,
      eaLayer,
      search,
      includeStats,
      includeCrossRefs,
    } = req.query;

    if (!domainId) {
      return res.status(400).json({ error: 'Domain ID is required' });
    }

    // Check domain access
    const { hasAccess, error: accessError } = await checkDomainAccess(req, domainId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error: accessError || 'Access denied' });
    }

    try {
      // Get aggregated view
      const aggregated = await eaAggregationService.getAggregatedView(domainId, {
        projectId,
        eaLayer,
        search,
        includeStats: includeStats !== 'false',
      });

      // Optionally include cross-references
      let crossReferences = null;
      if (includeCrossRefs === 'true') {
        const refsResult = await eaAggregationService.getCrossReferences(domainId, {
          includeArtefactDetails: true,
        });
        crossReferences = refsResult;
      }

      return res.status(200).json({
        ...aggregated,
        crossReferences,
        availableSources: Object.values(AGGREGATION_SOURCES).map(s => ({
          code: s.code,
          name: s.name,
          eaLayer: s.eaLayer,
          description: s.description,
        })),
      });
    } catch (err) {
      console.error('Error getting aggregated EA view:', err);
      return res.status(500).json({
        error: 'Failed to get aggregated view',
        details: process.env.NODE_ENV !== 'production' ? err.message : undefined,
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
