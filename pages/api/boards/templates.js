// pages/api/boards/templates.js
// Templates listing API

import { boardRepository } from '../../../lib/repositories/BoardRepository';

/**
 * Get user from request headers
 */
function getUserFromReq(req) {
  const user = req.headers['x-user'];
  const role = req.headers['x-role'];
  if (!user || !role) return null;
  return { userId: user, role };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const ctx = getUserFromReq(req);

  if (!ctx) {
    return res.status(401).json({ error: 'Missing user/role headers' });
  }

  try {
    const { category } = req.query;
    const templates = await boardRepository.getTemplates(category || null);

    return res.status(200).json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return res.status(500).json({ error: 'Failed to fetch templates' });
  }
}
