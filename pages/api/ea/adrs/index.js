// pages/api/ea/adrs/index.js
// API for Architecture Decision Records (ADRs)
// GET - List all ADRs with optional filtering
// POST - Create new ADR

import { eaRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const { domain_id, project_id, status } = req.query;

  // GET - List all ADRs
  if (req.method === 'GET') {
    try {
      const decisions = await eaRepository.findAllDecisions({ domain_id, project_id, status });
      return res.status(200).json(decisions);
    } catch (err) {
      console.error('Error fetching ADRs:', err);
      return res.status(500).json({ error: 'Failed to fetch ADRs' });
    }
  }

  // POST - Create new ADR
  if (req.method === 'POST') {
    const {
      project_id,
      domain_id,
      title,
      context,
      decision,
      rationale,
      alternatives,
      consequences,
      status: adrStatus,
      related_standards,
      related_elements,
      decision_date,
      review_date,
      deciders,
      created_by
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    try {
      const adr = await eaRepository.createDecision({
        project_id,
        domain_id,
        title,
        context,
        decision,
        rationale,
        alternatives,
        consequences,
        status: adrStatus || 'proposed',
        related_standards,
        related_elements,
        decision_date,
        review_date,
        deciders,
        created_by,
      });
      return res.status(201).json(adr);
    } catch (err) {
      console.error('Error creating ADR:', err);
      return res.status(500).json({ error: 'Failed to create ADR' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
