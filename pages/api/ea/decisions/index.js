// pages/api/ea/decisions/index.js
// CRUD API for EA Decisions (Architecture Decision Records - ADRs)

import { eaRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const { domain_id, project_id, status, id } = req.query;

  // GET - List all decisions
  if (req.method === 'GET') {
    try {
      const decisions = await eaRepository.findAllDecisions({ domain_id, project_id, status });
      return res.status(200).json(decisions);
    } catch (err) {
      console.error('Error fetching EA decisions:', err);
      return res.status(500).json({ error: 'Failed to fetch EA decisions' });
    }
  }

  // POST - Create new decision (ADR)
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
      status: decisionStatus,
      related_standards,
      related_elements,
      decision_date,
      review_date,
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
        status: decisionStatus,
        related_standards,
        related_elements,
        decision_date,
        review_date,
        created_by,
      });
      return res.status(201).json(adr);
    } catch (err) {
      console.error('Error creating EA decision:', err);
      return res.status(500).json({ error: 'Failed to create EA decision' });
    }
  }

  // PUT - Update decision (by id in body)
  if (req.method === 'PUT') {
    const { id: decisionId, ...updates } = req.body;

    if (!decisionId) {
      return res.status(400).json({ error: 'id is required' });
    }

    try {
      const adr = await eaRepository.updateDecision(decisionId, updates);

      if (!adr) {
        return res.status(404).json({ error: 'Decision not found' });
      }

      return res.status(200).json(adr);
    } catch (err) {
      console.error('Error updating EA decision:', err);
      return res.status(500).json({ error: 'Failed to update EA decision' });
    }
  }

  // DELETE - Delete decision (by id in query)
  if (req.method === 'DELETE') {
    if (!id) {
      return res.status(400).json({ error: 'id query parameter is required' });
    }

    try {
      const deleted = await eaRepository.deleteDecision(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Decision not found' });
      }

      return res.status(200).json({ success: true, id });
    } catch (err) {
      console.error('Error deleting EA decision:', err);
      return res.status(500).json({ error: 'Failed to delete EA decision' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
