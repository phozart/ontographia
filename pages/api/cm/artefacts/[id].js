// pages/api/cm/artefacts/[id].js
// Change Management - Single artefact CRUD API

import { cmRepository } from '../../../../lib/repositories';
import { getUserFromRequest, checkProjectAccess } from '../../../../lib/projectAccess';
import { mapCMStatusToArtefactStatus } from '../../../../lib/cm-types';

export default async function handler(req, res) {
  const { id } = req.query;
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Artefact ID required' });
  }

  if (req.method === 'GET') {
    try {
      const artefact = await cmRepository.findCMArtefactById(id);

      if (!artefact) {
        return res.status(404).json({ error: 'CM artefact not found' });
      }

      const { hasAccess, error } = await checkProjectAccess(req, artefact.project_id, 'view');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      return res.status(200).json(artefact);
    } catch (err) {
      console.error('Error fetching CM artefact:', err);
      return res.status(500).json({ error: 'Failed to fetch artefact' });
    }
  }

  if (req.method === 'PUT') {
    const {
      name,
      description,
      status,
      ownerId,
      tags,
      customFields,
      ...typeSpecificFields
    } = req.body;

    try {
      const current = await cmRepository.findCMArtefactById(id);

      if (!current) {
        return res.status(404).json({ error: 'CM artefact not found' });
      }

      const { hasAccess, error } = await checkProjectAccess(req, current.project_id, 'edit');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      const mergedCustomFields = {
        ...(customFields || {}),
        ...typeSpecificFields,
      };

      const artefactStatus = status ? mapCMStatusToArtefactStatus(status) : null;

      const updated = await cmRepository.updateCMArtefact(id, {
        name,
        description,
        status: artefactStatus,
        ownerId,
        tags,
        customFields: mergedCustomFields,
      });

      return res.status(200).json(updated);
    } catch (err) {
      console.error('Error updating CM artefact:', err);
      return res.status(500).json({ error: 'Failed to update artefact' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const current = await cmRepository.findCMArtefactById(id);

      if (!current) {
        return res.status(404).json({ error: 'CM artefact not found' });
      }

      const { hasAccess, error } = await checkProjectAccess(req, current.project_id, 'delete');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      await cmRepository.deleteCMArtefact(id);

      return res.status(200).json({ success: true, message: 'Artefact deleted' });
    } catch (err) {
      console.error('Error deleting CM artefact:', err);
      return res.status(500).json({ error: 'Failed to delete artefact' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
