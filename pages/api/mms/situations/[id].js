// pages/api/mms/situations/[id].js
// Mental Model Studio - Single situation CRUD API

import { mmsRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const userId = req.headers['x-user'];
  const userRole = req.headers['x-role'];
  const { id } = req.query;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Situation ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const situation = await mmsRepository.findSituationById(id, true);

      if (!situation) {
        return res.status(404).json({ error: 'Situation not found' });
      }

      // Check access
      if (userRole !== 'admin' && situation.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      return res.status(200).json(situation);
    } catch (err) {
      console.error('Error fetching MMS situation:', err);
      return res.status(500).json({ error: 'Failed to fetch situation' });
    }
  }

  if (req.method === 'PUT') {
    try {
      // Check ownership first
      const ownership = await mmsRepository.checkOwnership(id);
      if (!ownership.found) {
        return res.status(404).json({ error: 'Situation not found' });
      }
      if (userRole !== 'admin' && ownership.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const {
        title,
        description,
        scope,
        tags,
        status,
        activeLens,
        properties
      } = req.body;

      if (title === undefined && description === undefined && scope === undefined &&
          tags === undefined && status === undefined && activeLens === undefined &&
          properties === undefined) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      const situation = await mmsRepository.updateSituation(id, {
        title,
        description,
        scope,
        tags,
        status,
        activeLens,
        properties,
      });

      return res.status(200).json(situation);
    } catch (err) {
      console.error('Error updating MMS situation:', err);
      return res.status(500).json({ error: 'Failed to update situation' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Check ownership first
      const ownership = await mmsRepository.checkOwnership(id);
      if (!ownership.found) {
        return res.status(404).json({ error: 'Situation not found' });
      }
      if (userRole !== 'admin' && ownership.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await mmsRepository.deleteSituation(id);
      return res.status(204).end();
    } catch (err) {
      console.error('Error deleting MMS situation:', err);
      return res.status(500).json({ error: 'Failed to delete situation' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
