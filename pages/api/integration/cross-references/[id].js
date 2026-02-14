/**
 * Cross-Space Reference Actions API
 * PATCH: Approve or reject a cross-space reference
 * DELETE: Remove a cross-space reference
 */

import IntegrationRepository from '../../../../lib/repositories/IntegrationRepository';
import { errorResponse } from '../../../../lib/api/errorResponse';

export default async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;

  if (!id) {
    return res.status(400).json({ error: 'Reference ID required' });
  }

  try {
    if (method === 'PATCH') {
      const { action, rationale } = req.body;
      const userId = req.headers['x-user-id'] || 'system';

      if (action === 'approve') {
        const result = await IntegrationRepository.approveCrossSpaceReference(id, userId, rationale);
        res.status(200).json(result);
      } else if (action === 'reject') {
        if (!rationale) {
          return res.status(400).json({ error: 'Rationale required for rejection' });
        }
        const result = await IntegrationRepository.rejectCrossSpaceReference(id, userId, rationale);
        res.status(200).json(result);
      } else {
        res.status(400).json({ error: 'Invalid action. Use "approve" or "reject"' });
      }

    } else if (method === 'DELETE') {
      await IntegrationRepository.delete(id);
      res.status(204).end();

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    return errorResponse(res, 500, 'Cross-reference action failed', error);
  }
}
