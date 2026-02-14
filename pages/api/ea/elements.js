// pages/api/ea/elements.js
// CRUD API for EA elements

import { eaRepository, EA_ELEMENT_TYPES, ALL_EA_TYPES } from '../../../lib/repositories';
import { getUserFromRequest, checkDomainAccess } from '../../../lib/projectAccess';

// Re-export types for backwards compatibility
export { EA_ELEMENT_TYPES, ALL_EA_TYPES };

export default async function handler(req, res) {
  // Authentication check
  const { user, role } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { domain, domainId } = req.query;
  const effectiveDomainId = domainId || domain;

  // Domain access check for operations that need it
  if (effectiveDomainId) {
    const { hasAccess, error } = await checkDomainAccess(req, effectiveDomainId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error: error || 'Access denied' });
    }
  }

  if (req.method === 'GET') {
    try {
      const elements = await eaRepository.findAllElements({ domain: effectiveDomainId });
      return res.status(200).json(elements);
    } catch (err) {
      console.error('Error fetching EA elements:', err);
      return res.status(500).json({ error: 'Failed to fetch EA elements' });
    }
  }

  if (req.method === 'POST') {
    // Check edit access for mutations
    if (effectiveDomainId) {
      const { hasAccess, error } = await checkDomainAccess(req, effectiveDomainId, 'edit');
      if (!hasAccess) {
        return res.status(403).json({ error: error || 'Edit access denied' });
      }
    }

    const { elementType, layer, name, description, properties, parentId, domainName } = req.body;

    if (!elementType || !layer || !name) {
      return res.status(400).json({ error: 'elementType, layer, and name are required' });
    }

    try {
      const element = await eaRepository.createElement({
        elementType,
        layer,
        name,
        description,
        properties,
        parentId,
        domainName: domainName || effectiveDomainId,
        userId: user,
      });
      return res.status(201).json(element);
    } catch (err) {
      console.error('Error creating EA element:', err);
      return res.status(500).json({ error: 'Failed to create EA element' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
