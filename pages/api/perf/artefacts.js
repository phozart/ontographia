/**
 * Performance Artefacts API
 * GET: List performance artefacts with filtering
 * POST: Create new performance artefact
 */

import { perfRepository } from '../../../lib/repositories/PerfRepository';
import { getUserFromRequest, checkDomainAccess } from '../../../lib/projectAccess';
import { isPerfType, getTypeDefinition } from '../../../lib/perf-types';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // ========== GET - List artefacts ==========
  if (req.method === 'GET') {
    const { domainId, projectId, type, types, stage, status, search, limit, offset } = req.query;

    if (!domainId) {
      return res.status(400).json({ error: 'Domain ID required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domainId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const result = await perfRepository.findByDomain(domainId, {
        projectId,
        type,
        types: types ? types.split(',') : undefined,
        stage,
        status,
        search,
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
      });

      return res.status(200).json(result);
    } catch (err) {
      console.error('Error fetching performance artefacts:', err);
      return res.status(500).json({ error: 'Failed to fetch artefacts' });
    }
  }

  // ========== POST - Create artefact ==========
  if (req.method === 'POST') {
    const { domainId, projectId, artefactType, name, description, ownerId, tags, customFields } = req.body;

    if (!domainId) {
      return res.status(400).json({ error: 'Domain ID is required' });
    }

    if (!artefactType || !name) {
      return res.status(400).json({ error: 'artefactType and name are required' });
    }

    if (!isPerfType(artefactType)) {
      return res.status(400).json({ error: 'Invalid artefact type for performance module' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domainId, 'create');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const typeDef = getTypeDefinition(artefactType);

      const artefact = await perfRepository.create({
        domainId,
        projectId: projectId || null,
        artefactType,
        name,
        description,
        ownerId: ownerId || user,
        tags,
        customFields: {
          ...(customFields || {}),
          perf_stage: typeDef?.stage || null,
        },
        createdBy: user,
      });

      return res.status(201).json(artefact);
    } catch (err) {
      console.error('Error creating performance artefact:', err);
      return res.status(500).json({ error: 'Failed to create artefact' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
