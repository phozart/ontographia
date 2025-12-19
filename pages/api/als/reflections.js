// pages/api/als/reflections.js - Learning reflections API
import { alsRepository } from '../../../lib/repositories';

export default async function handler(req, res) {
  const user = req.headers['x-user'];
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { session_id, situation_id, insight_type, limit } = req.query;

    try {
      const reflections = await alsRepository.findReflections({
        sessionId: session_id,
        situationId: situation_id,
        insightType: insight_type,
        limit,
      });
      return res.status(200).json(reflections);
    } catch (err) {
      console.error('Error fetching reflections:', err);
      return res.status(500).json({ error: 'Failed to fetch reflections' });
    }
  }

  if (req.method === 'POST') {
    const { sessionId, situationId, whatClicked, whatConfused, modeAppropriate, nextAdjustment, insightType, content } = req.body;

    if (!sessionId && !situationId) {
      return res.status(400).json({ error: 'Either sessionId or situationId is required' });
    }

    try {
      const reflection = await alsRepository.createReflection({
        sessionId,
        situationId,
        userId: user,
        whatClicked,
        whatConfused,
        modeAppropriate,
        nextAdjustment,
        insightType,
        content,
      });

      return res.status(201).json(reflection);
    } catch (err) {
      console.error('Error creating reflection:', err);
      return res.status(500).json({ error: 'Failed to create reflection' });
    }
  }

  if (req.method === 'PUT') {
    const { id, whatClicked, whatConfused, modeAppropriate, nextAdjustment, insightType, content } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Reflection id is required' });
    }

    if (whatClicked === undefined && whatConfused === undefined && modeAppropriate === undefined &&
        nextAdjustment === undefined && insightType === undefined && content === undefined) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    try {
      const reflection = await alsRepository.updateReflection(id, {
        whatClicked,
        whatConfused,
        modeAppropriate,
        nextAdjustment,
        insightType,
        content,
      });

      if (!reflection) {
        return res.status(404).json({ error: 'Reflection not found' });
      }

      return res.status(200).json(reflection);
    } catch (err) {
      console.error('Error updating reflection:', err);
      return res.status(500).json({ error: 'Failed to update reflection' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Reflection id is required' });
    }

    try {
      const deleted = await alsRepository.deleteReflection(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Reflection not found' });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error deleting reflection:', err);
      return res.status(500).json({ error: 'Failed to delete reflection' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
