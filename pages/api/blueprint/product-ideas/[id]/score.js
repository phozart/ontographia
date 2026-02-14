// pages/api/blueprint/product-ideas/[id]/score.js
// Update scoring for a product idea

import { productIdeaRepository } from '../../../../../lib/repositories/ProductIdeaRepository';
import { errorResponse } from '../../../../../lib/api/errorResponse';
import { emitEvent, EVENT_TYPES } from '../../../../../lib/services/innovationEvents';

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
    const productIdea = await productIdeaRepository.findById(id);
    if (!productIdea) {
      return res.status(404).json({ error: 'Product idea not found' });
    }

    const updated = await productIdeaRepository.updateScoring(id, scores);

    // Emit event (fire-and-forget)
    emitEvent({
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
      actor: null, // score API doesn't currently extract user
    }).catch(err => console.error('[Events] Failed to emit ScoreUpdated:', err.message));

    return res.status(200).json(updated);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to update scoring', error);
  }
}
