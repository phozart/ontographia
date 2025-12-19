/**
 * Business Service Management - Artefacts API
 *
 * @route GET /api/bsm/artefacts - List BSM artefacts
 * @route POST /api/bsm/artefacts - Create BSM artefact
 *
 * @requires x-user header - User ID for authentication
 * @requires x-role header - User role for authorization
 *
 * @module pages/api/bsm/artefacts
 */

import { bsmRepository } from '../../../lib/repositories';
import { getUserFromRequest, checkDomainAccess } from '../../../lib/projectAccess';
import { BSM_TYPE_DEFS, isBsmType, getTypeDefinition } from '../../../lib/bsm-types';

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
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // ========== GET - List artefacts ==========
  if (req.method === 'GET') {
    const { domainId, projectId, type, types, stage, search, limit, offset } = req.query;

    if (!domainId) {
      return res.status(400).json({ error: 'Domain ID required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domainId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const result = await bsmRepository.findByDomain(domainId, {
        projectId,
        type,
        types: types ? types.split(',') : undefined,
        stage,
        search,
        limit,
        offset,
      });

      return res.status(200).json({
        artefacts: result.artefacts,
        total: result.total,
        limit: limit ? parseInt(limit, 10) : null,
        offset: offset ? parseInt(offset, 10) : 0,
      });
    } catch (err) {
      console.error('Error listing BSM artefacts:', err);
      return res.status(500).json({ error: 'Failed to list artefacts', details: err.message });
    }
  }

  // ========== POST - Create artefact ==========
  if (req.method === 'POST') {
    const {
      domainId,
      projectId,
      artefactType,
      name,
      description,
      ownerId,
      tags,
      customFields,
      ...typeSpecificFields
    } = req.body;

    // Validate required fields
    if (!domainId) {
      return res.status(400).json({ error: 'Domain ID is required' });
    }

    if (!artefactType) {
      return res.status(400).json({ error: 'Artefact type is required' });
    }

    if (!isBsmType(artefactType)) {
      return res.status(400).json({ error: `Invalid BSM type: ${artefactType}` });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domainId, 'create');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      // Get type definition for validation
      const typeDef = getTypeDefinition(artefactType);

      // Get status for mapping
      const bsmStatus = typeSpecificFields.status || customFields?.status || 'draft';
      const artefactStatus = mapBsmStatusToArtefactStatus(bsmStatus);

      // Merge custom fields
      const mergedCustomFields = {
        ...(customFields || {}),
        ...typeSpecificFields,
        bsm_stage: typeDef?.stage || null,
        bsm_status: bsmStatus,
      };

      const newArtefact = await bsmRepository.create({
        domainId,
        projectId: projectId || null,
        artefactType,
        name: name.trim(),
        description: description || '',
        ownerId: ownerId || user,
        tags: tags || [],
        customFields: mergedCustomFields,
        createdBy: user,
      });

      return res.status(201).json(newArtefact);
    } catch (err) {
      console.error('Error creating BSM artefact:', err);
      return res.status(500).json({ error: 'Failed to create artefact', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
