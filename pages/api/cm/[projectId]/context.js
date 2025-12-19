// pages/api/cm/[projectId]/context.js
// Change Management - Context CRUD endpoint

import { cmRepository } from '../../../../lib/repositories';
import { getUserFromRequest, checkProjectAccess } from '../../../../lib/projectAccess';

export default async function handler(req, res) {
  const { projectId } = req.query;
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!projectId) {
    return res.status(400).json({ error: 'Project ID required' });
  }

  if (req.method === 'POST') {
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'create');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const {
      title,
      changeStatement,
      businessDriver,
      desiredFutureState,
      currentStateSummary,
      changeType,
      ownerId,
      sponsorId,
      startDate,
      targetDate,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    try {
      const context = await cmRepository.createContext(projectId, {
        title,
        changeStatement,
        businessDriver,
        desiredFutureState,
        currentStateSummary,
        changeType,
        ownerId,
        sponsorId,
        startDate,
        targetDate,
      }, user);

      return res.status(201).json(context);
    } catch (err) {
      if (err.message === 'CONTEXT_EXISTS') {
        return res.status(409).json({ error: 'Change context already exists. Use PUT to update.' });
      }
      console.error('Error creating change context:', err);
      return res.status(500).json({ error: 'Failed to create change context' });
    }
  }

  if (req.method === 'PUT') {
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const {
      title,
      changeStatement,
      businessDriver,
      desiredFutureState,
      currentStateSummary,
      changeType,
      ownerId,
      sponsorId,
      startDate,
      targetDate,
    } = req.body;

    try {
      const context = await cmRepository.updateContext(projectId, {
        title,
        changeStatement,
        businessDriver,
        desiredFutureState,
        currentStateSummary,
        changeType,
        ownerId,
        sponsorId,
        startDate,
        targetDate,
      });

      if (!context) {
        return res.status(404).json({ error: 'Change context not found' });
      }

      return res.status(200).json(context);
    } catch (err) {
      console.error('Error updating change context:', err);
      return res.status(500).json({ error: 'Failed to update change context' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
