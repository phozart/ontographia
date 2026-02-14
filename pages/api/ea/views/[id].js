// pages/api/ea/views/[id].js
// Single view operations: GET, PUT, DELETE

import { eaRepository } from '../../../../lib/repositories';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'View ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const view = await eaRepository.findViewById(id);
      if (!view) {
        return res.status(404).json({ error: 'View not found' });
      }

      if (view.domain_id) {
        const { hasAccess, error } = await checkDomainAccess(req, view.domain_id, 'view');
        if (!hasAccess) {
          return res.status(403).json({ error: error || 'Access denied' });
        }
      }

      return res.status(200).json(view);
    } catch (err) {
      console.error('Error fetching EA view:', err);
      return res.status(500).json({ error: 'Failed to fetch EA view' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const existing = await eaRepository.findViewById(id);
      if (!existing) {
        return res.status(404).json({ error: 'View not found' });
      }

      if (existing.domain_id) {
        const { hasAccess, error } = await checkDomainAccess(req, existing.domain_id, 'edit');
        if (!hasAccess) {
          return res.status(403).json({ error: error || 'Edit access denied' });
        }
      }

      const { name, description, status, elements, relationships, groups, notes,
        canvasWidth, canvasHeight, gridSize, snapToGrid, zoom, ownerId } = req.body;

      const updated = await eaRepository.updateView(id, {
        name,
        description,
        status,
        elements,
        relationships,
        groups,
        notes,
        canvasWidth,
        canvasHeight,
        gridSize,
        snapToGrid,
        zoom,
        ownerId,
      });

      if (!updated) {
        return res.status(404).json({ error: 'View not found' });
      }

      return res.status(200).json(updated);
    } catch (err) {
      console.error('Error updating EA view:', err);
      return res.status(500).json({ error: 'Failed to update EA view' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const existing = await eaRepository.findViewById(id);
      if (!existing) {
        return res.status(404).json({ error: 'View not found' });
      }

      if (existing.domain_id) {
        const { hasAccess, error } = await checkDomainAccess(req, existing.domain_id, 'edit');
        if (!hasAccess) {
          return res.status(403).json({ error: error || 'Edit access denied' });
        }
      }

      const deleted = await eaRepository.deleteView(id);
      if (!deleted) {
        return res.status(404).json({ error: 'View not found' });
      }

      return res.status(204).end();
    } catch (err) {
      console.error('Error deleting EA view:', err);
      return res.status(500).json({ error: 'Failed to delete EA view' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
