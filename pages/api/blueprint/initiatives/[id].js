// pages/api/blueprint/initiatives/[id].js
// Single initiative operations: GET, PUT, DELETE
// Task BP-010

import { blueprintRepository } from '../../../../lib/repositories';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';
import { BPS_HORIZONS } from '../../../../lib/blueprint-types';
import { emitEvent, EVENT_TYPES } from '../../../../lib/services/innovationEvents';
import { syncInitiativeToGraph, removeGraphNode } from '../../../../lib/services/blueprintGraphSync';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Initiative ID is required' });
  }

  // GET - Fetch single initiative
  if (req.method === 'GET') {
    try {
      const initiative = await blueprintRepository.findById(id);
      if (!initiative) {
        return res.status(404).json({ error: 'Initiative not found' });
      }

      // Check domain access
      if (initiative.domain_id) {
        const { hasAccess, error } = await checkDomainAccess(req, initiative.domain_id, 'view');
        if (!hasAccess) {
          return res.status(403).json({ error: error || 'Access denied' });
        }
      }

      return res.status(200).json(initiative);
    } catch (err) {
      console.error('Error fetching initiative:', err);
      return res.status(500).json({ error: 'Failed to fetch initiative' });
    }
  }

  // PUT - Update initiative
  if (req.method === 'PUT') {
    try {
      const existing = await blueprintRepository.findById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Initiative not found' });
      }

      // Check domain edit access
      if (existing.domain_id) {
        const { hasAccess, error } = await checkDomainAccess(req, existing.domain_id, 'edit');
        if (!hasAccess) {
          return res.status(403).json({ error: error || 'Edit access denied' });
        }
      }

      const {
        name,
        description,
        horizon,
        track,
        ownerId,
        sponsorId,
        ideaData,
        exploreData,
        assessData,
        caseData,
        approvalData,
        tags,
        customFields,
      } = req.body;

      // Validate horizon if provided
      if (horizon && !Object.keys(BPS_HORIZONS).includes(horizon)) {
        return res.status(400).json({
          error: `Invalid horizon. Valid horizons: ${Object.keys(BPS_HORIZONS).join(', ')}`,
        });
      }

      const updated = await blueprintRepository.update(id, {
        name,
        description,
        horizon,
        track,
        ownerId,
        sponsorId,
        ideaData,
        exploreData,
        assessData,
        caseData,
        approvalData,
        tags,
        customFields,
      });

      if (!updated) {
        return res.status(404).json({ error: 'Initiative not found' });
      }

      // Emit event (fire-and-forget)
      emitEvent({
        domainId: existing.domain_id,
        eventType: EVENT_TYPES.INITIATIVE_UPDATED,
        entityId: id,
        entityType: 'initiative',
        payload: {
          fields_changed: Object.keys(req.body).filter(k => req.body[k] !== undefined),
          name: updated.name,
          stage: updated.stage,
        },
        previousState: {
          name: existing.name,
          horizon: existing.horizon,
          stage: existing.stage,
        },
        actor: user,
      }).catch(err => console.error('[Events] Failed to emit InitiativeUpdated:', err.message));

      // Sync to knowledge graph (fire-and-forget)
      syncInitiativeToGraph(updated)
        .catch(err => console.error('[GraphSync] Failed to sync initiative:', err.message));

      return res.status(200).json(updated);
    } catch (err) {
      console.error('Error updating initiative:', err);
      return res.status(500).json({ error: 'Failed to update initiative' });
    }
  }

  // DELETE - Delete initiative
  if (req.method === 'DELETE') {
    try {
      const existing = await blueprintRepository.findById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Initiative not found' });
      }

      // Check domain edit access
      if (existing.domain_id) {
        const { hasAccess, error } = await checkDomainAccess(req, existing.domain_id, 'edit');
        if (!hasAccess) {
          return res.status(403).json({ error: error || 'Edit access denied' });
        }
      }

      const deleted = await blueprintRepository.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Initiative not found' });
      }

      // Emit event (fire-and-forget)
      emitEvent({
        domainId: existing.domain_id,
        eventType: EVENT_TYPES.INITIATIVE_DELETED,
        entityId: id,
        entityType: 'initiative',
        payload: {
          initiative_id: existing.initiative_id,
          name: existing.name,
          stage: existing.stage,
        },
        actor: user,
      }).catch(err => console.error('[Events] Failed to emit InitiativeDeleted:', err.message));

      // Remove from knowledge graph (fire-and-forget)
      removeGraphNode(id)
        .catch(err => console.error('[GraphSync] Failed to remove graph node:', err.message));

      return res.status(204).end();
    } catch (err) {
      console.error('Error deleting initiative:', err);
      return res.status(500).json({ error: 'Failed to delete initiative' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
