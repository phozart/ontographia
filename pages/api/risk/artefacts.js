/**
 * Risk Artefacts API
 *
 * GET  - List risk artefacts for a domain
 * POST - Create a new risk artefact
 */

import { riskRepository } from '../../../lib/repositories';
import { getUserFromRequest, checkDomainAccess } from '../../../lib/projectAccess';
import { isRiskType } from '../../../lib/risk-types';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    if (req.method === 'GET') {
      const { domainId, projectId, type, types, stage, search, limit, offset } = req.query;

      if (!domainId) {
        return res.status(400).json({ error: 'Domain ID required' });
      }

      const { hasAccess, error } = await checkDomainAccess(req, domainId, 'view');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      const result = await riskRepository.findByDomain(domainId, {
        projectId,
        type,
        types: types ? types.split(',') : undefined,
        stage,
        search,
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
      });

      return res.status(200).json(result);
    }

    if (req.method === 'POST') {
      const { domainId, projectId, artefactType, name, description, ownerId, tags, customFields } = req.body;

      if (!domainId) {
        return res.status(400).json({ error: 'Domain ID is required' });
      }

      if (!artefactType || !name) {
        return res.status(400).json({ error: 'artefactType and name are required' });
      }

      if (!isRiskType(artefactType)) {
        return res.status(400).json({ error: `Invalid risk type: ${artefactType}` });
      }

      const { hasAccess, error } = await checkDomainAccess(req, domainId, 'create');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      const artefact = await riskRepository.create({
        domainId,
        projectId: projectId || null,
        artefactType,
        name,
        description,
        ownerId: ownerId || user,
        tags,
        customFields,
        createdBy: user,
      });

      return res.status(201).json(artefact);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[Risk API] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
