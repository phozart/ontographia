// pages/api/ea/roadmaps/index.js
// CRUD API for EA Architecture Roadmaps

import { eaRepository } from '../../../../lib/repositories';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { domainId, modelId, status } = req.query;

  if (!domainId) {
    return res.status(400).json({ error: 'domainId is required' });
  }

  const { hasAccess, error } = await checkDomainAccess(req, domainId, 'view');
  if (!hasAccess) {
    return res.status(403).json({ error: error || 'Access denied' });
  }

  if (req.method === 'GET') {
    try {
      const roadmaps = await eaRepository.findAllRoadmaps(domainId, { modelId, status });
      return res.status(200).json(roadmaps);
    } catch (err) {
      console.error('Error fetching roadmaps:', err);
      return res.status(500).json({ error: 'Failed to fetch roadmaps' });
    }
  }

  if (req.method === 'POST') {
    const { hasAccess: editAccess, error: editError } = await checkDomainAccess(req, domainId, 'edit');
    if (!editAccess) {
      return res.status(403).json({ error: editError || 'Edit access denied' });
    }

    const {
      modelId: mId, name, description, startDate, endDate,
      baseline, target, transitionStates, gaps, workPackages,
      displayOptions, status: roadmapStatus, ownerId, linkedInitiatives
    } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ error: 'name, startDate, and endDate are required' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    if (start >= end) {
      return res.status(400).json({ error: 'startDate must be before endDate' });
    }

    try {
      const roadmap = await eaRepository.createRoadmap({
        domainId,
        modelId: mId,
        name,
        description,
        startDate,
        endDate,
        baseline,
        target,
        transitionStates,
        gaps,
        workPackages,
        displayOptions,
        status: roadmapStatus,
        ownerId,
        linkedInitiatives,
        createdBy: user,
      });
      return res.status(201).json(roadmap);
    } catch (err) {
      console.error('Error creating roadmap:', err);
      return res.status(500).json({ error: 'Failed to create roadmap' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
