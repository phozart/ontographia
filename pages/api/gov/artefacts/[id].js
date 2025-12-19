/**
 * Single Governance Artefact API
 * GET: Get artefact by ID
 * PUT: Update artefact
 * DELETE: Delete artefact
 */

import { govRepository } from '../../../../lib/repositories/GovRepository';
import { getUserFromRequest, checkProjectAccess } from '../../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);
  const { id } = req.query;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Artefact ID is required' });
  }

  // ========== GET - Get artefact by ID ==========
  if (req.method === 'GET') {
    try {
      const artefact = await govRepository.findById(id);
      if (!artefact) {
        return res.status(404).json({ error: 'Artefact not found' });
      }

      const { hasAccess, error } = await checkProjectAccess(req, artefact.project_id, 'view');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      // Also get relationships
      const relationships = await govRepository.getRelationships(id);

      return res.status(200).json({ ...artefact, relationships });
    } catch (err) {
      console.error('Error fetching governance artefact:', err);
      return res.status(500).json({ error: 'Failed to fetch artefact' });
    }
  }

  // ========== PUT - Update artefact ==========
  if (req.method === 'PUT') {
    try {
      const existing = await govRepository.findById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Artefact not found' });
      }

      const { hasAccess, error } = await checkProjectAccess(req, existing.project_id, 'edit');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      const updated = await govRepository.update(id, req.body);
      return res.status(200).json(updated);
    } catch (err) {
      console.error('Error updating governance artefact:', err);
      return res.status(500).json({ error: 'Failed to update artefact' });
    }
  }

  // ========== DELETE - Delete artefact ==========
  if (req.method === 'DELETE') {
    try {
      const existing = await govRepository.findById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Artefact not found' });
      }

      const { hasAccess, error } = await checkProjectAccess(req, existing.project_id, 'delete');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      await govRepository.delete(id);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error deleting governance artefact:', err);
      return res.status(500).json({ error: 'Failed to delete artefact' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
