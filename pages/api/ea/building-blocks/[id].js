// pages/api/ea/building-blocks/[id].js
// Single building block operations: GET, PUT, DELETE

import { eaRepository } from '../../../../lib/repositories';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Building block ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const block = await eaRepository.findBuildingBlockById(id);
      if (!block) {
        return res.status(404).json({ error: 'Building block not found' });
      }

      if (block.domain_id) {
        const { hasAccess, error } = await checkDomainAccess(req, block.domain_id, 'view');
        if (!hasAccess) {
          return res.status(403).json({ error: error || 'Access denied' });
        }
      }

      return res.status(200).json(block);
    } catch (err) {
      console.error('Error fetching building block:', err);
      return res.status(500).json({ error: 'Failed to fetch building block' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const existing = await eaRepository.findBuildingBlockById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Building block not found' });
      }

      if (existing.domain_id) {
        const { hasAccess, error } = await checkDomainAccess(req, existing.domain_id, 'edit');
        if (!hasAccess) {
          return res.status(403).json({ error: error || 'Edit access denied' });
        }
      }

      const {
        name, description, category, purpose, keyFeatures, interfaces, conformsTo,
        whenToUse, whenNotToUse, considerations, realizesAbbId, implementationType,
        vendor, productName, productVersion, technologyStack, deploymentModel,
        sbbInterfaces, usedInApplications, licensingModel, estimatedCost,
        relatedBlocks, status, ownerId, approvedBy, approvedAt
      } = req.body;

      const updated = await eaRepository.updateBuildingBlock(id, {
        name,
        description,
        category,
        purpose,
        keyFeatures,
        interfaces,
        conformsTo,
        whenToUse,
        whenNotToUse,
        considerations,
        realizesAbbId,
        implementationType,
        vendor,
        productName,
        productVersion,
        technologyStack,
        deploymentModel,
        sbbInterfaces,
        usedInApplications,
        licensingModel,
        estimatedCost,
        relatedBlocks,
        status,
        ownerId,
        approvedBy,
        approvedAt,
      });

      if (!updated) {
        return res.status(404).json({ error: 'Building block not found' });
      }

      return res.status(200).json(updated);
    } catch (err) {
      console.error('Error updating building block:', err);
      return res.status(500).json({ error: 'Failed to update building block' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const existing = await eaRepository.findBuildingBlockById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Building block not found' });
      }

      if (existing.domain_id) {
        const { hasAccess, error } = await checkDomainAccess(req, existing.domain_id, 'edit');
        if (!hasAccess) {
          return res.status(403).json({ error: error || 'Edit access denied' });
        }
      }

      const deleted = await eaRepository.deleteBuildingBlock(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Building block not found' });
      }

      return res.status(204).end();
    } catch (err) {
      console.error('Error deleting building block:', err);
      return res.status(500).json({ error: 'Failed to delete building block' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
