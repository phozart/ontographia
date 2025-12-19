// pages/api/als/situations/index.js - Learning situations API
import { alsRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const user = req.headers['x-user'];
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { domain_id, status } = req.query;

    try {
      const situations = await alsRepository.findSituations({
        domainId: domain_id,
        status,
      });
      return res.status(200).json(situations);
    } catch (err) {
      console.error('Error fetching learning situations:', err);
      return res.status(500).json({ error: 'Failed to fetch learning situations' });
    }
  }

  if (req.method === 'POST') {
    const { domainId, title, description, subject, learningObjective, constraints, properties } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    try {
      const situation = await alsRepository.createSituation({
        domainId,
        userId: user,
        title,
        description,
        subject,
        learningObjective,
        constraints,
        properties,
      });

      return res.status(201).json(situation);
    } catch (err) {
      console.error('Error creating learning situation:', err);
      return res.status(500).json({ error: 'Failed to create learning situation' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
