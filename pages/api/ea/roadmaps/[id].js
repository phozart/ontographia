// pages/api/ea/roadmaps/[id].js
// Single roadmap operations: GET, PUT, DELETE

import { eaRepository } from '../../../../lib/repositories';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Roadmap ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const roadmap = await eaRepository.findRoadmapById(id);
      if (!roadmap) {
        return res.status(404).json({ error: 'Roadmap not found' });
      }

      if (roadmap.domain_id) {
        const { hasAccess, error } = await checkDomainAccess(req, roadmap.domain_id, 'view');
        if (!hasAccess) {
          return res.status(403).json({ error: error || 'Access denied' });
        }
      }

      return res.status(200).json(roadmap);
    } catch (err) {
      console.error('Error fetching roadmap:', err);
      return res.status(500).json({ error: 'Failed to fetch roadmap' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const existing = await eaRepository.findRoadmapById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Roadmap not found' });
      }

      if (existing.domain_id) {
        const { hasAccess, error } = await checkDomainAccess(req, existing.domain_id, 'edit');
        if (!hasAccess) {
          return res.status(403).json({ error: error || 'Edit access denied' });
        }
      }

      const {
        name, description, startDate, endDate, baseline, target,
        transitionStates, gaps, workPackages, displayOptions,
        status, ownerId, linkedInitiatives
      } = req.body;

      // Validate dates if provided
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
          return res.status(400).json({ error: 'startDate must be before endDate' });
        }
      }

      const updated = await eaRepository.updateRoadmap(id, {
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
        status,
        ownerId,
        linkedInitiatives,
      });

      if (!updated) {
        return res.status(404).json({ error: 'Roadmap not found' });
      }

      return res.status(200).json(updated);
    } catch (err) {
      console.error('Error updating roadmap:', err);
      return res.status(500).json({ error: 'Failed to update roadmap' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const existing = await eaRepository.findRoadmapById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Roadmap not found' });
      }

      if (existing.domain_id) {
        const { hasAccess, error } = await checkDomainAccess(req, existing.domain_id, 'edit');
        if (!hasAccess) {
          return res.status(403).json({ error: error || 'Edit access denied' });
        }
      }

      const deleted = await eaRepository.deleteRoadmap(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Roadmap not found' });
      }

      return res.status(204).end();
    } catch (err) {
      console.error('Error deleting roadmap:', err);
      return res.status(500).json({ error: 'Failed to delete roadmap' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
