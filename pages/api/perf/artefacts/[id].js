/**
 * Performance Artefact Detail API
 * GET: Get single artefact
 * PUT: Update artefact
 * DELETE: Delete artefact
 */

import { perfRepository } from '../../../../lib/repositories/PerfRepository';
import { getUserFromRequest, checkProjectAccess } from '../../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);
  const { id } = req.query;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!id) {
    return res.status(400).json({ error: 'id is required' });
  }

  // ========== GET - Get single artefact ==========
  if (req.method === 'GET') {
    try {
      const artefact = await perfRepository.findById(id);
      if (!artefact) {
        return res.status(404).json({ error: 'Artefact not found' });
      }
      return res.status(200).json(artefact);
    } catch (err) {
      console.error('Error fetching performance artefact:', err);
      return res.status(500).json({ error: 'Failed to fetch artefact' });
    }
  }

  // ========== PUT - Update artefact ==========
  if (req.method === 'PUT') {
    try {
      const artefact = await perfRepository.update(id, req.body);
      if (!artefact) {
        return res.status(404).json({ error: 'Artefact not found' });
      }
      return res.status(200).json(artefact);
    } catch (err) {
      console.error('Error updating performance artefact:', err);
      return res.status(500).json({ error: 'Failed to update artefact' });
    }
  }

  // ========== DELETE - Delete artefact ==========
  if (req.method === 'DELETE') {
    try {
      const deleted = await perfRepository.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Artefact not found' });
      }
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error deleting performance artefact:', err);
      return res.status(500).json({ error: 'Failed to delete artefact' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
