// pages/api/blueprint/initiatives/index.js
// CRUD API for Blueprint Initiatives
// Tasks BP-010, BP-011, BP-014, BP-015

import { blueprintRepository } from '../../../../lib/repositories';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';
import { BPS_STAGES, BPS_HORIZONS } from '../../../../lib/blueprint-types';
import { EVENT_TYPES } from '../../../../lib/services/innovationEvents';
import { enqueueOutboxEvents, OUTBOX_ACTIONS } from '../../../../lib/services/outboxService';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { domainId } = req.query;

  if (!domainId) {
    return res.status(400).json({ error: 'domainId is required' });
  }

  const { hasAccess, error } = await checkDomainAccess(req, domainId, 'view');
  if (!hasAccess) {
    return res.status(403).json({ error: error || 'Access denied' });
  }

  // GET - List initiatives
  if (req.method === 'GET') {
    try {
      const {
        stage,
        horizon,
        ownerId,
        search,
        limit,
        offset,
        orderBy,
        orderDirection,
      } = req.query;

      // Validate stage if provided
      if (stage && !BPS_STAGES.includes(stage)) {
        return res.status(400).json({
          error: `Invalid stage. Valid stages: ${BPS_STAGES.join(', ')}`,
        });
      }

      // Validate horizon if provided
      if (horizon && !Object.keys(BPS_HORIZONS).includes(horizon)) {
        return res.status(400).json({
          error: `Invalid horizon. Valid horizons: ${Object.keys(BPS_HORIZONS).join(', ')}`,
        });
      }

      const initiatives = await blueprintRepository.findByDomain(domainId, {
        stage,
        horizon,
        ownerId,
        search,
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
        orderBy,
        orderDirection,
      });

      // Get total count for pagination
      const allInitiatives = await blueprintRepository.findByDomain(domainId, {
        stage,
        horizon,
        ownerId,
        search,
      });

      return res.status(200).json({
        initiatives,
        total: allInitiatives.length,
        limit: limit ? parseInt(limit, 10) : null,
        offset: offset ? parseInt(offset, 10) : 0,
      });
    } catch (err) {
      console.error('Error fetching initiatives:', err);
      return res.status(500).json({ error: 'Failed to fetch initiatives' });
    }
  }

  // POST - Create initiative
  if (req.method === 'POST') {
    const { hasAccess: editAccess, error: editError } = await checkDomainAccess(req, domainId, 'edit');
    if (!editAccess) {
      return res.status(403).json({ error: editError || 'Edit access denied' });
    }

    const {
      name,
      description,
      stage,
      horizon,
      track,
      projectId,
      ownerId,
      sponsorId,
      ideaData,
      exploreData,
      assessData,
      caseData,
      tags,
      customFields,
    } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }

    // Validate stage if provided
    if (stage && !BPS_STAGES.includes(stage)) {
      return res.status(400).json({
        error: `Invalid stage. Valid stages: ${BPS_STAGES.join(', ')}`,
      });
    }

    // Validate horizon if provided
    if (horizon && !Object.keys(BPS_HORIZONS).includes(horizon)) {
      return res.status(400).json({
        error: `Invalid horizon. Valid horizons: ${Object.keys(BPS_HORIZONS).join(', ')}`,
      });
    }

    try {
      // Validate track if provided
      const validTracks = ['full', 'xpress', 'lite'];
      if (track && !validTracks.includes(track)) {
        return res.status(400).json({
          error: `Invalid track. Valid tracks: ${validTracks.join(', ')}`,
        });
      }

      const initiative = await blueprintRepository.create({
        domainId,
        projectId,
        name: name.trim(),
        description,
        stage: stage || 'idea',
        horizon,
        track: track || 'full',
        submitterId: user,
        ownerId,
        sponsorId,
        ideaData,
        exploreData,
        assessData,
        caseData,
        tags,
        customFields,
        createdBy: user,
      });

      // Enqueue side effects via outbox (retryable, monitored)
      enqueueOutboxEvents([
        {
          action: OUTBOX_ACTIONS.EMIT_INNOVATION_EVENT,
          entityType: 'initiative',
          entityId: initiative.id,
          payload: {
            domainId,
            eventType: EVENT_TYPES.INITIATIVE_CREATED,
            entityId: initiative.id,
            entityType: 'initiative',
            payload: {
              initiative_id: initiative.initiative_id,
              name: initiative.name,
              stage: initiative.stage,
              horizon: initiative.horizon,
            },
            actor: user,
          },
        },
        {
          action: OUTBOX_ACTIONS.SYNC_INITIATIVE_TO_GRAPH,
          entityType: 'initiative',
          entityId: initiative.id,
          payload: initiative,
        },
      ]).catch(err => console.error('[Outbox] Failed to enqueue:', err.message));

      return res.status(201).json(initiative);
    } catch (err) {
      console.error('Error creating initiative:', err);
      return res.status(500).json({ error: 'Failed to create initiative' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
