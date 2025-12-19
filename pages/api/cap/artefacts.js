/**
 * Capability Studio - Artefacts API
 *
 * @route GET /api/cap/artefacts - List capability artefacts
 * @route POST /api/cap/artefacts - Create capability artefact
 *
 * @requires x-user header - User ID for authentication
 * @requires x-role header - User role for authorization
 *
 * @module pages/api/cap/artefacts
 */

import { capRepository } from '../../../lib/repositories';
import { getUserFromRequest, checkDomainAccess } from '../../../lib/projectAccess';
import { CAP_TYPE_DEFS, isCapType, getTypeDefinition } from '../../../lib/cap-types';

/**
 * Map capability status to valid artefact status
 */
const mapCapStatusToArtefactStatus = (capStatus) => {
  const mapping = {
    'draft': 'Draft',
    'in_review': 'InReview',
    'validated': 'Approved',
    'archived': 'Deprecated',
  };
  return mapping[capStatus] || 'Draft';
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
      const result = await capRepository.findByDomain(domainId, {
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
      console.error('Error listing capability artefacts:', err);
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

    if (!isCapType(artefactType)) {
      return res.status(400).json({ error: `Invalid capability type: ${artefactType}` });
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

      // Validate required fields from type definition
      if (typeDef?.fields) {
        for (const field of typeDef.fields) {
          if (field.required && field.key !== 'name') {
            const value = typeSpecificFields[field.key] || customFields?.[field.key];
            if (!value) {
              return res.status(400).json({ error: `Field '${field.label || field.key}' is required` });
            }
          }
        }
      }

      // Get status for mapping
      const capStatus = typeSpecificFields.status || customFields?.status || 'draft';
      const artefactStatus = mapCapStatusToArtefactStatus(capStatus);

      // Merge custom fields
      const mergedCustomFields = {
        ...(customFields || {}),
        ...typeSpecificFields,
        cap_stage: typeDef?.stage || null,
        cap_status: capStatus,
      };

      const newArtefact = await capRepository.create({
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
      console.error('Error creating capability artefact:', err);
      console.error('[Cap Artefacts API] Full error details:', {
        message: err.message,
        code: err.code,
        detail: err.detail,
        constraint: err.constraint,
        table: err.table,
        column: err.column,
      });
      return res.status(500).json({
        error: 'Failed to create artefact',
        details: err.message,
        code: err.code,
        dbDetail: err.detail,
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
