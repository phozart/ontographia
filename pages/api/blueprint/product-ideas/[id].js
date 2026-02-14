// pages/api/blueprint/product-ideas/[id].js
// API endpoints for individual Product Idea operations

import { productIdeaRepository } from '../../../../lib/repositories/ProductIdeaRepository';
import { errorResponse } from '../../../../lib/api/errorResponse';
import { emitEvent, EVENT_TYPES } from '../../../../lib/services/innovationEvents';
import { syncProductIdeaToGraph, removeGraphNode } from '../../../../lib/services/blueprintGraphSync';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Product idea ID is required' });
  }

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res, id);
      case 'PUT':
        return handlePut(req, res, id);
      case 'DELETE':
        return handleDelete(req, res, id);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    return errorResponse(res, 500, 'Product idea operation failed', error);
  }
}

/**
 * GET /api/blueprint/product-ideas/[id]
 * Get a single product idea by ID (UUID or display ID)
 */
async function handleGet(req, res, id) {
  // Try UUID first, then display ID
  let productIdea = await productIdeaRepository.findById(id);

  if (!productIdea) {
    // Try display ID (PI-xxx)
    productIdea = await productIdeaRepository.findByDisplayId(id);
  }

  if (!productIdea) {
    return res.status(404).json({ error: 'Product idea not found' });
  }

  return res.status(200).json(productIdea);
}

/**
 * PUT /api/blueprint/product-ideas/[id]
 * Update a product idea
 */
async function handlePut(req, res, id) {
  const productIdea = await productIdeaRepository.findById(id);
  if (!productIdea) {
    return res.status(404).json({ error: 'Product idea not found' });
  }

  const updated = await productIdeaRepository.update(id, req.body);

  // Emit event (fire-and-forget)
  emitEvent({
    domainId: productIdea.domain_id,
    eventType: EVENT_TYPES.PRODUCT_IDEA_UPDATED,
    entityId: id,
    entityType: 'product_idea',
    payload: {
      product_idea_id: productIdea.product_idea_id,
      fields_changed: Object.keys(req.body).filter(k => req.body[k] !== undefined),
      name: updated.name,
    },
    previousState: {
      name: productIdea.name,
      stage: productIdea.stage,
    },
  }).catch(err => console.error('[Events] Failed to emit ProductIdeaUpdated:', err.message));

  // Sync to knowledge graph (fire-and-forget)
  syncProductIdeaToGraph(updated)
    .catch(err => console.error('[GraphSync] Failed to sync product idea:', err.message));

  return res.status(200).json(updated);
}

/**
 * DELETE /api/blueprint/product-ideas/[id]
 * Delete a product idea
 */
async function handleDelete(req, res, id) {
  const productIdea = await productIdeaRepository.findById(id);
  if (!productIdea) {
    return res.status(404).json({ error: 'Product idea not found' });
  }

  await productIdeaRepository.delete(id);

  // Emit event (fire-and-forget)
  emitEvent({
    domainId: productIdea.domain_id,
    eventType: EVENT_TYPES.PRODUCT_IDEA_UPDATED,
    entityId: id,
    entityType: 'product_idea',
    payload: {
      product_idea_id: productIdea.product_idea_id,
      name: productIdea.name,
      action: 'deleted',
    },
  }).catch(err => console.error('[Events] Failed to emit ProductIdeaDeleted:', err.message));

  // Remove from knowledge graph (fire-and-forget)
  removeGraphNode(id)
    .catch(err => console.error('[GraphSync] Failed to remove product idea graph node:', err.message));

  return res.status(200).json({ success: true, id });
}
