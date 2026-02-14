// pages/api/blueprint/product-ideas/[id]/select.js
// Select a product idea for execution

import { productIdeaRepository } from '../../../../../lib/repositories/ProductIdeaRepository';
import { errorResponse } from '../../../../../lib/api/errorResponse';
import { EVENT_TYPES } from '../../../../../lib/services/innovationEvents';
import { enqueueOutboxEvent, OUTBOX_ACTIONS } from '../../../../../lib/services/outboxService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { id } = req.query;
  const { selectedBy } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Product idea ID is required' });
  }

  try {
    await productIdeaRepository.ensureTableExists();
    const productIdea = await productIdeaRepository.findById(id);
    if (!productIdea) {
      return res.status(404).json({ error: 'Product idea not found' });
    }

    const updated = await productIdeaRepository.select(id, selectedBy || 'system');

    // Enqueue side effect via outbox
    enqueueOutboxEvent({
      action: OUTBOX_ACTIONS.EMIT_INNOVATION_EVENT,
      entityType: 'product_idea',
      entityId: id,
      payload: {
        domainId: productIdea.domain_id,
        eventType: EVENT_TYPES.PRODUCT_IDEA_SELECTED,
        entityId: id,
        entityType: 'product_idea',
        payload: {
          product_idea_id: productIdea.product_idea_id,
          name: productIdea.name,
          selection_status: updated.selection_status,
        },
        actor: selectedBy || 'system',
      },
    }).catch(err => console.error('[Outbox] Failed to enqueue:', err.message));

    return res.status(200).json(updated);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to select product idea', error);
  }
}
