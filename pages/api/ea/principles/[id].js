// pages/api/ea/principles/[id].js
// Single principle operations: GET, PUT, DELETE

import { eaRepository } from '../../../../lib/repositories';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Principle ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const principle = await eaRepository.findPrincipleById(id);
      if (!principle) {
        return res.status(404).json({ error: 'Principle not found' });
      }

      if (principle.domain_id) {
        const { hasAccess, error } = await checkDomainAccess(req, principle.domain_id, 'view');
        if (!hasAccess) {
          return res.status(403).json({ error: error || 'Access denied' });
        }
      }

      return res.status(200).json(principle);
    } catch (err) {
      console.error('Error fetching principle:', err);
      return res.status(500).json({ error: 'Failed to fetch principle' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const existing = await eaRepository.findPrincipleById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Principle not found' });
      }

      if (existing.domain_id) {
        const { hasAccess, error } = await checkDomainAccess(req, existing.domain_id, 'edit');
        if (!hasAccess) {
          return res.status(403).json({ error: error || 'Edit access denied' });
        }
      }

      const {
        name, category, priority, statement, rationale, implications,
        status, effectiveDate, reviewDate, ownerId, approvedBy, approvedAt,
        supportsGoals, constrainsElements, exceptions
      } = req.body;

      const updated = await eaRepository.updatePrinciple(id, {
        name,
        category,
        priority,
        statement,
        rationale,
        implications,
        status,
        effectiveDate,
        reviewDate,
        ownerId,
        approvedBy,
        approvedAt,
        supportsGoals,
        constrainsElements,
        exceptions,
      });

      if (!updated) {
        return res.status(404).json({ error: 'Principle not found' });
      }

      return res.status(200).json(updated);
    } catch (err) {
      console.error('Error updating principle:', err);
      return res.status(500).json({ error: 'Failed to update principle' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const existing = await eaRepository.findPrincipleById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Principle not found' });
      }

      if (existing.domain_id) {
        const { hasAccess, error } = await checkDomainAccess(req, existing.domain_id, 'edit');
        if (!hasAccess) {
          return res.status(403).json({ error: error || 'Edit access denied' });
        }
      }

      const deleted = await eaRepository.deletePrinciple(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Principle not found' });
      }

      return res.status(204).end();
    } catch (err) {
      console.error('Error deleting principle:', err);
      return res.status(500).json({ error: 'Failed to delete principle' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
