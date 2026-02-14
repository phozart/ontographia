/**
 * Handoff Actions API
 * PATCH: Accept or reject a handoff
 */

import IntegrationRepository from '../../../../lib/repositories/IntegrationRepository';
import { errorResponse } from '../../../../lib/api/errorResponse';

export default async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;

  if (!id) {
    return res.status(400).json({ error: 'Handoff ID required' });
  }

  try {
    if (method === 'PATCH') {
      const { action, reason } = req.body;
      const userId = req.headers['x-user-id'] || 'system';

      if (action === 'accept') {
        const result = await IntegrationRepository.acceptHandoff(id, userId);
        res.status(200).json(result);
      } else if (action === 'reject') {
        if (!reason) {
          return res.status(400).json({ error: 'Reason required for rejection' });
        }
        const result = await IntegrationRepository.rejectHandoff(id, userId, reason);
        res.status(200).json(result);
      } else {
        res.status(400).json({ error: 'Invalid action. Use "accept" or "reject"' });
      }

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    return errorResponse(res, 500, 'Handoff action failed', error);
  }
}
