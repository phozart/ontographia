// pages/api/mms/situations/index.js
// Mental Model Studio - Situations list and create API

import { mmsRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const userId = req.headers['x-user'];
  const userRole = req.headers['x-role'];

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const { domain_id, status } = req.query;

      const situations = await mmsRepository.findSituations({
        domainId: domain_id,
        status,
        userId,
        userRole,
      });

      return res.status(200).json(situations);
    } catch (err) {
      console.error('Error fetching MMS situations:', err);
      return res.status(500).json({ error: 'Failed to fetch situations' });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        domainId,
        title,
        description,
        scope,
        tags,
        status,
        activeLens,
        properties
      } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const situation = await mmsRepository.createSituation({
        domainId,
        userId,
        title,
        description,
        scope,
        tags,
        status,
        activeLens,
        properties,
      });

      return res.status(201).json(situation);
    } catch (err) {
      console.error('Error creating MMS situation:', err);
      return res.status(500).json({ error: 'Failed to create situation' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
