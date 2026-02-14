// pages/api/ea/models/index.js
// CRUD API for EA Architecture Models

import { eaRepository } from '../../../../lib/repositories';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { domainId, status } = req.query;

  if (!domainId) {
    return res.status(400).json({ error: 'domainId is required' });
  }

  // Domain access check
  const { hasAccess, error } = await checkDomainAccess(req, domainId, 'view');
  if (!hasAccess) {
    return res.status(403).json({ error: error || 'Access denied' });
  }

  if (req.method === 'GET') {
    try {
      const models = await eaRepository.findAllModels(domainId, { status });
      return res.status(200).json(models);
    } catch (err) {
      console.error('Error fetching EA models:', err);
      return res.status(500).json({ error: 'Failed to fetch EA models' });
    }
  }

  if (req.method === 'POST') {
    const { hasAccess: editAccess, error: editError } = await checkDomainAccess(req, domainId, 'edit');
    if (!editAccess) {
      return res.status(403).json({ error: editError || 'Edit access denied' });
    }

    const { name, description, purpose, scope, status: modelStatus, version,
      linkedInitiatives, linkedProjects, linkedRequirements, folders,
      source, sourceFormat, sourceFile } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    try {
      const model = await eaRepository.createModel({
        domainId,
        name,
        description,
        purpose,
        scope,
        status: modelStatus,
        version,
        linkedInitiatives,
        linkedProjects,
        linkedRequirements,
        folders,
        source,
        sourceFormat,
        sourceFile,
        createdBy: user,
      });
      return res.status(201).json(model);
    } catch (err) {
      console.error('Error creating EA model:', err);
      return res.status(500).json({ error: 'Failed to create EA model' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
