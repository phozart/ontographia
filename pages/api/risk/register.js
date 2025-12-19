/**
 * Risk Register API
 *
 * GET - Get risk register view with all risks and their controls
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

    const register = await riskRepository.buildRiskRegister(domainId);
    return res.json(register);
  } catch (error) {
    console.error('[Risk Register API] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
