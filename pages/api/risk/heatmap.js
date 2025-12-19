/**
 * Risk Heat Map API
 *
 * GET - Get risk heat map data
 */

import { riskRepository } from '../../../lib/repositories';
import { checkDomainAccess } from '../../../lib/projectAccess';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { domainId } = req.query;

    if (!domainId) {
      return res.status(400).json({ error: 'Domain ID required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domainId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error: error || 'Access denied' });
    }

    const heatMap = await riskRepository.getRiskHeatMap(domainId);
    return res.json(heatMap);
  } catch (error) {
    console.error('[Risk HeatMap API] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
