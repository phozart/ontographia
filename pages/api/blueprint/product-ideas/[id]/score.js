// pages/api/blueprint/product-ideas/[id]/score.js
// Update scoring for a product idea

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
  const { scores } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Product idea ID is required' });
  }

  if (!scores || typeof scores !== 'object') {
    return res.status(400).json({ error: 'scores object is required' });
  }

  try {
    await productIdeaRepository.ensureTableExists();
    const productIdea = await productIdeaRepository.findById(id);
    if (!productIdea) {
      return res.status(404).json({ error: 'Product idea not found' });
    }

    const updated = await productIdeaRepository.updateScoring(id, scores);

    // Enqueue side effect via outbox
    enqueueOutboxEvent({
      action: OUTBOX_ACTIONS.EMIT_INNOVATION_EVENT,
      entityType: 'product_idea',
      entityId: id,
      payload: {
        domainId: productIdea.domain_id,
        eventType: EVENT_TYPES.SCORE_UPDATED,
        entityId: id,
        entityType: 'product_idea',
        payload: {
          product_idea_id: productIdea.product_idea_id,
          name: productIdea.name,
          initiative_id: productIdea.initiative_id,
          scores_updated: Object.keys(scores),
        },
        previousState: {
          assess_data: productIdea.assess_data,
        },
        actor: null,
      },
    }).catch(err => console.error('[Outbox] Failed to enqueue:', err.message));

    return res.status(200).json(updated);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to update scoring', error);
  }
}
