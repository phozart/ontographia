/**
 * EA PDS Projects Import API - Import PDS projects/artefacts to EA
 *
 * POST /api/ea/pds-projects/import - Import selected PDS artefacts to EA
 *
 * @module pages/api/ea/pds-projects/import
 */

import { eaAggregationService, TYPE_MAPPINGS } from '../../../../lib/services/EAAggregationService';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';
import { errorResponse } from '../../../../lib/api/errorResponse';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // POST - Import PDS artefacts to EA
  if (req.method === 'POST') {
    const {
      domainId,
      artefactIds,
      createElements = false,
      projectId,
    } = req.body;

    if (!domainId) {
      return res.status(400).json({ error: 'Domain ID is required' });
    }

    if (!artefactIds || !Array.isArray(artefactIds) || artefactIds.length === 0) {
      return res.status(400).json({ error: 'Artefact IDs are required' });
    }

    // Check domain access (need edit permission for import)
    const { hasAccess, error: accessError } = await checkDomainAccess(req, domainId, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error: accessError || 'Access denied' });
    }

    try {
      // Use the EA Aggregation Service to import
      const result = await eaAggregationService.importToEA(
        'PDS',
        artefactIds,
        domainId,
        user,
        {
          createElements,
          projectId,
        }
      );

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      console.error('Error importing PDS artefacts to EA:', err);
      return res.status(500).json({
        error: 'Failed to import PDS artefacts',
        details: process.env.NODE_ENV !== 'production' ? err.message : undefined,
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
