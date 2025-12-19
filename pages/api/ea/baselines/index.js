// pages/api/ea/baselines/index.js
// CRUD API for EA Baselines (Architecture Snapshots)

import { eaRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const { domain_id, project_id, baseline_type } = req.query;

  // GET - List all baselines
  if (req.method === 'GET') {
    try {
      const baselines = await eaRepository.findAllBaselines({ domain_id, project_id, baseline_type });
      return res.status(200).json(baselines);
    } catch (err) {
      console.error('Error fetching EA baselines:', err);
      return res.status(500).json({ error: 'Failed to fetch EA baselines' });
    }
  }

  // POST - Create new baseline (snapshot)
  if (req.method === 'POST') {
    const {
      project_id,
      domain_id,
      name,
      description,
      baseline_type,
      baseline_date,
      snapshot,
      notes,
      created_by
    } = req.body;

    if (!name || !baseline_type) {
      return res.status(400).json({ error: 'name and baseline_type are required' });
    }

    try {
      const baseline = await eaRepository.createBaseline({
        project_id,
        domain_id,
        name,
        description,
        baseline_type,
        baseline_date,
        snapshot,
        notes,
        created_by,
      });
      return res.status(201).json(baseline);
    } catch (err) {
      console.error('Error creating EA baseline:', err);
      return res.status(500).json({ error: 'Failed to create EA baseline' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
