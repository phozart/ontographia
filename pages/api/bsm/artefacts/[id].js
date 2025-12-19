/**
 * Business Service Management - Single Artefact API
 *
 * @route GET /api/bsm/artefacts/:id - Get single artefact
 * @route PUT /api/bsm/artefacts/:id - Update artefact
 * @route DELETE /api/bsm/artefacts/:id - Delete artefact
 *
 * @requires x-user header - User ID for authentication
 * @requires x-role header - User role for authorization
 *
 * @module pages/api/bsm/artefacts/[id]
 */

import { bsmRepository } from '../../../../lib/repositories';
import { getUserFromRequest, checkProjectAccess } from '../../../../lib/projectAccess';
import { getTypeDefinition } from '../../../../lib/bsm-types';

/**
 * Map BSM status to valid artefact status
 */
const mapBsmStatusToArtefactStatus = (bsmStatus) => {
  const mapping = {
    'draft': 'Draft',
    'planned': 'InReview',
    'active': 'Approved',
    'deprecated': 'Deprecated',
    'retired': 'Deprecated',
  };
  return mapping[bsmStatus] || 'Draft';
};

export default async function handler(req, res) {
  const { id } = req.query;
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Artefact ID required' });
  }

  // ========== GET - Fetch single artefact ==========
  if (req.method === 'GET') {
    try {
      const artefact = await bsmRepository.findByIdWithRelationships(id);

      if (!artefact) {
        return res.status(404).json({ error: 'Artefact not found' });
      }

      // Check project access
      const { hasAccess, error } = await checkProjectAccess(req, artefact.project_id, 'view');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      // Add type definition
      const typeDef = getTypeDefinition(artefact.artefact_type);

      return res.status(200).json({
        ...artefact,
        typeDef,
      });
    } catch (err) {
      console.error('Error fetching BSM artefact:', err);
      return res.status(500).json({ error: 'Failed to fetch artefact', details: err.message });
    }
  }

  // ========== PUT - Update artefact ==========
  if (req.method === 'PUT') {
    const {
      name,
      description,
      ownerId,
      tags,
      customFields,
      ...typeSpecificFields
    } = req.body;

    try {
      // First fetch the artefact to get project_id
      const existing = await bsmRepository.findById(id);

      if (!existing) {
        return res.status(404).json({ error: 'Artefact not found' });
      }

      // Check project access
      const { hasAccess, error } = await checkProjectAccess(req, existing.project_id, 'edit');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      // Get status for mapping
      const bsmStatus = typeSpecificFields.status || typeSpecificFields.bsm_status ||
        customFields?.status || customFields?.bsm_status;

      // Build update data
      const updateData = {
        ...typeSpecificFields,
      };

      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (ownerId !== undefined) updateData.ownerId = ownerId;
      if (tags !== undefined) updateData.tags = tags;
      if (customFields !== undefined) updateData.customFields = customFields;

      // Map status if changed
      if (bsmStatus) {
        updateData.status = mapBsmStatusToArtefactStatus(bsmStatus);
        updateData.bsm_status = bsmStatus;
      }

      const updated = await bsmRepository.update(id, updateData);

      return res.status(200).json(updated);
    } catch (err) {
      console.error('Error updating BSM artefact:', err);
      return res.status(500).json({ error: 'Failed to update artefact', details: err.message });
    }
  }

  // ========== DELETE - Remove artefact ==========
  if (req.method === 'DELETE') {
    try {
      // Fetch artefact first
      const existing = await bsmRepository.findById(id);

      if (!existing) {
        return res.status(404).json({ error: 'Artefact not found' });
      }

      // Check project access
      const { hasAccess, error } = await checkProjectAccess(req, existing.project_id, 'delete');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      await bsmRepository.delete(id);

      return res.status(200).json({ success: true, id });
    } catch (err) {
      console.error('Error deleting BSM artefact:', err);
      return res.status(500).json({ error: 'Failed to delete artefact', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
