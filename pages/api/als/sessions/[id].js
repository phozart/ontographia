// pages/api/als/sessions/[id].js - Single learning session API
import { alsRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const user = req.headers['x-user'];
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const session = await alsRepository.findSessionById(id);

      if (!session) {
        return res.status(404).json({ error: 'Learning session not found' });
      }

      return res.status(200).json(session);
    } catch (err) {
      console.error('Error fetching learning session:', err);
      return res.status(500).json({ error: 'Failed to fetch learning session' });
    }
  }

  if (req.method === 'PUT') {
    const { endedAt, durationMinutes, understandingSignal, frictionNotes, focusQuestion, materialUsed, properties } = req.body;

    if (endedAt === undefined && durationMinutes === undefined && understandingSignal === undefined &&
        frictionNotes === undefined && focusQuestion === undefined && materialUsed === undefined &&
        properties === undefined) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    try {
      const session = await alsRepository.updateSession(id, {
        endedAt,
        durationMinutes,
        understandingSignal,
        frictionNotes,
        focusQuestion,
        materialUsed,
        properties,
      });

      if (!session) {
        return res.status(404).json({ error: 'Learning session not found' });
      }

      return res.status(200).json(session);
    } catch (err) {
      console.error('Error updating learning session:', err);
      return res.status(500).json({ error: 'Failed to update learning session' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await alsRepository.deleteSession(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Learning session not found' });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error deleting learning session:', err);
      return res.status(500).json({ error: 'Failed to delete learning session' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
