// pages/api/cm/artefacts.js
// Change Management - List and create artefacts API

import { cmRepository } from '../../../lib/repositories';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';
import { CM_ARTEFACT_TYPES, CM_TYPE_DEFS, isCMType, mapCMStatusToArtefactStatus } from '../../../lib/cm-types';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    const { projectId, contextId, type, types, search, limit, offset } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    if (type && !isCMType(type)) {
      return res.status(400).json({ error: `Invalid CM type: ${type}` });
    }

    try {
      const typeList = types ? types.split(',').filter(t => isCMType(t)) : null;
      const result = await cmRepository.findCMArtefacts(projectId, {
        contextId,
        type,
        types: typeList,
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
      console.error('Error listing CM artefacts:', err);
      return res.status(500).json({ error: 'Failed to list artefacts' });
    }
  }

  if (req.method === 'POST') {
    const {
      projectId,
      artefactType,
      name,
      description,
      ownerId,
      tags,
      customFields,
      ...typeSpecificFields
    } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    if (!artefactType) {
      return res.status(400).json({ error: 'Artefact type is required' });
    }

    if (!isCMType(artefactType)) {
      return res.status(400).json({ error: `Invalid CM type: ${artefactType}. Type must start with 'cm_'` });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Artefact name is required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'create');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const typeDef = CM_TYPE_DEFS[artefactType];
    if (!typeDef) {
      return res.status(400).json({ error: `Unknown CM type: ${artefactType}` });
    }

    if (typeDef.fields) {
      for (const field of typeDef.fields) {
        if (field.required && !typeSpecificFields[field.key] && field.key !== 'name') {
          if (!customFields?.[field.key]) {
            return res.status(400).json({ error: `Field '${field.label || field.key}' is required` });
          }
        }
      }
    }

    let cmStatus = 'draft';
    if (artefactType === 'cm_context') {
      cmStatus = typeSpecificFields.status || customFields?.status || 'draft';
    }

    const mergedCustomFields = {
      ...(customFields || {}),
      ...typeSpecificFields,
      cm_type: artefactType,
    };

    const artefactStatus = mapCMStatusToArtefactStatus(cmStatus);

    try {
      const artefact = await cmRepository.createCMArtefact({
        projectId,
        artefactType,
        name,
        description,
        status: artefactStatus,
        ownerId: ownerId || user,
        tags,
        customFields: mergedCustomFields,
        userId: user,
      });

      return res.status(201).json(artefact);
    } catch (err) {
      console.error('Error creating CM artefact:', err);
      return res.status(500).json({ error: 'Failed to create artefact' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
