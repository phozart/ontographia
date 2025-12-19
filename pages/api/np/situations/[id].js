// pages/api/np/situations/[id].js
// API for single N&P situation operations

import { npRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Situation ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const situation = await npRepository.findSituationWithDetails(id);

      if (!situation) {
        return res.status(404).json({ error: 'Situation not found' });
      }

      return res.status(200).json(situation);
    } catch (err) {
      console.error('Error fetching situation:', err);
      return res.status(500).json({ error: 'Failed to fetch situation' });
    }
  }

  if (req.method === 'PUT') {
    const {
      name,
      description,
      situation_type,
      other_party,
      context,
      stakes,
      relationship_importance,
      time_pressure,
      status,
      outcome,
      outcome_notes,
      properties
    } = req.body;

    try {
      const situation = await npRepository.updateSituation(id, {
        name,
        description,
        situationType: situation_type,
        otherParty: other_party,
        context,
        stakes,
        relationshipImportance: relationship_importance,
        timePressure: time_pressure,
        status,
        outcome,
        outcomeNotes: outcome_notes,
        properties,
      });

      if (!situation) {
        return res.status(404).json({ error: 'Situation not found' });
      }

      return res.status(200).json(situation);
    } catch (err) {
      console.error('Error updating situation:', err);
      return res.status(500).json({ error: 'Failed to update situation' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await npRepository.deleteSituation(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Situation not found' });
      }

      return res.status(200).json({ success: true, deleted });
    } catch (err) {
      console.error('Error deleting situation:', err);
      return res.status(500).json({ error: 'Failed to delete situation' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
