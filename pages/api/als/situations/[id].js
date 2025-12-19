// pages/api/als/situations/[id].js - Single learning situation API
import { alsRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const user = req.headers['x-user'];
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const situation = await alsRepository.findSituationById(id);

      if (!situation) {
        return res.status(404).json({ error: 'Learning situation not found' });
      }

      return res.status(200).json(situation);
    } catch (err) {
      console.error('Error fetching learning situation:', err);
      return res.status(500).json({ error: 'Failed to fetch learning situation' });
    }
  }

  if (req.method === 'PUT') {
    const { title, description, subject, learningObjective, constraints, status, properties } = req.body;

    if (title === undefined && description === undefined && subject === undefined &&
        learningObjective === undefined && constraints === undefined && status === undefined &&
        properties === undefined) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    try {
      const situation = await alsRepository.updateSituation(id, {
        title,
        description,
        subject,
        learningObjective,
        constraints,
        status,
        properties,
      });

      if (!situation) {
        return res.status(404).json({ error: 'Learning situation not found' });
      }

      return res.status(200).json(situation);
    } catch (err) {
      console.error('Error updating learning situation:', err);
      return res.status(500).json({ error: 'Failed to update learning situation' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await alsRepository.deleteSituation(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Learning situation not found' });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error deleting learning situation:', err);
      return res.status(500).json({ error: 'Failed to delete learning situation' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
