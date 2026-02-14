// pages/api/ea/principles/index.js
// CRUD API for EA Architecture Principles

import { eaRepository } from '../../../../lib/repositories';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

/**
 * Principle categories (TOGAF)
 */
export const PRINCIPLE_CATEGORIES = Object.freeze({
  business: { name: 'Business Principles', description: 'Govern business decisions and behaviors' },
  data: { name: 'Data Principles', description: 'Govern data management and usage' },
  application: { name: 'Application Principles', description: 'Govern application design and development' },
  technology: { name: 'Technology Principles', description: 'Govern technology choices and standards' },
  security: { name: 'Security Principles', description: 'Govern security and compliance' },
});

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { domainId, category, status } = req.query;

  if (!domainId) {
    return res.status(400).json({ error: 'domainId is required' });
  }

  const { hasAccess, error } = await checkDomainAccess(req, domainId, 'view');
  if (!hasAccess) {
    return res.status(403).json({ error: error || 'Access denied' });
  }

  if (req.method === 'GET') {
    try {
      const principles = await eaRepository.findAllPrinciples(domainId, { category, status });
      return res.status(200).json(principles);
    } catch (err) {
      console.error('Error fetching principles:', err);
      return res.status(500).json({ error: 'Failed to fetch principles' });
    }
  }

  if (req.method === 'POST') {
    const { hasAccess: editAccess, error: editError } = await checkDomainAccess(req, domainId, 'edit');
    if (!editAccess) {
      return res.status(403).json({ error: editError || 'Edit access denied' });
    }

    const {
      name, category: cat, priority, statement, rationale, implications,
      status: principleStatus, effectiveDate, reviewDate, ownerId,
      supportsGoals, constrainsElements, exceptions
    } = req.body;

    if (!name || !cat || !statement || !rationale) {
      return res.status(400).json({ error: 'name, category, statement, and rationale are required' });
    }

    if (!PRINCIPLE_CATEGORIES[cat]) {
      return res.status(400).json({
        error: `Invalid category. Use: ${Object.keys(PRINCIPLE_CATEGORIES).join(', ')}`
      });
    }

    try {
      const principle = await eaRepository.createPrinciple({
        domainId,
        name,
        category: cat,
        priority,
        statement,
        rationale,
        implications,
        status: principleStatus,
        effectiveDate,
        reviewDate,
        ownerId,
        supportsGoals,
        constrainsElements,
        exceptions,
        createdBy: user,
      });
      return res.status(201).json(principle);
    } catch (err) {
      console.error('Error creating principle:', err);
      return res.status(500).json({ error: 'Failed to create principle' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
