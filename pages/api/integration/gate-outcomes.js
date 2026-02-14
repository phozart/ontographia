/**
 * Gate Outcomes API
 * GET: List gate outcomes (decision history)
 * POST: Record a new gate outcome
 */

import IntegrationRepository from '../../../lib/repositories/IntegrationRepository';
import { errorResponse } from '../../../lib/api/errorResponse';

export default async function handler(req, res) {
  const { method } = req;

  try {
    if (method === 'GET') {
      const { domainId, artefactId, gateId, outcome } = req.query;

      const outcomes = await IntegrationRepository.getGateOutcomes({
        domainId,
        artefactId,
        gateId,
        outcome
      });

      // Aggregate stats
      const stats = {
        total: outcomes.length,
        byOutcome: outcomes.reduce((acc, o) => {
          acc[o.outcome] = (acc[o.outcome] || 0) + 1;
          return acc;
        }, {}),
        byGateType: outcomes.reduce((acc, o) => {
          const type = o.gate_type || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {})
      };

      res.status(200).json({ outcomes, stats });

    } else if (method === 'POST') {
      const {
        gateId,
        domainId,
        artefactId,
        relationshipId,
        outcome,
        rationale,
        conditions,
        evidence,
        checklistResults
      } = req.body;

      // Validate required fields
      if (!domainId || !artefactId || !outcome) {
        return res.status(400).json({
          error: 'Missing required fields: domainId, artefactId, outcome'
        });
      }

      // Validate outcome value
      const validOutcomes = ['approved', 'rejected', 'deferred', 'conditional', 'auto_approved', 'expired'];
      if (!validOutcomes.includes(outcome)) {
        return res.status(400).json({
          error: `Invalid outcome. Must be one of: ${validOutcomes.join(', ')}`
        });
      }

      const decidedBy = req.headers['x-user-id'] || 'system';

      const outcomeRecord = await IntegrationRepository.createGateOutcome({
        gateId,
        domainId,
        artefactId,
        relationshipId,
        outcome,
        decidedBy,
        rationale,
        conditions,
        evidence,
        checklistResults
      });

      res.status(201).json(outcomeRecord);

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    return errorResponse(res, 500, 'Gate outcomes operation failed', error);
  }
}
