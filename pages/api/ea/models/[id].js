// pages/api/ea/models/[id].js
// Single model operations: GET, PUT, DELETE

import { eaRepository } from '../../../../lib/repositories';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id, domainId } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Model ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const model = await eaRepository.findModelById(id);
      if (!model) {
        return res.status(404).json({ error: 'Model not found' });
      }

      // Check domain access
      if (model.domain_id) {
        const { hasAccess, error } = await checkDomainAccess(req, model.domain_id, 'view');
        if (!hasAccess) {
          return res.status(403).json({ error: error || 'Access denied' });
        }
      }

      return res.status(200).json(model);
    } catch (err) {
      console.error('Error fetching EA model:', err);
      return res.status(500).json({ error: 'Failed to fetch EA model' });
    }
  }

  if (req.method === 'PUT') {
    try {
      // First get the model to check domain access
      const existing = await eaRepository.findModelById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Model not found' });
      }

      if (existing.domain_id) {
        const { hasAccess, error } = await checkDomainAccess(req, existing.domain_id, 'edit');
        if (!hasAccess) {
          return res.status(403).json({ error: error || 'Edit access denied' });
        }
      }

      const { name, description, purpose, scope, status, version,
        linkedInitiatives, linkedProjects, linkedRequirements, folders,
        ownerId, approverId, approvedAt, reviewDate } = req.body;

      const updated = await eaRepository.updateModel(id, {
        name,
        description,
        purpose,
        scope,
        status,
        version,
        linkedInitiatives,
        linkedProjects,
        linkedRequirements,
        folders,
        ownerId,
        approverId,
        approvedAt,
        reviewDate,
      });

      if (!updated) {
        return res.status(404).json({ error: 'Model not found' });
      }

      return res.status(200).json(updated);
    } catch (err) {
      console.error('Error updating EA model:', err);
      return res.status(500).json({ error: 'Failed to update EA model' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const existing = await eaRepository.findModelById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Model not found' });
      }

      if (existing.domain_id) {
        const { hasAccess, error } = await checkDomainAccess(req, existing.domain_id, 'edit');
        if (!hasAccess) {
          return res.status(403).json({ error: error || 'Edit access denied' });
        }
      }

      const deleted = await eaRepository.deleteModel(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Model not found' });
      }

      return res.status(204).end();
    } catch (err) {
      console.error('Error deleting EA model:', err);
      return res.status(500).json({ error: 'Failed to delete EA model' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
