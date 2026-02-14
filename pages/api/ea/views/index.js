// pages/api/ea/views/index.js
// CRUD API for EA Architecture Views

import { eaRepository } from '../../../../lib/repositories';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

/**
 * ArchiMate viewpoint types
 */
export const EA_VIEWPOINTS = Object.freeze({
  // Basic viewpoints
  organization: { name: 'Organization', layer: 'business', description: 'Business actors and roles' },
  business_process_cooperation: { name: 'Business Process Cooperation', layer: 'business', description: 'Process collaboration' },
  product: { name: 'Product', layer: 'business', description: 'Products and services' },
  application_cooperation: { name: 'Application Cooperation', layer: 'application', description: 'Application interactions' },
  application_usage: { name: 'Application Usage', layer: 'application', description: 'Business use of applications' },
  implementation_deployment: { name: 'Implementation & Deployment', layer: 'technology', description: 'Software deployment' },
  technology: { name: 'Technology', layer: 'technology', description: 'Infrastructure and platforms' },
  technology_usage: { name: 'Technology Usage', layer: 'technology', description: 'Application use of infrastructure' },
  information_structure: { name: 'Information Structure', layer: 'application', description: 'Data objects and relationships' },
  service_realization: { name: 'Service Realization', layer: 'all', description: 'How services are realized' },
  physical: { name: 'Physical', layer: 'technology', description: 'Physical infrastructure' },
  layered: { name: 'Layered', layer: 'all', description: 'Cross-layer overview' },
  // Motivation viewpoints
  stakeholder: { name: 'Stakeholder', layer: 'motivation', description: 'Stakeholders and their concerns' },
  goal_realization: { name: 'Goal Realization', layer: 'motivation', description: 'Goals and their refinement' },
  requirements_realization: { name: 'Requirements Realization', layer: 'motivation', description: 'Requirements and realizations' },
  motivation: { name: 'Motivation', layer: 'motivation', description: 'Full motivation model' },
  // Strategy viewpoints
  strategy: { name: 'Strategy', layer: 'strategy', description: 'Strategic resources and goals' },
  capability_map: { name: 'Capability Map', layer: 'strategy', description: 'Business capabilities' },
  outcome_realization: { name: 'Outcome Realization', layer: 'strategy', description: 'Desired outcomes' },
  resource_map: { name: 'Resource Map', layer: 'strategy', description: 'Resources allocation' },
  // Implementation viewpoints
  project: { name: 'Project', layer: 'implementation', description: 'Projects and deliverables' },
  migration: { name: 'Migration', layer: 'implementation', description: 'Transition planning' },
  implementation_migration: { name: 'Implementation & Migration', layer: 'implementation', description: 'Full migration view' },
});

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { domainId, modelId, viewpoint, status } = req.query;

  if (!domainId && !modelId) {
    return res.status(400).json({ error: 'domainId or modelId is required' });
  }

  // Domain access check
  if (domainId) {
    const { hasAccess, error } = await checkDomainAccess(req, domainId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error: error || 'Access denied' });
    }
  }

  if (req.method === 'GET') {
    try {
      const views = await eaRepository.findAllViews({ domainId, modelId, viewpoint, status });
      return res.status(200).json(views);
    } catch (err) {
      console.error('Error fetching EA views:', err);
      return res.status(500).json({ error: 'Failed to fetch EA views' });
    }
  }

  if (req.method === 'POST') {
    if (domainId) {
      const { hasAccess: editAccess, error: editError } = await checkDomainAccess(req, domainId, 'edit');
      if (!editAccess) {
        return res.status(403).json({ error: editError || 'Edit access denied' });
      }
    }

    const { name, description, viewpoint: vp, status: viewStatus,
      elements, relationships, groups, notes,
      canvasWidth, canvasHeight, gridSize, snapToGrid, zoom, ownerId } = req.body;

    if (!name || !vp) {
      return res.status(400).json({ error: 'name and viewpoint are required' });
    }

    // Validate viewpoint
    if (!EA_VIEWPOINTS[vp]) {
      return res.status(400).json({
        error: `Invalid viewpoint. Valid options: ${Object.keys(EA_VIEWPOINTS).join(', ')}`
      });
    }

    try {
      const view = await eaRepository.createView({
        modelId,
        domainId,
        name,
        description,
        viewpoint: vp,
        status: viewStatus,
        elements,
        relationships,
        groups,
        notes,
        canvasWidth,
        canvasHeight,
        gridSize,
        snapToGrid,
        zoom,
        ownerId,
        createdBy: user,
      });
      return res.status(201).json(view);
    } catch (err) {
      console.error('Error creating EA view:', err);
      return res.status(500).json({ error: 'Failed to create EA view' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
