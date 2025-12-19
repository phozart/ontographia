/**
 * Policy Hierarchy API
 * GET: Get policy hierarchy
 */

import { govRepository } from '../../../lib/repositories/GovRepository';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    const { projectId, hierarchy } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      if (hierarchy === 'true') {
        const policyHierarchy = await govRepository.getPolicyHierarchy(projectId);
        return res.status(200).json({ hierarchy: policyHierarchy });
      }

      // Return flat list
      const result = await govRepository.findByProject(projectId, { type: 'gov_policy' });
      return res.status(200).json(result);
    } catch (err) {
      console.error('Error fetching policies:', err);
      return res.status(500).json({ error: 'Failed to fetch policies' });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
