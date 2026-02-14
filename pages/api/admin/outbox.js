// pages/api/admin/outbox.js
// Outbox relay endpoint - processes pending outbox events
// POST: trigger processing, GET: view stats

import { processOutbox, getOutboxStats, cleanupProcessed, ensureOutboxTable } from '../../../lib/services/outboxService';
import { errorResponse } from '../../../lib/api/errorResponse';

export default async function handler(req, res) {
  const { method } = req;

  try {
    await ensureOutboxTable();

    switch (method) {
      case 'POST': {
        const { batchSize = 20, cleanup } = req.body || {};

        if (cleanup) {
          const deleted = await cleanupProcessed(cleanup.daysOld || 7);
          return res.status(200).json({ action: 'cleanup', deleted });
        }

        const result = await processOutbox({ batchSize });
        return res.status(200).json({
          action: 'process',
          ...result,
        });
      }

      case 'GET': {
        const stats = await getOutboxStats();
        return res.status(200).json(stats);
      }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    return errorResponse(res, 500, 'Outbox operation failed', error);
  }
}
