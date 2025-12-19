// pages/api/artefacts/[id].js
// Get, update, delete single artefact with access control

import { getUserFromRequest, checkArtefactAccess } from '../../../lib/projectAccess';
import { artefactRepository } from '../../../lib/repositories';

export default async function handler(req, res) {
  const { id } = req.query;
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Artefact ID required' });
  }

  if (req.method === 'GET') {
    // Get single artefact with relationships
    const { hasAccess, error } = await checkArtefactAccess(req, id, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const artefact = await artefactRepository.findByIdWithRelationships(id);
      if (!artefact) {
        return res.status(404).json({ error: 'Artefact not found' });
      }
      return res.status(200).json(artefact);
    } catch (err) {
      console.error('Error fetching artefact:', err);
      return res.status(500).json({ error: 'Failed to fetch artefact' });
    }
  }

  if (req.method === 'PUT') {
    // Update artefact
    const { hasAccess, error } = await checkArtefactAccess(req, id, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    // Check if trying to approve - need approve permission
    if (req.body.status === 'Approved') {
      const { hasAccess: canApprove, error: approveError } = await checkArtefactAccess(req, id, 'approve');
      if (!canApprove) {
        return res.status(403).json({ error: approveError || 'Insufficient permissions to approve' });
      }
    }

    try {
      const artefact = await artefactRepository.updateArtefact(id, req.body);
      if (!artefact) {
        return res.status(404).json({ error: 'Artefact not found' });
      }
      return res.status(200).json(artefact);
    } catch (err) {
      console.error('Error updating artefact:', err);
      return res.status(500).json({ error: 'Failed to update artefact' });
    }
  }

  if (req.method === 'DELETE') {
    // Delete artefact
    const { hasAccess, error } = await checkArtefactAccess(req, id, 'delete');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const deleted = await artefactRepository.deleteArtefact(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Artefact not found' });
      }
      return res.status(200).json({ success: true });
    } catch (err) {
      if (err.message.includes('Approved artefacts')) {
        return res.status(400).json({ error: err.message });
      }
      console.error('Error deleting artefact:', err);
      return res.status(500).json({ error: 'Failed to delete artefact' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
