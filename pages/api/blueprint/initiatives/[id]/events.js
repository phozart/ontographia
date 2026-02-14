// pages/api/blueprint/initiatives/[id]/events.js
// Audit trail API — returns innovation events for a specific initiative

import { blueprintRepository } from '../../../../../lib/repositories';
import { getUserFromRequest, checkDomainAccess } from '../../../../../lib/projectAccess';
import { getEventsByEntity, getEventCount } from '../../../../../lib/services/innovationEvents';
import { errorResponse } from '../../../../../lib/api/errorResponse';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, eventType, limit, offset } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Initiative ID is required' });
  }

  try {
    // Verify initiative exists and user has access
    const initiative = await blueprintRepository.findById(id);
    if (!initiative) {
      return res.status(404).json({ error: 'Initiative not found' });
    }

    if (initiative.domain_id) {
      const { hasAccess, error } = await checkDomainAccess(req, initiative.domain_id, 'view');
      if (!hasAccess) {
        return res.status(403).json({ error: error || 'Access denied' });
      }
    }

    const [events, total] = await Promise.all([
      getEventsByEntity(id, {
        eventType,
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0,
      }),
      getEventCount(id),
    ]);

    return res.status(200).json({
      events,
      total,
      initiative_id: initiative.initiative_id,
      name: initiative.name,
    });
  } catch (err) {
    return errorResponse(res, 500, 'Failed to fetch initiative events', err);
  }
}
