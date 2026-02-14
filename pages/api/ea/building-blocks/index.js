// pages/api/ea/building-blocks/index.js
// CRUD API for EA Building Blocks (ABB/SBB)

import { eaRepository } from '../../../../lib/repositories';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

/**
 * Building block types
 */
export const BUILDING_BLOCK_TYPES = Object.freeze({
  abb: {
    name: 'Architecture Building Block',
    description: 'Abstract building block defining capabilities and requirements',
  },
  sbb: {
    name: 'Solution Building Block',
    description: 'Concrete building block implementing an ABB',
  },
});

/**
 * Building block domain categories
 */
export const BUILDING_BLOCK_CATEGORIES = Object.freeze({
  business: { name: 'Business', description: 'Business capabilities and processes' },
  data: { name: 'Data', description: 'Data management and storage' },
  application: { name: 'Application', description: 'Application functionality' },
  technology: { name: 'Technology', description: 'Infrastructure and platforms' },
});

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { domainId, blockType, domainCategory, status } = req.query;

  if (!domainId) {
    return res.status(400).json({ error: 'domainId is required' });
  }

  const { hasAccess, error } = await checkDomainAccess(req, domainId, 'view');
  if (!hasAccess) {
    return res.status(403).json({ error: error || 'Access denied' });
  }

  if (req.method === 'GET') {
    try {
      const blocks = await eaRepository.findAllBuildingBlocks(domainId, { blockType, domainCategory, status });
      return res.status(200).json(blocks);
    } catch (err) {
      console.error('Error fetching building blocks:', err);
      return res.status(500).json({ error: 'Failed to fetch building blocks' });
    }
  }

  if (req.method === 'POST') {
    const { hasAccess: editAccess, error: editError } = await checkDomainAccess(req, domainId, 'edit');
    if (!editAccess) {
      return res.status(403).json({ error: editError || 'Edit access denied' });
    }

    const {
      blockType: bType, name, description, domainCategory: dCategory, category,
      purpose, keyFeatures, interfaces, conformsTo, whenToUse, whenNotToUse, considerations,
      realizesAbbId, implementationType, vendor, productName, productVersion,
      technologyStack, deploymentModel, sbbInterfaces, usedInApplications, licensingModel, estimatedCost,
      relatedBlocks, status: blockStatus, ownerId
    } = req.body;

    if (!name || !bType || !dCategory) {
      return res.status(400).json({ error: 'name, blockType, and domainCategory are required' });
    }

    if (!BUILDING_BLOCK_TYPES[bType]) {
      return res.status(400).json({ error: 'Invalid blockType. Use: abb, sbb' });
    }

    if (!BUILDING_BLOCK_CATEGORIES[dCategory]) {
      return res.status(400).json({ error: 'Invalid domainCategory. Use: business, data, application, technology' });
    }

    try {
      const block = await eaRepository.createBuildingBlock({
        domainId,
        blockType: bType,
        name,
        description,
        domainCategory: dCategory,
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
        status: blockStatus,
        ownerId,
        createdBy: user,
      });
      return res.status(201).json(block);
    } catch (err) {
      console.error('Error creating building block:', err);
      return res.status(500).json({ error: 'Failed to create building block' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
