/**
 * Governance Artefacts API
 * GET: List governance artefacts for a domain
 * POST: Create a new governance artefact
 */

import { govRepository } from '../../../lib/repositories/GovRepository';
import { getUserFromRequest, checkDomainAccess } from '../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // ========== GET - List artefacts ==========
  if (req.method === 'GET') {
    const { domainId, projectId, type, types, stage, search, status, limit, offset } = req.query;

    if (!domainId) {
      return res.status(400).json({ error: 'Domain ID required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domainId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const result = await govRepository.findByDomain(domainId, {
        projectId,
        type,
        types: types ? types.split(',') : undefined,
        stage,
        search,
        status,
        limit,
        offset,
      });
      return res.status(200).json(result);
    } catch (err) {
      console.error('Error fetching governance artefacts:', err);
      return res.status(500).json({ error: 'Failed to fetch artefacts' });
    }
  }

  // ========== POST - Create artefact ==========
  if (req.method === 'POST') {
    const { domainId, projectId, artefactType, name, description, tags, customFields } = req.body;

    if (!domainId) {
      return res.status(400).json({ error: 'Domain ID is required' });
    }

    if (!artefactType || !name) {
      return res.status(400).json({ error: 'artefactType and name are required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domainId, 'create');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const artefact = await govRepository.create({
        domainId,
        projectId: projectId || null,
        artefactType,
        name,
        description,
        tags,
        customFields,
        createdBy: user,
      });
      return res.status(201).json(artefact);
    } catch (err) {
      console.error('Error creating governance artefact:', err);
      return res.status(500).json({ error: 'Failed to create artefact' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
