// pages/api/blueprint/product-ideas/[id]/advance.js
// Advance a product idea to the next stage

import { productIdeaRepository } from '../../../../../lib/repositories/ProductIdeaRepository';
import { errorResponse } from '../../../../../lib/api/errorResponse';
import { EVENT_TYPES } from '../../../../../lib/services/innovationEvents';
import { enqueueOutboxEvents, OUTBOX_ACTIONS } from '../../../../../lib/services/outboxService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { id } = req.query;
  const { decision, decisionBy, notes, conditions } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Product idea ID is required' });
  }

  try {
    await productIdeaRepository.ensureTableExists();
    const productIdea = await productIdeaRepository.findById(id);
    if (!productIdea) {
      return res.status(404).json({ error: 'Product idea not found' });
    }

    const updated = await productIdeaRepository.advanceStage(id, {
      decision: decision || 'approved',
      decisionBy,
      notes,
      conditions,
    });

    // Enqueue side effects via outbox
    enqueueOutboxEvents([
      {
        action: OUTBOX_ACTIONS.EMIT_INNOVATION_EVENT,
        entityType: 'product_idea',
        entityId: id,
        payload: {
          domainId: productIdea.domain_id,
          eventType: EVENT_TYPES.STAGE_ADVANCED,
          entityId: id,
          entityType: 'product_idea',
          payload: {
            product_idea_id: productIdea.product_idea_id,
            name: productIdea.name,
            from_stage: productIdea.stage,
            to_stage: updated.stage,
            decision: decision || 'approved',
            notes: notes || null,
          },
          previousState: {
            stage: productIdea.stage,
          },
          actor: decisionBy || 'system',
        },
      },
      {
        action: OUTBOX_ACTIONS.SYNC_PRODUCT_IDEA_TO_GRAPH,
        entityType: 'product_idea',
        entityId: id,
        payload: updated,
      },
    ]).catch(err => console.error('[Outbox] Failed to enqueue:', err.message));

    return res.status(200).json(updated);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to advance product idea stage', error);
  }
}
