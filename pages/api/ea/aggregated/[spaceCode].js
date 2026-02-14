/**
 * EA Aggregated API - Space-Specific Endpoint
 *
 * GET /api/ea/aggregated/[spaceCode] - Returns aggregated data from a specific source space
 *
 * Valid space codes: CAP, BA, PORTFOLIO, PDS, PERF
 *
 * @module pages/api/ea/aggregated/[spaceCode]
 */

import { eaAggregationService, AGGREGATION_SOURCES } from '../../../../lib/services/EAAggregationService';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';
import { errorResponse } from '../../../../lib/api/errorResponse';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { spaceCode } = req.query;

  // Validate space code
  const normalizedCode = spaceCode?.toUpperCase();
  if (!normalizedCode || !AGGREGATION_SOURCES[normalizedCode]) {
    return res.status(400).json({
      error: `Invalid space code: ${spaceCode}`,
      validCodes: Object.keys(AGGREGATION_SOURCES),
    });
  }

  // GET - Get aggregated data from specific source space
  if (req.method === 'GET') {
    const {
      domainId,
      projectId,
      types,
      search,
      limit,
      offset,
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
      // Parse types if provided as comma-separated string
      const typesList = types ? types.split(',').filter(t => t.trim()) : undefined;

      const result = await eaAggregationService.aggregateFromSpace(normalizedCode, domainId, {
        projectId,
        types: typesList,
        search,
        limit: limit ? parseInt(limit, 10) : 100,
        offset: offset ? parseInt(offset, 10) : 0,
      });

      // Also get any existing cross-references for this space
      const crossRefs = await eaAggregationService.getCrossReferences(domainId, {
        sourceSpace: normalizedCode,
        includeArtefactDetails: false,
      });

      // Mark artefacts that are already imported
      const importedIds = new Set(crossRefs.references.map(r => r.source_artefact_id));
      const enrichedArtefacts = result.artefacts.map(a => ({
        ...a,
        isImportedToEA: importedIds.has(a.id),
        crossReferenceId: crossRefs.references.find(r => r.source_artefact_id === a.id)?.id || null,
      }));

      return res.status(200).json({
        ...result,
        artefacts: enrichedArtefacts,
        crossReferences: {
          total: crossRefs.total,
          imported: importedIds.size,
        },
      });
    } catch (err) {
      console.error(`Error getting aggregated data from ${normalizedCode}:`, err);
      return res.status(500).json({
        error: `Failed to get aggregated data from ${normalizedCode}`,
        details: process.env.NODE_ENV !== 'production' ? err.message : undefined,
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
