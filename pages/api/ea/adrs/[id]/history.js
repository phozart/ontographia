// pages/api/ea/adrs/[id]/history.js
// API for ADR history
// GET - Get history of changes for an ADR

import { eaRepository } from '../../../../../lib/repositories';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ADR ID is required' });
  }

  // GET - Get history of ADR changes
  if (req.method === 'GET') {
    try {
      // First verify the ADR exists
      const adr = await eaRepository.findDecisionById(id);
      if (!adr) {
        return res.status(404).json({ error: 'ADR not found' });
      }

      const history = await eaRepository.getDecisionHistory(id);

      return res.status(200).json({
        adr_id: id,
        adr_number: adr.adr_number,
        title: adr.title,
        history: history
      });
    } catch (err) {
      console.error('Error fetching ADR history:', err);
      return res.status(500).json({ error: 'Failed to fetch ADR history' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
