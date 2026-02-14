// pages/api/blueprint/product-ideas/index.js
// API endpoints for Blueprint Product Ideas

import { productIdeaRepository } from '../../../../lib/repositories/ProductIdeaRepository';
import { blueprintRepository } from '../../../../lib/repositories/BlueprintRepository';
import { errorResponse } from '../../../../lib/api/errorResponse';
import { EVENT_TYPES } from '../../../../lib/services/innovationEvents';
import { enqueueOutboxEvents, OUTBOX_ACTIONS } from '../../../../lib/services/outboxService';

export default async function handler(req, res) {
  const { method } = req;

  try {
    await productIdeaRepository.ensureTableExists();

    switch (method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    return errorResponse(res, 500, 'Product ideas operation failed', error);
  }
}

/**
 * GET /api/blueprint/product-ideas
 * Query params:
 *   - domainId (required): Domain UUID
 *   - initiativeId: Filter by initiative UUID
 *   - stage: Filter by stage
 *   - selectionStatus: Filter by selection status
 *   - search: Search in name/description
 *   - limit, offset: Pagination
 *   - orderBy, orderDirection: Sorting
 */
async function handleGet(req, res) {
  const {
    domainId,
    initiativeId,
    stage,
    selectionStatus,
    search,
    limit,
    offset,
    orderBy,
    orderDirection,
  } = req.query;

  if (!domainId) {
    return res.status(400).json({ error: 'domainId is required' });
  }

  const productIdeas = await productIdeaRepository.findByDomain(domainId, {
    initiativeId,
    stage,
    selectionStatus,
    search,
    limit: limit ? parseInt(limit, 10) : undefined,
    offset: offset ? parseInt(offset, 10) : undefined,
    orderBy,
    orderDirection,
  });

  return res.status(200).json(productIdeas);
}

/**
 * POST /api/blueprint/product-ideas
 * Create a new product idea
 * Body: { initiativeId, domainId, name, ... }
 */
async function handlePost(req, res) {
  const {
    initiativeId,
    domainId,
    name,
    tagline,
    description,
    stage,
    horizon,
    ideaType,
    technologyPosture,
    riskProfile,
    ownerId,
    ideaData,
    exploreData,
    assessData,
    caseData,
    canvasData,
    aiComparison,
    validationPriority,
    marketFitHypothesis,
    estimatedInvestment,
    estimatedAnnualCost,
    paybackMonths,
    costSavingsRatio,
    tags,
    customFields,
    createdBy,
  } = req.body;

  if (!initiativeId || !domainId || !name) {
    return res.status(400).json({
      error: 'initiativeId, domainId, and name are required',
    });
  }

  // Verify initiative exists
  const initiative = await blueprintRepository.findById(initiativeId);
  if (!initiative) {
    return res.status(404).json({ error: 'Initiative not found' });
  }

  const productIdea = await productIdeaRepository.create({
    initiativeId,
    domainId,
    name,
    tagline,
    description,
    stage,
    horizon,
    ideaType,
    technologyPosture,
    riskProfile,
    ownerId,
    ideaData,
    exploreData,
    assessData,
    caseData,
    canvasData,
    aiComparison,
    validationPriority,
    marketFitHypothesis,
    estimatedInvestment,
    estimatedAnnualCost,
    paybackMonths,
    costSavingsRatio,
    tags,
    customFields,
    createdBy: createdBy || 'system',
  });

  // Enqueue side effects via outbox
  enqueueOutboxEvents([
    {
      action: OUTBOX_ACTIONS.EMIT_INNOVATION_EVENT,
      entityType: 'product_idea',
      entityId: productIdea.id,
      payload: {
        domainId,
        eventType: EVENT_TYPES.PRODUCT_IDEA_CREATED,
        entityId: productIdea.id,
        entityType: 'product_idea',
        payload: {
          product_idea_id: productIdea.product_idea_id,
          initiative_id: initiativeId,
          name: productIdea.name,
          stage: productIdea.stage,
          horizon: productIdea.horizon,
        },
        actor: createdBy || 'system',
      },
    },
    {
      action: OUTBOX_ACTIONS.SYNC_PRODUCT_IDEA_TO_GRAPH,
      entityType: 'product_idea',
      entityId: productIdea.id,
      payload: productIdea,
    },
  ]).catch(err => console.error('[Outbox] Failed to enqueue:', err.message));

  return res.status(201).json(productIdea);
}
