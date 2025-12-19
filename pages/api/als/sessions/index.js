// pages/api/als/sessions/index.js - Learning sessions API
import { alsRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const user = req.headers['x-user'];
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { situation_id, learning_mode, limit } = req.query;

    try {
      const sessions = await alsRepository.findSessions({
        situationId: situation_id,
        learningMode: learning_mode,
        limit,
      });
      return res.status(200).json(sessions);
    } catch (err) {
      console.error('Error fetching learning sessions:', err);
      return res.status(500).json({ error: 'Failed to fetch learning sessions' });
    }
  }

  if (req.method === 'POST') {
    const { situationId, learningMode, focusQuestion, materialUsed, properties } = req.body;

    if (!situationId || !learningMode) {
      return res.status(400).json({ error: 'situationId and learningMode are required' });
    }

    try {
      const session = await alsRepository.createSession({
        situationId,
        userId: user,
        learningMode,
        focusQuestion,
        materialUsed,
        properties,
      });

      return res.status(201).json(session);
    } catch (err) {
      console.error('Error creating learning session:', err);
      return res.status(500).json({ error: 'Failed to create learning session' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
