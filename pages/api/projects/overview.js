// pages/api/projects/overview.js
// Project Overview Dashboard API - Aggregated project statistics

import { projectRepository } from '../../../lib/repositories';
import { getUserFromRequest } from '../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { domainId, status } = req.query;

  try {
    const overview = await projectRepository.getOverview(user, role, { domainId, status });
    return res.status(200).json(overview);
  } catch (err) {
    console.error('Error fetching projects overview:', err);
    return res.status(500).json({
      error: 'Failed to fetch projects overview',
      ...(process.env.NODE_ENV !== 'production' && { details: err.message }),
    });
  }
}
