/**
 * Program Initiatives API
 * GET: List initiatives for a domain
 * POST: Create a new initiative
 */

import IntegrationRepository from '../../../lib/repositories/IntegrationRepository';
import { errorResponse } from '../../../lib/api/errorResponse';

export default async function handler(req, res) {
  const { method } = req;

  try {
    if (method === 'GET') {
      const { domainId, status, priority, space } = req.query;

      if (!domainId) {
        return res.status(400).json({ error: 'domainId is required' });
      }

      const initiatives = await IntegrationRepository.getInitiatives(domainId, {
        status,
        priority,
        space
      });

      // Aggregate stats
      const stats = {
        total: initiatives.length,
        byStatus: initiatives.reduce((acc, i) => {
          acc[i.status] = (acc[i.status] || 0) + 1;
          return acc;
        }, {}),
        byPriority: initiatives.reduce((acc, i) => {
          acc[i.priority] = (acc[i.priority] || 0) + 1;
          return acc;
        }, {}),
        totalArtefacts: initiatives.reduce((sum, i) => sum + parseInt(i.artefact_count || 0), 0)
      };

      res.status(200).json({ initiatives, stats });

    } else if (method === 'POST') {
      const {
        domainId,
        name,
        description,
        status,
        priority,
        startDate,
        targetDate,
        ownerId,
        spacesInvolved,
        objectives,
        successMetrics,
        currentStage
      } = req.body;

      // Validate required fields
      if (!domainId || !name) {
        return res.status(400).json({
          error: 'Missing required fields: domainId, name'
        });
      }

      const createdBy = req.headers['x-user-id'] || 'system';

      const initiative = await IntegrationRepository.createInitiative({
        domainId,
        name,
        description,
        status,
        priority,
        startDate,
        targetDate,
        ownerId,
        spacesInvolved,
        objectives,
        successMetrics,
        currentStage,
        createdBy
      });

      res.status(201).json(initiative);

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    return errorResponse(res, 500, 'Initiatives operation failed', error);
  }
}
