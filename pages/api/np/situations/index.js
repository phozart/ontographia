// pages/api/np/situations/index.js
// API for managing N&P situations

import { npRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const { domain_id, user_id, status, situation_type } = req.query;

  if (req.method === 'GET') {
    try {
      const situations = await npRepository.findSituations({
        domainId: domain_id,
        userId: user_id,
        status,
        situationType: situation_type,
      });
      return res.status(200).json(situations);
    } catch (err) {
      console.error('Error fetching situations:', err);
      return res.status(500).json({ error: 'Failed to fetch situations' });
    }
  }

  if (req.method === 'POST') {
    const {
      domain_id: domainId,
      user_id: userId,
      name,
      description,
      situation_type: sitType,
      other_party,
      context,
      stakes,
      relationship_importance,
      time_pressure,
      properties
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    try {
      const situation = await npRepository.createSituation({
        domainId,
        userId,
        name,
        description,
        situationType: sitType,
        otherParty: other_party,
        context,
        stakes,
        relationshipImportance: relationship_importance,
        timePressure: time_pressure,
        properties,
      });

      return res.status(201).json(situation);
    } catch (err) {
      console.error('Error creating situation:', err);
      return res.status(500).json({ error: 'Failed to create situation' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
