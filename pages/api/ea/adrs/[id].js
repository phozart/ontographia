// pages/api/ea/adrs/[id].js
// API for single Architecture Decision Record
// GET - Get ADR by ID
// PUT - Update ADR
// DELETE - Delete ADR

import { eaRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ADR ID is required' });
  }

  // GET - Get single ADR with full details
  if (req.method === 'GET') {
    try {
      const adr = await eaRepository.findDecisionById(id);

      if (!adr) {
        return res.status(404).json({ error: 'ADR not found' });
      }

      return res.status(200).json(adr);
    } catch (err) {
      console.error('Error fetching ADR:', err);
      return res.status(500).json({ error: 'Failed to fetch ADR' });
    }
  }

  // PUT - Update ADR
  if (req.method === 'PUT') {
    const {
      title,
      context,
      decision,
      rationale,
      alternatives,
      consequences,
      status,
      superseded_by,
      related_standards,
      related_elements,
      decision_date,
      review_date,
      date_superseded,
      deciders,
      updated_by
    } = req.body;

    try {
      const adr = await eaRepository.updateDecision(id, {
        title,
        context,
        decision,
        rationale,
        alternatives,
        consequences,
        status,
        superseded_by,
        related_standards,
        related_elements,
        decision_date,
        review_date,
        date_superseded,
        deciders,
        updated_by
      });

      if (!adr) {
        return res.status(404).json({ error: 'ADR not found' });
      }

      return res.status(200).json(adr);
    } catch (err) {
      console.error('Error updating ADR:', err);
      return res.status(500).json({ error: 'Failed to update ADR' });
    }
  }

  // DELETE - Delete ADR
  if (req.method === 'DELETE') {
    try {
      const deleted = await eaRepository.deleteDecision(id);

      if (!deleted) {
        return res.status(404).json({ error: 'ADR not found' });
      }

      return res.status(200).json({ success: true, id });
    } catch (err) {
      console.error('Error deleting ADR:', err);
      return res.status(500).json({ error: 'Failed to delete ADR' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
