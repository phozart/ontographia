/**
 * Governance Validation API
 * GET: Validate governance completeness
 */

import { govRepository } from '../../../lib/repositories/GovRepository';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const validation = await govRepository.validateCompleteness(projectId);
      return res.status(200).json(validation);
    } catch (err) {
      console.error('Error validating governance:', err);
      return res.status(500).json({ error: 'Failed to validate governance' });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
