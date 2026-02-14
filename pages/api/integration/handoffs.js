/**
 * Handoff Records API
 * GET: List handoff records
 * POST: Create a new handoff record
 */

import IntegrationRepository from '../../../lib/repositories/IntegrationRepository';
import { errorResponse } from '../../../lib/api/errorResponse';

export default async function handler(req, res) {
  const { method } = req;

  try {
    if (method === 'GET') {
      const { domainId, projectId, status, fromSpace, toSpace } = req.query;

      const handoffs = await IntegrationRepository.getHandoffRecords({
        domainId,
        projectId,
        status,
        fromSpace,
        toSpace
      });

      // Aggregate stats
      const stats = {
        total: handoffs.length,
        byStatus: handoffs.reduce((acc, h) => {
          acc[h.status] = (acc[h.status] || 0) + 1;
          return acc;
        }, {}),
        byType: handoffs.reduce((acc, h) => {
          acc[h.handoff_type] = (acc[h.handoff_type] || 0) + 1;
          return acc;
        }, {}),
        pendingCount: handoffs.filter(h => h.status === 'pending').length
      };

      res.status(200).json({ handoffs, stats });

    } else if (method === 'POST') {
      const {
        domainId,
        projectId,
        fromSpace,
        toSpace,
        fromArtefactId,
        toArtefactId,
        handoffType,
        summary,
        context,
        deliverables,
        acceptanceCriteria
      } = req.body;

      // Validate required fields
      if (!domainId || !fromSpace || !toSpace || !handoffType) {
        return res.status(400).json({
          error: 'Missing required fields: domainId, fromSpace, toSpace, handoffType'
        });
      }

      // Validate handoff type
      const validTypes = ['initiate', 'transition', 'escalate', 'return', 'complete'];
      if (!validTypes.includes(handoffType)) {
        return res.status(400).json({
          error: `Invalid handoffType. Must be one of: ${validTypes.join(', ')}`
        });
      }

      const handoverBy = req.headers['x-user-id'] || 'system';

      const handoff = await IntegrationRepository.createHandoffRecord({
        domainId,
        projectId,
        fromSpace,
        toSpace,
        fromArtefactId,
        toArtefactId,
        handoffType,
        summary,
        context,
        deliverables,
        acceptanceCriteria,
        handoverBy
      });

      res.status(201).json(handoff);

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    return errorResponse(res, 500, 'Handoffs operation failed', error);
  }
}
