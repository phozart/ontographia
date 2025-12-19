// pages/api/ea/baselines/[id].js
// Single EA Baseline operations

import { eaRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Baseline ID is required' });
  }

  // GET - Get single baseline with snapshot data
  if (req.method === 'GET') {
    try {
      const baseline = await eaRepository.findBaselineById(id);

      if (!baseline) {
        return res.status(404).json({ error: 'Baseline not found' });
      }

      return res.status(200).json(baseline);
    } catch (err) {
      console.error('Error fetching EA baseline:', err);
      return res.status(500).json({ error: 'Failed to fetch EA baseline' });
    }
  }

  // PUT - Update baseline metadata (not snapshot)
  if (req.method === 'PUT') {
    const { name, description, notes } = req.body;

    try {
      const baseline = await eaRepository.updateBaseline(id, { name, description, notes });

      if (!baseline) {
        return res.status(404).json({ error: 'Baseline not found' });
      }

      return res.status(200).json(baseline);
    } catch (err) {
      console.error('Error updating EA baseline:', err);
      return res.status(500).json({ error: 'Failed to update EA baseline' });
    }
  }

  // DELETE - Delete baseline
  if (req.method === 'DELETE') {
    try {
      const deleted = await eaRepository.deleteBaseline(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Baseline not found' });
      }

      return res.status(200).json({ success: true, id });
    } catch (err) {
      console.error('Error deleting EA baseline:', err);
      return res.status(500).json({ error: 'Failed to delete EA baseline' });
    }
  }

  // POST with ?action=compare - Compare two baselines
  if (req.method === 'POST' && req.query.action === 'compare') {
    const { compare_with } = req.body;

    if (!compare_with) {
      return res.status(400).json({ error: 'compare_with baseline ID is required' });
    }

    try {
      const comparison = await eaRepository.compareBaselines(id, compare_with);

      if (!comparison) {
        return res.status(404).json({ error: 'One or both baselines not found' });
      }

      return res.status(200).json(comparison);
    } catch (err) {
      console.error('Error comparing baselines:', err);
      return res.status(500).json({ error: 'Failed to compare baselines' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
