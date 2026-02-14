// pages/api/blueprint/product-ideas/[id]/advance.js
// Advance a product idea to the next stage

import { productIdeaRepository } from '../../../../../lib/repositories/ProductIdeaRepository';
import { errorResponse } from '../../../../../lib/api/errorResponse';
import { emitEvent, EVENT_TYPES } from '../../../../../lib/services/innovationEvents';
import { syncProductIdeaToGraph } from '../../../../../lib/services/blueprintGraphSync';

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

    // Emit event (fire-and-forget)
    emitEvent({
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
    }).catch(err => console.error('[Events] Failed to emit product idea StageAdvanced:', err.message));

    // Sync updated stage to graph (fire-and-forget)
    syncProductIdeaToGraph(updated)
      .catch(err => console.error('[GraphSync] Failed to sync product idea:', err.message));

    return res.status(200).json(updated);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to advance product idea stage', error);
  }
}
